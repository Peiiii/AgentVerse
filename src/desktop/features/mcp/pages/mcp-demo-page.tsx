import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { MCPImportForm, MCPServerForm, MCPServerManager, MCPToolsDisplay, MCPToolsStats } from "@/common/components/mcp";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useAllTools } from "@/common/hooks/use-all-tools";
import { useMCPServers } from "@/common/hooks/use-mcp-servers";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { type MCPServerConfig } from "@/core/stores/mcp-server.store";
import { useProvideAgentToolDefs, useProvideAgentToolExecutors } from "@agent-labs/agent-chat";
import { MessageSquare, Server } from "lucide-react";
import React from "react";

function MCPDemoContent() {
  const {
    servers,
    addServer,
    updateServer,
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
  const handleAddServer = (config: Omit<MCPServerConfig, 'id'>) => {
    try {
      addServer(config);
    } catch (error) {
      console.error("添加服务器失败:", error);
    }
  };

  // 导入服务器
  const handleImportServers = (configs: Omit<MCPServerConfig, 'id'>[]) => {
    try {
      importServers(configs);
    } catch (error) {
      console.error("导入服务器失败:", error);
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

  // 更新服务器
  const handleUpdateServer = (serverId: string, updates: Partial<MCPServerConfig>) => {
    updateServer(serverId, updates);
  };

  // 删除服务器
  const handleRemoveServer = (serverId: string) => {
    removeServer(serverId);
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
          <MCPToolsStats
            servers={servers}
            getConnection={getConnection}
            className="mt-4"
          />
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <Tabs defaultValue="servers" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="servers" className="text-xs">服务器管理</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">工具列表</TabsTrigger>
            </TabsList>

            <TabsContent value="servers" className="flex-1 overflow-hidden m-0">
              <div className="p-6 overflow-y-auto h-full space-y-6 pb-6">
                {/* 添加服务器表单 */}
                <MCPServerForm
                  onSubmit={handleAddServer}
                  title="添加MCP服务器"
                  description="配置新的MCP服务器连接"
                />

                {/* JSON导入 */}
                <MCPImportForm
                  onImport={handleImportServers}
                  title="批量导入"
                  description="通过JSON格式批量导入服务器配置"
                />

                {/* 服务器列表 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">服务器列表</h3>
                  <MCPServerManager
                    servers={servers}
                    getConnection={getConnection}
                    getServerStatus={getServerStatus}
                    isConnected={isConnected}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onUpdate={handleUpdateServer}
                    onRemove={handleRemoveServer}
                    onRefreshTools={handleRefreshTools}
                    showEditButton={true}
                    showRemoveButton={true}
                    showRefreshButton={true}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 overflow-hidden m-0">
              <div className="p-6 overflow-y-auto h-full pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">工具详情</h3>
                    <MCPToolsDisplay
                      servers={servers}
                      getConnection={getConnection}
                      showServerInfo={true}
                      showToolCount={true}
                    />
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
            agentDef={mcpAssistant}
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