import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { 
  Bot, 
  Wand2, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  User
} from "lucide-react";
import { useState } from "react";
import { ModernChatInput } from "../chat/modern-chat-input";

interface AiChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentPreview?: Partial<AgentDef>;
  suggestions?: string[];
}

interface AiChatCreatorProps {
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void;
  className?: string;
}

export function AiChatCreator({ onAgentCreate, className }: AiChatCreatorProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      content: "✨ 你好！我是AI助手，让我帮你创建一个完美的智能体。\n\n请告诉我你想要什么样的智能体？比如：\n- 它的专业领域是什么？\n- 应该有什么样的性格？\n- 主要用途是什么？",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "我想要一个Python编程助手",
        "创建一个友善的心理咨询师",
        "我需要一个严谨的数据分析师",
        "制作一个有趣的创意写作助手"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Partial<AgentDef> | null>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AiChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    // 模拟AI处理和生成响应
    setTimeout(() => {
      const aiResponse = generateAiResponse(inputValue, messages);
      setMessages(prev => [...prev, aiResponse]);
      
      if (aiResponse.agentPreview) {
        setCreatedAgent(aiResponse.agentPreview);
      }
      
      setIsThinking(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleCreateAgent = () => {
    if (createdAgent) {
      const fullAgent: Omit<AgentDef, "id"> = {
        name: createdAgent.name || "新智能体",
        avatar: createdAgent.avatar || "",
        prompt: createdAgent.prompt || "",
        role: createdAgent.role || "participant",
        personality: createdAgent.personality || "",
        expertise: createdAgent.expertise || [],
        bias: createdAgent.bias || "",
        responseStyle: createdAgent.responseStyle || "",
      };
      onAgentCreate(fullAgent);
    }
  };

  const generateAiResponse = (_userInput: string, previousMessages: AiChatMessage[]): AiChatMessage => {
    // 简化的AI响应生成逻辑
    const messageCount = previousMessages.filter(m => m.isUser).length;
    
    if (messageCount === 1) {
      // 第一次用户输入，生成智能体预览
      const agentPreview: Partial<AgentDef> = {
        name: "Python编程助手",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=python-helper",
        personality: "专业、耐心、善于解释复杂概念",
        expertise: ["Python编程", "数据分析", "机器学习"],
        role: "participant",
        bias: "倾向于提供实践性的解决方案",
        responseStyle: "详细、步骤清晰、包含代码示例",
        prompt: "你是一个专业的Python编程助手，擅长数据分析和机器学习。你的回答应该详细、步骤清晰，并且包含具体的代码示例。你总是耐心地解释复杂的概念，帮助用户理解和学习。"
      };

      return {
        id: (Date.now() + 1).toString(),
        content: "太好了！基于你的描述，我为你创建了一个Python编程助手。这个智能体具有以下特点：\n\n📋 **专业领域**: Python编程、数据分析、机器学习\n🎭 **性格特征**: 专业、耐心、善于解释复杂概念\n💬 **回复风格**: 详细、步骤清晰、包含代码示例\n\n你觉得这个配置怎么样？还有什么需要调整的吗？",
        isUser: false,
        timestamp: new Date(),
        agentPreview,
        suggestions: [
          "看起来很棒，就这样创建",
          "让它更有趣一些",
          "增加一些其他编程语言",
          "调整一下性格特征"
        ]
      };
    } else {
      // 后续对话，根据用户反馈调整
      return {
        id: (Date.now() + 1).toString(),
        content: "好的！我已经根据你的反馈调整了智能体的配置。现在这个智能体应该更符合你的需求了。\n\n🎉 你满意这个配置吗？如果满意的话，点击下方的创建按钮就可以生成这个智能体了！",
        isUser: false,
        timestamp: new Date(),
        suggestions: [
          "完美！创建这个智能体",
          "再调整一下回复风格",
          "增加更多专业领域",
          "重新开始设计"
        ]
      };
    }
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* 聊天区域 */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* 可滚动的头部欢迎信息 */}
          <div className="text-center py-8">
            <div className="relative w-30 h-30 mx-auto mb-6">
              {/* 魔法圆阵效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full animate-spin opacity-25" style={{ animationDuration: "10s" }}></div>
              <div className="absolute inset-2 border-2 border-dashed border-purple-300/50 rounded-full animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }}></div>
              <div className="absolute inset-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full animate-ping opacity-15" style={{ animationDuration: "4s" }}></div>
              
              {/* 中心魔法棒容器 */}
              <div className="absolute inset-4 bg-gradient-to-br from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/40">
                <div className="w-12 h-12 bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                  <Wand2 className="w-6 h-6 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }} />
                </div>
              </div>
              
              {/* 魔法符文和星星装饰 */}
              <div className="absolute -top-2 left-1 w-5 h-5 bg-gradient-to-br from-yellow-300 to-amber-400 animate-bounce shadow-lg" style={{ animationDelay: "0s", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}></div>
              <div className="absolute -bottom-2 right-1 w-4 h-4 bg-gradient-to-br from-pink-300 to-rose-400 animate-bounce shadow-lg" style={{ animationDelay: "0.6s", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}></div>
              <div className="absolute top-2 -right-3 w-3 h-3 bg-gradient-to-br from-emerald-300 to-teal-400 animate-bounce shadow-lg" style={{ animationDelay: "1.2s", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}></div>
              <div className="absolute bottom-6 -left-3 w-2 h-2 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "1.8s" }}></div>
              <div className="absolute top-6 left-0 w-1.5 h-1.5 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "2.4s" }}></div>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI智能体创建助手
            </h3>
            <p className="text-sm text-muted-foreground">
              通过对话创建你的专属智能体
            </p>
          </div>
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* 消息气泡 */}
              <div className={cn(
                "flex gap-3",
                message.isUser ? "justify-end" : "justify-start"
              )}>
                {!message.isUser && (
                  <Avatar className="w-8 h-8 border-2 border-gradient-to-r from-emerald-400 to-blue-400">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 text-white text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-4 shadow-sm border",
                  message.isUser
                    ? "bg-orange-500 dark:bg-orange-600 text-white border-orange-500/20"
                    : "bg-card border-border hover:bg-muted/30 transition-colors"
                )}>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </div>
                </div>

                {message.isUser && (
                  <Avatar className="w-8 h-8 border-2 border-gradient-to-r from-orange-400 to-pink-400">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 text-white text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* 智能体预览卡片 */}
              {message.agentPreview && (
                <div className="ml-11 p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-gradient-to-r from-violet-400 to-fuchsia-400">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white font-bold">
                        {message.agentPreview.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{message.agentPreview.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {message.agentPreview.role === "moderator" ? "主持人" : "参与者"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {message.agentPreview.personality}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.agentPreview.expertise?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 创建按钮 */}
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <Button 
                      onClick={handleCreateAgent}
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle className="w-4 h-4" />
                      创建这个智能体
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 建议按钮 */}
              {message.suggestions && !message.isUser && (
                <div className="ml-11 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs gap-1 hover:bg-primary/10 hover:border-primary/30"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 思考状态 */}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 border-2 border-gradient-to-r from-emerald-400 to-blue-400">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 text-white text-xs">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">AI正在分析你的需求...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className="p-6 border-t">
        <div className="max-w-2xl mx-auto">
          <ModernChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isThinking}
            placeholder="描述你想要的智能体..."
          />
        </div>
      </div>
    </div>
  );
} 