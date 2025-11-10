import { CapabilityRegistry } from "@/common/lib/capabilities";
import { RxEvent } from "@/common/lib/rx-event";
import { getPresenter } from "@/core/presenter/presenter";
import { discussionCapabilitiesResource } from "@/core/resources/discussion-capabilities.resource";
import { AgentMessage, DiscussionSettings, NormalMessage, ActionResultMessage } from "@/common/types/discussion";
import { DiscussionError, DiscussionErrorType, handleDiscussionError } from "./discussion-error.util";
import { DEFAULT_SETTINGS } from "@/core/config/settings";
import { createNestedBean } from "packages/rx-nested-bean/src";
import { BehaviorSubject } from "rxjs";
import { agentListResource } from "@/core/resources";
import { AgentDef } from "@/common/types/agent";
import { aiService } from "@/core/services/ai.service";
import { messageService } from "@/core/services/message.service";
import { MentionResolver } from "./discussion/mention-resolver";
import { NextSpeakerSelector } from "./discussion/next-speaker";
import { streamAgentResponse } from "./discussion/streaming-responder";
import { ActionRunner } from "./discussion/action-runner";

// --- Minimal Rx Store State ---
type Member = { agentId: string; isAutoReply: boolean };
type State = {
  isPaused: boolean;
  currentDiscussionId: string | null;
  settings: DiscussionSettings;
  members: Member[];
  messages: AgentMessage[];
  topic: string;
};

export type Snapshot = {
  isRunning: boolean;
  currentSpeakerId: string | null;
  processed: number;
  roundLimit: number;
};

// (removed standalone factory; merged into service below)

// --- Single-file Service ---
export class DiscussionControlService {
  onError$ = new RxEvent<Error>();
  onCurrentDiscussionIdChange$ = new RxEvent<string | null>();

  // rx-nested-bean store kept for UI hooks compatibility
  store = createNestedBean<State>({
    isPaused: true,
    currentDiscussionId: null,
    settings: DEFAULT_SETTINGS,
    members: [],
    messages: [],
    topic: "",
  });

  // controller state (merged)
  private ctrl = {
    discussionId: null as string | null,
    members: [] as Member[],
    isRunning: false,
    processed: 0,
    roundLimit: 20,
    currentSpeakerId: null as string | null,
    currentAbort: undefined as AbortController | undefined,
    snapshot$: new BehaviorSubject<Snapshot>({ isRunning: false, currentSpeakerId: null, processed: 0, roundLimit: 20 }),
    pendingMentions: [] as string[],
    pendingMentionSourceId: null as string | null,
  };

  // extracted helpers
  private mention = new MentionResolver();
  private selector = new NextSpeakerSelector(this.mention);
  private actions = new ActionRunner({
    create: (msg) => getPresenter().messages.create(msg) as Promise<ActionResultMessage>,
  });
  private runLock: Promise<void> = Promise.resolve();

  constructor() {
    // register capabilities once
    discussionCapabilitiesResource.whenReady().then((data) => {
      CapabilityRegistry.getInstance().registerAll(data);
    });
  }

  // helpers
  private getState() { return this.store.get(); }
  private setState(update: Partial<State>) { this.store.set((prev) => ({ ...prev, ...update })); }
  private publishCtrl() {
    const { isRunning, currentSpeakerId, processed, roundLimit } = this.ctrl;
    this.ctrl.snapshot$.next({ isRunning, currentSpeakerId, processed, roundLimit });
  }
  getSnapshot(): Snapshot { return this.ctrl.snapshot$.getValue(); }
  getSnapshot$() { return this.ctrl.snapshot$.asObservable(); }

  // state accessors
  getCurrentDiscussionId(): string | null { return this.getState().currentDiscussionId; }
  getCurrentDiscussionId$() { return this.store.namespaces.currentDiscussionId.$ as unknown as import('rxjs').Observable<string | null>; }
  isPaused(): boolean { return this.getState().isPaused; }
  private setPaused(paused: boolean) { this.setState({ isPaused: paused }); }

  // mutations
  setCurrentDiscussionId(id: string | null) {
    if (this.getState().currentDiscussionId === id) return;
    this.setState({ currentDiscussionId: id });
    this.onCurrentDiscussionIdChange$.next(id);
    this.ctrl.discussionId = id;
    const maxRounds = Math.trunc(Number(this.getState().settings.maxRounds) || 0);
    this.ctrl.roundLimit = Math.max(1, maxRounds || 1);
    this.publishCtrl();
  }

  setMembers(members: Member[]) {
    this.setState({ members });
    this.ctrl.members = members;
    this.publishCtrl();
  }

  setMessages(messages: AgentMessage[]) { this.setState({ messages }); }

  setSettings(settings: Partial<DiscussionSettings>) {
    const merged = { ...this.getState().settings, ...settings } as DiscussionSettings;
    this.setState({ settings: merged });
    const maxRounds = Math.trunc(Number(merged.maxRounds) || 0);
    this.ctrl.roundLimit = Math.max(1, maxRounds || 1);
    this.publishCtrl();
  }

  private agentCanUseActions(agent: AgentDef | undefined): boolean {
    if (!agent) return false;
    const permissions = this.getState().settings.toolPermissions;
    const allowed = permissions?.[agent.role];
    if (typeof allowed === "boolean") {
      return allowed;
    }
    return agent.role === "moderator";
  }

