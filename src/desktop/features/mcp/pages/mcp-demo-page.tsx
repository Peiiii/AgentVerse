import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Textarea } from "@/common/components/ui/textarea";
import { useAllTools } from "@/common/hooks/use-all-tools";
import { useMCPServers } from "@/common/hooks/use-mcp-servers";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { type MCPServerConfig } from "@/core/stores/mcp-server.store";
import { useProvideAgentToolDefs, useProvideAgentToolExecutors } from "@agent-labs/agent-chat";
import { AlertCircle, MessageSquare, Plus, RefreshCw, Server, Trash2, Wrench } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { MCPClient, MCPTransportFactory } from "@/common/lib/mcp";
import { MockMCPServer } from "@/common/lib/mcp/examples/mock-server";

function MCPDemoContent() {
  const {
    servers,
    stats,
    addServer,
    removeServer,
    importServers,
    connectServer,
    disconnectServer,
    refreshTools,
    getConnection,
    isConnected,
    getServerStatus,
  } = useMCPServers();

  // 使用useAllTools hook获取转换后的工具
  const { toolDefinitions, toolExecutors, stats: toolsStats } = useAllTools();
  console.log("[MCPDemoContent] toolDefinitions", toolDefinitions)

  // 将MCP工具提供给agent-chat
  useProvideAgentToolDefs(toolDefinitions);
  useProvideAgentToolExecutors(toolExecutors);

  // 表单状态
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [serverType, setServerType] = useState<"sse" | "streamable-http">("streamable-http");
  const [serverDescription, setServerDescription] = useState("");

  // JSON导入状态
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // 创建一个支持MCP工具的AI助手
  const mcpAssistant: AgentDef = {
    id: "mcp-assistant",
    name: "MCP智能助手",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mcp",
    prompt: `你是一个支持MCP（Model Context Protocol）工具的AI智能助手。你可以通过连接到系统的MCP服务器来使用各种强大的工具完成复杂任务。

## 当前可用的MCP工具：
${toolsStats.totalTools > 0
        ? toolsStats.servers.map(serverName => {
          const serverTools = toolsStats.toolsByServer[serverName] || [];
          return `**${serverName}**:\n${serverTools.map(toolName => `- ${toolName}`).join('\n')}`;
        }).join('\n\n')
        : '暂无可用的MCP工具，请先连接服务器'
      }

## 你的能力包括：
1. **文件系统操作** - 读取、写入、搜索文件
2. **数据查询和分析** - 查询数据库、处理数据
3. **信息检索** - 搜索网络、知识库查询
4. **自动化任务** - 批处理、工作流执行
5. **代码生成和执行** - 编程助手、代码分析

## 使用指南：
- 当用户需要操作文件时，我会使用文件系统相关的工具
- 当用户需要查询信息时，我会使用搜索和数据库工具  
- 当用户需要执行复杂任务时，我会组合使用多个工具
- 我会根据工具的参数要求，确保提供正确的参数格式
- 如果工具执行失败，我会分析错误原因并尝试其他方法

让我们开始吧！告诉我你需要什么帮助，我会使用最合适的MCP工具来完成任务。`,
    role: "participant",
    personality: "专业、智能、高效",
    expertise: ["MCP工具调用", "文件操作", "数据处理", "信息检索", "任务自动化", "系统集成"],
    bias: "优先使用MCP工具来提供准确和高效的解决方案",
    responseStyle: "专业、详细、步骤清晰",
  };

  const [messages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");

  // 添加服务器
  const handleAddServer = () => {
    if (!serverUrl.trim()) return;

    try {
      addServer({
        name: serverName || new URL(serverUrl).hostname,
        url: serverUrl,
        type: serverType,
        description: serverDescription,
      });

      // 清空表单
      setServerName("");
      setServerUrl("");
      setServerType("streamable-http");
      setServerDescription("");
    } catch (error) {
      console.error("添加服务器失败:", error);
    }
  };

  // 导入服务器
  const handleImportServers = () => {
    if (!importJson.trim()) return;

    try {
      const parsed = JSON.parse(importJson);
      let configs: Array<Omit<MCPServerConfig, 'id'>> = [];

      // 支持多种格式：
      // 1. 数组格式: [{name: "server1", url: "...", type: "http"}]
      // 2. 对象格式: {mcpServers: {proxy: {type: "sse", url: "..."}}}
      if (Array.isArray(parsed)) {
        configs = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // 处理嵌套对象格式
        const extractServers = (obj: any, prefix = ''): Array<Omit<MCPServerConfig, 'id'>> => {
          const servers: Array<Omit<MCPServerConfig, 'id'>> = [];

          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && 'url' in value) {
              // 这是一个服务器配置
              const serverConfig = value as any;
              servers.push({
                name: prefix ? `${prefix}-${key}` : key,
                url: String(serverConfig.url),
                type: (serverConfig.type as 'sse' | 'streamable-http') || 'streamable-http',
                description: serverConfig.description || `${key} MCP服务器`,
              });
            } else if (typeof value === 'object' && value !== null) {
              // 继续递归查找
              const nestedServers = extractServers(value, prefix ? `${prefix}-${key}` : key);
              servers.push(...nestedServers);
            }
          }

          return servers;
        };

        configs = extractServers(parsed);
      } else {
        throw new Error("JSON格式不支持");
      }

      if (configs.length === 0) {
        throw new Error("未找到有效的服务器配置");
      }

      importServers(configs);
      setImportJson("");
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "JSON格式错误");
    }
  };

  // 连接服务器
  const handleConnect = async (serverId: string) => {
    try {
      await connectServer(serverId);
    } catch (error) {
      console.error("连接失败:", error);
    }
  };

  // 断开连接
  const handleDisconnect = async (serverId: string) => {
    try {
      await disconnectServer(serverId);
    } catch (error) {
      console.error("断开连接失败:", error);
    }
  };

  // 刷新工具
  const handleRefreshTools = async (serverId: string) => {
    try {
      await refreshTools(serverId);
    } catch (error) {
      console.error("刷新工具失败:", error);
    }
  };

  // 删除服务器
  const handleRemoveServer = (serverId: string) => {
    removeServer(serverId);
  };

  // 通用MCP传输层演示
  const [universalMCPStatus, setUniversalMCPStatus] = useState<string>("未连接");
  const [universalMCPTools, setUniversalMCPTools] = useState<any[]>([]);
  const [universalMCPResult, setUniversalMCPResult] = useState<string>("");
  const universalMCPRef = useRef<MCPClient | null>(null);
  const mockServerRef = useRef<MockMCPServer | null>(null);

  // 初始化通用MCP演示
  useEffect(() => {
    // 创建事件总线用于演示
    const eventBus = new EventTarget();
    
    // 创建Event传输层
    const eventTransport = MCPTransportFactory.create({
      type: 'event',
      eventBus,
      channel: 'demo'
    });

    // 创建MCP客户端
    universalMCPRef.current = new MCPClient(eventTransport);

    // 创建模拟服务器
    mockServerRef.current = new MockMCPServer(eventTransport);

    return () => {
      // 清理
      if (universalMCPRef.current) {
        // 断开连接
      }
    };
  }, []);

  // 连接通用MCP
  const handleConnectUniversalMCP = async () => {
    try {
      setUniversalMCPStatus("连接中...");
      
      if (universalMCPRef.current) {
        // 获取工具列表
        const tools = await universalMCPRef.current.listTools();
        setUniversalMCPTools(tools);
        setUniversalMCPStatus("已连接");
        setUniversalMCPResult(`成功获取到 ${tools.length} 个工具`);
      }
    } catch (error) {
      setUniversalMCPStatus("连接失败");
      setUniversalMCPResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 调用通用MCP工具
  const handleCallUniversalTool = async (toolName: string) => {
    try {
      if (!universalMCPRef.current) return;

      let args: any;
      switch (toolName) {
        case "file_read":
          args = { path: "/demo/test.txt" };
          break;
        case "file_write":
          args = { path: "/demo/output.txt", content: "Hello from Universal MCP!" };
          break;
        case "search_web":
          args = { query: "通用MCP传输层" };
          break;
        default:
          args = {};
      }

      const result = await universalMCPRef.current.callTool(toolName, args);
      setUniversalMCPResult(`工具调用成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setUniversalMCPResult(`工具调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧MCP管理区 */}
      <div className="w-1/3 border-r flex flex-col min-h-0">
        <div className="p-6 border-b flex-shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            MCP工具演示平台
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            体验基于MCP官方SDK的AI工具调用和服务集成
          </p>

          {/* 统计信息 */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">已连接服务器</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{stats.connected}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">可用工具</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.totalTools}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <Tabs defaultValue="servers" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="servers" className="text-xs">服务器管理</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">工具列表</TabsTrigger>
              <TabsTrigger value="universal" className="text-xs">通用传输层</TabsTrigger>
            </TabsList>

            <TabsContent value="servers" className="flex-1 overflow-hidden m-0">
              <div className="p-6 overflow-y-auto h-full space-y-6 pb-6">
                {/* 添加服务器表单 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      添加MCP服务器
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="server-name">服务器名称</Label>
                      <Input
                        id="server-name"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        placeholder="文件系统服务器"
                      />
                    </div>
                    <div>
                      <Label htmlFor="server-url">服务器地址</Label>
                      <Input
                        id="server-url"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="http://localhost:3000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="server-type">传输协议</Label>
                      <Select value={serverType} onValueChange={(value: "sse" | "streamable-http") => setServerType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
                          <SelectItem value="sse">SSE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="server-description">描述（可选）</Label>
                      <Input
                        id="server-description"
                        value={serverDescription}
                        onChange={(e) => setServerDescription(e.target.value)}
                        placeholder="文件系统操作服务器"
                      />
                    </div>
                    <Button onClick={handleAddServer} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      添加服务器
                    </Button>
                  </CardContent>
                </Card>

                {/* JSON导入 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">批量导入</CardTitle>
                    <CardDescription>通过JSON格式批量导入服务器配置</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="import-json">JSON配置</Label>
                      <Textarea
                        id="import-json"
                        value={importJson}
                        onChange={(e) => setImportJson(e.target.value)}
                        placeholder={`// 支持数组格式:
[
  {
    "name": "文件系统服务器",
    "url": "http://localhost:3000",
    "type": "streamable-http",
    "description": "文件系统操作"
  }
]

// 或嵌套对象格式:
{
  "mcpServers": {
    "proxy": {
      "type": "sse",
      "url": "http://127.0.0.1:8080/sse"
    }
  }
}`}
                        rows={4}
                      />
                    </div>
                    {importError && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {importError}
                      </div>
                    )}
                    <Button onClick={handleImportServers} className="w-full">
                      导入服务器
                    </Button>
                  </CardContent>
                </Card>

                {/* 服务器列表 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">服务器列表</h3>
                  {servers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暂无MCP服务器，请添加服务器
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {servers.map((server) => {
                        const connection = getConnection(server.id);
                        const status = getServerStatus(server.id);
                        const connected = isConnected(server.id);

                        return (
                          <Card key={server.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500" :
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
                                      onClick={() => handleDisconnect(server.id)}
                                    >
                                      断开
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleConnect(server.id)}
                                      disabled={status === "connecting"}
                                    >
                                      {status === "connecting" ? "连接中..." : "连接"}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveServer(server.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <CardDescription className="text-xs">
                                {server.url} • {server.type.toUpperCase()}
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
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRefreshTools(server.id)}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 overflow-hidden m-0">
              <div className="p-6 overflow-y-auto h-full pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">工具详情</h3>
                    {toolsStats.totalTools === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        暂无可用的MCP工具，请先连接服务器
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {servers.map((server) => {
                          const connection = getConnection(server.id);
                          if (!connection || connection.status !== "connected") return null;

                          return (
                            <Card key={server.id}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  {server.name}
                                  <Badge variant="outline" className="text-xs">
                                    {connection.tools.length} 工具
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {server.url}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {connection.tools.length > 0 ? (
                                  <div className="space-y-1">
                                    {connection.tools.map((tool: any) => (
                                      <div
                                        key={tool.name}
                                        className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                                      >
                                        <Wrench className="w-3 h-3 text-muted-foreground" />
                                        <div className="flex-1">
                                          <span className="font-medium">{tool.name}</span>
                                          {tool.description && (
                                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">暂无可用工具</p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="universal" className="flex-1 overflow-hidden m-0">
              <div className="p-6 overflow-y-auto h-full pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">通用MCP传输层演示</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      演示基于抽象传输层的通用MCP客户端，支持PostMessage、Event等多种通信方式
                    </p>
                    
                    {/* 连接状态 */}
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            universalMCPStatus === "已连接" ? "bg-green-500" :
                            universalMCPStatus === "连接中..." ? "bg-yellow-500" :
                            universalMCPStatus === "连接失败" ? "bg-red-500" : "bg-gray-400"
                          }`} />
                          通用MCP客户端
                          <Badge variant="outline" className="text-xs">
                            {universalMCPStatus}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          基于Event传输层的模拟MCP服务器
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          onClick={handleConnectUniversalMCP}
                          disabled={universalMCPStatus === "连接中..."}
                          className="w-full"
                        >
                          {universalMCPStatus === "已连接" ? "重新连接" : "连接服务器"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* 工具列表 */}
                    {universalMCPTools.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">可用工具</CardTitle>
                          <CardDescription className="text-xs">
                            {universalMCPTools.length} 个工具
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {universalMCPTools.map((tool: any) => (
                              <div key={tool.name} className="space-y-2">
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                                  <Wrench className="w-3 h-3 text-muted-foreground" />
                                  <div className="flex-1">
                                    <span className="font-medium">{tool.name}</span>
                                    {tool.description && (
                                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCallUniversalTool(tool.name)}
                                  >
                                    调用
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 调用结果 */}
                    {universalMCPResult && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">调用结果</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-3 bg-muted/30 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                            {universalMCPResult}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧聊天区 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-6 border-b flex-shrink-0 overflow-hidden">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            与MCP智能助手对话
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            体验AI如何使用MCP工具来完成复杂任务 · 支持{toolsStats.totalTools}个工具调用
          </p>

          {/* 快速提示 */}
          {toolsStats.totalTools > 0 && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">💡 试试这些指令：</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">帮我分析一下数据</Badge>
                <Badge variant="secondary" className="text-xs">搜索相关信息</Badge>
                <Badge variant="secondary" className="text-xs">执行文件操作</Badge>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <AgentChatContainer
            agent={mcpAssistant}
            messages={messages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            showInfoPanel={false}
            defaultInfoExpanded={false}
            compactInfo={true}
            enableFloatingInfo={false}
            className="flex-1 min-h-0 h-full"
          />
        </div>
      </div>
    </div>
  );
}

export function MCPDemoPage() {
  return <MCPDemoContent />;
} 