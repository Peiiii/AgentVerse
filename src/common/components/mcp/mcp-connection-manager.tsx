import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { useMCPTools } from "@/common/hooks/use-mcp-tools";
import type { MCPServerConfig } from "@/common/lib/mcp/mcp-connection-manager";
import { Server, Settings, Trash2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface MCPConnectionManagerProps {
  className?: string;
}

export function MCPConnectionManager({ className }: MCPConnectionManagerProps) {
  const { connections, isLoading, error, connectToServer, disconnectFromServer } = useMCPTools();
  
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [transport, setTransport] = useState<"websocket" | "tcp">("websocket");

  const handleConnect = async () => {
    if (!serverName.trim() || !serverUrl.trim()) {
      return;
    }

    const config: MCPServerConfig = {
      name: serverName.trim(),
      url: serverUrl.trim(),
      transport,
    };

    try {
      await connectToServer(config);
      setServerName("");
      setServerUrl("");
    } catch (err) {
      console.error("Failed to connect to MCP server:", err);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectFromServer(connectionId);
    } catch (err) {
      console.error("Failed to disconnect from MCP server:", err);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            MCP服务器连接管理
          </CardTitle>
          <CardDescription>
            连接到本地或远程的MCP服务器，获取可用的工具
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 连接表单 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="server-name">服务器名称</Label>
                <Input
                  id="server-name"
                  placeholder="例如：文件系统服务器"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="transport">传输协议</Label>
                <Select value={transport} onValueChange={(value: "websocket" | "tcp") => setTransport(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="websocket">WebSocket</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="server-url">服务器地址</Label>
              <Input
                id="server-url"
                placeholder="例如：ws://localhost:3000 或 tcp://localhost:3001"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={isLoading || !serverName.trim() || !serverUrl.trim()}
              className="w-full"
            >
              {isLoading ? "连接中..." : "连接服务器"}
            </Button>
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* 连接列表 */}
          {connections.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">已连接的服务器</h4>
              <div className="space-y-2">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {connection.isConnected ? (
                          <Wifi className="w-4 h-4 text-green-600" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">{connection.config.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {connection.tools.length} 个工具
                      </Badge>
                      {connection.error && (
                        <Badge variant="destructive" className="text-xs">
                          错误
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 快速连接示例 */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">快速连接示例</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setServerName("文件系统服务器");
                  setServerUrl("ws://localhost:3000");
                  setTransport("websocket");
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                连接本地文件系统MCP服务器
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 