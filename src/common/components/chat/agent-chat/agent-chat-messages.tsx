import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { useChatAutoScroll } from "@/common/hooks/use-chat-auto-scroll";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import type { UIMessage } from "@ai-sdk/ui-utils";
import { ChevronDown, MessageSquare, Bot, User } from "lucide-react";
import { forwardRef, useImperativeHandle, ReactNode } from "react";

// 消息样式主题配置
export interface MessageStyleConfig {
  userBubble: {
    background: string;
    textColor: string;
    border: string;
  };
  assistantBubble: {
    background: string;
    textColor: string;
    border: string;
    hover?: string;
  };
}

// Avatar样式配置
export interface AvatarStyleConfig {
  size: "sm" | "md" | "lg";
  assistantStyle: {
    ring: string;
    fallbackBackground: string;
    showIcon?: boolean;
  };
  userStyle: {
    ring: string;
    fallbackBackground: string;
    showIcon?: boolean;
    displayText?: string;
  };
}

// 空状态配置
export interface EmptyStateConfig {
  title: string;
  description: string;
  icon?: ReactNode;
  showDefault?: boolean;
  // 新增：自定义欢迎头部组件
  customWelcomeHeader?: ReactNode;
}

// 预设主题
export const MESSAGE_THEMES = {
  default: {
    userBubble: {
      background: "bg-blue-500 dark:bg-blue-600",
      textColor: "text-white",
      border: "border-blue-500/20",
    },
    assistantBubble: {
      background: "bg-card",
      textColor: "text-foreground",
      border: "border-border",
      hover: "hover:bg-muted/30",
    },
  },
  creator: {
    userBubble: {
      background: "bg-orange-500 dark:bg-orange-600",
      textColor: "text-white",
      border: "border-orange-500/20",
    },
    assistantBubble: {
      background: "bg-card",
      textColor: "text-foreground",
      border: "border-border",
      hover: "hover:bg-muted/30",
    },
  },
} as const;

export const AVATAR_THEMES = {
  default: {
    size: "md" as const,
    assistantStyle: {
      ring: "ring-2 ring-gradient-to-r from-purple-400 to-pink-400",
      fallbackBackground: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
      showIcon: false,
    },
    userStyle: {
      ring: "",
      fallbackBackground: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 border-2 border-blue-300/50",
      showIcon: false,
      displayText: "你",
    },
  },
  creator: {
    size: "sm" as const,
    assistantStyle: {
      ring: "border-2 border-gradient-to-r from-emerald-400 to-blue-400",
      fallbackBackground: "bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500",
      showIcon: true,
    },
    userStyle: {
      ring: "border-2 border-gradient-to-r from-orange-400 to-pink-400",
      fallbackBackground: "bg-gradient-to-br from-orange-500 via-pink-500 to-red-500",
      showIcon: true,
      displayText: "",
    },
  },
} as const;

interface AgentChatMessagesProps {
  agent: AgentDef;
  uiMessages: UIMessage[];
  isResponding: boolean;
  isSticky?: boolean;
  // 新增：样式主题配置
  messageTheme?: keyof typeof MESSAGE_THEMES | MessageStyleConfig;
  avatarTheme?: keyof typeof AVATAR_THEMES | AvatarStyleConfig;
  // 新增：空状态配置
  emptyState?: EmptyStateConfig;
  // 新增：自定义样式类名
  className?: string;
}

export interface AgentChatMessagesRef {
  scrollToBottom: () => void;
}

