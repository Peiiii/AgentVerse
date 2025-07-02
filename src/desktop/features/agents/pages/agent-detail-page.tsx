import { AgentEmbeddedForm } from "@/common/components/agent/agent-embedded-form";
import { AiChatCreator } from "@/common/components/agent/ai-chat-creator";
import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useAgents } from "@/core/hooks/useAgents";
import { ArrowLeft, Bot, Settings, Sparkles, Wand2, Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AgentDef } from "@/common/types/agent";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { ChatMessage } from "@/common/types/chat";

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agents, updateAgent } = useAgents();
  
  const [agent, setAgent] = useState<AgentDef | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"configure" | "ai-create">("configure");
  const [chatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // 查找当前agent
  useEffect(() => {
    if (agentId) {
      const foundAgent = agents.find(a => a.id === agentId);
      setAgent(foundAgent || null);
    }
  }, [agentId, agents]);

  // 如果agent未找到，显示错误页面
  if (!agentId || !agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">智能体未找到</h2>
          <p className="text-muted-foreground mb-4">请检查链接是否正确或返回智能体列表</p>
          <Button onClick={() => navigate("/agents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回智能体列表
          </Button>
        </div>
      </div>
    );
  }

  const handleAgentUpdate = (updatedAgentData: Omit<AgentDef, "id">) => {
    const updatedAgent = { ...updatedAgentData, id: agent.id };
    setAgent(updatedAgent);
    updateAgent(agent.id, updatedAgentData);
  };

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "moderator":
        return {
          icon: Bot,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/50",
          borderColor: "border-amber-200 dark:border-amber-800",
          label: "主持人"
        };
      case "participant":
        return {
          icon: Bot,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
          borderColor: "border-emerald-200 dark:border-emerald-800",
          label: "参与者"
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "智能体"
        };
    }
  };

  const roleConfig = getRoleConfig(agent.role);

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧设置区 - 统一使用50%宽度 */}
      <div className="w-1/2 border-r flex flex-col">
        {/* 左侧头部 - 配置导向 */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/agents")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20 shadow-lg">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                    {agent.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-background",
                  roleConfig.bgColor
                )}>
                  <roleConfig.icon className={cn("w-2.5 h-2.5", roleConfig.color)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {agent.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 mt-1",
                    roleConfig.borderColor,
                    roleConfig.bgColor,
                    roleConfig.color
                  )}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  配置中心
                </Badge>
              </div>
            </div>
          </div>

          <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as "configure" | "ai-create")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configure" className="text-xs gap-1">
                <Settings className="w-3 h-3" />
                手动配置
              </TabsTrigger>
              <TabsTrigger value="ai-create" className="text-xs gap-1">
                <Wand2 className="w-3 h-3" />
                AI创建
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 内容区 - 简洁的背景 */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <Tabs value={sidebarTab} className="h-full">
            <TabsContent value="configure" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {/* 添加一个温暖的卡片容器 */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">智能体配置</h3>
                        <p className="text-sm text-muted-foreground">详细设置智能体的各项属性和行为特征</p>
                      </div>
                    </div>
                    <AgentEmbeddedForm
                      onSubmit={handleAgentUpdate}
                      initialData={agent}
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="ai-create" className="h-full m-0">
              <AiChatCreator 
                onAgentCreate={handleAgentUpdate}
                className="h-full"
                editingAgent={agent}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧聊天区 - 使用新的组件 */}
      <AgentChatContainer
        agent={agent}
        messages={chatMessages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
      />
    </div>
  );
} 