import {
  EventType,
  Message,
  Tool,
  type Context,
  type RunAgentInput,
  type ToolCall,
} from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import OpenAI from "openai";
import { TextMessageHandler } from "./handlers/text-message.handler";
import { ToolCallHandler } from "./handlers/tool-call.handler";
import { StreamProcessor } from "./stream-processor";
import { EventData } from "./types";

export interface AgentConfig {
  openaiApiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface OpenAIAgentOptions {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class OpenAIAgent {
  private client: OpenAI;

  constructor(private config: AgentConfig) {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.baseURL,
    });
  }

  private convertToolsToOpenAIFormat(tools: Tool[]) {
    return tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  private convertMessagesToOpenAIFormat(
    messages: Message[]
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((message) => {
      if (message.role === "tool" && "toolCallId" in message) {
        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.toolCallId,
        };
      }
      if (
        message.role === "developer" ||
        message.role === "system" ||
        message.role === "user"
      ) {
        return {
          role: message.role,
          content: message.content,
          id: message.id,
        };
      }
      return {
        role: message.role,
        content: message.content,
        id: message.id,
        tool_calls:
          "toolCalls" in message
            ? message.toolCalls?.map((toolCall: ToolCall) => ({
                id: toolCall.id,
                type: "function" as const,
                function: {
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                },
              }))
            : undefined,
      };
    });
  }

  private addContextToMessages(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    context: Context[]
  ) {
    const contextMessage = {
      role: "system" as const,
      content: context
        .map((ctx) => `${ctx.description}: ${ctx.value}`)
        .join("\n"),
    };
    return [contextMessage, ...messages];
  }

  async *run(
    inputData: RunAgentInput,
    acceptHeader: string
  ): AsyncGenerator<string, void, unknown> {
    const encoder = new EventEncoder({ accept: acceptHeader });

    // 发送开始事件
    const startEvent: EventData = {
      type: EventType.RUN_STARTED,
      threadId: inputData.threadId,
      runId: inputData.runId,
      toolCalls: [],
      messages: [],
      toolCallArgs: "",
      content: "",
    };
    yield encoder.encode(startEvent);

    try {
      // 准备消息和工具
      let messages = inputData.messages
        ? this.convertMessagesToOpenAIFormat(inputData.messages)
        : [];
      if (inputData.context) {
        messages = this.addContextToMessages(messages, inputData.context);
      }
      const tools = inputData.tools
        ? this.convertToolsToOpenAIFormat(inputData.tools)
        : [];

      // 创建流
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        stream: true,
        tools,
      });

      // 处理流
      const processor = new StreamProcessor(encoder);
      processor.addHandler("text", new TextMessageHandler(encoder));
      processor.addHandler("tool", new ToolCallHandler(encoder));
      yield* processor.process(stream);
    } catch (error) {
      yield* this.handleError(error as Error, encoder);
    }

    // 发送结束事件
    const endEvent: EventData = {
      type: EventType.RUN_FINISHED,
      threadId: inputData.threadId,
      runId: inputData.runId,
      toolCalls: [],
      messages: [],
      toolCallArgs: "",
      content: "",
    };
    yield encoder.encode(endEvent);
  }

  private async *handleError(
    error: Error,
    encoder: EventEncoder
  ): AsyncGenerator<string, void, unknown> {
    const event: EventData = {
      type: EventType.RUN_ERROR,
      error: {
        message: error.message,
      },
    };
    console.error("[OpenAIAgent][handleError]:", error);
    yield encoder.encode(event);
  }
}
