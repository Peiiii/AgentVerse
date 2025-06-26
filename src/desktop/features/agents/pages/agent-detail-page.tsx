import { AgentEmbeddedForm } from "@/common/components/agent/agent-embedded-form";
import { AiChatCreator } from "@/common/components/agent/ai-chat-creator";
import { ModernChatInput } from "@/common/components/chat/modern-chat-input";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useAgents } from "@/core/hooks/useAgents";
import { ArrowLeft, Bot, MessageSquare, Settings, Sparkles, Wand2 } from "lucide-react";
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
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
          label: "主持人"
        };
      case "participant":
        return {
          icon: MessageSquare,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
          label: "参与者"
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          label: "智能体"
        };
    }
  };

  const roleConfig = getRoleConfig(agent.role);

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧设置区 */}
      <div className={cn(
        "flex-shrink-0 border-r bg-background/30 backdrop-blur-xl flex flex-col transition-all duration-300",
        sidebarTab === "ai-create" ? "w-[45%]" : "w-96"
      )}>
        {/* 头部 */}
        <div className="p-6 border-b bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/agents")}
              className="flex-shrink-0 hover:bg-primary/10 hover:text-primary"
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
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg",
                  roleConfig.bgColor, roleConfig.borderColor, "border-2"
                )}>
                  <roleConfig.icon className={cn("w-2.5 h-2.5", roleConfig.color)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {agent.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 mt-1",
                    roleConfig.borderColor,
                    roleConfig.bgColor
                  )}
                >
                  {roleConfig.label}
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

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={sidebarTab} className="h-full">
            <TabsContent value="configure" className="h-full m-0">
              <ScrollArea className="h-full">
                                 <div className="p-4">
                   <AgentEmbeddedForm
                     onSubmit={handleAgentUpdate}
                     initialData={agent}
                   />
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

      {/* 右侧聊天区 */}
      <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-blue-50/20 via-background to-purple-50/10">
        {/* 聊天头部 */}
        <div className="p-6 border-b bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 shadow-lg">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                  {agent.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              {/* 在线状态指示器 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                与 {agent.name} 对话
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                测试智能体的对话能力和性格特征
              </p>
            </div>
          </div>
        </div>

        {/* 聊天消息区 */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
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
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20 shadow-lg">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                        {agent.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl p-4 shadow-sm backdrop-blur-sm border",
                      message.isUser
                        ? "bg-primary text-primary-foreground border-primary/20"
                        : "bg-background/90 border-border/30 hover:bg-background/95 transition-colors"
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </div>
                    <div className={cn(
                      "text-xs mt-2 opacity-60",
                      message.isUser ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.isUser && (
                    <Avatar className="w-10 h-10 ring-2 ring-muted shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80">
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
                <Avatar className="w-10 h-10 ring-2 ring-primary/20 shadow-lg">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                    {agent.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-background/90 border border-border/30 rounded-2xl p-4 backdrop-blur-sm">
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
        <div className="p-6 border-t bg-background/80 backdrop-blur-xl">
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