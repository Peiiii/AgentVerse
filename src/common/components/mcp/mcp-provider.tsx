import { useMCPTools } from "@/common/hooks/use-mcp-tools";
import { createContext, ReactNode, useContext } from "react";

interface MCPContextValue {
    connections: any[];
    isLoading: boolean;
    error: string | null;
    connectToServer: (config: any) => Promise<string>;
    disconnectFromServer: (connectionId: string) => Promise<void>;
    mcpToolDefinitions: any[];
    getConnection: (connectionId: string) => any;
    getTools: (connectionId: string) => any[];
}

const MCPContext = createContext<MCPContextValue | null>(null);

interface MCPProviderProps {
    children: ReactNode;
}

export function MCPProvider({ children }: MCPProviderProps) {
    const mcpTools = useMCPTools();

    return (
        <MCPContext.Provider value={mcpTools}>
            {children}
        </MCPContext.Provider>
    );
}

export function useMCPContext() {
    const context = useContext(MCPContext);
    if (!context) {
        throw new Error("useMCPContext must be used within MCPProvider");
    }
    return context;
} 