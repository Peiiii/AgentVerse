import { Agent } from "@/common/types/agent";
import {
  DiscussionKeys,
  IDiscussionEnvBus,
} from "../discussion/discussion-env";
import { RxEvent } from "@/common/lib/rx-event";

/**
 * Agent的基础配置接口
 */
export interface IAgentConfig extends Agent {
  name: string;
  agentId: string;
  /**
   * 提示词模板，支持使用变量插值
   * @example
   * ```
   * 你是一个名叫{{agent.name}}的助手。
   * 你非常擅长聊天，善于倾听和回答问题。
   * 你会以专业、友好的方式帮助用户解决问题。
   * ```
   */
  prompt: string;
  conversation?: {
    minResponseDelay?: number;
    contextMessages?: number;
  };
  // [key: string]: unknown;
}

export interface BaseAgentState {
  lastSpeakTime?: Date;
  isThinking?: boolean;
  respondToSelf?: boolean;
  autoReply?: boolean;
  isPaused?: boolean;
}

/**
 * Agent的基础类
 * S 类型不能包含 InternalState 中的字段
 */
export abstract class BaseAgent<S extends BaseAgentState = BaseAgentState> {
  protected env!: IDiscussionEnvBus;
  protected config: IAgentConfig;
  protected state: S;
  protected lastActionMessageId?: string;
  protected useStreaming: boolean = true; // 默认使用流式输出

  // 状态变更事件
  public readonly onStateChange$ = new RxEvent<S>();

  constructor(config: IAgentConfig, initialState: S) {
    this.config = config;
    this.state = { ...initialState };
  }

  updateConfig(config: Partial<IAgentConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  updateState(state: Partial<S>): void {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  protected getPrompt(): string {
    if (!this.config.prompt) return "";
    return this.processPromptTemplate(this.config.prompt);
  }

  protected processPromptTemplate(template: string): string {
    const context = {
      agent: this.config,
      // 未来可以在这里添加更多上下文
      // env: this.env,
      // state: this.state,
    };

    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      try {
        const path = expression.trim();
        // 未来可以在这里添加函数调用支持
        // if (path.includes('(')) { ... }

        const keys = path.split(".");
        let value: unknown = context;

        for (const key of keys) {
          if (value && typeof value === "object") {
            value = (value as Record<string, unknown>)[key];
          } else {
            return match;
          }
        }

        return value === undefined ? match : String(value);
      } catch {
        return match;
      }
    });
  }

  public enterEnv(env: IDiscussionEnvBus): void {
    if (this.env) {
      throw new Error(`Agent ${this.config.name} is already in an environment`);
    }
    this.env = env;
    this.onEnter();
  }

  public leaveEnv(): void {
    if (!this.env) {
      throw new Error(`Agent ${this.config.name} is not in any environment`);
    }

    try {
      this.onLeave();
      this.cleanupHandlers.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error(
            `Error during cleanup in agent ${this.config.name}:`,
            error
          );
        }
      });
    } finally {
      this.cleanupHandlers = [];
      this.env = undefined!;
    }
  }

  protected addCleanup(cleanup: () => void): void {
    this.cleanupHandlers.push(cleanup);
  }

  protected setState(
    updates: Partial<S> | ((prevState: S) => Partial<S>)
  ): void {
    const prevState = this.state;
    this.state = {
      ...this.state,
      ...(typeof updates === "function" ? updates(prevState) : updates),
    };

    // 当isThinking状态改变时，发送事件
    if (
      "isThinking" in this.state &&
      prevState.isThinking !== this.state.isThinking
    ) {
      this.env.eventBus.emit(DiscussionKeys.Events.thinking, {
        agentId: this.config.agentId,
        isThinking: this.state.isThinking || false,
      });
    }

    // 发送状态变更事件
    this.onStateChange$.next(this.state);
  }

  // 允许切换输出模式
  setStreamingMode(enabled: boolean) {
    this.useStreaming = enabled;
  }

  protected abstract onEnter(): void;
  protected onLeave(): void {}

  private cleanupHandlers: Array<() => void> = [];

  public pause(): void {
    this.setState((prevState) => ({
      ...prevState,
      isPaused: true,
      isThinking: false
    } as Partial<S>));
    this.onStateChange$.next(this.state);
    this.onPause();
  }

  public resume(): void {
    this.setState((prevState) => ({
      ...prevState,
      isPaused: false,
      isThinking: false
    } as Partial<S>));
    this.onStateChange$.next(this.state);
    this.onResume();
  }

  protected onPause(): void {}
  protected onResume(): void {}

  protected shouldProcessMessage(): boolean {
    return !this.state.isPaused;
  }
}
