import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/common/components/ui/card";
import { EditMCPServerButton } from "@/common/features/mcp/components";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import type { MCPServerConfig, MCPServerConnection } from "@/core/stores/mcp-server.store";

interface MCPServerManagerProps {
  servers: MCPServerConfig[];
  getConnection: (serverId: string) => MCPServerConnection | undefined;
  getServerStatus: (serverId: string) => string;
  isConnected: (serverId: string) => boolean;
  onConnect: (serverId: string) => void;
  onDisconnect: (serverId: string) => void;
  onUpdate: (serverId: string, updates: Partial<MCPServerConfig>) => void;
  onRemove: (serverId: string) => void;
  onRefreshTools: (serverId: string) => void;
  showEditButton?: boolean;
  showRemoveButton?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

export function MCPServerManager({
  servers,
  getConnection,
  getServerStatus,
  isConnected,
  onConnect,
  onDisconnect,
  onUpdate,
  onRemove,
  onRefreshTools,
  showEditButton = true,
  showRemoveButton = true,
  showRefreshButton = true,
  className = "",
}: MCPServerManagerProps) {
  if (servers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        暂无MCP服务器，请添加服务器
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {servers.map((server) => {
        const connection = getConnection(server.id);
        const status = getServerStatus(server.id);
        const connected = isConnected(server.id);

        return (
          <Card key={server.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === "connected" ? "bg-green-500" :
                    status === "connecting" ? "bg-yellow-500" :
                    status === "error" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                  <span className="font-medium text-sm">{server.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {connected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDisconnect(server.id)}
                    >
                      断开
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onConnect(server.id)}
                      disabled={status === "connecting"}
                    >
                      {status === "connecting" ? "连接中..." : "连接"}
                    </Button>
                  )}
                  
                  {showEditButton && (
                    <EditMCPServerButton
                      server={server}
                      onUpdate={(id, updates) => onUpdate(id, updates)}
                    />
                  )}
                  
                  {showRemoveButton && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(server.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">
                {server.url} • {server.type.toUpperCase()}
                {server.description && (
                  <span className="ml-2">• {server.description}</span>
                )}
              </CardDescription>
              {connection?.error && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {connection.error}
                </div>
              )}
            </CardHeader>
            {connected && (
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{connection?.tools.length || 0} 个工具</span>
                  {showRefreshButton && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRefreshTools(server.id)}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// 可插拔的服务器卡片组件
interface MCPServerCardProps {
  server: MCPServerConfig;
  connection?: MCPServerConnection;
  status: string;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onUpdate: (id: string, updates: Partial<MCPServerConfig>) => void;
  onRemove: () => void;
  onRefreshTools: () => void;
  showEditButton?: boolean;
  showRemoveButton?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

export function MCPServerCard({
  server,
  connection,
  status,
  connected,
  onConnect,
  onDisconnect,
  onUpdate,
  onRemove,
  onRefreshTools,
  showEditButton = true,
  showRemoveButton = true,
  showRefreshButton = true,
  className = "",
}: MCPServerCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              status === "connected" ? "bg-green-500" :
              status === "connecting" ? "bg-yellow-500" :
              status === "error" ? "bg-red-500" : "bg-gray-400"
            }`} />
            <span className="font-medium text-sm">{server.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {connected ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onDisconnect}
              >
                断开
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onConnect}
                disabled={status === "connecting"}
              >
                {status === "connecting" ? "连接中..." : "连接"}
              </Button>
            )}
            
            {showEditButton && (
              <EditMCPServerButton
                server={server}
                onUpdate={(id, updates) => onUpdate(id, updates)}
              />
            )}
            
            {showRemoveButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRemove}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          {server.url} • {server.type.toUpperCase()}
          {server.description && (
            <span className="ml-2">• {server.description}</span>
          )}
        </CardDescription>
        {connection?.error && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            {connection.error}
          </div>
        )}
      </CardHeader>
      {connected && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{connection?.tools.length || 0} 个工具</span>
            {showRefreshButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRefreshTools}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 