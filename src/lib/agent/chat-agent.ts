import { BaseActionExecutor, DefaultActionExecutor } from "@/lib/agent/action";
import { ActionDef, ActionParser } from "@/lib/agent/action/action-parser";
import { CapabilityRegistry } from "@/lib/capabilities";
import { DiscussionKeys } from "@/lib/discussion/discussion-env";
import { generateId } from "@/lib/utils";
import { messagesResource } from "@/resources";
import { messageService } from "@/services/message.service";
import {
  ActionResultMessage,
  AgentMessage,
  NormalMessage,
} from "@/types/discussion";
import { MessageHandlingAgent } from "./message-handling-agent";

/**
 * 示例：一个简单的聊天Agent
 */

export class ChatAgent extends MessageHandlingAgent {
  private actionParser: ActionParser = new ActionParser();
  private actionExecutor: BaseActionExecutor = new DefaultActionExecutor();
  private capabilityRegistry = CapabilityRegistry.getInstance();

  protected async handleActionResult(
    message: ActionResultMessage
  ): Promise<void> {
    const response = this.useStreaming
      ? await this.generateStreamingActionResponse(message)
      : await this.generateActionResponse(message);

    if (response) {
      this.env.eventBus.emit(DiscussionKeys.Events.message, response);
      this.onDidSendMessage(response);
    }
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
