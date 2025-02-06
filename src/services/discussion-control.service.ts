import { DEFAULT_SETTINGS } from "@/config/settings";
import { BaseAgent, ChatAgent } from "@/lib/agent";
import { CapabilityRegistry } from "@/lib/capabilities";
import {
  DiscussionEnvBus,
  DiscussionKeys,
} from "@/lib/discussion/discussion-env";
import { RxEvent } from "@/lib/rx-event";
import { agentListResource, discussionMembersResource } from "@/resources";
import { discussionCapabilitiesResource } from "@/resources/discussion-capabilities.resource";
import { discussionMemberService } from "@/services/discussion-member.service";
import { typingIndicatorService } from "@/services/typing-indicator.service";
import { AgentMessage, NormalMessage } from "@/types/discussion";
import { DiscussionMember } from "@/types/discussion-member";
import { createNestedBean, createProxyBean } from "rx-nested-bean";
import { agentSelector } from "./agent-selector.service";
import {
  DiscussionError,
  DiscussionErrorType,
  handleDiscussionError,
} from "./discussion-error.util";

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

export class DiscussionControlService {
  store = createNestedBean({
    messages: [] as AgentMessage[],
    isPaused: true,
    currentDiscussionId: null as string | null,
    settings: DEFAULT_SETTINGS,
    currentRound: 0,
    currentSpeakerIndex: -1,
    members: [] as DiscussionMember[],
    topic: "",
  });

  onRequestSendMessage$ = new RxEvent<
    Pick<NormalMessage, "agentId" | "content" | "type">
  >();
  onError$ = new RxEvent<Error>();
  onCurrentDiscussionIdChange$ = new RxEvent<string | null>();

  private messagesBean = createProxyBean(this.store, "messages");
  isPausedBean = createProxyBean(this.store, "isPaused");
  private settingsBean = createProxyBean(this.store, "settings");
  currentDiscussionIdBean = createProxyBean(this.store, "currentDiscussionId");
  private currentRoundBean = createProxyBean(this.store, "currentRound");
  private currentSpeakerIndexBean = createProxyBean(
    this.store,
    "currentSpeakerIndex"
  );
  private membersBean = createProxyBean(this.store, "members");
  private topicBean = createProxyBean(this.store, "topic");

  private timeoutManager = new TimeoutManager();
  private agents: Map<string, BaseAgent> = new Map();
  private env: DiscussionEnvBus;

  // 生命周期管理
  private serviceCleanupHandlers: Array<() => void> = [];  // 服务级清理
  private discussionCleanupHandlers: Array<() => void> = []; // 讨论级清理
  private runtimeCleanupHandlers: Array<() => void> = [];   // 运行时清理

  constructor() {
    this.env = new DiscussionEnvBus();
    this.initializeService();
  }

  // 服务级初始化
  private initializeService() {
    // 1. 注册能力
    discussionCapabilitiesResource.whenReady().then((data) => {
      CapabilityRegistry.getInstance().registerAll(data);
    });

    // 2. 监听成员变化
    const membersSub = this.membersBean.$.subscribe((members) => {
      this.syncAgentsWithMembers(members);
    });
    this.serviceCleanupHandlers.push(() => membersSub.unsubscribe());
  }

