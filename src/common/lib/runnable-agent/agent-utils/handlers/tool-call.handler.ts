import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import OpenAI from 'openai';
import { EventData, StreamContext, StreamHandler } from '../types';

export class ToolCallHandler implements StreamHandler {
  constructor(private encoder: EventEncoder) {}

  async *handle(
    chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
    context: StreamContext,
  ): AsyncGenerator<string, void, unknown> {
    const toolCall = chunk.choices[0].delta.tool_calls?.[0];
    if (!toolCall) {
      return;
    }

    if (!context.isToolCallStarted) {
      context.toolCallId = toolCall.id ?? '';
      context.toolCallName = toolCall.function?.name ?? '';
      context.isToolCallStarted = true;

      const event: EventData = {
        type: EventType.TOOL_CALL_START,
        toolCallId: context.toolCallId,
        toolCallName: context.toolCallName,
        toolCallArgs: '',
        toolCalls: [
          {
            id: context.toolCallId,
            type: 'function',
            function: {
              name: context.toolCallName,
              arguments: '',
            },
          },
        ],
        messages: [
          {
            id: context.messageId,
            role: 'assistant',
            toolCalls: [
              {
                id: context.toolCallId,
                type: 'function',
                function: {
                  name: context.toolCallName,
                  arguments: '',
                },
              },
            ],
          },
        ],
      };
      yield this.encoder.encode(event);
    }

    if (toolCall.function?.arguments) {
      context.toolCallArgs += toolCall.function.arguments;
      const event: EventData = {
        type: EventType.TOOL_CALL_ARGS,
        toolCallId: context.toolCallId,
        toolCallName: context.toolCallName,
        toolCallArgs: context.toolCallArgs,
        delta: toolCall.function?.arguments,
        toolCalls: [
          {
            id: context.toolCallId,
            type: 'function',
            function: {
              name: context.toolCallName,
              arguments: context.toolCallArgs,
            },
          },
        ],
        messages: [
          {
            id: context.messageId,
            role: 'assistant',
            toolCalls: [
              {
                id: context.toolCallId,
                type: 'function',
                function: {
                  name: context.toolCallName,
                  arguments: context.toolCallArgs,
                },
              },
            ],
          },
        ],
      };
      yield this.encoder.encode(event);
    }
  }

  async *finalize(
    context: StreamContext,
  ): AsyncGenerator<string, void, unknown> {
    if (context.isToolCallStarted) {
      const event: EventData = {
        type: EventType.TOOL_CALL_END,
        toolCallId: context.toolCallId,
        toolCallName: context.toolCallName,
        toolCallArgs: context.toolCallArgs,
        toolCalls: [
          {
            id: context.toolCallId,
            type: 'function',
            function: {
              name: context.toolCallName,
              arguments: context.toolCallArgs,
            },
          },
        ],
        messages: [
          {
            id: context.messageId,
            role: 'assistant',
            toolCalls: [
              {
                id: context.toolCallId,
                type: 'function',
                function: {
                  name: context.toolCallName,
                  arguments: context.toolCallArgs,
                },
              },
            ],
          },
        ],
      };
      yield this.encoder.encode(event);
    }
  }
}
