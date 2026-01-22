import { CapabilityRegistry } from "@/common/lib/capabilities";
import { RxEvent } from "@/common/lib/rx-event";
import { getPresenter } from "@/core/presenter/presenter";
import { discussionCapabilities } from "@/core/managers/discussion-capabilities";
import { AgentMessage, DiscussionSettings, NormalMessage } from "@/common/types/discussion";
import { DiscussionError, DiscussionErrorType, handleDiscussionError } from "@/core/utils/discussion-error.util";
import { DEFAULT_SETTINGS } from "@/core/config/settings";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { AgentDef } from "@/common/types/agent";
import { aiService } from "@/core/repositories/ai.client";
import { messageRepository } from "@/core/repositories/message.repository";
import { MentionResolver } from "./discussion/mention-resolver";
import { NextSpeakerSelector } from "./discussion/next-speaker";
import { streamAgentResponse } from "./discussion/streaming-responder";

// --- Runtime + Config ---
type Member = { agentId: string; isAutoReply: boolean };

export type Snapshot = {
  isRunning: boolean;
  currentSpeakerId: string | null;
  processed: number;
  roundLimit: number;
};

type CtrlState = {
  discussionId: string | null;
  members: Member[];
  isRunning: boolean;
  processed: number;
  roundLimit: number;
  currentSpeakerId: string | null;
  currentAbort?: AbortController | undefined;
};

// (removed standalone factory; merged into service below)

// --- Single-file Manager ---
export class DiscussionControlManager {
  onError$ = new RxEvent<Error>();
  onCurrentDiscussionIdChange$ = new RxEvent<string | null>();

  // discussion settings as a dedicated subject
  private settings$ = new BehaviorSubject<DiscussionSettings>(DEFAULT_SETTINGS);

  // Runtime controller state managed by a single BehaviorSubject
  private ctrl$ = new BehaviorSubject<CtrlState>({
    discussionId: null,
    members: [],
    isRunning: false,
    processed: 0,
    roundLimit: 20,
    currentSpeakerId: null,
    currentAbort: undefined,
  });

  // extracted helpers
  private mention = new MentionResolver();
  private selector = new NextSpeakerSelector(this.mention);
  private runLock: Promise<void> = Promise.resolve();
  private getAgentDefs = async (): Promise<AgentDef[]> => {
    const presenter = getPresenter();
    const current = presenter.agents.getAll();
    if (current.length > 0) return current;
    return presenter.agents.load();
  };

  constructor() {
    // register capabilities once
    CapabilityRegistry.getInstance().registerAll(discussionCapabilities);
  }

  // helpers
  getSettings(): DiscussionSettings { return this.settings$.getValue(); }
  getSettings$() { return this.settings$.asObservable(); }
  getSnapshot(): Snapshot {
    const c = this.ctrl$.getValue();
    return {
      isRunning: c.isRunning,
      currentSpeakerId: c.currentSpeakerId,
      processed: c.processed,
      roundLimit: c.roundLimit,
    };
  }
  getSnapshot$() {
    return this.ctrl$.asObservable().pipe(
      map((c) => ({
        isRunning: c.isRunning,
        currentSpeakerId: c.currentSpeakerId,
        processed: c.processed,
        roundLimit: c.roundLimit,
      }))
    );
  }

  private patchCtrl(patch: Partial<CtrlState>) {
    const cur = this.ctrl$.getValue();
    this.ctrl$.next({ ...cur, ...patch });
  }

  // Internal: get the full ctrl state
  private getCtrlState(): CtrlState { return this.ctrl$.getValue(); }

  // state accessors
  getCurrentDiscussionId(): string | null { return this.getCtrlState().discussionId; }
  getCurrentDiscussionId$() { return this.ctrl$.asObservable().pipe(map((c) => c.discussionId)); }
  isPaused(): boolean { return !this.getCtrlState().isRunning; }

  // mutations
  setCurrentDiscussionId(id: string | null) {
    if (this.getCtrlState().discussionId === id) return;
    const maxRounds = Math.trunc(Number(this.getSettings().maxRounds) || 0);
    this.patchCtrl({ discussionId: id, roundLimit: Math.max(1, maxRounds || 1) });
    this.onCurrentDiscussionIdChange$.next(id);
  }

  setMembers(members: Member[]) { this.patchCtrl({ members }); }

  // setMessages removed: messages are managed by repository/manager

