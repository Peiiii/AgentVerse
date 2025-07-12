import { BaseEvent, EventType, RunAgentInput } from "@ag-ui/core";
import { IAgent, IObservable } from "@agent-labs/agent-chat";
import { Observable } from "rxjs";
import { catchError, filter } from "rxjs/operators";
import { AgentConfig, OpenAIAgent } from "./agent-utils/openai-agent";
import { decodeEventStream } from "./sse-json-decoder";

export class ExperimentalInBrowserAgent implements IAgent {
  private openaiAgent: OpenAIAgent;
  private currentConfig: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    this.currentConfig = {
      apiKey:
        config?.apiKey || import.meta.env.VITE_OPENAI_API_KEY || "",
      model:
        config?.model || import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 1000,
      baseURL:
        config?.baseURL ||
        import.meta.env.VITE_OPENAI_API_URL ||
        "https://api.openai.com/v1",
    };

    if (!this.currentConfig.apiKey) {
      throw new Error(
        "OpenAI API key is required. Please set VITE_OPENAI_API_KEY environment variable."
      );
    }

    this.openaiAgent = new OpenAIAgent(this.currentConfig);
  }

  run(input: RunAgentInput): IObservable<BaseEvent> {
    const createChunkObservable = (generator: AsyncGenerator<string>) =>
      new Observable<string>(subscriber => {
        (async () => {
          try {
            for await (const chunk of generator) {
              subscriber.next(chunk);
            }
            subscriber.complete();
          } catch (err) {
            subscriber.error(err);
          }
        })();
      });

    return new Observable<BaseEvent>(observer => {
      const process = async () => {
        try {
          const acceptHeader = "application/json";
          const generator = this.openaiAgent.run(input, acceptHeader);

          createChunkObservable(generator).pipe(
            decodeEventStream(), // event解码步骤
            filter((event: unknown) => !!event && !!(event as { type?: unknown }).type),  // 业务处理可继续扩展
            // 你可以在这里继续添加更多 operator
            catchError(err => {
              observer.next({
                type: EventType.RUN_ERROR,
                timestamp: Date.now(),
                rawEvent: {
                  message: err instanceof Error ? err.message : "Unknown error",
                },
              });
              observer.error(err);
              return [];
            })
          ).subscribe({
            next: (event: unknown) => observer.next(event as BaseEvent),
            error: err => observer.error(err),
            complete: () => {
              observer.complete();
            }
          });
        } catch (error) {
          observer.next({
            type: EventType.RUN_ERROR,
            timestamp: Date.now(),
            rawEvent: {
              message: error instanceof Error ? error.message : "Unknown error",
            },
          });
          observer.error(error);
        }
      };
      process();
      return () => {
        // 可以在这里添加取消逻辑
      };
    });
  }

  // 设置API密钥
  setApiKey(apiKey: string): void {
    this.currentConfig.apiKey = apiKey;
    this.openaiAgent = new OpenAIAgent(this.currentConfig);
  }

  // 设置模型
  setModel(model: string): void {
    this.currentConfig.model = model;
    this.openaiAgent = new OpenAIAgent(this.currentConfig);
  }

  // 获取当前配置
  getConfig() {
    return {
      model: this.currentConfig.model,
      hasApiKey: !!this.currentConfig.apiKey,
      temperature: this.currentConfig.temperature,
      maxTokens: this.currentConfig.maxTokens,
    };
  }
}
