import { DEFAULT_SETTINGS } from "@/config/settings";
import { BaseAgent, ChatAgent } from "@/common/lib/agent";
import {
  DiscussionEnvBus,
  DiscussionKeys,
} from "@/common/lib/discussion/discussion-env";
import { RxEvent } from "@/common/lib/rx-event";
import { agentListResource } from "@/core/resources";
import { AgentMessage } from "@/common/types/discussion";
import { DiscussionMember } from "@/common/types/discussion-member";
import { createNestedBean, createProxyBean } from "packages/rx-nested-bean/src";

export class TimeoutManager {
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
export class DiscussionStore {
  readonly store = createNestedBean({
    messages: [] as AgentMessage[],
    isPaused: true,
    currentDiscussionId: null as string | null,
    settings: DEFAULT_SETTINGS,
    currentRound: 0,
    currentSpeakerIndex: -1,
    members: [] as DiscussionMember[],
    topic: "",
  });

  readonly messagesBean = createProxyBean(this.store, "messages");
  readonly isPausedBean = createProxyBean(this.store, "isPaused");
  readonly settingsBean = createProxyBean(this.store, "settings");
  readonly currentDiscussionIdBean = createProxyBean(
    this.store,
    "currentDiscussionId"
  );
  readonly currentRoundBean = createProxyBean(this.store, "currentRound");
  readonly currentSpeakerIndexBean = createProxyBean(
    this.store,
    "currentSpeakerIndex"
  );
  readonly membersBean = createProxyBean(this.store, "members");
  readonly topicBean = createProxyBean(this.store, "topic");

  reset() {
    this.messagesBean.set([]);
    this.isPausedBean.set(true);
    this.currentDiscussionIdBean.set(null);
    this.settingsBean.set(DEFAULT_SETTINGS);
    this.currentRoundBean.set(0);
    this.currentSpeakerIndexBean.set(-1);
    this.membersBean.set([]);
    this.topicBean.set("");
  }
}
export class AgentManager {
  private agents = new Map<string, BaseAgent>();
  private env: DiscussionEnvBus;

  constructor(env: DiscussionEnvBus) {
    this.env = env;
  }

  syncWithMembers(members: DiscussionMember[]) {
    // 移除不在 members 中的 agents
    for (const [agentId, agent] of this.agents) {
      if (!members.find((m) => m.agentId === agentId)) {
        agent.leaveEnv();
        this.agents.delete(agentId);
      }
    }

    // 更新或添加 agents
    for (const member of members) {
      const agentData = agentListResource
        .read()
        .data.find((agent) => agent.id === member.agentId)!;
      const existingAgent = this.agents.get(member.agentId);
      if (existingAgent) {
        existingAgent.updateConfig({ ...agentData });
        existingAgent.updateState({ autoReply: member.isAutoReply });
      } else {
        const agent = new ChatAgent(
          {
            ...agentData,
            agentId: member.agentId,
          },
          { autoReply: member.isAutoReply }
        );
        this.agents.set(member.agentId, agent);
        agent.enterEnv(this.env);
      }
    }
  }

  pauseAll() {
    for (const agent of this.agents.values()) {
      agent.pause();
    }
  }

  resumeAll() {
    for (const agent of this.agents.values()) {
      agent.resume();
    }
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  cleanup() {
    for (const agent of this.agents.values()) {
      agent.leaveEnv();
    }
    this.agents.clear();
  }
}
export class CleanupManager {
  private cleanupHandlers = new Map<string, Array<() => void>>();

  readonly SERVICE = "service";
  readonly DISCUSSION = "discussion";
  readonly RUNTIME = "runtime";

  constructor() {
    this.cleanupHandlers.set(this.SERVICE, []);
    this.cleanupHandlers.set(this.DISCUSSION, []);
    this.cleanupHandlers.set(this.RUNTIME, []);
  }

  addHandler(level: string, handler: () => void) {
    const handlers = this.cleanupHandlers.get(level);
    if (handlers) {
      handlers.push(handler);
    }
  }

  cleanupLevel(level: string) {
    const handlers = this.cleanupHandlers.get(level);
    if (handlers) {
      handlers.forEach((cleanup) => cleanup());
      handlers.length = 0;
    }

    // 清理低级别的资源
    switch (level) {
      case this.SERVICE:
        this.cleanupLevel(this.DISCUSSION);
        break;
      case this.DISCUSSION:
        this.cleanupLevel(this.RUNTIME);
        break;
    }
  }
}
export class EventManager {
  private env: DiscussionEnvBus;
  private cleanupManager: CleanupManager;
  readonly onError$ = new RxEvent<Error>();
  readonly onCurrentDiscussionIdChange$ = new RxEvent<string | null>();

  constructor(env: DiscussionEnvBus, cleanupManager: CleanupManager) {
    this.env = env;
    this.cleanupManager = cleanupManager;
  }

  emitMessage(message: AgentMessage) {
    this.env.eventBus.emit(DiscussionKeys.Events.message, message);
  }

  emitError(error: Error) {
    this.onError$.next(error);
  }

  emitDiscussionIdChange(id: string | null) {
    this.onCurrentDiscussionIdChange$.next(id);
  }

  emitDiscussionPause() {
    this.env.eventBus.emit(DiscussionKeys.Events.discussionPause, null);
  }

  emitDiscussionResume() {
    this.env.eventBus.emit(DiscussionKeys.Events.discussionResume, null);
  }

  emitDiscussionStart(topic: string) {
    this.env.eventBus.emit(DiscussionKeys.Events.discussionStart, { topic });
  }

  listenToThinking(
    handler: (state: { agentId: string; isThinking: boolean }) => void
  ) {
    const off = this.env.eventBus.on(DiscussionKeys.Events.thinking, handler);
    this.cleanupManager.addHandler(this.cleanupManager.DISCUSSION, off);
    return off;
  }

  listenToLimitReached(handler: () => void) {
    const off = this.env.speakScheduler.onLimitReached$.listen(handler);
    this.cleanupManager.addHandler(this.cleanupManager.DISCUSSION, off);
    return off;
  }
}
