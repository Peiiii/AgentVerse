import { AgentMessage } from "@/types/discussion";
import { SpeakRequest, SpeakScheduler } from "./speak-scheduler";
import { createKey, EnvironmentBus, IEnvironmentBus } from "../typed-bus";

// 扩展的事件和状态键
export const DiscussionKeys = {
  Events: {
    message: createKey<AgentMessage>("message"),
    discussionStart: createKey<{ topic: string }>("discussionStart"),
    discussionPause: createKey<void>("discussionPause"),
    discussionResume: createKey<void>("discussionResume"),
    thinking: createKey<{ agentId: string; isThinking: boolean }>("thinking"),
  },
  States: {
    speaking: createKey<string | null>("speaking"),
  },
};

export class DiscussionEnvBus extends EnvironmentBus {
  speakScheduler: SpeakScheduler;

  constructor() {
    super();
    this.speakScheduler = new SpeakScheduler();
  }

  // 提交发言请求
  public submitSpeakRequest(request: SpeakRequest): void {
    this.speakScheduler.submit(request);
  }

  public destroy(): void {
    this.speakScheduler.clear();
    this.reset();
  }
}

// 导出类型
export type IDiscussionEnvBus = IEnvironmentBus & DiscussionEnvBus;

// 重新导出类型
export type { SpeakReason, SpeakRequest } from './speak-scheduler';
