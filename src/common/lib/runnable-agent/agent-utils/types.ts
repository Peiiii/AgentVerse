import { EventType } from '@ag-ui/core';

export interface StreamContext {
  messageId: string;
  toolCallId: string;
  isMessageStarted: boolean;
  isToolCallStarted: boolean;
  fullResponse: string;
  toolCallArgs: string;
  toolCallName: string;
  getSnapshot(): StateSnapshot;
}

export interface StateSnapshot {
  last_response: string;
  last_tool_call: {
    name: string;
    arguments: string;
  } | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamHandler {
  handle(chunk: unknown, context: StreamContext): AsyncGenerator<string, void, unknown>;
  finalize(context: StreamContext): AsyncGenerator<string, void, unknown>;
}

export interface EventData {
  type: EventType;
  threadId?: string;
  runId?: string;
  messageId?: string;
  role?: string;
  delta?: string;
  toolCallId?: string;
  toolCallName?: string;
  toolCallArgs?: string;
  snapshot?: StateSnapshot;
  content?: string;
  name?: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  messages?: Array<{
    id: string;
    role: string;
    content?: string;
    name?: string;
    toolCalls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface StreamProcessor {
  process(stream: AsyncIterable<unknown>): AsyncGenerator<string, void, unknown>;
  handleError(error: Error): AsyncGenerator<string, void, unknown>;
  addHandler(type: string, handler: StreamHandler): void;
} 