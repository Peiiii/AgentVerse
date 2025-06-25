import { RxEvent } from "@/common/lib/rx-event";
import { AgentMessage } from "@/types/discussion";
import { createNestedBean, createProxyBean } from "rx-nested-bean";

export interface SpeakRequest {
  agentId: string;
  agentName: string;
  reason: SpeakReason;
  priority: number;
  timestamp: Date;
  message: AgentMessage;
  onGranted: () => Promise<void>;
}

export interface SpeakReason {
  type: "mentioned" | "auto_reply" | "follow_up" | "other";
  description: string;
  factors?: {
    isModerator?: boolean;
    isContextRelevant?: number; // 0-1
    timeSinceLastSpeak?: number;
  };
}

// 说话状态
export type SpeakingState = {
  agentId: string | null;
  startTime: Date | null;
  timeoutId: NodeJS.Timeout | null;
  controller: AbortController | null;
};

export class SpeakScheduler {
  private requests: SpeakRequest[] = [];
  private readonly MAX_MESSAGES = 20; // 最大消息数限制
  private readonly SPEAK_TIMEOUT = 300000; // 说话超时时间，300秒

  // 状态管理
  private store = createNestedBean({
    messageCounter: 0,
    speaking: {
      agentId: null as string | null,
      startTime: null as Date | null,
      timeoutId: null as NodeJS.Timeout | null,
      controller: null as AbortController | null,
    } as SpeakingState,
    isPaused: false
  });

  // 代理访问器
  messageCounterBean = createProxyBean(this.store, "messageCounter");
  speakingStateBean = createProxyBean(this.store, "speaking");
  isPausedBean = createProxyBean(this.store, "isPaused");

  // 事件通知
  public onMessageProcessed$ = new RxEvent<number>();
  public onLimitReached$ = new RxEvent<void>();
  public onSpeakTimeout$ = new RxEvent<string>(); // 发送超时的 agentId
  public onSpeakInterrupted$ = new RxEvent<string>(); // 发言被中断的 agentId

  constructor() {
    // 监听说话状态变化
    this.speakingStateBean.$.subscribe((state) => {
      // 只在agentId变化且不为null时设置超时
      if (state.agentId && !state.timeoutId) {
        this.setupSpeakTimeout(state.agentId);
      }
    });
  }

  public setPaused(paused: boolean) {
    this.isPausedBean.set(paused);
    if (paused) {
      // 暂停时中断当前发言
      const currentState = this.speakingStateBean.get();
      if (currentState.agentId) {
        this.interruptSpeaking(currentState.agentId);
      }
      // 清空请求队列
      this.requests = [];
      // 清除当前说话状态
      this.clearSpeakingState();
    }
  }

  public getRoundLimit() {
    return this.MAX_MESSAGES;
  }

  public getCurrentSpeaker(): string | null {
    return this.speakingStateBean.get().agentId;
  }

  public submit(request: SpeakRequest): void {
    this.requests.push(request);
    this.processNextRequest();
  }

  public completeSpeaking(agentId: string): void {
    const currentState = this.speakingStateBean.get();
    if (currentState.agentId === agentId) {
      this.clearSpeakingState();
      this.processNextRequest();
    }
  }

  public clear(): void {
    this.requests = [];
    this.messageCounterBean.set(0);
    this.clearSpeakingState();
  }

