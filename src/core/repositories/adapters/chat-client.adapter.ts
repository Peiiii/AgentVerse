/**
 * ChatClient 的浏览器直连 Adapter
 * 包装现有 ai-service 实现
 * @module core/repositories/adapters/chat-client.adapter
 */

import { ClientError } from '../shared.types';
import type {
    ChatClient,
    ChatMessage,
    ChatOptions,
    ChatResponse,
    StreamEvent,
} from '../chat.client';
import {
    DirectAPIAdapter,
    StandardProvider,
    BaseConfig,
} from '@/common/lib/ai-service';

/**
 * 浏览器直连适配器
 * 使用 OpenAI SDK 直接在浏览器中调用 API
 */
export class BrowserChatClientAdapter implements ChatClient {
    private provider: StandardProvider | null = null;
    private config: BaseConfig | null = null;

    /**
     * 配置 API 连接参数
     */
    configure(config: BaseConfig): void {
        const adapter = new DirectAPIAdapter(config.apiKey, config.baseUrl);
        this.config = { ...config };
        this.provider = new StandardProvider(this.config, adapter, 'openai');
    }

    private ensureProvider(model?: string): StandardProvider {
        if (!this.provider || !this.config) {
            throw new ClientError(
                'ChatClient not configured. Call configure() first.',
                'INVALID_REQUEST'
            );
        }
        if (model && this.config.model !== model) {
            const nextConfig = { ...this.config, model };
            this.config = nextConfig;
            this.provider.configure(nextConfig);
        }
        return this.provider;
    }

    /**
     * 将 ChatMessage 转换为 ai-service ChatMessage
     */
    private toServiceMessages(
        messages: ChatMessage[]
    ): { role: 'system' | 'user' | 'assistant'; content: string }[] {
        return messages
            .filter((m) => m.role !== 'tool') // 暂不支持 tool role
            .map((m) => ({
                role: m.role as 'system' | 'user' | 'assistant',
                content: m.content,
            }));
    }

    async chat(options: ChatOptions): Promise<ChatResponse> {
        const provider = this.ensureProvider(options.model);

        // 注意：当前 ai-service 不支持 tools，这里只处理基础对话
        if (options.tools && options.tools.length > 0) {
            console.warn(
                '[ChatClient] Tools are not supported in this adapter version'
            );
        }

        try {
            const content = await provider.generateCompletion(
                this.toServiceMessages(options.messages),
                options.temperature,
                options.maxTokens
            );

            return {
                content,
                toolCalls: undefined,
                usage: undefined, // 当前 ai-service 不返回 usage
            };
        } catch (error) {
            throw new ClientError(
                error instanceof Error ? error.message : 'Chat request failed',
                'UNKNOWN',
                undefined,
                error
            );
        }
    }

    async *stream(
        options: ChatOptions,
        signal?: AbortSignal
    ): AsyncIterable<StreamEvent> {
        const provider = this.ensureProvider(options.model);
        let abortHandler: (() => void) | undefined;
        let subscription: { unsubscribe: () => void } | null = null;

        if (options.tools && options.tools.length > 0) {
            console.warn(
                '[ChatClient] Tools are not supported in this adapter version'
            );
        }

        try {
            const observable = provider.generateStreamCompletion(
                this.toServiceMessages(options.messages),
                options.temperature,
                options.maxTokens
            );

            // 将 RxJS Observable 转换为 AsyncIterable
            const chunks: string[] = [];
            let completed = false;
            let streamError: Error | null = null;
            let aborted = false;
            // 检查是否已取消
            if (signal?.aborted) {
                yield { type: 'error', error: new ClientError('Aborted', 'UNKNOWN') };
                return;
            }

            subscription = observable.subscribe({
                next: (chunk) => chunks.push(chunk),
                error: (err: Error) => {
                    streamError = err;
                    completed = true;
                },
                complete: () => {
                    completed = true;
                },
            });

            // 监听取消信号
            if (signal) {
                abortHandler = () => {
                    aborted = true;
                    subscription?.unsubscribe();
                    completed = true;
                };
                signal.addEventListener('abort', abortHandler);
            }

            // 轮询输出 chunks
            while (!completed || chunks.length > 0) {
                if (aborted) {
                    yield { type: 'error', error: new ClientError('Aborted', 'UNKNOWN') };
                    return;
                }

                if (chunks.length > 0) {
                    const content = chunks.shift()!;
                    yield { type: 'delta', content };
                } else if (!completed) {
                    // 等待更多数据
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            }

            if (streamError) {
                yield {
                    type: 'error',
                    error: new ClientError(
                        (streamError as Error).message,
                        'UNKNOWN',
                        undefined,
                        streamError
                    ),
                };
            } else {
                yield { type: 'done', usage: undefined };
            }
        } catch (error) {
            yield {
                type: 'error',
                error: new ClientError(
                    error instanceof Error ? error.message : 'Stream failed',
                    'UNKNOWN',
                    undefined,
                    error
                ),
            };
        } finally {
            if (signal && abortHandler) {
                signal.removeEventListener('abort', abortHandler);
            }
            subscription?.unsubscribe();
        }
    }
}

/** 默认 ChatClient 实例（未配置） */
export const chatClient: ChatClient = new BrowserChatClientAdapter();
