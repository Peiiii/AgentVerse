import { CapabilityRegistry, toToolDefinitions } from "@/common/lib/capabilities";
import { PromptBuilder } from "@/common/lib/agent/prompt/prompt-builder";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage, StreamEvent, ToolCall, ToolDefinition } from "@/common/lib/ai-service";
import type { IAgentConfig } from "@/common/types/agent-config";
import { AgentMessage, MessageSegment, NormalMessage } from "@/common/types/discussion";

type Deps = {
  aiService: {
    streamChatCompletion: (options: {
      messages: ChatMessage[];
      tools?: ToolDefinition[];
    }) => import("rxjs").Observable<StreamEvent>;
  };
  messageRepo: {
    createMessage: (m: Omit<NormalMessage, "id">) => Promise<AgentMessage>;
    updateMessage: (id: string, patch: Partial<NormalMessage>) => Promise<AgentMessage>;
    getMessage: (id: string) => Promise<AgentMessage>;
    listMessages: (discussionId: string) => Promise<AgentMessage[]>;
  };
  reload: () => Promise<void>;
  promptBuilder?: PromptBuilder; // optional for testing
  capabilityRegistry?: CapabilityRegistry; // optional override
};

const MAX_TOOL_ROUNDS = 100;

const serializeToolResult = (value: unknown) => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return String(value);
  }
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
    discussionNote?: string;
  }
): Promise<AgentMessage> {
  const { aiService, messageRepo, reload } = deps;
  const capabilityRegistry = deps.capabilityRegistry ?? CapabilityRegistry.getInstance();
  const promptBuilder = deps.promptBuilder ?? new PromptBuilder();
  const tools = params.canUseActions
    ? toToolDefinitions(capabilityRegistry.getCapabilities())
    : undefined;

  const messages = await messageRepo.listMessages(params.discussionId);
  const cfg: IAgentConfig = { ...params.agent, agentId: params.agentId, canUseActions: params.canUseActions };
  const prepared = promptBuilder.buildPrompt({
    currentAgent: params.agent,
    currentAgentConfig: cfg,
    agents: params.members,
    messages,
    triggerMessage: params.trigger.type === "text" ? (params.trigger as NormalMessage) : undefined,
    capabilities: capabilityRegistry.getCapabilities(),
    discussionNote: params.discussionNote,
  });

  const runOnce = async (chatMessages: ChatMessage[]) => {
    const initial: Omit<NormalMessage, "id"> = {
      type: "text",
      content: "",
      agentId: params.agentId,
      timestamp: new Date(),
      discussionId: params.discussionId,
      status: "streaming",
      lastUpdateTime: new Date(),
    };
    const created = (await messageRepo.createMessage(initial)) as NormalMessage;

    const stream = aiService.streamChatCompletion({ messages: chatMessages, tools });
    let content = "";
    let toolCalls: ToolCall[] = [];
    let segments: MessageSegment[] = [];
    const toolSegmentIndex = new Map<string, number>();
    const toolSegmentIndexById = new Map<string, number>();

    const appendTextSegment = (chunk: string) => {
      const last = segments[segments.length - 1];
      if (last?.type === "text") {
        last.content += chunk;
        return;
      }
      segments = [...segments, { type: "text", content: chunk }];
    };

    const upsertToolSegment = (key: string, call: ToolCall) => {
      const existingIndex = toolSegmentIndex.get(key);
      if (existingIndex !== undefined) {
        const existing = segments[existingIndex];
        if (existing?.type === "tool_invocation") {
          const nextSegment: MessageSegment = {
            ...existing,
            call,
            status: existing.status ?? "pending",
          };
          segments = segments.map((segment, index) =>
            index === existingIndex ? nextSegment : segment
          );
        }
        if (call.id) {
          toolSegmentIndexById.set(call.id, existingIndex);
        }
        return;
      }
      const nextIndex = segments.length;
      segments = [
        ...segments,
        { type: "tool_invocation", key, call, status: "pending" },
      ];
      toolSegmentIndex.set(key, segments.length - 1);
      if (call.id) {
        toolSegmentIndexById.set(call.id, nextIndex);
      }
    };

    const syncSegmentsWithToolCalls = (calls: ToolCall[]) => {
      if (calls.length === 0) return false;
      let changed = false;
      const nextSegments = [...segments];

      for (const call of calls) {
        const existingIndex = toolSegmentIndexById.get(call.id);
        if (existingIndex !== undefined) {
          const existing = nextSegments[existingIndex];
          if (existing?.type === "tool_invocation") {
            if (
              existing.call.id !== call.id ||
              existing.call.name !== call.name
            ) {
              nextSegments[existingIndex] = { ...existing, call };
              changed = true;
            }
          }
          continue;
        }

        const nextIndex = nextSegments.length;
        nextSegments.push({
          type: "tool_invocation",
          key: call.id,
          call,
          status: "pending",
        });
        toolSegmentIndex.set(call.id, nextIndex);
        toolSegmentIndexById.set(call.id, nextIndex);
        changed = true;
      }

      if (changed) segments = nextSegments;
      return changed;
    };
    try {
      await consumeObservable(stream, params.signal, async (event) => {
        if (event.type === "delta") {
          content += event.content;
          appendTextSegment(event.content);
          await messageRepo.updateMessage(created.id, {
            content,
            segments: segments.length ? segments : undefined,
            lastUpdateTime: new Date(),
          });
          await reload();
        } else if (event.type === "tool_call_delta") {
          upsertToolSegment(event.key, event.call);
          await messageRepo.updateMessage(created.id, {
            segments: segments.length ? segments : undefined,
            lastUpdateTime: new Date(),
          });
          await reload();
        } else if (event.type === "tool_calls") {
          toolCalls = event.calls;
          if (syncSegmentsWithToolCalls(toolCalls)) {
            await messageRepo.updateMessage(created.id, {
              segments: segments.length ? segments : undefined,
              lastUpdateTime: new Date(),
            });
            await reload();
          }
        }
      });
      syncSegmentsWithToolCalls(toolCalls);
      await messageRepo.updateMessage(created.id, {
        status: "completed",
        lastUpdateTime: new Date(),
        toolCalls: toolCalls.length ? toolCalls : undefined,
        content,
        segments: segments.length ? segments : undefined,
      });
      await reload();
    } catch (e) {
      await messageRepo.updateMessage(created.id, { status: "error", lastUpdateTime: new Date() });
      await reload();
      throw e;
    }

    const finalMessage = (await messageRepo.getMessage(created.id)) as NormalMessage;
    return { message: finalMessage, toolCalls };
  };

  const runWithTools = async (
    chatMessages: ChatMessage[],
    depth: number
  ): Promise<AgentMessage> => {
    const { message, toolCalls } = await runOnce(chatMessages);
    if (!toolCalls.length || !params.canUseActions) {
      return message;
    }
    if (depth >= MAX_TOOL_ROUNDS) {
      return message;
    }

    type ToolExecutionResult = {
      toolCallId: string;
      toolName: string;
      status: "success" | "error";
      result?: unknown;
      error?: string;
    };

    const toolResults: ToolExecutionResult[] = [];
    let segments = message.segments ? [...message.segments] : [];

    const updateToolInvocation = async (
      call: ToolCall,
      patch: Partial<Extract<MessageSegment, { type: "tool_invocation" }>>
    ) => {
      let found = false;
      const nextSegments = segments.map((segment) => {
        if (segment.type !== "tool_invocation") return segment;
        if (segment.call.id !== call.id) return segment;
        found = true;
        return { ...segment, call, ...patch };
      });

      if (!found) {
        nextSegments.push({
          type: "tool_invocation",
          key: call.id,
          call,
          status: patch.status ?? "pending",
          result: patch.result,
          error: patch.error,
          startTime: patch.startTime,
          endTime: patch.endTime,
        });
      }

      segments = nextSegments;
      await messageRepo.updateMessage(message.id, {
        segments: segments.length ? segments : undefined,
        lastUpdateTime: new Date(),
      });
      await reload();
    };

    for (const call of toolCalls) {
      const startTime = Date.now();
      await updateToolInvocation(call, { status: "pending", startTime });
      try {
        const result = await capabilityRegistry.execute(call.name, call.arguments);
        toolResults.push({
          toolCallId: call.id,
          toolName: call.name,
          status: "success",
          result,
        });
        await updateToolInvocation(call, {
          status: "success",
          result,
          startTime,
          endTime: Date.now(),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Tool execution failed";
        toolResults.push({
          toolCallId: call.id,
          toolName: call.name,
          status: "error",
          error: errorMessage,
        });
        await updateToolInvocation(call, {
          status: "error",
          error: errorMessage,
          startTime,
          endTime: Date.now(),
        });
      }
    }

    const assistantToolMessage: ChatMessage = {
      role: "assistant",
      content: message.content,
      toolCalls,
    };
    const toolMessages: ChatMessage[] = toolResults.map((result) => ({
      role: "tool",
      toolCallId: result.toolCallId,
      content:
        result.status === "success"
          ? serializeToolResult(result.result)
          : serializeToolResult({ error: result.error }),
    }));

    return runWithTools(
      [...chatMessages, assistantToolMessage, ...toolMessages],
      depth + 1
    );
  };

  return runWithTools(prepared, 0);
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
