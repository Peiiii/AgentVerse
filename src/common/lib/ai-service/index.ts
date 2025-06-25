import OpenAI from "openai";
import { APIError } from "openai/error";
import {
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { Observable } from "rxjs";

// 错误类
export class AIServiceError extends Error {
  constructor(message: string, public code?: string, public type?: string) {
    super(message);
    this.name = "AIServiceError";
  }
}

// 核心类型
export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// 核心接口
export interface BaseConfig {
  apiKey: string;
  baseUrl?: string;
  model: string; // 改为必需
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface APIAdapter {
  configure(config: BaseConfig): void;
  makeRequest(params: AIRequestParams): Promise<string>;
  makeStreamRequest(params: AIRequestParams): Observable<string>;
}

export interface AIRequestParams {
  messages: ChatMessage[];
  model: string; // 改为必需
  temperature?: number;
  maxTokens?: number;
  [key: string]: unknown;
}

export interface LLMProvider {
  configure(config: BaseConfig): void;
  generateCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number
  ): Promise<string>;

  generateStreamCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number
  ): Observable<string>;
}

// Provider 参数接口
export interface ProviderParams {
  provider: string;
  model: string;
  [key: string]: unknown;
}

// Provider 抽象基类
export abstract class BaseLLMProvider implements LLMProvider {
  constructor(
    protected config: BaseConfig,
    protected readonly adapter: APIAdapter
  ) {
    this.validateConfig(config);
  }

  configure(config: BaseConfig): void {
    this.config = { ...this.config, ...config };
    this.adapter.configure(config);
  }

  protected validateConfig(config: BaseConfig): void {
    if (!config.apiKey) {
      throw new AIServiceError("Missing API key");
    }
    if (!config.model) {
      throw new AIServiceError("Missing model");
    }
  }

  protected abstract getProviderParams(): ProviderParams;

  async generateCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    const { model, ...providerParams } = this.getProviderParams();
    return this.adapter.makeRequest({
      messages,
      temperature: temperature || this.config.temperature,
      maxTokens: maxTokens || this.config.maxTokens,
      model,
      ...providerParams,
    });
  }

  public abstract generateStreamCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number
  ): Observable<string>;
}

// 通用适配器实现
export class DirectAPIAdapter implements APIAdapter {
  private client: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });
  }

  configure(config: BaseConfig): void {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  async makeRequest(params: AIRequestParams): Promise<string> {
    try {
      const { messages, temperature, maxTokens, model } = params;
      const completion = await this.client.chat.completions.create({
        messages: messages as ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
        model,
        stream: false,
      } as ChatCompletionCreateParams);

      if (!("choices" in completion)) {
        throw new AIServiceError("Invalid response format");
      }

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      throw new AIServiceError(
        error instanceof Error ? error.message : "API request failed",
        (error as APIError)?.code || undefined,
        (error as APIError)?.type || undefined
      );
    }
  }

  makeStreamRequest(params: AIRequestParams): Observable<string> {
    return new Observable<string>((subscriber) => {
      const { messages, temperature, maxTokens, model } = params;

      const processStream = async () => {
        try {
          const stream = await this.client.chat.completions.create({
            messages: messages as ChatCompletionMessageParam[],
            temperature,
            max_tokens: maxTokens,
            model,
            stream: true,
          } as ChatCompletionCreateParams);

          for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              subscriber.next(content);
            }
          }
          subscriber.complete();
        } catch (error) {
          subscriber.error(
            new AIServiceError(
              error instanceof Error ? error.message : "Stream request failed",
              (error as APIError)?.code || undefined,
              (error as APIError)?.type || undefined
            )
          );
        }
      };

      processStream();

      return () => {
        // Cleanup if needed
      };
    });
  }
}

export class ProxyAPIAdapter implements APIAdapter {
  constructor(private baseURL: string) {}

  configure(config: BaseConfig): void {
    this.baseURL = config.baseUrl || this.baseURL;
  }

  async makeRequest(params: AIRequestParams): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AIServiceError(error.error, error.code, error.type);
      }

      const data = await response.json();
      return data.choices[0].message.content || "";
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError(
        error instanceof Error ? error.message : "API request failed"
      );
    }
  }

  makeStreamRequest(params: AIRequestParams): Observable<string> {
    return new Observable<string>((subscriber) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === "string") {
          searchParams.append(key, value);
        } else {
          searchParams.append(key, JSON.stringify(value));
        }
      });

      const eventSource = new EventSource(
        `${this.baseURL}/api/ai/chat/stream?${searchParams.toString()}`
      );

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          subscriber.complete();
          eventSource.close();
          return;
        }

        try {
          const parsed = JSON.parse(event.data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            subscriber.next(content);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = () => {
        subscriber.error(new AIServiceError("SSE connection failed"));
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }
}

// 通用 Provider 实现
export class StandardProvider extends BaseLLMProvider {
  constructor(
    protected readonly config: BaseConfig,
    protected readonly adapter: APIAdapter,
    private readonly providerType: string
  ) {
    super(config, adapter);
  }

  public getProviderParams(): ProviderParams {
    return {
      provider: this.providerType,
      model: this.config.model,
    };
  }

  public generateStreamCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number
  ): Observable<string> {
    const { model, ...providerParams } = this.getProviderParams();
    return this.adapter.makeStreamRequest({
      messages,
      temperature: temperature || this.config.temperature,
      maxTokens: maxTokens || this.config.maxTokens,
      model,
      ...providerParams,
    });
  }
}
