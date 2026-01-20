/**
 * ChatClient 接口定义
 * AI 对话客户端抽象层
 * @module core/repositories/chat.client
 */

import type { ClientError, JsonSchema } from './shared.types';

/** 聊天消息 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    /** 当 role 为 tool 时，关联的 tool call id */
    toolCallId?: string;
}

/** 工具定义（传给 API 的 schema） */
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: JsonSchema;
}

/** 工具调用结果（API 返回） */
export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

/** Token 使用统计 */
export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
}

/** 聊天请求选项 */
export interface ChatOptions {
    messages: ChatMessage[];
    model: string;
    temperature?: number;
    maxTokens?: number;
    tools?: ToolDefinition[];
}

/** 聊天响应 */
export interface ChatResponse {
    content: string;
    toolCalls?: ToolCall[];
    usage?: TokenUsage;
}

/** 流式事件 */
export type StreamEvent =
    | { type: 'delta'; content: string }
    | { type: 'tool_call'; call: ToolCall }
    | { type: 'done'; usage?: TokenUsage }
    | { type: 'error'; error: ClientError };

/**
 * AI 对话客户端接口
 *
 * Adapters:
 * - BrowserAdapter: 使用 OpenAI SDK 在浏览器中直接调用
 * - ProxyAdapter: 通过后端代理调用
 * - MockAdapter: 测试用 Mock
 */
export interface ChatClient {
    /** 同步对话 */
    chat(options: ChatOptions): Promise<ChatResponse>;

    /** 流式对话，支持取消 */
    stream(
        options: ChatOptions,
        signal?: AbortSignal
    ): AsyncIterable<StreamEvent>;
}
