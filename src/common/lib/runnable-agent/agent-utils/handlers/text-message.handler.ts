import { EventEncoder } from '@ag-ui/encoder';
import { EventType } from '@ag-ui/core';
import { StreamHandler, StreamContext, EventData } from '../types';
import OpenAI from 'openai';

export class TextMessageHandler implements StreamHandler {
  constructor(private encoder: EventEncoder) {}

  async *handle(chunk: OpenAI.Chat.Completions.ChatCompletionChunk, context: StreamContext): AsyncGenerator<string, void, unknown> {
    if (!context.isMessageStarted) {
      const event: EventData = {
        type: EventType.TEXT_MESSAGE_START,
        messageId: context.messageId,
        role: 'assistant',
        content: '',
        messages: [{
          id: context.messageId,
          role: 'assistant',
          content: ''
        }]
      };
      yield this.encoder.encode(event);
      context.isMessageStarted = true;
    }

    const content = chunk.choices[0].delta.content;
    if (content) {
      context.fullResponse += content;
      const event: EventData = {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: context.messageId,
        role: 'assistant',
        delta: content,
        content: context.fullResponse,
        messages: [{
          id: context.messageId,
          role: 'assistant',
          content: context.fullResponse
        }]
      };
      yield this.encoder.encode(event);
    }
  }

  async *finalize(context: StreamContext): AsyncGenerator<string, void, unknown> {
    if (context.isMessageStarted) {
      const event: EventData = {
        type: EventType.TEXT_MESSAGE_END,
        messageId: context.messageId,
        role: 'assistant',
        content: context.fullResponse,
        messages: [{
          id: context.messageId,
          role: 'assistant',
          content: context.fullResponse
        }]
      };
      yield this.encoder.encode(event);
    }
  }
} 