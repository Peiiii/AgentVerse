import { BaseAgent, BaseAgentState } from "@/lib/agent/base-agent";
import { PromptBuilder } from "@/lib/agent/prompt/prompt-builder";
import { ChatMessage, ChatRole } from "@/lib/ai-service";
import { CapabilityRegistry } from "@/lib/capabilities";
import { DiscussionKeys } from "@/lib/discussion/discussion-env";
import { SpeakReason, SpeakRequest } from "@/lib/discussion/speak-scheduler";
import {
  agentListResource,
  discussionMembersResource,
  messagesResource,
} from "@/resources";
import { aiService } from "@/services/ai.service";
import { discussionControlService } from "@/services/discussion-control.service";
import { messageService } from "@/services/message.service";
import {
  ActionResultMessage,
  AgentMessage,
  NormalMessage,
} from "@/types/discussion";

/**
 * 消息处理层
 * 提供消息处理的核心流程和通用实现
 */

export abstract class MessageHandlingAgent<
  S extends BaseAgentState = BaseAgentState
> extends BaseAgent<S> {
  private promptBuilder = new PromptBuilder();
  // 实现消息监听的基础设施
  protected onEnter(): void {
    const off = this.env.eventBus.on(
      DiscussionKeys.Events.message,
      (message: AgentMessage) => {
        this.onMessage(message);
      }
    );
    this.addCleanup(off);
  }

  // 消息处理核心流程
  protected async onMessage(message: AgentMessage): Promise<void> {
    if (!this.shouldProcessMessage()) {
      return; // 如果已暂停，不处理消息
    }

    if (message.type === "action_result") {
      // 处理 action 结果
      if (message.originMessageId === this.lastActionMessageId) {
        await this.handleActionResult(message);
      }
      return;
    }

    const normalMessage = message as NormalMessage;
    if (!this.shouldRespond(normalMessage)) {
      return;
    }

    const request: SpeakRequest = {
      agentId: this.config.agentId,
      agentName: this.config.name,
      message: normalMessage,
      reason: this.getSpeakReason(normalMessage),
      priority: 0,
      timestamp: new Date(),
      onGranted: async () => {
        await this.speak(request);
      },
    };

    this.env.submitSpeakRequest(request);
  }

  protected async speak(request: SpeakRequest): Promise<void> {
    this.setState({ isThinking: true } as Partial<S>);

    try {
      const message = this.useStreaming
        ? await this.generateStreamingMessage(request.message as NormalMessage)
        : await this.generateStandardMessage(request.message as NormalMessage);

      if (!message) {
        this.setState({ isThinking: false } as Partial<S>);
        return;
      }
      this.state.lastSpeakTime =
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp);
      this.setState({ isThinking: false } as Partial<S>);
      this.env.eventBus.emit(DiscussionKeys.Events.message, message);
      this.onDidSendMessage(message);
    } catch (error) {
      this.setState({ isThinking: false } as Partial<S>);
      throw error;
    }
  }

  // 标准消息生成方法
  protected async generateStandardMessage(
    message: NormalMessage
  ): Promise<NormalMessage> {
    const prepared = await this.prepareMessages(message);
    const response = await aiService.chatCompletion(prepared);
    return await this.addMessage(response);
  }

  // 提取公共的消息准备逻辑
  protected async prepareMessages(
    message?: NormalMessage | ActionResultMessage
  ): Promise<ChatMessage[]> {
    const discussionId = discussionControlService.getCurrentDiscussionId();
    if (!discussionId) {
      throw new Error("Discussion ID is not set");
    }

    const messages = await messageService.listMessages(discussionId);
    const agentList = agentListResource.read().data;
    const memberAgents = (
      await discussionMembersResource.current.whenReady()
    ).map((member) => agentList.find((agent) => agent.id === member.agentId)!);

    return this.promptBuilder.buildPrompt({
      currentAgent: this.config,
      currentAgentConfig: this.config,
      agents: memberAgents,
      messages,
      triggerMessage: message,
      capabilities: CapabilityRegistry.getInstance().getCapabilities(),
    });
  }

  // 提取流式消息处理逻辑
  protected async handleStreamingResponse(
    messages: Array<{ role: ChatRole; content: string }>
  ): Promise<NormalMessage> {
    // 创建初始消息
    const initialMessage = await this.addMessage("", {
      status: "pending",
      lastUpdateTime: new Date(),
    });

    try {
      // 开始流式输出
      const stream = await aiService.streamChatCompletion(
        messages as ChatMessage[]
      );

      if (!stream) {
        await this.updateMessage(initialMessage.id, {
          status: "error",
          lastUpdateTime: new Date(),
        });
      }

      // 更新状态为 streaming
      await this.updateMessage(initialMessage.id, {
        status: "streaming",
        lastUpdateTime: new Date(),
      });

      let content = "";

      // 处理流式输出
      await new Promise<void>((resolve, reject) => {
        stream.subscribe({
          next: async (chunk) => {
            content += chunk;
            await this.updateMessage(initialMessage.id, {
              content,
              lastUpdateTime: new Date(),
            });
          },
          error: reject,
          complete: resolve,
        });
      });

      // 完成后更新最终状态
      await this.updateMessage(initialMessage.id, {
        status: "completed",
        lastUpdateTime: new Date(),
      });
    } catch (error) {
      // 发生错误时更新状态
      await this.updateMessage(initialMessage.id, {
        status: "error",
        lastUpdateTime: new Date(),
      });
      throw error;
    }
    return (await messageService.getMessage(
      initialMessage.id
    )) as NormalMessage;
  }

  protected async generateActionResponse(
    actionMessage: ActionResultMessage
  ): Promise<AgentMessage> {
    const prepared = await this.prepareMessages(actionMessage);
    const response = await aiService.chatCompletion(prepared);
    return await this.addMessage(response);
  }

  protected async generateStreamingActionResponse(
    actionMessage: ActionResultMessage
  ): Promise<NormalMessage> {
    const prepared = await this.prepareMessages(actionMessage);
    return this.handleStreamingResponse(prepared);
  }

  protected async generateStreamingMessage(
    message: NormalMessage
  ): Promise<NormalMessage> {
    const prepared = await this.prepareMessages(message);
    return this.handleStreamingResponse(prepared);
  }

  // 检查消息中是否 @ 了当前 agent
  protected checkIfMentioned(content: string, name: string): boolean {
    const mentionPattern = new RegExp(`@(?:"${name}"|'${name}'|${name})`, "i");
    return mentionPattern.test(content);
  }

  protected getSpeakReason(message: NormalMessage): SpeakReason {
    const isMentioned = this.checkIfMentioned(
      message.content,
      this.config.name
    );

    if (isMentioned) {
      return {
        type: "mentioned",
        description: "被直接提及",
        factors: {
          isModerator: this.config.role === "moderator",
          isContextRelevant: 1,
        },
      };
    }

    return {
      type: "auto_reply",
      description: "自动回复",
      factors: {
        isModerator: this.config.role === "moderator",
        isContextRelevant: 0.5,
        timeSinceLastSpeak: this.state.lastSpeakTime
          ? Date.now() - this.state.lastSpeakTime.getTime()
          : Infinity,
      },
    };
  }

  protected async addMessage(
    content: string,
    extra?: Partial<NormalMessage>
  ): Promise<NormalMessage> {
    const discussionId = discussionControlService.getCurrentDiscussionId()!;
    const message: Omit<NormalMessage, "id"> = {
      type: "text",
      content,
      agentId: this.config.agentId,
      timestamp: new Date(),
      discussionId,
      ...extra,
    };
    const createdMessage = await messageService.createMessage(message);
    messagesResource.current.reload();
    return createdMessage as NormalMessage;
  }

  protected async updateMessage(
    messageId: string,
    updates: Partial<NormalMessage>
  ): Promise<void> {
    await messageService.updateMessage(messageId, updates);
    messagesResource.current.reload();
  }

  protected shouldRespond(message: NormalMessage): boolean {
    // 检查是否被 @ 了
    const isMentioned = this.checkIfMentioned(
      message.content,
      this.config.name
    );
    // 如果被 @ 了，强制回复
    if (isMentioned) {
      return true;
    }

    // 如果没有开启自动回复，不响应
    if (!this.state.autoReply) {
      return false;
    }

    // 如果正在思考，不要回复
    if (this.state.isThinking) {
      return false;
    }

    // 检查是否有人在说话
    const currentSpeaker = this.env.stateBus.get(
      DiscussionKeys.States.speaking
    );
    if (currentSpeaker) {
      return false;
    }

    // 是否回复自己的消息
    if (!this.state.respondToSelf && message.agentId === this.config.agentId) {
      return false;
    }

    // 检查发言间隔
    if (this.state.lastSpeakTime) {
      const lastSpeakTimestamp =
        this.state.lastSpeakTime instanceof Date
          ? this.state.lastSpeakTime.getTime()
          : this.state.lastSpeakTime;
      const elapsed = Date.now() - lastSpeakTimestamp;
      if (elapsed < (this.config.conversation?.minResponseDelay ?? 0)) {
        return false;
      }
    }

    return true;
  }

  protected abstract onDidSendMessage(
    agentMessage: AgentMessage
  ): void | Promise<void>;

  protected abstract handleActionResult(
    message: ActionResultMessage
  ): Promise<void>;
}
