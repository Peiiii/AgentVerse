import { useMCPConnectionManagerContext } from "@/common/components/mcp/mcp-provider";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { useMCPClient } from "@/common/hooks/use-mcp-client";
import { AlertCircle, Play, RefreshCw, Server, Settings, Trash2, Upload, Wifi, WifiOff } from "lucide-react";
import { useRef, useState } from "react";

interface MCPConnectionManagerProps {
  className?: string;
}

interface MCPServerConfig {
  name: string;
  url: string;
  type?: "sse" | "http" | "websocket" | "tcp";
}

export function MCPConnectionManager({ className }: MCPConnectionManagerProps) {
  const { connections, connectToServer, connectWithClient, disconnectFromServer, removeConnection, importAndConnectServers } = useMCPConnectionManagerContext();
  
  // 单个连接测试
  const [serverUrl, setServerUrl] = useState("");
  const [serverName, setServerName] = useState("");
  const [transportType, setTransportType] = useState<"sse" | "http">("http");
  const mcpClient = useMCPClient();
  
  // 批量导入
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLTextAreaElement>(null);

  // 单个连接
  const handleConnect = async () => {
    if (!serverUrl.trim()) return;

    try {
      const config: MCPServerConfig = {
        name: serverName || new URL(serverUrl).hostname,
        url: serverUrl,
        type: transportType
      };
      
      const connectionId = await connectToServer(config);
      await connectWithClient(connectionId, mcpClient);
      
      // 清空输入
      setServerUrl("");
      setServerName("");
      setTransportType("http");
    } catch (error) {
      console.error("连接失败:", error);
    }
  };

  // 断开连接
  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectFromServer(connectionId);
    } catch (error) {
      console.error("断开连接失败:", error);
    }
  };

  // 删除连接
  const handleRemove = async (connectionId: string) => {
    try {
      await removeConnection(connectionId);
    } catch (error) {
      console.error("删除连接失败:", error);
    }
  };

  // 批量导入
  const handleImport = async () => {
    if (!importJson.trim()) return;

    try {
      setImportError(null);
      const jsonData = JSON.parse(importJson);
      let configs: MCPServerConfig[] = [];

      // 支持多种格式
      if (Array.isArray(jsonData)) {
        // 直接数组格式
        configs = jsonData;
      } else if (jsonData.mcpServers) {
        // {"mcpServers": {"name": {"type": "sse", "url": "..."}}} 格式
        configs = Object.entries(jsonData.mcpServers).map(([name, config]: [string, any]) => ({
          name,
          url: config.url,
          type: config.type || "http"
        }));
      } else {
        throw new Error("不支持的导入格式。请使用数组格式或 mcpServers 对象格式");
      }

      if (configs.length === 0) {
        throw new Error("没有找到有效的服务器配置");
      }

      console.log(`开始导入并连接 ${configs.length} 个MCP服务器...`);
      
      // 自动导入并连接所有服务器
      const results = await importAndConnectServers(configs);
      
      setImportJson("");
      
      // 显示结果提示
      if (results.successful > 0) {
        console.log(`🎉 已自动连接 ${results.successful} 个MCP服务器，工具将在几秒钟内可用`);
      }
      
      if (results.failed > 0) {
        console.warn(`⚠️ ${results.failed} 个服务器连接失败，请检查配置`);
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "导入失败";
      setImportError(message);
    }
  };

  // 测试工具调用
  const handleTestTool = async (connectionId: string, toolName: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) return;

      // 找到对应的工具
      const tool = connection.tools.find((t: any) => t.name === toolName);
      if (!tool) return;

      // 简单测试调用（使用空参数）
      if (!mcpClient.client) {
        console.error("MCP客户端未连接");
        return;
      }

      const result = await mcpClient.client.callTool({
        name: toolName,
        arguments: {}
      });
      console.log("工具调用结果:", result);
    } catch (error) {
      console.error("工具调用失败:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 单个连接测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            连接MCP服务器
          </CardTitle>
          <CardDescription>
            输入MCP服务器地址进行连接测试
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">服务器名称（可选）</Label>
              <Input
                id="server-name"
                placeholder="如：文件管理器"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="server-url">服务器地址</Label>
              <Input
                id="server-url"
                placeholder="https://example.com/mcp"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport-type">传输协议</Label>
            <Select value={transportType} onValueChange={(value: "sse" | "http") => setTransportType(value)}>
              <SelectTrigger id="transport-type">
                <SelectValue placeholder="选择传输协议" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="sse">SSE (Server-Sent Events)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              HTTP: 标准HTTP请求/响应 | SSE: 服务器推送事件流
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleConnect}
              disabled={!serverUrl.trim() || mcpClient.status === "connecting"}
              className="flex-1"
            >
              {mcpClient.status === "connecting" ? "连接中..." : "连接并拉取工具"}
            </Button>
            
            {mcpClient.status === "connected" && (
              <Button variant="outline" onClick={() => mcpClient.disconnect()}>
                断开连接
              </Button>
            )}
          </div>

          {/* 连接状态显示 */}
          {mcpClient.status !== "disconnected" && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {mcpClient.status === "connected" ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : mcpClient.status === "connecting" ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  状态: {mcpClient.status === "connected" ? "已连接" : 
                         mcpClient.status === "connecting" ? "连接中" : "连接失败"}
                </span>
              </div>

              {mcpClient.error && (
                <Alert className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{mcpClient.error}</AlertDescription>
                </Alert>
              )}

              {mcpClient.status === "connected" && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">工具: </span>
                    <Badge variant="secondary">{mcpClient.tools.length}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">资源: </span>
                    <Badge variant="secondary">{mcpClient.resources.length}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">提示: </span>
                    <Badge variant="secondary">{mcpClient.prompts.length}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 批量导入 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            批量导入MCP服务
          </CardTitle>
          <CardDescription>
            导入JSON格式的MCP服务器配置列表
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-json">服务器配置JSON</Label>
            <Textarea
              ref={importInputRef}
              id="import-json"
              placeholder={`{
  "mcpServers": {
    "time": {
      "type": "sse",
      "url": "https://mcp.api-inference.modelscope.net/c502cb6bb3fa40/sse"
    },
    "filesystem": {
      "type": "http", 
      "url": "https://api.example.com/mcp/fs"
    }
  }
}

或者数组格式:
[
  {
    "name": "时间服务",
    "url": "https://mcp.api-inference.modelscope.net/c502cb6bb3fa40/sse",
    "type": "sse"
  }
]`}
              className="min-h-[120px] font-mono text-sm"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
          </div>

          {importError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleImport} disabled={!importJson.trim()}>
            导入服务器配置
          </Button>
        </CardContent>
      </Card>

      {/* 已连接的服务器列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            已连接的服务器
          </CardTitle>
          <CardDescription>
            管理已连接的MCP服务器和可用工具
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无连接的MCP服务器
            </p>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <Card key={connection.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connection.status === "connected" ? "bg-green-500" :
                        connection.status === "connecting" ? "bg-yellow-500" :
                        connection.status === "error" ? "bg-red-500" : "bg-gray-400"
                      }`} />
                      <div>
                        <h4 className="font-medium">{connection.config.name}</h4>
                        <p className="text-sm text-muted-foreground">{connection.config.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {connection.tools.length} 工具
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {connection.resources.length} 资源
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {connection.prompts.length} 提示
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={connection.status !== "connected"}
                      >
                        断开
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(connection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 工具列表 */}
                  {connection.tools.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">可用工具:</h5>
                      <div className="grid gap-2">
                        {connection.tools.map((tool: any) => (
                          <div key={tool.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="font-medium text-sm">{tool.name}</span>
                              {tool.description && (
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestTool(connection.id, tool.name)}
                              disabled={connection.status !== "connected"}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              测试
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connection.error && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{connection.error}</AlertDescription>
                    </Alert>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 