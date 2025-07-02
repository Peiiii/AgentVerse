import React, { useMemo } from "react";
import {
  AgentContextManager,
  AgentContextManagerContext,
  AgentToolDefManager,
  AgentToolDefManagerContext,
  AgentToolExecutorManager,
  AgentToolExecutorManagerContext,
  AgentToolRendererManager,
  AgentToolRendererManagerContext,
} from "@agent-labs/agent-chat";

interface AgentChatProviderWrapperProps {
  children: React.ReactNode;
  contextManager?: AgentContextManager;
  toolDefManager?: AgentToolDefManager;
  toolExecutorManager?: AgentToolExecutorManager;
  toolRendererManager?: AgentToolRendererManager;
}

export function AgentChatProviderWrapper({
  children,
  contextManager: contextManagerProp,
  toolDefManager: toolDefManagerProp,
  toolExecutorManager: toolExecutorManagerProp,
  toolRendererManager: toolRendererManagerProp,
}: AgentChatProviderWrapperProps) {
  const contextManager = useMemo(() => contextManagerProp || new AgentContextManager(), [contextManagerProp]);
  const toolDefManager = useMemo(() => toolDefManagerProp || new AgentToolDefManager(), [toolDefManagerProp]);
  const toolExecutorManager = useMemo(() => toolExecutorManagerProp || new AgentToolExecutorManager(), [toolExecutorManagerProp]);
  const toolRendererManager = useMemo(() => toolRendererManagerProp || new AgentToolRendererManager(), [toolRendererManagerProp]);

  return (
    <AgentContextManagerContext.Provider value={contextManager}>
      <AgentToolDefManagerContext.Provider value={toolDefManager}>
        <AgentToolExecutorManagerContext.Provider value={toolExecutorManager}>
          <AgentToolRendererManagerContext.Provider value={toolRendererManager}>
            {children}
          </AgentToolRendererManagerContext.Provider>
        </AgentToolExecutorManagerContext.Provider>
      </AgentToolDefManagerContext.Provider>
    </AgentContextManagerContext.Provider>
  );
} 