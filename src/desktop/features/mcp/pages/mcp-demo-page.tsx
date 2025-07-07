import React from "react";
import { MCPConnectionManager } from "@/common/components/mcp/mcp-connection-manager";
import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { useMCPContext } from "@/common/components/mcp/mcp-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Server, Wrench, MessageSquare } from "lucide-react";

export function MCPDemoPage() {
  const { connections, mcpToolDefinitions } = useMCPContext();
  
  // 创建一个支持MCP工具的AI助手
  const mcpAssistant: AgentDef = {
    id: "mcp-assistant",
    name: "MCP助手",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mcp",
    prompt: `你是一个支持MCP（Model Context Protocol）工具的AI助手。

你可以使用连接到系统的MCP服务器提供的工具来帮助用户完成任务。

当前可用的MCP工具：
${mcpToolDefinitions.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

请根据用户的需求，选择合适的MCP工具来完成任务。如果用户想要：
- 操作文件系统，使用文件系统相关的工具
- 查询信息，使用相应的查询工具
- 执行其他任务，使用对应的工具

记住：
1. 仔细阅读工具的描述和参数要求
2. 确保提供正确的参数格式
3. 如果工具执行失败，分析错误原因并尝试其他方法
4. 始终以友好和专业的态度帮助用户`,
    role: "participant",
    personality: "专业、友好、乐于助人",
    expertise: ["MCP工具使用", "文件操作", "信息查询", "任务自动化"],
    bias: "倾向于使用MCP工具来高效完成任务",
    responseStyle: "专业、详细、实用",
  };

  const [messages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧MCP管理区 */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Server className="w-5 h-5" />
            MCP工具演示
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            连接MCP服务器，体验AI工具调用功能
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="connections" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connections">连接管理</TabsTrigger>
              <TabsTrigger value="tools">可用工具</TabsTrigger>
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
                    <h3 className="font-semibold mb-2">已连接服务器</h3>
                    {connections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        暂无连接的MCP服务器
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {connections.map((connection) => (
                          <Card key={connection.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Server className="w-4 h-4" />
                                {connection.config.name}
                                <Badge variant="outline" className="text-xs">
                                  {connection.tools.length} 工具
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-1">
                                {connection.tools.map((tool: any) => (
                                  <div
                                    key={tool.name}
                                    className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                                  >
                                    <Wrench className="w-3 h-3 text-muted-foreground" />
                                    <span className="font-medium">{tool.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      {tool.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">可用工具列表</h3>
                    {mcpToolDefinitions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        暂无可用的MCP工具
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {mcpToolDefinitions.map((tool) => (
                          <Card key={tool.name}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{tool.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {tool.description}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
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
            与MCP助手对话
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            尝试让AI使用MCP工具来帮助你完成任务
          </p>
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