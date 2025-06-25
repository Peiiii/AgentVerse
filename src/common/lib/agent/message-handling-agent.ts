import { BaseAgent, BaseAgentState } from "@/common/lib/agent/base-agent";
import { PromptBuilder } from "@/common/lib/agent/prompt/prompt-builder";
import { ChatMessage, ChatRole } from "@/common/lib/ai-service";
import { CapabilityRegistry } from "@/common/lib/capabilities";
import { DiscussionKeys } from "@/common/lib/discussion/discussion-env";
import { SpeakReason, SpeakRequest } from "@/common/lib/discussion/speak-scheduler";
import {
  agentListResource,
  discussionMembersResource,
  messagesResource,
} from "@/core/resources";
import { aiService } from "@/core/services/ai.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { messageService } from "@/core/services/message.service";
import {
  ActionResultMessage,
  AgentMessage,
  NormalMessage,
} from "@/common/types/discussion";

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

    // 监听中断事件
    this.addCleanup(
      this.env.speakScheduler.onSpeakInterrupted$.listen((agentId) => {
        if (agentId === this.config.agentId) {
          console.log(`[ChatAgent] ${this.config.name} speaking interrupted`);
        }
      })
    );

    // 监听超时事件
    this.addCleanup(
      this.env.speakScheduler.onSpeakTimeout$.listen((agentId) => {
        if (agentId === this.config.agentId) {
          console.log(`[ChatAgent] ${this.config.name} speaking timeout`);
        }
      })
    );
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
      const message = request.message;
      let responseMessage: NormalMessage;

      if (message.type === "text") {
        responseMessage = this.useStreaming
          ? await this.generateStreamingMessage(message)
          : await this.generateStandardMessage(message);
      } else if (message.type === "action_result") {
        responseMessage = await this.generateStreamingActionResponse(message);
      } else {
        throw new Error(`Unsupported message type: ${message.type}`);
      }

      if (!responseMessage) {
        this.setState({ isThinking: false } as Partial<S>);
        return;
      }

      this.state.lastSpeakTime = 
        responseMessage.timestamp instanceof Date
          ? responseMessage.timestamp
          : new Date(responseMessage.timestamp);
      
      this.setState({ isThinking: false } as Partial<S>);
      this.env.eventBus.emit(DiscussionKeys.Events.message, responseMessage);
      await this.onDidSendMessage(responseMessage);

      // 如果不是流式响应,需要手动通知调度器完成
      // 流式响应在handleStreamingResponse中已经通知了
      if (!this.useStreaming) {
        this.env.speakScheduler.completeSpeaking(this.config.agentId);
      }
    } catch (error) {
      this.setState({ isThinking: false } as Partial<S>);
      // 出错时也要通知调度器
      this.env.speakScheduler.completeSpeaking(this.config.agentId);
      console.error("[ChatAgent] Failed to speak:", error);
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
      status: "streaming",
      lastUpdateTime: new Date(),
    });

    try {
      // 获取中断控制器
      const controller = this.env.speakScheduler.startSpeaking(this.config.agentId);

      // 创建流式响应
      const stream = await aiService.streamChatCompletion(messages);

      // 处理流式响应
      let content = "";
      await new Promise<void>((resolve, reject) => {
        // 如果已经被中断,直接返回
        if (controller.signal.aborted) {
          resolve();
          return;
        }

        const subscription = stream.subscribe({
          next: async (chunk: string) => {
            // 检查是否被中断
            if (controller.signal.aborted) {
              subscription.unsubscribe();
              await this.updateMessage(initialMessage.id, {
                status: "completed",
                content: content + "\n[已中断]",
                lastUpdateTime: new Date(),
              });
              resolve();
              return;
            }

            content += chunk;
            await this.updateMessage(initialMessage.id, {
              content,
              lastUpdateTime: new Date(),
            });
          },
          error: async (error: Error) => {
            subscription.unsubscribe();
            reject(error);
          },
          complete: () => {
            subscription.unsubscribe();
            resolve();
          },
        });

        // 监听中断信号
        controller.signal.addEventListener('abort', () => {
          subscription.unsubscribe();
          resolve();
        });
      });

      // 完成后更新最终状态
      await this.updateMessage(initialMessage.id, {
        status: "completed",
        lastUpdateTime: new Date(),
      });

      // 通知调度器完成
      this.env.speakScheduler.completeSpeaking(this.config.agentId);

    } catch (error) {
      // 发生错误时更新状态
      await this.updateMessage(initialMessage.id, {
        status: "error",
        lastUpdateTime: new Date(),
      });

      // 通知调度器完成(即使是错误也要通知,以便释放说话状态)
      this.env.speakScheduler.completeSpeaking(this.config.agentId);
      
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
    const isMentioned = this.checkIfMentioned(message.content, this.config.name);
    const timeSinceLastSpeak = this.state.lastSpeakTime
      ? Date.now() - (this.state.lastSpeakTime instanceof Date
          ? this.state.lastSpeakTime.getTime()
          : this.state.lastSpeakTime)
      : Infinity;

    return {
      type: isMentioned ? "mentioned" : "auto_reply",
      description: isMentioned
        ? "Agent was mentioned in the message"
        : "Auto reply based on context",
      factors: {
        isModerator: this.config.role === "moderator",
        timeSinceLastSpeak,
        // TODO: 可以添加更多因素，如上下文相关性评分等
      }
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