  private syncAgentsWithMembers(members: DiscussionMember[]) {
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
        // 更新现有 agent 的配置
        existingAgent.updateConfig({
          ...agentData,
        });
        // 更新状态
        existingAgent.updateState({
          autoReply: member.isAutoReply,
        });
      } else {
        // 创建新的 agent
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

  getCurrentDiscussionId(): string | null {
    return this.currentDiscussionIdBean.get();
  }

  getCurrentDiscussionId$() {
    return this.currentDiscussionIdBean.$;
  }

  setCurrentDiscussionId(id: string | null) {
    const oldId = this.currentDiscussionIdBean.get();
    if (oldId !== id) {
      this.currentDiscussionIdBean.set(id);
      this.onCurrentDiscussionIdChange$.next(id);
    }
  }

  setMembers(members: DiscussionMember[]) {
    this.membersBean.set(members);
  }

  setMessages(messages: AgentMessage[]) {
    this.messagesBean.set(messages);
  }

  removeMember(memberId: string) {
    const members = this.membersBean.get();
    this.membersBean.set(members.filter((m) => m.agentId !== memberId));
  }

  setTopic(topic: string) {
    this.topicBean.set(topic);
  }

  getTopic() {
    return this.topicBean.get();
  }

  onMessage(message: AgentMessage) {
    this.env.eventBus.emit(DiscussionKeys.Events.message, message);
  }

  // 讨论级初始化
  private initializeDiscussion(topic: string): Promise<string[]> {
    // if (!topic) {
    //   throw new DiscussionError(DiscussionErrorType.NO_TOPIC, "未设置讨论主题");
    // }

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

    return this.selectParticipants(topic);
  }

  // 运行时控制
  pause() {
    // 1. 设置暂停状态
    this.isPausedBean.set(true);
    
    // 2. 暂停所有 agents
    for (const agent of this.agents.values()) {
      agent.pause();
    }
    
    // 3. 发送讨论暂停事件
    this.env.eventBus.emit(DiscussionKeys.Events.discussionPause, null);
    
    // 4. 清理运行时资源
    this.cleanupRuntime();
  }

  resume() {
    // 1. 设置恢复状态
    this.isPausedBean.set(false);
    
    // 2. 恢复所有 agents
    for (const agent of this.agents.values()) {
      agent.resume();
    }
    
    // 3. 发送讨论恢复事件
    this.env.eventBus.emit(DiscussionKeys.Events.discussionResume, null);
  }

  // 清理方法分层
  private cleanupRuntime() {
    // 清理运行时资源（定时器等）
    this.timeoutManager.clearAll();
    this.runtimeCleanupHandlers.forEach(cleanup => cleanup());
    this.runtimeCleanupHandlers = [];
  }

  private cleanupDiscussion() {
    // 清理讨论级资源
    this.discussionCleanupHandlers.forEach(cleanup => cleanup());
    this.discussionCleanupHandlers = [];
    this.cleanupRuntime(); // 同时清理运行时资源
  }

  private cleanupService() {
    // 清理服务级资源
    this.serviceCleanupHandlers.forEach(cleanup => cleanup());
    this.serviceCleanupHandlers = [];
    this.cleanupDiscussion(); // 同时清理讨论级资源
  }

  // 完全销毁服务
  destroy() {
    // 1. 清理所有代理
    for (const agent of this.agents.values()) {
      agent.leaveEnv();
    }
    this.agents.clear();

    // 2. 清理环境
    this.env.destroy();

    // 3. 清理所有级别的资源
    this.cleanupService();

    // 4. 重置所有状态
    this.resetState();
  }

  // 状态重置
  private resetState() {
    this.messagesBean.set([]);
    this.isPausedBean.set(true);
    this.currentDiscussionIdBean.set(null);
    this.settingsBean.set(DEFAULT_SETTINGS);
    this.currentRoundBean.set(0);
    this.currentSpeakerIndexBean.set(-1);
    this.membersBean.set([]);
    this.topicBean.set("");
  }

  // 辅助方法：选择参与者
  private async selectParticipants(topic: string): Promise<string[]> {
    const currentMembers = this.membersBean.get();
    if (currentMembers.length > 0) {
      return currentMembers.map(member => member.agentId);
    }

    const availableAgents = agentListResource.read().data;
    const selectedIds = await agentSelector.selectAgents(topic, availableAgents);
    if (selectedIds.length === 0) {
      throw new DiscussionError(
        DiscussionErrorType.NO_PARTICIPANTS,
        "没有合适的参与者"
      );
    }

    await this.updateDiscussionMembers(selectedIds);
    return selectedIds;
  }

  private async updateDiscussionMembers(agentIds: string[]) {
    const discussionId = this.getCurrentDiscussionId();
    if (!discussionId) return;

    // 1. 获取当前已存在的成员
    const existingMembers = this.membersBean.get();
    const existingAgentIds = new Set(existingMembers.map(m => m.agentId));

    // 2. 过滤出需要新增的成员
    const newAgentIds = agentIds.filter(id => !existingAgentIds.has(id));
    
    if (newAgentIds.length === 0) {
      console.log("[DiscussionControl] No new members to add");
      return;
    }

    // 3. 创建新成员
    const members: Omit<
      DiscussionMember,
      "id" | "joinedAt" | "discussionId"
    >[] = newAgentIds.map((id) => ({
      agentId: id,
      isAutoReply: true,
    }));

    // 4. 添加新成员并刷新资源
    console.log("[DiscussionControl] Adding new members:", newAgentIds);
    await discussionMemberService.createMany(discussionId, members);
    await discussionMembersResource.current.reload();
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
      this.isPausedBean.set(true);
    }

    this.onError$.next(discussionError);
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  // 恢复已有讨论
  private async resumeExistingDiscussion(): Promise<void> {
    const messages = this.messagesBean.get();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // 1. 恢复讨论级资源
      await this.initializeDiscussion(this.topicBean.get());
      
      // 2. 恢复运行时状态
      this.resume();
      
      // 3. 重放最后一条消息
      this.env.eventBus.emit(DiscussionKeys.Events.message, lastMessage);
    }
  }

  // 开始新讨论
  private async startNewDiscussion(selectedIds: string[]): Promise<void> {
    const topic = this.topicBean.get();

    // 1. 恢复运行时状态
    this.resume();

    // 2. 发送讨论开始事件
    this.env.eventBus.emit(DiscussionKeys.Events.discussionStart, { topic });

    // 3. 发送初始消息
    const moderator = this.agents.get(selectedIds[0]);
    if (moderator) {
      const initialMessage: NormalMessage = {
        agentId: "system",
        content: `用户：${topic}`,
        type: "text",
        id: "system",
        discussionId: this.getCurrentDiscussionId()!,
        timestamp: new Date(),
      };
      this.env.eventBus.emit(DiscussionKeys.Events.message, initialMessage);
    }
  }

  // 主入口方法
  async run(): Promise<void> {
    try {
      // 1. 检查是否已经在运行
      if (!this.isPausedBean.get()) {
        console.log("[DiscussionControl] Discussion is already running");
        return;
      }

      // 2. 检查是否有历史消息和成员
      if (
        this.messagesBean.get().length > 0 &&
        this.membersBean.get().length > 0
      ) {
        console.log("[DiscussionControl] Resuming existing discussion");
        await this.resumeExistingDiscussion();
        return;
      }

      // 3. 初始化新讨论
      console.log("[DiscussionControl] Initializing new discussion");
      const selectedIds = await this.initializeDiscussion(
        this.topicBean.get() || "一个用户启动了讨论，但不知道用户的意图是什么"
      );

      // 4. 启动讨论
      console.log("[DiscussionControl] Starting new discussion");
      await this.startNewDiscussion(selectedIds);
    } catch (error) {
      console.error("[DiscussionControl] Failed to run discussion:", error);
      this.handleError(error, "讨论运行失败");
      this.pause();
    }
  }
}

export const discussionControlService = new DiscussionControlService();
