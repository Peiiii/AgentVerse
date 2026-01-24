import { CapabilityRegistry, toToolDefinitions } from "@/common/lib/capabilities";
import { PromptBuilder } from "@/common/lib/agent/prompt/prompt-builder";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage, StreamEvent, ToolCall, ToolDefinition } from "@/common/lib/ai-service";
import type { IAgentConfig } from "@/common/types/agent-config";
import { AgentMessage, NormalMessage, ToolResultMessage } from "@/common/types/discussion";

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
    createToolResult: (m: Omit<ToolResultMessage, "id">) => Promise<ToolResultMessage>;
  };
  reload: () => Promise<void>;
  promptBuilder?: PromptBuilder; // optional for testing
  capabilityRegistry?: CapabilityRegistry; // optional override
};

const MAX_TOOL_ROUNDS = 3;

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
    try {
      await consumeObservable(stream, params.signal, async (event) => {
        if (event.type === "delta") {
          content += event.content;
          await messageRepo.updateMessage(created.id, { content, lastUpdateTime: new Date() });
          await reload();
        } else if (event.type === "tool_calls") {
          toolCalls = event.calls;
        }
      });
      await messageRepo.updateMessage(created.id, {
        status: "completed",
        lastUpdateTime: new Date(),
        toolCalls: toolCalls.length ? toolCalls : undefined,
        content,
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

    const toolResults: ToolResultMessage[] = [];
    for (const call of toolCalls) {
      const startTime = Date.now();
      try {
        const result = await capabilityRegistry.execute(call.name, call.arguments);
        const created = await messageRepo.createToolResult({
          type: "tool_result",
          agentId: "tool",
          discussionId: params.discussionId,
          timestamp: new Date(),
          originMessageId: message.id,
          toolCallId: call.id,
          toolName: call.name,
          status: "success",
          result,
          startTime,
          endTime: Date.now(),
        });
        toolResults.push(created);
      } catch (error) {
        const created = await messageRepo.createToolResult({
          type: "tool_result",
          agentId: "tool",
          discussionId: params.discussionId,
          timestamp: new Date(),
          originMessageId: message.id,
          toolCallId: call.id,
          toolName: call.name,
          status: "error",
          error: error instanceof Error ? error.message : "Tool execution failed",
          startTime,
          endTime: Date.now(),
        });
        toolResults.push(created);
      }
    }
    await reload();

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
