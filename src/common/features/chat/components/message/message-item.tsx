// Avatar primitives are not used directly in this component
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { useCopy } from "@/core/hooks/use-copy";
import { useToast } from "@/core/hooks/use-toast";
import { cn } from "@/common/lib/utils";
import { MessageWithTools } from "@/common/types/discussion";
import { AgentDef } from "@/common/types/agent";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { MessageContentBlocks } from "./message-content-blocks";
import { AgentHoverCard } from "@/common/features/agents/components/cards/agent-hover-card";

interface MessageItemProps {
  message: MessageWithTools;
  agentInfo: {
    getName: (agentId: string) => string;
    getAvatar: (agentId: string) => string;
    getAgent?: (agentId: string) => AgentDef | undefined;
  };
  onViewAgentDetail?: (agentId: string) => void;
  onChatWithAgent?: (agent: AgentDef) => void;
}

// 头像组件 - 支持 HoverCard
function AvatarWithHoverCard({
  agentId,
  agentInfo,
  className,
  onViewDetail,
  onChat,
}: {
  agentId: string;
  agentInfo: MessageItemProps["agentInfo"];
  className?: string;
  onViewDetail?: (agentId: string) => void;
  onChat?: (agent: AgentDef) => void;
}) {
  const { getName, getAvatar, getAgent } = agentInfo;
  const agent = getAgent?.(agentId);

  const avatarElement = (
    <SmartAvatar
      src={getAvatar(agentId)}
      alt={getName(agentId)}
      className={cn("cursor-pointer", className)}
      fallback={<span>{getName(agentId)[0]}</span>}
    />
  );

  // 如果是用户消息或没有 agent 信息，不展示 hover card
  if (agentId === "user" || !agent) {
    return avatarElement;
  }

  return (
    <AgentHoverCard
      agent={agent}
      onViewDetail={onViewDetail}
      onChat={onChat}
      side="right"
      align="start"
    >
      {avatarElement}
    </AgentHoverCard>
  );
}

// 移动端头像和用户信息组件
function MessageHeader({
  message,
  agentInfo,
  onViewDetail,
  onChat,
}: {
  message: MessageWithTools;
  agentInfo: MessageItemProps["agentInfo"];
  onViewDetail?: (agentId: string) => void;
  onChat?: (agent: AgentDef) => void;
}) {
  const { getName } = agentInfo;

  return (
    <div className="sm:hidden flex items-center gap-2 mb-2">
      <AvatarWithHoverCard
        agentId={message.agentId}
        agentInfo={agentInfo}
        className="w-5 h-5 shrink-0"
        onViewDetail={onViewDetail}
        onChat={onChat}
      />
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {getName(message.agentId)}
      </div>
      <time className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(message.timestamp).toLocaleTimeString()}
      </time>
    </div>
  );
}

// 桌面端头像和用户信息组件
function DesktopMessageHeader({
  message,
  agentInfo,
  onViewDetail,
  onChat,
}: {
  message: MessageWithTools;
  agentInfo: MessageItemProps["agentInfo"];
  onViewDetail?: (agentId: string) => void;
  onChat?: (agent: AgentDef) => void;
}) {
  const { getName } = agentInfo;

  return (
    <div className="hidden sm:flex items-start gap-3">
      <AvatarWithHoverCard
        agentId={message.agentId}
        agentInfo={agentInfo}
        className="w-8 h-8 shrink-0 ring-2 ring-transparent group-hover:ring-purple-500/30 transition-all duration-200"
        onViewDetail={onViewDetail}
        onChat={onChat}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {getName(message.agentId)}
          </div>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </time>
        </div>
      </div>
    </div>
  );
}

export function MessageItem({
  message,
  agentInfo,
  onViewAgentDetail,
  onChatWithAgent,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { copy: handleCopy } = useCopy({
    onSuccess: () => {
      setCopied(true);
      toast({
        description: "已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "复制失败",
      });
    },
  });
  const isUserMessage = message.agentId === "user";

  return (
    <div className="group animate-fadeIn hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200">
      <div className="px-3 sm:px-4 py-2 max-w-full sm:max-w-3xl mx-auto">
        <MessageHeader
          message={message}
          agentInfo={agentInfo}
          onViewDetail={onViewAgentDetail}
          onChat={onChatWithAgent}
        />
        <DesktopMessageHeader
          message={message}
          agentInfo={agentInfo}
          onViewDetail={onViewAgentDetail}
          onChat={onChatWithAgent}
        />

        {/* 消息内容部分 */}
        <div className="relative">
          <div
            className={cn(
              "text-sm text-gray-700 dark:text-gray-200",
              "px-3 sm:px-4 py-1 sm:py-3",
              "sm:bg-white sm:dark:bg-gray-800",
              "sm:border sm:border-gray-200 sm:dark:border-gray-700",
              "sm:group-hover:border-gray-300 sm:dark:group-hover:border-gray-600",
              "sm:rounded-xl sm:break-words",
              "sm:shadow-sm sm:group-hover:shadow-md",
              "transition-all duration-200",
              "sm:ml-11",
              isUserMessage && "bg-blue-50/50 dark:bg-blue-900/10"
            )}
          >
            <div className={cn(isUserMessage && "pr-6")}>
              <MessageContentBlocks message={message} />
              {/* 复制按钮 */}
              {isUserMessage ? (
                <button
                  onClick={() => handleCopy(message.content)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                  title={copied ? "已复制" : "复制"}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-4 mt-1.5">
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {copied ? "已复制" : "复制"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
