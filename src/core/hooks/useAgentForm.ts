import { useState, useCallback, useMemo } from "react";
import { Agent } from "@/common/types/agent";

export function useAgentForm(agents: Agent[], updateAgent: (agentId: string, agentData: Partial<Omit<Agent, "id">>) => void) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string>();

  const handleEditAgent = useCallback((agent: Agent) => {
    setEditingAgentId(agent.id);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback((agentData: Omit<Agent, "id">) => {
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