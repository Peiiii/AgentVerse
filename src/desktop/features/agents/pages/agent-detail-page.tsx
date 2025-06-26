import { AgentEmbeddedForm } from "@/common/components/agent/agent-embedded-form";
import { AiChatCreator } from "@/common/components/agent/ai-chat-creator";
import { ModernChatInput } from "@/common/components/chat/modern-chat-input";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useAgents } from "@/core/hooks/useAgents";
import { ArrowLeft, Bot, MessageSquare, Settings, Sparkles, Wand2, Edit3, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Agent } from "@/common/types/agent";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";
import { ScrollArea } from "@/common/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agents, updateAgent } = useAgents();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"configure" | "ai-create">("configure");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsThinking(true);

    // 模拟AI响应
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `你好！我是${agent.name}。${agent.personality || "我很高兴与你交流。"}`,
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, agentMessage]);
      setIsThinking(false);
    }, 1500);
  };

  const handleAgentUpdate = (updatedAgentData: Omit<Agent, "id">) => {
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
          icon: MessageSquare,
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
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧聊天区 - 使用50%宽度 */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {/* 右侧头部 - 聊天导向 */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 shadow-lg">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                  {agent.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              {/* 在线状态指示器 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse shadow-sm"></div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">
                与 {agent.name} 对话
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                实时体验智能体能力
              </p>
            </div>
          </div>
        </div>

        {/* 聊天消息区 */}
        <ScrollArea className="flex-1 p-6 bg-muted/20">
          <div className="space-y-6 max-w-4xl mx-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative w-36 h-36 mx-auto mb-8">
                  {/* 聊天气泡背景效果 */}
                  <div className="absolute top-0 left-4 w-16 h-12 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-2xl rounded-bl-sm opacity-60 animate-pulse" style={{ animationDelay: "0s", animationDuration: "2s" }}></div>
                  <div className="absolute top-6 right-2 w-12 h-10 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-2xl rounded-br-sm opacity-50 animate-pulse" style={{ animationDelay: "0.7s", animationDuration: "2.5s" }}></div>
                  <div className="absolute bottom-4 left-0 w-14 h-11 bg-gradient-to-br from-pink-300 to-rose-400 rounded-2xl rounded-bl-sm opacity-40 animate-pulse" style={{ animationDelay: "1.4s", animationDuration: "2.2s" }}></div>
                  
                  {/* 中心对话头像 */}
                  <div className="absolute inset-6 bg-gradient-to-br from-emerald-500 via-teal-500 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                    <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-white drop-shadow-lg animate-pulse" />
                    </div>
                  </div>
                  
                  {/* 对话泡泡装饰 */}
                  <div className="absolute -top-3 right-8 w-8 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0s" }}>
                    <div className="absolute bottom-0 right-1 w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rotate-45 transform origin-top-left"></div>
                  </div>
                  <div className="absolute bottom-0 right-4 w-6 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0.8s" }}>
                    <div className="absolute bottom-0 left-1 w-1.5 h-1.5 bg-gradient-to-br from-cyan-400 to-blue-500 rotate-45 transform origin-top-right"></div>
                  </div>
                  <div className="absolute top-8 -left-2 w-5 h-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "1.6s" }}>
                    <div className="absolute bottom-0 right-0.5 w-1 h-1 bg-gradient-to-br from-purple-400 to-pink-500 rotate-45 transform origin-top-left"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  开始与智能体对话
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  在下方输入消息，测试智能体的回答能力和性格特征。你可以询问任何问题来了解它的专业知识。
                </p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!message.isUser && (
                    <Avatar className="w-10 h-10 ring-2 ring-gradient-to-r from-purple-400 to-pink-400 shadow-lg">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold">
                        {agent.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl p-4 shadow-sm border",
                      message.isUser
                        ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500/20"
                        : "bg-card border-border hover:bg-muted/30 transition-colors"
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>
                  {message.isUser && (
                    <Avatar className="w-10 h-10 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white font-bold border-2 border-blue-300/50">
                        你
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {/* 思考中指示器 */}
            {isThinking && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 ring-2 ring-gradient-to-r from-purple-400 to-pink-400 shadow-lg">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold">
                    {agent.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{agent.name} 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 输入区 */}
        <div className="p-6 border-t">
          <div className="max-w-4xl mx-auto">
            <ModernChatInput
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              disabled={isThinking}
              placeholder={`与 ${agent.name} 对话...`}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 