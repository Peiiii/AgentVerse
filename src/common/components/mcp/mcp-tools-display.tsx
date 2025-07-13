import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Wrench } from "lucide-react";
import type { MCPServerConfig, MCPServerConnection } from "@/core/stores/mcp-server.store";

interface MCPToolsDisplayProps {
  servers: MCPServerConfig[];
  getConnection: (serverId: string) => MCPServerConnection | undefined;
  showServerInfo?: boolean;
  showToolCount?: boolean;
  className?: string;
}

export function MCPToolsDisplay({
  servers,
  getConnection,
  showServerInfo = true,
  showToolCount = true,
  className = "",
}: MCPToolsDisplayProps) {
  const connectedServers = servers.filter(server => {
    const connection = getConnection(server.id);
    return connection && connection.status === "connected";
  });

  if (connectedServers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        暂无可用的MCP工具，请先连接服务器
      </p>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {connectedServers.map((server) => {
        const connection = getConnection(server.id);

        if (!connection) return null;
        
        return (
          <Card key={server.id}>
            {showServerInfo && (
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {server.name}
                  {showToolCount && (
                    <Badge variant="outline" className="text-xs">
                      {connection.tools.length} 工具
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {server.url}
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className={showServerInfo ? "pt-0" : ""}>
              {connection.tools.length > 0 ? (
                <div className="space-y-1">
                  {connection.tools.map((tool: unknown) => {
                    const toolObj = tool as { name: string; description?: string };
                    return (
                      <div
                        key={toolObj.name}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                      >
                        <Wrench className="w-3 h-3 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">{toolObj.name}</span>
                          {toolObj.description && (
                            <p className="text-xs text-muted-foreground">{toolObj.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">暂无可用工具</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// 工具统计组件
interface MCPToolsStatsProps {
  servers: MCPServerConfig[];
  getConnection: (serverId: string) => MCPServerConnection | undefined;
  className?: string;
}

export function MCPToolsStats({
  servers,
  getConnection,
  className = "",
}: MCPToolsStatsProps) {
  const stats = servers.reduce(
    (acc, server) => {
      const connection = getConnection(server.id);
      if (connection && connection.status === "connected") {
        acc.connectedServers++;
        acc.totalTools += connection.tools.length;
        acc.totalResources += connection.resources.length;
        acc.totalPrompts += connection.prompts.length;
      }
      return acc;
    },
    { connectedServers: 0, totalTools: 0, totalResources: 0, totalPrompts: 0 }
  );

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium">已连接服务器</span>
        </div>
        <div className="text-2xl font-bold text-blue-600 mt-1">{stats.connectedServers}</div>
      </div>
      
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">可用工具</span>
        </div>
        <div className="text-2xl font-bold text-green-600 mt-1">{stats.totalTools}</div>
      </div>
      
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-purple-600">📚</div>
          <span className="text-sm font-medium">可用资源</span>
        </div>
        <div className="text-2xl font-bold text-purple-600 mt-1">{stats.totalResources}</div>
      </div>
      
      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-orange-600">💬</div>
          <span className="text-sm font-medium">可用提示</span>
        </div>
        <div className="text-2xl font-bold text-orange-600 mt-1">{stats.totalPrompts}</div>
      </div>
    </div>
  );
} 