import { useMCPClient } from "@/common/hooks/use-mcp-client";
import { useMCPConnectionManager } from "@/common/hooks/use-mcp-connection-manager";
import type { MCPConnection, MCPServerConfig } from "@/common/lib/mcp/mcp-connection-manager";
import { createContext, ReactNode, useContext } from "react";

export interface MCPConnectionManagerContextValue {
    connections: MCPConnection[];
    isLoading: boolean;
    error: string | null;
    connectToServer: (config: MCPServerConfig) => Promise<string>;
    connectWithClient: (connectionId: string, client: ReturnType<typeof useMCPClient>) => Promise<void>;
    disconnectFromServer: (connectionId: string) => Promise<void>;
    removeConnection: (connectionId: string) => Promise<void>;
    importServers: (configList: MCPServerConfig[]) => Promise<string[]>;
    importAndConnectServers: (configList: MCPServerConfig[]) => Promise<{
        total: number;
        successful: number;
        failed: number;
        connectionIds: string[];
    }>;
    getAllTools: any[];
    getConnection: (connectionId: string) => MCPConnection | undefined;
    getTools: (connectionId: string) => any[];
    getClient: (connectionId: string) => ReturnType<typeof useMCPClient> | undefined;
    activeClients: Map<string, ReturnType<typeof useMCPClient>>;
}

const MCPConnectionManagerContext = createContext<MCPConnectionManagerContextValue | null>(null);

interface MCPProviderProps {
    children: ReactNode;
}

export function MCPProvider({ children }: MCPProviderProps) {
    const mcpConnectionManager = useMCPConnectionManager();

    return (
        <MCPConnectionManagerContext.Provider value={mcpConnectionManager}>
            {children}
        </MCPConnectionManagerContext.Provider>
    );
}

export function useMCPConnectionManagerContext() {
    const context = useContext(MCPConnectionManagerContext);
    if (!context) {
        throw new Error("useMCPConnectionManagerContext must be used within MCPProvider");
    }
    return context;
} 