import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { MCPConnectionManager } from "@/common/components/mcp/mcp-connection-manager";
import { MCPProvider, useMCPConnectionManagerContext } from "@/common/components/mcp/mcp-provider";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useMCPAIIntegration } from "@/common/hooks/use-mcp-ai-integration";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { Database, Lightbulb, MessageSquare, Server, Wrench } from "lucide-react";
import React from "react";

function MCPDemoContent() {
  const { connections } = useMCPConnectionManagerContext();
  const { mcpToolDefinitions, connectedToolsCount } = useMCPAIIntegration();
  
  // 创建一个支持MCP工具的AI助手
  const mcpAssistant: AgentDef = {
    id: "mcp-assistant",
    name: "MCP智能助手",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mcp",
    prompt: `你是一个支持MCP（Model Context Protocol）工具的AI智能助手。你可以通过连接到系统的MCP服务器来使用各种强大的工具完成复杂任务。

## 当前可用的MCP工具：
${mcpToolDefinitions.map((tool: any) => `- **${tool.name}**: ${tool.description || '强大的MCP工具'}`).join('\n')}

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

  // 统计连接和工具数量
  const connectedCount = connections.filter(c => c.status === "connected").length;
  const totalTools = connections.reduce((sum, c) => sum + c.tools.length, 0);
  const totalResources = connections.reduce((sum, c) => sum + c.resources.length, 0);
  const totalPrompts = connections.reduce((sum, c) => sum + c.prompts.length, 0);

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧MCP管理区 */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-6 border-b">
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
              <div className="text-2xl font-bold text-blue-600 mt-1">{connectedCount}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">可用工具</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">{totalTools}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="connections" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connections" className="text-xs">连接管理</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">工具列表</TabsTrigger>
              <TabsTrigger value="capabilities" className="text-xs">能力概览</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="h-full m-0">
              <div className="p-6 overflow-auto h-full">
                <MCPConnectionManager />
              </div>
            </TabsContent>

            <TabsContent value="tools" className="h-full m-0">
              <div className="p-6 overflow-auto h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">工具详情</h3>
                    {connections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        暂无连接的MCP服务器
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {connections.map((connection) => (
                          <Card key={connection.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  connection.status === "connected" ? "bg-green-500" :
                                  connection.status === "connecting" ? "bg-yellow-500" :
                                  connection.status === "error" ? "bg-red-500" : "bg-gray-400"
                                }`} />
                                {connection.config.name}
                                <Badge variant="outline" className="text-xs">
                                  {connection.tools.length} 工具
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {connection.config.url}
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
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="h-full m-0">
              <div className="p-6 overflow-auto h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* 工具能力 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-blue-600" />
                          工具能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-1">{totalTools}</div>
                        <p className="text-xs text-muted-foreground">个可调用工具</p>
                      </CardContent>
                    </Card>

                    {/* 资源能力 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Database className="w-4 h-4 text-green-600" />
                          资源能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600 mb-1">{totalResources}</div>
                        <p className="text-xs text-muted-foreground">个可访问资源</p>
                      </CardContent>
                    </Card>

                    {/* 提示能力 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-orange-600" />
                          提示能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600 mb-1">{totalPrompts}</div>
                        <p className="text-xs text-muted-foreground">个智能提示</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 功能说明 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">MCP功能特点</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full" />
                          <span>自动协议协商（HTTP/SSE）</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full" />
                          <span>实时工具发现和调用</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-orange-600 rounded-full" />
                          <span>智能提示和资源管理</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-600 rounded-full" />
                          <span>批量服务导入</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧聊天区 */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            与MCP智能助手对话
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            体验AI如何使用MCP工具来完成复杂任务 · 支持{connectedToolsCount}个工具调用
          </p>
          
          {/* 快速提示 */}
          {connectedToolsCount > 0 && (
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

        <div className="flex-1 overflow-hidden">
          <AgentChatContainer
            agent={mcpAssistant}
            messages={messages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            showInfoPanel={false}
            defaultInfoExpanded={false}
            compactInfo={true}
            enableFloatingInfo={false}
          />
        </div>
      </div>
    </div>
  );
}

export function MCPDemoPage() {
  return (
    <MCPProvider>
      <MCPDemoContent />
    </MCPProvider>
  );
} 