  setSettings(settings: Partial<DiscussionSettings>) {
    const merged = { ...this.getSettings(), ...settings } as DiscussionSettings;
    this.settings$.next(merged);
    const maxRounds = Math.trunc(Number(merged.maxRounds) || 0);
    this.patchCtrl({ roundLimit: Math.max(1, maxRounds || 1) });
  }

  private agentCanUseActions(agent: AgentDef | undefined): boolean {
    if (!agent) return false;
    const permissions = this.getSettings().toolPermissions;
    const allowed = permissions?.[agent.role];
    if (typeof allowed === "boolean") {
      return allowed;
    }
    return agent.role === "moderator";
  }

  // runtime
  pause() {
    const cur = this.getCtrlState();
    if (cur.currentAbort) {
      cur.currentAbort.abort();
    }
    this.patchCtrl({ isRunning: false, currentAbort: undefined, currentSpeakerId: null });
  }
  resume() {
    this.patchCtrl({ isRunning: true, processed: 0 });
  }

  async startIfEligible(): Promise<boolean> {
    if (!this.isPaused()) return true;
    const { members } = this.getCtrlState();
    if (members.length <= 0) return false;
    this.patchCtrl({ isRunning: true, processed: 0 });
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


  private async selectNextAgentId(trigger: AgentMessage): Promise<string | null> {
    const members = this.getCtrlState().members;
    const defs = await this.getAgentDefs();
    return this.selector.select(trigger, members, defs);
  }

  private async addSystemMessage(content: string) {
    const id = this.getCtrlState().discussionId;
    if (!id) return;
    const msg: Omit<NormalMessage, 'id'> = {
      type: 'text',
      content,
      agentId: 'system',
      timestamp: new Date(),
      discussionId: id,
    };
    await messageRepository.createMessage(msg);
  }

  private async generateStreamingResponse(agentId: string, trigger: AgentMessage): Promise<AgentMessage | null> {
    const id = this.getCtrlState().discussionId;
    if (!id) return null;
    const defs = await this.getAgentDefs();
    const current = defs.find(a => a.id === agentId);
    if (!current) return null;
    const memberDefs: AgentDef[] = this.getCtrlState().members.map(m => defs.find(a => a.id === m.agentId)!).filter(Boolean);

    this.patchCtrl({ currentSpeakerId: agentId });
    const abortCtrl = new AbortController();
    this.patchCtrl({ currentAbort: abortCtrl });

    let finalMessage: AgentMessage | null = null;
    try {
      finalMessage = await streamAgentResponse(
        { aiService, messageRepo: messageRepository, reload: () => this.reloadMessages() },
        {
          discussionId: id,
          agent: current,
          agentId,
          trigger,
          members: memberDefs,
          canUseActions: this.agentCanUseActions(current),
          signal: abortCtrl.signal,
        }
      );
    } catch (e) {
      // Best-effort error marking: the stream function already attempts to mark completion
      this.handleError(e, '生成回复失败');
      throw e;
    } finally {
      this.patchCtrl({ currentSpeakerId: null, currentAbort: undefined });
    }
    return finalMessage as AgentMessage;
  }

  private async processInternal(trigger: AgentMessage): Promise<void> {
    const id = this.getCtrlState().discussionId;
    if (!id) return;
    if (!this.getCtrlState().isRunning) this.resume();

    let last: AgentMessage | null = trigger;
    this.patchCtrl({ processed: 0 });

    while (this.getCtrlState().isRunning && this.getCtrlState().processed < this.getCtrlState().roundLimit && last) {
      const next = await this.selectNextAgentId(last);
      if (!next) break;
      const resp = await this.generateStreamingResponse(next, last);
      if (!resp) break;
      last = resp;
      this.patchCtrl({ processed: this.getCtrlState().processed + 1 });
    }
    if (this.getCtrlState().processed >= this.getCtrlState().roundLimit) {
      const limit = this.getCtrlState().roundLimit;
      await this.addSystemMessage(`已达到消息上限（${limit}），对话已暂停。`);
      this.pause();
    }
  }

  private handleError(error: unknown, message: string, context?: Record<string, unknown>) {
    const discussionError = error instanceof DiscussionError ? error : new DiscussionError(DiscussionErrorType.GENERATE_RESPONSE, message, error, context);
    const { shouldPause } = handleDiscussionError(discussionError);
    if (shouldPause) {
      this.patchCtrl({ isRunning: false });
    }
    this.onError$.next(discussionError);
  }

  private async reloadMessages() {
    await getPresenter().messages.loadForDiscussion();
  }
}

// Instance is created in presenter to ensure singleton ownership.
