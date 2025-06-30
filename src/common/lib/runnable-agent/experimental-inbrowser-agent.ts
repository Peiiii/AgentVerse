import { BaseEvent, EventType, RunAgentInput } from "@ag-ui/core";
import { IAgent, IObservable } from "@agent-labs/agent-chat";
import { Observable } from "rxjs";
import { AgentConfig, OpenAIAgent } from "./agent-utils/openai-agent";

export class ExperimentalInBrowserAgent implements IAgent {
  private openaiAgent: OpenAIAgent;
  private currentConfig: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    this.currentConfig = {
      openaiApiKey:
        config?.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || "",
      model:
        config?.model || import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 1000,
      baseURL:
        config?.baseURL ||
        import.meta.env.VITE_OPENAI_API_URL ||
        "https://api.openai.com/v1",
    };

    if (!this.currentConfig.openaiApiKey) {
      throw new Error(
        "OpenAI API key is required. Please set VITE_OPENAI_API_KEY environment variable."
      );
    }

    this.openaiAgent = new OpenAIAgent(this.currentConfig);
  }

  run(input: RunAgentInput): IObservable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      const processRun = async () => {
        try {
          // 使用现有的OpenAIAgent，传入默认的accept header
          const acceptHeader = "application/json";
          const generator = this.openaiAgent.run(input, acceptHeader);

          // 处理AsyncGenerator的输出
          for await (const encodedEvent of generator) {
            try {
              // 解析编码的事件
              const event = JSON.parse(encodedEvent);

              // 转换为BaseEvent格式
              const baseEvent: BaseEvent = {
                type: event.type,
                timestamp: event.timestamp || Date.now(),
                rawEvent: event,
              };

              observer.next(baseEvent);
            } catch (parseError) {
              console.error("Failed to parse event:", parseError);
            }
          }

          observer.complete();
        } catch (error) {
          console.error("Agent run error:", error);

          // 发送运行错误事件
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

      processRun();

      // 返回清理函数
      return () => {
        // 可以在这里添加取消逻辑
      };
    });
  }

  // 设置API密钥
  setApiKey(apiKey: string): void {
    this.currentConfig.openaiApiKey = apiKey;
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
      hasApiKey: !!this.currentConfig.openaiApiKey,
      temperature: this.currentConfig.temperature,
      maxTokens: this.currentConfig.maxTokens,
    };
  }
}
