import { AgentDef } from "@/common/types/agent";

// Lightweight agent config used by PromptBuilder/controller.
export interface IAgentConfig extends AgentDef {
  agentId: string;
  prompt: string;
  conversation?: {
    minResponseDelay?: number;
    contextMessages?: number;
  };
}

