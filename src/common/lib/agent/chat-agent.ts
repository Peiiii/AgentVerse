import { BaseActionExecutor, DefaultActionExecutor } from "@/common/lib/agent/action";
import { ActionDef, ActionParser } from "@/common/lib/agent/action/action-parser";
import { CapabilityRegistry } from "@/common/lib/capabilities";
import { DiscussionKeys, SpeakRequest } from "@/common/lib/discussion/discussion-env";
import { generateId } from "@/common/lib/utils";
import { messagesResource } from "@/core/resources";
import { messageService } from "@/services/message.service";
import {
  ActionResultMessage,
  AgentMessage,
  NormalMessage,
} from "@/common/types/discussion";
import { MessageHandlingAgent } from "./message-handling-agent";

/**
 * 示例：一个简单的聊天Agent
 */

export class ChatAgent extends MessageHandlingAgent {
  private actionParser: ActionParser = new ActionParser();
  private actionExecutor: BaseActionExecutor = new DefaultActionExecutor();
  private capabilityRegistry = CapabilityRegistry.getInstance();

  protected async handleActionResult(message: ActionResultMessage): Promise<void> {
    // 创建说话请求
    const request: SpeakRequest = {
      agentId: this.config.agentId,
      agentName: this.config.name,
      message,
      reason: {
        type: "follow_up",
        description: "响应操作执行结果",
        factors: {
          isModerator: this.config.role === "moderator",
          isContextRelevant: 1, // 操作结果响应具有高相关性
          timeSinceLastSpeak: this.state.lastSpeakTime 
            ? Date.now() - this.state.lastSpeakTime.getTime()
            : Infinity
        }
      },
      priority: 0,
      timestamp: new Date(),
      onGranted: async () => {
        const response = this.useStreaming
          ? await this.generateStreamingActionResponse(message)
          : await this.generateActionResponse(message);

        if (response) {
          this.env.eventBus.emit(DiscussionKeys.Events.message, response);
          this.onDidSendMessage(response);
        }
      }
    };

    // 提交说话请求
    this.env.submitSpeakRequest(request);
  }

  protected onDidSendMessage(agentMessage: AgentMessage): void | Promise<void> {
    if (agentMessage.type !== "action_result") {
      this.checkActionAndRun(agentMessage as NormalMessage);
    }
  }

  protected checkActionAndRun = async (agentMessage: NormalMessage) => {
    if (this.config.role === "moderator") {
      const parseResult = this.actionParser.parse(agentMessage.content);
      console.log("[ChatAgent] ActionParseResult:", parseResult);
      if (parseResult.length === 0) return;

      const executionResult = await this.actionExecutor.execute(
        parseResult,
        this.capabilityRegistry
      );

      if (executionResult) {
        this.lastActionMessageId = agentMessage.id;

        const resultMessage: ActionResultMessage = {
          id: generateId(),
          type: "action_result",
          agentId: "system",
          timestamp: new Date(),
          discussionId: agentMessage.discussionId,
          originMessageId: agentMessage.id,
          results: executionResult.map((result, index) => {
            const action = parseResult[index].parsed as ActionDef;
            return {
              operationId: action.operationId,
              capability: result.capability,
              params: result.params || {},
              status: result.error ? "error" : "success",
              result: result.result,
              description: action.description,
              error: result.error,
              startTime: result.startTime,
              endTime: result.endTime,
            };
          }),
        };

        await messageService.addMessage(
          agentMessage.discussionId,
          resultMessage
        );
        messagesResource.current.reload();
        this.env.eventBus.emit(DiscussionKeys.Events.message, resultMessage);
      }
    }
  };
}
