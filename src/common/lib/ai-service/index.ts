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

const toOpenAiTools = (tools?: ToolDefinition[]) =>
  tools?.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));

const toOpenAiMessages = (
  messages: ChatMessage[]
): ChatCompletionMessageParam[] =>
  messages.map((message) => {
    switch (message.role) {
      case "tool": {
        if (!message.toolCallId) {
          throw new AIServiceError("Missing toolCallId for tool message");
        }
        return {
          role: "tool",
          content: message.content,
          tool_call_id: message.toolCallId,
        };
      }
      case "assistant": {
        const toolCalls =
          message.toolCalls && message.toolCalls.length > 0
            ? message.toolCalls.map((call) => ({
                id: call.id,
                type: "function" as const,
                function: {
                  name: call.name,
                  arguments: JSON.stringify(call.arguments ?? {}),
                },
              }))
            : undefined;
        return {
          role: "assistant",
          content: message.content,
          ...(message.name ? { name: message.name } : {}),
          ...(toolCalls ? { tool_calls: toolCalls } : {}),
        };
      }
      case "system":
      case "user":
      default:
        return {
          role: message.role,
          content: message.content,
          ...(message.name ? { name: message.name } : {}),
        };
    }
  });

const parseToolArguments = (raw: string) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { _raw: raw };
  }
};

type ToolDelta = {
  index?: number;
  id?: string;
  function?: { name?: string; arguments?: string };
};

const createToolCallCollector = () => {
  const calls = new Map<
    string,
    { id?: string; name?: string; args: string; order: number; index?: number }
  >();
  let order = 0;
  let lastKey: string | null = null;

  const resolveKey = (delta: ToolDelta) => {
    if (typeof delta.index === "number") return `index:${delta.index}`;
    if (delta.id) return `id:${delta.id}`;
    return null;
  };

  const ensureEntry = (delta: ToolDelta) => {
    let key = resolveKey(delta);
    if (key && calls.has(key)) {
      lastKey = key;
      return calls.get(key)!;
    }
    if (!key && lastKey && calls.has(lastKey)) {
      return calls.get(lastKey)!;
    }
    if (!key) {
      key = `auto:${order}`;
    }
    const entry = {
      id: delta.id,
      name: delta.function?.name,
      args: "",
      order,
      index: delta.index,
    };
    calls.set(key, entry);
    lastKey = key;
    order += 1;
    return entry;
  };

  return {
    push(delta: ToolDelta) {
      const entry = ensureEntry(delta);
      if (delta.id) entry.id = delta.id;
      if (delta.function?.name) entry.name = delta.function.name;
      if (delta.function?.arguments) {
        entry.args += delta.function.arguments;
      }
    },
    flush() {
      const now = Date.now();
      return Array.from(calls.values())
        .sort((a, b) => {
          if (a.index != null && b.index != null) {
            return a.index - b.index;
          }
          return a.order - b.order;
        })
        .map((data, idx) => ({
          id: data.id || `toolcall-${data.index ?? idx}-${now}`,
          name: data.name || "unknown_tool",
          arguments: parseToolArguments(data.args),
        }));
    },
  };
};

// 核心类型
export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
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
  makeStreamRequest(params: AIRequestParams): Observable<StreamEvent>;
}

export interface AIRequestParams {
  messages: ChatMessage[];
  model: string; // 改为必需
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
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
    maxTokens?: number,
    tools?: ToolDefinition[]
  ): Observable<StreamEvent>;
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
    maxTokens?: number,
    tools?: ToolDefinition[]
  ): Observable<StreamEvent>;
}

export type StreamEvent =
  | { type: "delta"; content: string }
  | { type: "tool_calls"; calls: ToolCall[] }
  | { type: "done" };

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
      const { messages, temperature, maxTokens, model, tools } = params;
      const completion = await this.client.chat.completions.create({
        messages: toOpenAiMessages(messages),
        temperature,
        max_tokens: maxTokens,
        model,
        stream: false,
        tools: toOpenAiTools(tools),
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

  makeStreamRequest(params: AIRequestParams): Observable<StreamEvent> {
    return new Observable<StreamEvent>((subscriber) => {
      const { messages, temperature, maxTokens, model, tools } = params;
      const toolCalls = createToolCallCollector();

      const processStream = async () => {
        try {
          const stream = await this.client.chat.completions.create({
            messages: toOpenAiMessages(messages),
            temperature,
            max_tokens: maxTokens,
            model,
            stream: true,
            tools: toOpenAiTools(tools),
          } as ChatCompletionCreateParams);

          for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
            const delta = chunk.choices[0]?.delta;
            const content = delta?.content;
            if (content) {
              subscriber.next({ type: "delta", content });
            }
            const toolDeltas = delta?.tool_calls ?? [];
            for (const toolDelta of toolDeltas) {
              toolCalls.push(toolDelta);
            }
          }
          const calls = toolCalls.flush();
          if (calls.length > 0) {
            subscriber.next({ type: "tool_calls", calls });
          }
          subscriber.next({ type: "done" });
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

  makeStreamRequest(params: AIRequestParams): Observable<StreamEvent> {
    return new Observable<StreamEvent>((subscriber) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === "string") {
          searchParams.append(key, value);
        } else {
          searchParams.append(key, JSON.stringify(value));
        }
      });

      const toolCalls = createToolCallCollector();
      const eventSource = new EventSource(
        `${this.baseURL}/api/ai/chat/stream?${searchParams.toString()}`
      );

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          const calls = toolCalls.flush();
          if (calls.length > 0) {
            subscriber.next({ type: "tool_calls", calls });
          }
          subscriber.next({ type: "done" });
          subscriber.complete();
          eventSource.close();
          return;
        }

        try {
          const parsed = JSON.parse(event.data);
          const delta = parsed.choices[0]?.delta;
          const content = delta?.content;
          if (content) {
            subscriber.next({ type: "delta", content });
          }
          const toolDeltas = delta?.tool_calls ?? [];
          for (const toolDelta of toolDeltas) {
            toolCalls.push(toolDelta);
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
    maxTokens?: number,
    tools?: ToolDefinition[]
  ): Observable<StreamEvent> {
    const { model, ...providerParams } = this.getProviderParams();
    return this.adapter.makeStreamRequest({
      messages,
      temperature: temperature || this.config.temperature,
      maxTokens: maxTokens || this.config.maxTokens,
      tools,
      model,
      ...providerParams,
    });
  }
}
