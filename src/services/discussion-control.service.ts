import { CapabilityRegistry } from "@/common/lib/capabilities";
import {
  DiscussionEnvBus,
  DiscussionKeys,
} from "@/common/lib/discussion/discussion-env";
import { RxEvent } from "@/common/lib/rx-event";
import { messagesResource } from "@/resources";
import { discussionCapabilitiesResource } from "@/resources/discussion-capabilities.resource";
import { AgentManager } from "@/services/agent/agent-manager";
import { messageService } from "@/services/message.service";
import { typingIndicatorService } from "@/services/typing-indicator.service";
import {
  AgentMessage,
  NormalMessage
} from "@/common/types/discussion";
import {
  DiscussionError,
  DiscussionErrorType,
  handleDiscussionError,
} from "./discussion-error.util";
import { DiscussionStateManager } from "./discussion/discussion-state-manager";

class TimeoutManager {
  private timeouts = new Set<NodeJS.Timeout>();

  schedule(fn: () => void, delay: number) {
    const timeout = setTimeout(() => {
      fn();
      this.timeouts.delete(timeout);
    }, delay);
    this.timeouts.add(timeout);
    return timeout;
  }

  clearAll() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
  }
}

export class DiscussionControlService extends DiscussionStateManager {
  onError$ = new RxEvent<Error>();

  private timeoutManager = new TimeoutManager();
  private agentManager: AgentManager;
  env: DiscussionEnvBus;

  // 生命周期管理
  private serviceCleanupHandlers: Array<() => void> = []; // 服务级清理
  private discussionCleanupHandlers: Array<() => void> = []; // 讨论级清理
  private runtimeCleanupHandlers: Array<() => void> = []; // 运行时清理

  constructor() {
    super();
    this.env = new DiscussionEnvBus();
    this.agentManager = new AgentManager(this.env);
    this.initializeService();
  }

  // 服务级初始化
  private initializeService() {
    // 1. 注册能力
    discussionCapabilitiesResource.whenReady().then((data) => {
      CapabilityRegistry.getInstance().registerAll(data);
    });

    // 2. 监听成员变化
    const membersSub = this.onStateChange$.listen(([prev, current]) => {
      if (prev.members !== current.members) {
        this.agentManager.syncAgents(current.members);
      }
    });
    this.serviceCleanupHandlers.push(() => membersSub());
  }

  setCurrentDiscussionId(id: string | null) {
    const oldId = this.getCurrentDiscussionId();
    if (oldId !== id) {
      // 1. 先清理当前讨论的所有状态
      this.cleanupCurrentDiscussion();

      // 2. 再设置新的讨论 ID
      super.setCurrentDiscussionId(id);
    }
  }

  private cleanupCurrentDiscussion() {
    // 1. 暂停当前讨论
    this.pause();

    // 2. 清理所有指示器
    typingIndicatorService.clearAll();

    // 3. 重置环境状态
    this.env.reset();
    this.env.speakScheduler.resetCounter();

    // 4. 清理所有代理状态
    this.agentManager.pauseAll();

    // 5. 重置讨论相关状态
    this.resetDiscussionState();

    // 6. 执行讨论级清理
    this.discussionCleanupHandlers.forEach((cleanup) => cleanup());
    this.discussionCleanupHandlers = [];

    // 7. 清理运行时资源
    this.cleanupRuntime();
  }

  onMessage(message: AgentMessage) {
    this.env.eventBus.emit(DiscussionKeys.Events.message, message);
  }

  // 讨论级初始化
  private initializeDiscussion() {
    // 添加讨论级事件监听
    const thinkingOff = this.env.eventBus.on(
      DiscussionKeys.Events.thinking,
      (state) => {
        const { agentId, isThinking } = state;
        typingIndicatorService.updateStatus(
          agentId,
          isThinking ? "thinking" : null
        );
      }
    );
    this.discussionCleanupHandlers.push(thinkingOff);

    // 添加消息限制监听
    const scheduler = this.env.speakScheduler;
    const limitReachedOff = scheduler.onLimitReached$.listen(() => {
      // 添加系统消息
      const warningMessage: NormalMessage = {
        agentId: "system",
        content: `由于本轮消息数量达到限制（${scheduler.getRoundLimit()}条），讨论已自动暂停。这是为了避免自动对话消耗过多资源，您可手动重启对话。此为临时解决方案，后续会努力提供更合理的自动终止策略。`,
        type: "text",
        id: `system-${Date.now()}`,
        discussionId: this.getCurrentDiscussionId()!,
        timestamp: new Date(),
      };
      messageService.addMessage(
        this.getCurrentDiscussionId()!,
        warningMessage
      );
      messagesResource.current.reload();
      // 暂停讨论
      this.pause();
    });

    this.discussionCleanupHandlers.push(limitReachedOff);
  }

