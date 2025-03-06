import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCopy } from "@/hooks/use-copy";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MessageWithResults } from "@/types/discussion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { MessageMarkdownContent } from "../agent-action-display";

interface MessageItemWechatProps {
  message: MessageWithResults;
  agentInfo: {
    getName: (agentId: string) => string;
    getAvatar: (agentId: string) => string;
  };
  previousMessageTimestamp?: number;
}

// 时间间隔阈值，超过这个值才显示时间（15分钟）
const TIME_DISPLAY_THRESHOLD = 15 * 60 * 1000;

export function MessageItemWechat({ 
  message, 
  agentInfo,
  previousMessageTimestamp 
}: MessageItemWechatProps) {
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
  const { getName, getAvatar } = agentInfo;
  const agentName = getName(message.agentId);
  
  // 计算是否需要显示时间
  const currentTimestamp = new Date(message.timestamp).getTime();
  const shouldShowTime = !previousMessageTimestamp || 
    (currentTimestamp - previousMessageTimestamp > TIME_DISPLAY_THRESHOLD);

  // 检查消息是否为空
  const isEmpty = !message.content || message.content.trim() === '';

  return (
    <div className="py-1.5 group">
      {/* 时间显示 - 仅在时间间隔较大时显示 */}
      {shouldShowTime && (
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1.5">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      
      <div className={cn(
        "flex items-start",
        isUserMessage ? "flex-row-reverse gap-1" : "gap-2"
      )}>
        {/* 头像 */}
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={getAvatar(message.agentId)} />
          <AvatarFallback className={cn(
            "text-white text-xs",
            isUserMessage ? "bg-green-500" : "bg-blue-500"
          )}>
            {agentName[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "flex flex-col max-w-[calc(100%-48px)]", // 限制容器最大宽度
          isUserMessage ? "items-end" : "items-start"
        )}>
          {/* 发言人名称 - 非用户消息才显示 */}
          {!isUserMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">{agentName}</div>
          )}
          
          {/* 消息气泡 */}
          <div className={cn(
            "relative py-2 px-3 text-sm break-words",
            "inline-block",
            isEmpty ? "h-[36px] flex items-center" : "",
            isUserMessage 
              ? "bg-[#95ec69] dark:bg-[#7eca5b] text-gray-800 dark:text-gray-900 rounded-tl-md rounded-br-md rounded-bl-md" 
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tr-md rounded-br-md rounded-bl-md",
            // 三角形定位类
            isUserMessage ? "mr-[1px]" : "ml-[1px]"
          )}>
            {/* 左侧三角形 - 非用户消息 */}
            {!isUserMessage && (
              <div className="absolute -left-1.5 top-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white dark:border-r-gray-700 border-b-[6px] border-b-transparent"></div>
            )}
            
            {/* 消息内容 */}
            <div className={cn("min-w-[40px]", isEmpty ? "h-[20px]" : "")}>
              {isEmpty ? (
                <span className="opacity-0">&nbsp;</span>
              ) : (
                <MessageMarkdownContent
                  content={message.content}
                  actionResults={message.actionResults}
                />
              )}
            </div>
            
            {/* 右侧三角形 - 用户消息 */}
            {isUserMessage && (
              <div className="absolute -right-1.5 top-2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-[#95ec69] dark:border-l-[#7eca5b] border-b-[6px] border-b-transparent"></div>
            )}
            
            {/* 复制按钮 - 悬浮时显示 */}
            <button
              onClick={() => handleCopy(message.content)}
              className={cn(
                "absolute p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                isUserMessage 
                  ? "-left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" 
                  : "-right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              )}
              title={copied ? "已复制" : "复制"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 