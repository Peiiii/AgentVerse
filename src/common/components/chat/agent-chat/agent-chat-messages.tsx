import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import type { UIMessage } from "@ai-sdk/ui-utils";

interface AgentChatMessagesProps {
  agent: AgentDef;
  uiMessages: UIMessage[];
  isThinking: boolean;
}

export function AgentChatMessages({ agent, uiMessages, isThinking }: AgentChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 p-6 bg-muted/20">
      <div className="space-y-6 max-w-4xl mx-auto">
        {uiMessages.length === 0 ? (
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
          uiMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role !== "user" && (
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
                  message.role === "user"
                    ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500/20"
                    : "bg-card border-border hover:bg-muted/30 transition-colors"
                )}
              >
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>
              </div>
              {message.role === "user" && (
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
  );
} 