  // 运行时控制
  pause() {
    // 1. 设置暂停状态
    this.setPaused(true);

    // 2. 暂停所有 agents
    this.agentManager.pauseAll();

    // 3. 暂停调度器
    this.env.speakScheduler.setPaused(true);

    // 4. 发送讨论暂停事件
    this.env.eventBus.emit(DiscussionKeys.Events.discussionPause, null);

    // 5. 清理运行时资源
    this.cleanupRuntime();

    // 6. 重置计数器
    this.env.speakScheduler.resetCounter();
  }

  resume() {
    // 1. 设置恢复状态
    this.setPaused(false);

    // 2. 恢复调度器
    this.env.speakScheduler.setPaused(false);
    this.env.speakScheduler.resetCounter();

    // 3. 恢复所有 agents
    this.agentManager.resumeAll();

    // 4. 发送讨论恢复事件
    this.env.eventBus.emit(DiscussionKeys.Events.discussionResume, null);
  }

  // 清理方法分层
  private cleanupRuntime() {
    // 清理运行时资源（定时器等）
    this.timeoutManager.clearAll();
    this.runtimeCleanupHandlers.forEach((cleanup) => cleanup());
    this.runtimeCleanupHandlers = [];
  }

  private cleanupDiscussion() {
    // 清理讨论级资源
    this.discussionCleanupHandlers.forEach((cleanup) => cleanup());
    this.discussionCleanupHandlers = [];
    this.cleanupRuntime(); // 同时清理运行时资源
  }

  private cleanupService() {
    // 清理服务级资源
    this.serviceCleanupHandlers.forEach((cleanup) => cleanup());
    this.serviceCleanupHandlers = [];
    this.cleanupDiscussion(); // 同时清理讨论级资源
  }

  // 完全销毁服务
  destroy() {
    // 1. 清理所有代理
    this.agentManager.cleanup();

    // 2. 清理环境
    this.env.destroy();

    // 3. 清理所有级别的资源
    this.cleanupService();

    // 4. 重置所有状态
    this.resetAllState();
  }

  private handleError(
    error: unknown,
    message: string,
    context?: Record<string, unknown>
  ) {
    const discussionError =
      error instanceof DiscussionError
        ? error
        : new DiscussionError(
            DiscussionErrorType.GENERATE_RESPONSE,
            message,
            error,
            context
          );

    const { shouldPause } = handleDiscussionError(discussionError);
    if (shouldPause) {
      this.setPaused(true);
    }
    this.onError$.next(discussionError);
  }

  getAgent(agentId: string) {
    return this.agentManager.getAgent(agentId);
  }

  // 恢复已有讨论
  private async resumeExistingDiscussion(): Promise<void> {
    const state = this.getState();
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage) {
      // 1. 初始化讨论级资源
      await this.initializeDiscussion();

      // 2. 恢复运行时状态
      await this.resumeAndWaitReady();

      // 3. 重放最后一条消息以触发响应
      if (lastMessage.type === "text") {
        // 延迟一小段时间确保所有状态都已经准备就绪
        await new Promise((resolve) => setTimeout(resolve, 100));
        // 重放消息
        this.onMessage(lastMessage);
      }
    }
  }

  // 等待所有组件就绪
  private async resumeAndWaitReady(): Promise<void> {
    // 创建所有 agent 就绪的 Promise 数组
    const agentReadyPromises = this.agentManager.getAllAgents().map(
      (agent) =>
        new Promise<void>((resolve) => {
          // 监听 agent 的状态变化
          const off = agent.onStateChange$.listen((state) => {
            if (!state.isPaused && !state.isThinking) {
              off();
              resolve();
            }
          });
        })
    );

    // 创建一个 Promise 来等待调度器就绪
    const schedulerReadyPromise = new Promise<void>((resolve) => {
      const off = this.env.speakScheduler.isPausedBean.$.subscribe(
        (isPaused) => {
          if (!isPaused) {
            off.unsubscribe();
            resolve();
          }
        }
      );
    });

    // 先恢复状态
    this.resume();

    // 等待所有组件就绪
    await Promise.all([...agentReadyPromises, schedulerReadyPromise]);
  }

  // 主入口方法
  async run(): Promise<void> {
    try {
      // 1. 检查是否已经在运行
      if (!this.isPaused()) {
        console.log("[DiscussionControl] Discussion is already running");
        return;
      }

      // 2. 检查是否有历史消息和成员
      const state = this.getState();
      if (state.messages.length > 0 && state.members.length > 0) {
        console.log("[DiscussionControl] Resuming existing discussion");
        await this.resumeExistingDiscussion();
        return;
      }

      throw new DiscussionError(
        DiscussionErrorType.NO_MESSAGES,
        "没有历史消息"
      );
    } catch (error) {
      console.error("[DiscussionControl] Failed to run discussion:", error);
      this.handleError(error, "讨论运行失败");
      this.pause();
    }
  }
}

export const discussionControlService = new DiscussionControlService();
