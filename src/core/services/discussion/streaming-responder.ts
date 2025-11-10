import { CapabilityRegistry } from "@/common/lib/capabilities";
import { PromptBuilder } from "@/common/lib/agent/prompt/prompt-builder";
import { AgentDef } from "@/common/types/agent";
import type { IAgentConfig } from "@/common/types/agent-config";
import { AgentMessage, NormalMessage } from "@/common/types/discussion";

type Deps = {
  aiService: { streamChatCompletion: (prepared: unknown) => import("rxjs").Observable<string> };
  messageService: {
    createMessage: (m: Omit<NormalMessage, "id">) => Promise<AgentMessage>;
    updateMessage: (id: string, patch: Partial<NormalMessage>) => Promise<AgentMessage>;
    getMessage: (id: string) => Promise<AgentMessage>;
    listMessages: (discussionId: string) => Promise<AgentMessage[]>;
  };
  reload: () => Promise<void>;
  promptBuilder?: PromptBuilder; // optional for testing
  capabilityRegistry?: CapabilityRegistry; // optional override
};

export async function streamAgentResponse(
  deps: Deps,
  params: {
    discussionId: string;
    agent: AgentDef;
    agentId: string;
    trigger: AgentMessage;
    members: AgentDef[];
    canUseActions: boolean;
    signal: AbortSignal;
  }
): Promise<AgentMessage> {
  const { aiService, messageService, reload } = deps;
  const capabilityRegistry = deps.capabilityRegistry ?? CapabilityRegistry.getInstance();
  const promptBuilder = deps.promptBuilder ?? new PromptBuilder();

  const messages = await messageService.listMessages(params.discussionId);
  const cfg: IAgentConfig = { ...params.agent, agentId: params.agentId, canUseActions: params.canUseActions };
  const prepared = promptBuilder.buildPrompt({
    currentAgent: params.agent,
    currentAgentConfig: cfg,
    agents: params.members,
    messages,
    triggerMessage: params.trigger.type === "text" ? (params.trigger as NormalMessage) : undefined,
    capabilities: capabilityRegistry.getCapabilities(),
  });

  const initial: Omit<NormalMessage, "id"> = {
    type: "text",
    content: "",
    agentId: params.agentId,
    timestamp: new Date(),
    discussionId: params.discussionId,
    status: "streaming",
    lastUpdateTime: new Date(),
  };
  const created = (await messageService.createMessage(initial)) as NormalMessage;

  const stream = aiService.streamChatCompletion(prepared);
  let content = "";
  try {
    await consumeObservable(stream, params.signal, async (chunk) => {
      content += chunk;
      await messageService.updateMessage(created.id, { content, lastUpdateTime: new Date() });
      await reload();
    });
    // If aborted, the consumer resolves; finalize with completed state
    await messageService.updateMessage(created.id, { status: "completed", lastUpdateTime: new Date() });
    await reload();
  } catch (e) {
    await messageService.updateMessage(created.id, { status: "error", lastUpdateTime: new Date() });
    await reload();
    throw e;
  }

  const finalMessage = await messageService.getMessage(created.id);
  return finalMessage;
}

async function consumeObservable<T>(
  obs: import("rxjs").Observable<T>,
  signal: AbortSignal,
  onChunk: (x: T) => Promise<void>
) {
  return new Promise<void>((resolve, reject) => {
    const sub = obs.subscribe({
      next: (v) => void onChunk(v).catch(reject),
      error: (e) => {
        sub.unsubscribe();
        reject(e);
      },
      complete: () => {
        sub.unsubscribe();
        resolve();
      },
    });
    signal.addEventListener("abort", () => {
      sub.unsubscribe();
      resolve();
    });
  });
}
