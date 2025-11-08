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
import { PromptBuilder } from "@/common/lib/agent/prompt/prompt-builder";
import { AgentDef } from "@/common/types/agent";
import type { IAgentConfig } from "@/common/types/agent-config";
import { aiService } from "@/core/services/ai.service";
import { messageService } from "@/core/services/message.service";
import { CapabilityRegistry as Caps } from "@/common/lib/capabilities";
import { ActionDef, ActionParser } from "@/common/lib/agent/action/action-parser";
import { DefaultActionExecutor } from "@/common/lib/agent/action";

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

  constructor() {
    // register capabilities once
    discussionCapabilitiesResource.whenReady().then((data) => {
      CapabilityRegistry.getInstance().registerAll(data);
    });
  }

  // helpers
  private getState() { return this.store.get(); }
  private setState(update: Partial<State>) { this.store.set((prev) => ({ ...prev, ...update })); }
  private publishCtrl() { const { isRunning, currentSpeakerId, processed, roundLimit } = this.ctrl; this.ctrl.snapshot$.next({ isRunning, currentSpeakerId, processed, roundLimit }); }
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
    this.ctrl.roundLimit = Math.max(1, (this.getState().settings.maxRounds | 0) || 1);
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
    this.ctrl.roundLimit = Math.max(1, (merged.maxRounds | 0) || 1);
    this.publishCtrl();
  }

  // runtime
  pause() { this.setPaused(true); this.ctrl.isRunning = false; if (this.ctrl.currentAbort) { this.ctrl.currentAbort.abort(); this.ctrl.currentAbort = undefined; } this.ctrl.currentSpeakerId = null; this.publishCtrl(); }
  resume() { this.setPaused(false); this.ctrl.isRunning = true; this.ctrl.processed = 0; this.publishCtrl(); }

  async startIfEligible(): Promise<boolean> {
    if (!this.isPaused()) return true;
    const { members } = this.getState(); if (members.length <= 0) return false;
    this.setPaused(false); this.ctrl.isRunning = true; this.ctrl.processed = 0; this.publishCtrl(); return true;
  }

  async run(): Promise<void> { await this.startIfEligible(); }

  async process(message: AgentMessage): Promise<void> {
    try {
      const id = this.getCurrentDiscussionId(); if (!id) throw new Error('No discussion selected');
      if (this.isPaused()) { const started = await this.startIfEligible(); if (!started) return; }
      await this.processInternal(message); await getPresenter().messages.loadForDiscussion(id);
    } catch (error) { this.handleError(error, '处理消息失败'); this.pause(); }
  }

  // --- merged controller methods ---
  private extractMentions(content: string): string[] {
    const re =
      /@(?:"([^"]+)"|'([^']+)'|“([^”]+)”|‘([^’]+)’|「([^」]+)」|『([^』]+)』|（([^）]+)）|【([^】]+)】|《([^》]+)》|〈([^〉]+)〉|([^\s@，。,！？!?:：；;]+(?:\s+[^\s@，。,！？!?:：；;]+)*))/giu;
    const results: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      const [, ...groups] = match;
      const candidate = groups.find(Boolean);
      if (candidate) {
        results.push(candidate);
      }
    }
    return results;
  }

  private normalizeMentionTarget(target: string | null): string | null {
    if (!target) return null;
    const cleaned = target
      .trim()
      .replace(/^["'“”‘’「」『』【】《》〈〉（）()]+/, "")
      .replace(/["'“”‘’「」『』【】《》〈〉（）()\s，。,。！？!?:：；;、]+$/u, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return cleaned.length ? cleaned : null;
  }

  private prepareMentionQueue(trigger: AgentMessage) {
    if (trigger.type !== "text") return;
    if (this.ctrl.pendingMentionSourceId === trigger.id && this.ctrl.pendingMentions.length > 0) {
      return;
    }
    const mentions = this.extractMentions(trigger.content)
      .map((m) => this.normalizeMentionTarget(m))
      .filter((m): m is string => Boolean(m));
    if (mentions.length > 0) {
      this.ctrl.pendingMentions = mentions;
      this.ctrl.pendingMentionSourceId = trigger.id;
    } else if (this.ctrl.pendingMentionSourceId === trigger.id) {
      this.ctrl.pendingMentions = [];
      this.ctrl.pendingMentionSourceId = null;
    }
  }

  private takeNextMention(members: Member[]): string | null {
    if (!this.ctrl.pendingMentions.length) return null;
    const defs = agentListResource.read().data;
    while (this.ctrl.pendingMentions.length) {
      const target = this.ctrl.pendingMentions.shift()!;
      const agent = defs.find((a) => a.name.toLowerCase() === target.toLowerCase());
      if (agent && members.find((m) => m.agentId === agent.id)) {
        if (!this.ctrl.pendingMentions.length) {
          this.ctrl.pendingMentionSourceId = null;
        }
        return agent.id;
      }
    }
    this.ctrl.pendingMentionSourceId = null;
    return null;
  }

  private async selectNextAgentId(trigger: AgentMessage, lastResponder: string | null): Promise<string | null> {
    const members = this.ctrl.members; if (members.length === 0) return null;
    if (trigger.type === 'action_result' && lastResponder) { if (members.find(m => m.agentId === lastResponder)) return lastResponder; }
    if (trigger.type === "text") {
      this.prepareMentionQueue(trigger);
      const mentionTarget = this.takeNextMention(members);
      if (mentionTarget) return mentionTarget;
    }
    const autos = members.filter(m => m.isAutoReply);
    if (trigger.agentId === 'user') {
      if (autos.length) return autos[0].agentId;
      const defs = agentListResource.read().data; const mod = members.find(m => defs.find(a => a.id === m.agentId)?.role === 'moderator');
      return mod ? mod.agentId : members[0]?.agentId ?? null;
    }
    const next = autos.find(m => m.agentId !== trigger.agentId); return next ? next.agentId : null;
  }

  private async tryRunActions(agentMessage: NormalMessage): Promise<ActionResultMessage | null> {
    const parser = new ActionParser(); const exec = new DefaultActionExecutor(); const reg = Caps.getInstance();
    const parsed = parser.parse(agentMessage.content); if (!parsed.length) return null;
    const results = await exec.execute(parsed, reg);
    const resultMessage: Omit<import("@/common/types/discussion").ActionResultMessage, 'id' | 'discussionId'> = {
      type: 'action_result', agentId: 'system', timestamp: new Date(), originMessageId: agentMessage.id,
      results: results.map((r, i) => { const def = parsed[i].parsed as ActionDef | undefined; return ({ operationId: def?.operationId ?? `op-${i}`, capability: r.capability, params: r.params || {}, status: r.error ? 'error' : 'success', result: r.result, description: def?.description ?? '', error: r.error, startTime: r.startTime, endTime: r.endTime }); })
    };
    const created = await getPresenter().messages.create({
      ...resultMessage,
      discussionId: agentMessage.discussionId,
    });
    return created as ActionResultMessage;
  }

  private async addSystemMessage(content: string) { const id = this.ctrl.discussionId; if (!id) return; const msg: Omit<NormalMessage, 'id'> = { type: 'text', content, agentId: 'system', timestamp: new Date(), discussionId: id }; await messageService.createMessage(msg); }

  private async generateStreamingResponse(agentId: string, trigger: AgentMessage): Promise<AgentMessage | null> {
    const id = this.ctrl.discussionId; if (!id) return null; const defs = agentListResource.read().data; const current = defs.find(a => a.id === agentId); if (!current) return null;
    const memberDefs: AgentDef[] = this.ctrl.members.map(m => defs.find(a => a.id === m.agentId)!).filter(Boolean);
    const msgs = await messageService.listMessages(id);
    const cfg: IAgentConfig = { ...current, agentId };
    const prepared = new PromptBuilder().buildPrompt({ currentAgent: current, currentAgentConfig: cfg, agents: memberDefs, messages: msgs, triggerMessage: trigger.type === 'text' ? (trigger as NormalMessage) : undefined, capabilities: CapabilityRegistry.getInstance().getCapabilities() });
    const initial: Omit<NormalMessage, 'id'> = { type: 'text', content: '', agentId, timestamp: new Date(), discussionId: id, status: 'streaming', lastUpdateTime: new Date() };
    const created = await messageService.createMessage(initial) as NormalMessage;
    this.ctrl.currentSpeakerId = agentId; this.publishCtrl(); this.ctrl.currentAbort = new AbortController();
    let finalMessage: AgentMessage | null = null;
    try {
      const stream = aiService.streamChatCompletion(prepared); let content = '';
      await new Promise<void>((resolve, reject) => {
        const sub = stream.subscribe({ next: async (chunk: string) => { if (this.ctrl.currentAbort?.signal.aborted) { sub.unsubscribe(); resolve(); return; } content += chunk; await messageService.updateMessage(created.id, { content, lastUpdateTime: new Date() }); await getPresenter().messages.loadForDiscussion(id); }, error: (e) => { sub.unsubscribe(); reject(e); }, complete: () => { sub.unsubscribe(); resolve(); } });
        this.ctrl.currentAbort?.signal.addEventListener('abort', () => { sub.unsubscribe(); resolve(); });
      });
      await messageService.updateMessage(created.id, { status: 'completed', lastUpdateTime: new Date() }); await getPresenter().messages.loadForDiscussion(id);
      finalMessage = await messageService.getMessage(created.id);
      if (current.role === 'moderator') {
        const actionResultMessage = await this.tryRunActions(finalMessage as NormalMessage);
        if (actionResultMessage) {
          finalMessage = actionResultMessage;
        }
      }
    } catch (e) {
      await messageService.updateMessage(created.id, { status: 'error', lastUpdateTime: new Date() }); await getPresenter().messages.loadForDiscussion(id); throw e;
    } finally { this.ctrl.currentSpeakerId = null; this.ctrl.currentAbort = undefined; this.publishCtrl(); }
    if (!finalMessage) {
      finalMessage = await messageService.getMessage(created.id);
    }
    return finalMessage as AgentMessage;
  }

  private async processInternal(trigger: AgentMessage): Promise<void> {
    const id = this.ctrl.discussionId; if (!id) return; if (!this.ctrl.isRunning) this.resume(); let last: AgentMessage | null = trigger; let lastResponder: string | null = null; this.ctrl.processed = 0; this.publishCtrl();
    while (this.ctrl.isRunning && this.ctrl.processed < this.ctrl.roundLimit && last) {
      const next = await this.selectNextAgentId(last, lastResponder); if (!next) break; const resp = await this.generateStreamingResponse(next, last); if (!resp) break; lastResponder = next; last = resp; this.ctrl.processed++; this.publishCtrl();
    }
    if (this.ctrl.processed >= this.ctrl.roundLimit) { await this.addSystemMessage(`已达到消息上限（${this.ctrl.roundLimit}），对话已暂停。`); this.pause(); }
  }

  private handleError(error: unknown, message: string, context?: Record<string, unknown>) {
    const discussionError = error instanceof DiscussionError ? error : new DiscussionError(DiscussionErrorType.GENERATE_RESPONSE, message, error, context);
    const { shouldPause } = handleDiscussionError(discussionError); if (shouldPause) { this.setPaused(true); }
    this.onError$.next(discussionError);
  }
}

export const discussionControlService = new DiscussionControlService();
