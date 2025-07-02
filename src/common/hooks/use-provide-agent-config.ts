import {
  useProvideAgentToolDefs,
  useProvideAgentToolExecutors,
  useProvideAgentToolRenderers,
  useProvideAgentContexts,
} from "@agent-labs/agent-chat";
import type { ToolDefinition, ToolRenderer, ToolExecutor } from "@agent-labs/agent-chat";

interface UseProvideAgentConfigProps {
  tools?: ToolDefinition[];
  executors?: Record<string, ToolExecutor>;
  renderers?: ToolRenderer[];
  contexts?: { description: string; value: string }[];
}

export function useProvideAgentConfig({
  tools,
  executors,
  renderers,
  contexts,
}: UseProvideAgentConfigProps) {
  useProvideAgentToolDefs(tools || []);
  useProvideAgentToolExecutors(executors || {});
  useProvideAgentToolRenderers(renderers || []);
  useProvideAgentContexts(contexts || []);
} 