  // runtime
  pause() {
    this.setPaused(true);
    this.ctrl.isRunning = false;
    if (this.ctrl.currentAbort) {
      this.ctrl.currentAbort.abort();
      this.ctrl.currentAbort = undefined;
    }
    this.ctrl.currentSpeakerId = null;
    this.publishCtrl();
  }
  resume() {
    this.setPaused(false);
    this.ctrl.isRunning = true;
    this.ctrl.processed = 0;
    this.publishCtrl();
  }

  async startIfEligible(): Promise<boolean> {
    if (!this.isPaused()) return true;
    const { members } = this.getState();
    if (members.length <= 0) return false;
    this.setPaused(false);
    this.ctrl.isRunning = true;
    this.ctrl.processed = 0;
    this.publishCtrl();
    return true;
  }

  async run(): Promise<void> { await this.startIfEligible(); }

  async process(message: AgentMessage): Promise<void> {
    // serialize concurrent calls to avoid overlapping loops
    this.runLock = this.runLock.then(async () => {
      try {
        const id = this.getCurrentDiscussionId();
        if (!id) throw new Error('No discussion selected');
        if (this.isPaused()) {
          const started = await this.startIfEligible();
          if (!started) return;
        }
        await this.processInternal(message);
        await this.reloadMessages();
      } catch (error) {
        this.handleError(error, '处理消息失败');
        this.pause();
      }
    });
    return this.runLock;
  }


  private async selectNextAgentId(trigger: AgentMessage, lastResponder: string | null): Promise<string | null> {
    const members = this.ctrl.members;
    const defs = agentListResource.read().data;
    return this.selector.select(trigger, lastResponder, members, defs);
  }

  private async tryRunActions(agentMessage: NormalMessage): Promise<ActionResultMessage | null> {
    const defs = agentListResource.read().data;
    const author = defs.find((a) => a.id === agentMessage.agentId);
    const canUse = this.agentCanUseActions(author);
    return this.actions.runIfAny(author, canUse, agentMessage);
  }

  private async addSystemMessage(content: string) {
    const id = this.ctrl.discussionId;
    if (!id) return;
    const msg: Omit<NormalMessage, 'id'> = {
      type: 'text',
      content,
      agentId: 'system',
      timestamp: new Date(),
      discussionId: id,
    };
    await messageService.createMessage(msg);
  }

  private async generateStreamingResponse(agentId: string, trigger: AgentMessage): Promise<AgentMessage | null> {
    const id = this.ctrl.discussionId;
    if (!id) return null;
    const defs = agentListResource.read().data;
    const current = defs.find(a => a.id === agentId);
    if (!current) return null;
    const memberDefs: AgentDef[] = this.ctrl.members.map(m => defs.find(a => a.id === m.agentId)!).filter(Boolean);

    this.ctrl.currentSpeakerId = agentId;
    this.publishCtrl();
    this.ctrl.currentAbort = new AbortController();

    let finalMessage: AgentMessage | null = null;
    try {
      finalMessage = await streamAgentResponse(
        { aiService, messageService, reload: () => this.reloadMessages() },
        {
          discussionId: id,
          agent: current,
          agentId,
          trigger,
          members: memberDefs,
          canUseActions: this.agentCanUseActions(current),
          signal: this.ctrl.currentAbort.signal,
        }
      );
      if (this.agentCanUseActions(current)) {
        const actionResultMessage = await this.tryRunActions(finalMessage as NormalMessage);
        if (actionResultMessage) {
          finalMessage = actionResultMessage;
        }
      }
    } catch (e) {
      // Best-effort error marking: the stream function already attempts to mark completion
      this.handleError(e, '生成回复失败');
      throw e;
    } finally {
      this.ctrl.currentSpeakerId = null;
      this.ctrl.currentAbort = undefined;
      this.publishCtrl();
    }
    return finalMessage as AgentMessage;
  }

  private async processInternal(trigger: AgentMessage): Promise<void> {
    const id = this.ctrl.discussionId;
    if (!id) return;
    if (!this.ctrl.isRunning) this.resume();

    let last: AgentMessage | null = trigger;
    let lastResponder: string | null = null;
    this.ctrl.processed = 0;
    this.publishCtrl();

    while (this.ctrl.isRunning && this.ctrl.processed < this.ctrl.roundLimit && last) {
      const next = await this.selectNextAgentId(last, lastResponder);
      if (!next) break;
      const resp = await this.generateStreamingResponse(next, last);
      if (!resp) break;
      lastResponder = next;
      last = resp;
      this.ctrl.processed++;
      this.publishCtrl();
    }
    if (this.ctrl.processed >= this.ctrl.roundLimit) {
      await this.addSystemMessage(`已达到消息上限（${this.ctrl.roundLimit}），对话已暂停。`);
      this.pause();
    }
  }

  private handleError(error: unknown, message: string, context?: Record<string, unknown>) {
    const discussionError = error instanceof DiscussionError ? error : new DiscussionError(DiscussionErrorType.GENERATE_RESPONSE, message, error, context);
    const { shouldPause } = handleDiscussionError(discussionError); if (shouldPause) { this.setPaused(true); }
    this.onError$.next(discussionError);
  }

  private async reloadMessages() {
    await getPresenter().messages.loadForDiscussion();
  }
}

export const discussionControlService = new DiscussionControlService();