export const AgentChatMessages = forwardRef<AgentChatMessagesRef, AgentChatMessagesProps>(
  ({ 
    agent, 
    uiMessages, 
    isResponding, 
    messageTheme = "default",
    avatarTheme = "default",
    emptyState,
    className,
  }, ref) => {
    const { containerRef, isSticky, scrollToBottom } = useChatAutoScroll({
      deps: [uiMessages],
    });

    useImperativeHandle(ref, () => ({
      scrollToBottom,
    }));

    // 解析样式配置
    const messageStyle = typeof messageTheme === "string" ? MESSAGE_THEMES[messageTheme] : messageTheme;
    const avatarStyle = typeof avatarTheme === "string" ? AVATAR_THEMES[avatarTheme] : avatarTheme;

    // Avatar尺寸映射
    const avatarSizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    // 渲染Avatar
    const renderAvatar = (role: "user" | "assistant") => {
      const isUser = role === "user";
      const style = isUser ? avatarStyle.userStyle : avatarStyle.assistantStyle;
      const sizeClass = avatarSizeClasses[avatarStyle.size];

      return (
        <Avatar className={cn(sizeClass, style.ring, "shadow-lg")}>
          {!isUser && agent.avatar && (
            <AvatarImage src={agent.avatar} alt={agent.name} />
          )}
          <AvatarFallback className={cn(style.fallbackBackground, "text-white font-bold")}>
            {style.showIcon ? (
              isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />
            ) : (
              isUser ? (avatarStyle.userStyle.displayText || "") : (agent.name?.[0] || "?")
            )}
          </AvatarFallback>
        </Avatar>
      );
    };

    // 默认空状态配置
    const defaultEmptyState = emptyState || {
      title: "开始与智能体对话",
      description: "在下方输入消息，测试智能体的回答能力和性格特征。你可以询问任何问题来了解它的专业知识。",
      showDefault: true,
    };

    return (
      <div className={cn("flex-1 h-full flex flex-col overflow-hidden", className)}>
        <div className="flex h-full flex-col">
          <div ref={containerRef} className={cn(
            "p-6 bg-muted/20 flex-1 overflow-y-auto space-y-6",
            isSticky && "sticky-bottom"
          )}>
            {uiMessages.length === 0 ? (
              <div className="text-center py-16">
                {/* 优先使用自定义欢迎头部 */}
                {defaultEmptyState.customWelcomeHeader ? (
                  defaultEmptyState.customWelcomeHeader
                ) : (
                  <>
                    {defaultEmptyState.showDefault && (
                      <div className="relative w-36 h-36 mx-auto mb-8">
                        {/* 默认的聊天气泡背景效果 */}
                        <div className="absolute top-0 left-4 w-16 h-12 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-2xl rounded-bl-sm opacity-60 animate-pulse" style={{ animationDelay: "0s", animationDuration: "2s" }}></div>
                        <div className="absolute top-6 right-2 w-12 h-10 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-2xl rounded-br-sm opacity-50 animate-pulse" style={{ animationDelay: "0.7s", animationDuration: "2.5s" }}></div>
                        <div className="absolute bottom-4 left-0 w-14 h-11 bg-gradient-to-br from-pink-300 to-rose-400 rounded-2xl rounded-bl-sm opacity-40 animate-pulse" style={{ animationDelay: "1.4s", animationDuration: "2.2s" }}></div>

                        {/* 中心对话头像 */}
                        <div className="absolute inset-6 bg-gradient-to-br from-emerald-500 via-teal-500 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                          <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            {defaultEmptyState.icon || <MessageSquare className="w-8 h-8 text-white drop-shadow-lg animate-pulse" />}
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
                    )}
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                      {defaultEmptyState.title}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {defaultEmptyState.description}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                {uiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== "user" && renderAvatar("assistant")}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl p-4 shadow-sm border",
                        message.role === "user"
                          ? `${messageStyle.userBubble.background} ${messageStyle.userBubble.textColor} ${messageStyle.userBubble.border}`
                          : `${messageStyle.assistantBubble.background} ${messageStyle.assistantBubble.textColor} ${messageStyle.assistantBubble.border} ${messageStyle.assistantBubble.hover || ""} transition-colors`
                      )}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                    {message.role === "user" && renderAvatar("user")}
                  </div>
                ))}

                {/* 响应中状态 */}
                {isResponding && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">正在回复...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 滚动到底部按钮 */}
        <div className="relative">
          {!isSticky && (
            <div className="absolute bottom-4 right-4 z-10">
              <Button
                onClick={scrollToBottom}
                size="sm"
                className="w-10 h-10 p-0 rounded-full shadow-lg bg-background/80 text-foreground backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AgentChatMessages.displayName = "AgentChatMessages"; 