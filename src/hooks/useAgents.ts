import { useResourceState } from "@/common/lib/resource";
import { agentsResource } from "@/resources";
import { agentService } from "@/services/agent.service";
import { Agent } from "@/common/types/agent";
import { useMemoizedFn } from "ahooks";
import { useOptimisticUpdate } from "./useOptimisticUpdate";

interface UseAgentsProps {
  onChange?: (agents: Agent[]) => void;
}

export function useAgents({ onChange }: UseAgentsProps = {}) {
  const resource = useResourceState(agentsResource.list);
  const { data: agents } = resource;

  const withOptimisticUpdate = useOptimisticUpdate(resource, { onChange });

  const addAgent = useMemoizedFn(async () => {
    const defaultAgent = agentService.createDefaultAgent();
    const seed = `agent${Date.now().toString().slice(-4)}`;
    defaultAgent.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    
    return withOptimisticUpdate(
      // 乐观更新
      (agents) => [...agents, { ...defaultAgent, id: `temp-${seed}` }],
      // API 调用
      () => agentService.createAgent(defaultAgent)
    );
  });

  const updateAgent = useMemoizedFn(async (id: string, data: Partial<Agent>) => {
    return withOptimisticUpdate(
      // 乐观更新
      (agents) => agents.map((a) => (a.id === id ? { ...a, ...data } : a)),
      // API 调用
      () => agentService.updateAgent(id, data)
    );
  });

  const deleteAgent = useMemoizedFn(async (id: string) => {
    return withOptimisticUpdate(
      // 乐观更新
      (agents) => agents.filter((a) => a.id !== id),
      // API 调用
      () => agentService.deleteAgent(id)
    );
  });

  const getAgentName = useMemoizedFn((id: string) => {
    if(id==="user"){
      return "我";
    }
    return agents.find((agent) => agent.id === id)?.name ?? "未知";
  });

  const getAgentAvatar = useMemoizedFn((id: string) => {
    return agents.find((agent) => agent.id === id)?.avatar ?? "";
  });

  return {
    agents,
    isLoading: resource.isLoading,
    error: resource.error,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgentName,
    getAgentAvatar
  };
}