  private async processNextRequest(): Promise<void> {
    // 如果讨论已暂停，不处理请求
    if (this.isPausedBean.get()) {
      return;
    }

    // 如果当前有人在说话，不处理
    if (this.speakingStateBean.get().agentId) {
      return;
    }

    // 如果没有请求，不处理
    if (this.requests.length === 0) {
      return;
    }

    // 检查是否达到限制
    if (this.messageCounterBean.get() >= this.MAX_MESSAGES) {
      this.onLimitReached$.next();
      this.messageCounterBean.set(0);
      return;
    }

    const nextSpeaker = this.selectNextSpeaker();
    if (!nextSpeaker) return;

    // 再次检查是否暂停（防止在处理过程中状态改变）
    if (this.isPausedBean.get()) {
      return;
    }

    // 设置说话状态
    const controller = new AbortController();
    this.speakingStateBean.set({
      agentId: nextSpeaker.agentId,
      startTime: new Date(),
      timeoutId: null,
      controller
    });

    // 清除被选中 agent 的所有其他请求
    this.requests = this.requests.filter(
      (req) => req.agentId !== nextSpeaker.agentId
    );

    // 执行回调
    try {
      await nextSpeaker.onGranted();
      this.messageCounterBean.set(this.messageCounterBean.get() + 1);
      this.onMessageProcessed$.next(this.messageCounterBean.get());
    } catch (error) {
      console.error("Error executing speak callback:", error);
      this.clearSpeakingState();
    }
  }

  private setupSpeakTimeout(agentId: string): void {
    const timeoutId = setTimeout(() => {
      this.onSpeakTimeout$.next(agentId);
      this.clearSpeakingState();
      this.processNextRequest();
    }, this.SPEAK_TIMEOUT);

    // 直接更新timeoutId，不触发完整的状态更新
    const currentState = this.speakingStateBean.get();
    if (currentState.agentId === agentId) {
      this.speakingStateBean.set({
        ...currentState,
        timeoutId
      });
    }
  }

  private clearSpeakingState(): void {
    const currentState = this.speakingStateBean.get();
    if (currentState.timeoutId) {
      clearTimeout(currentState.timeoutId);
    }
    if (currentState.controller) {
      currentState.controller.abort();
    }
    
    this.speakingStateBean.set({
      agentId: null,
      startTime: null,
      timeoutId: null,
      controller: null
    });
  }

  private selectNextSpeaker(): SpeakRequest | null {
    if (this.requests.length === 0) return null;

    // 计算所有请求的得分
    const scoredRequests = this.requests.map(request => ({
      request,
      score: this.calculateScore(request)
    }));

    // 按得分降序排序
    scoredRequests.sort((a, b) => b.score - a.score);

    // 返回得分最高的请求
    return scoredRequests[0].request;
  }

  private calculateScore(request: SpeakRequest): number {
    const now = Date.now();
    const { reason, timestamp } = request;
    let score = 0;

    // 基础分数：根据请求类型
    switch (reason.type) {
      case "mentioned": 
        score += 100; // 被提到的优先级最高
        break;
      case "follow_up":
        score += 80;  // 跟进回复次优先
        break;
      case "auto_reply":
        score += 50;  // 自动回复基础优先级
        break;
      default:
        score += 30;
    }

    // 角色加权
    if (reason.factors?.isModerator) {
      score *= 1.5; // 主持人权重提升
    }

    // 上下文相关性
    if (reason.factors?.isContextRelevant) {
      score += reason.factors.isContextRelevant * 30; // 相关性越高分数越高
    }

    // 时间衰减：距离上次发言时间越长，优先级越高
    if (reason.factors?.timeSinceLastSpeak) {
      const timeBonus = Math.min(reason.factors.timeSinceLastSpeak / 60000, 5) * 10; // 每分钟加10分，最多5分钟
      score += timeBonus;
    }

    // 请求时间衰减：等待时间越长，适当提升优先级
    const waitTime = (now - timestamp.getTime()) / 1000; // 秒
    score += Math.min(waitTime / 10, 20); // 每10秒加1分，最多加20分

    return score;
  }

  public resetCounter(): void {
    this.messageCounterBean.set(0);
    this.onMessageProcessed$.next(this.messageCounterBean.get());
  }

  private interruptSpeaking(agentId: string): void {
    const currentState = this.speakingStateBean.get();
    if (currentState.agentId === agentId && currentState.controller) {
      currentState.controller.abort();
      this.onSpeakInterrupted$.next(agentId);
    }
  }

  public startSpeaking(agentId: string): AbortController {
    const controller = new AbortController();
    this.speakingStateBean.set({
      agentId,
      startTime: new Date(),
      timeoutId: null,
      controller
    } as SpeakingState);
    return controller;
  }
}
