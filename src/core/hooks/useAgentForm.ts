import { useState, useCallback, useMemo } from "react";
import { AgentDef } from "@/common/types/agent";

export function useAgentForm(agents: AgentDef[], updateAgent: (agentId: string, agentData: Partial<Omit<AgentDef, "id">>) => void) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string>();

  const handleEditAgent = useCallback((agent: AgentDef) => {
    setEditingAgentId(agent.id);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback((agentData: Omit<AgentDef, "id">) => {
    if (editingAgentId) {
      updateAgent(editingAgentId, agentData);
      setEditingAgentId(undefined);
    }
    setIsFormOpen(false);
  }, [editingAgentId, updateAgent]);

  const editingAgent = useMemo(
    () => editingAgentId ? agents.find(agent => agent.id === editingAgentId) : undefined,
    [agents, editingAgentId]
  );

  return {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleEditAgent,
    handleSubmit,
  };
} 