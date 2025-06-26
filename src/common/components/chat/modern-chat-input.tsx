import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { 
  Send, 
  Mic, 
  Smile, 
  ArrowUp,
  Sparkles,
  Plus
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ModernChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function ModernChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "输入消息...",
  maxLength = 2000,
  className,
}: ModernChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // 减少最大高度，更紧凑
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !disabled;
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;

  return (
    <div className={cn("relative", className)}>
      {/* 顶部提示信息 - 始终可见但很轻量 */}
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground/60">
        <div className="flex items-center gap-4">
          <span>按 Enter 发送消息</span>
          <span>Shift + Enter 换行</span>
        </div>
        {(isFocused || isNearLimit) && (
          <div className={cn(
            "transition-colors duration-200",
            isNearLimit ? "text-orange-500" : "text-muted-foreground/50",
            charCount > maxLength && "text-red-500"
          )}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>

      {/* 主输入区域 - 固定布局，不会因为focus改变高度 */}
      <div className={cn(
        "relative bg-background/90 backdrop-blur-sm border rounded-xl transition-all duration-200 ease-out",
        "shadow-sm hover:shadow-md",
        isFocused 
          ? "border-primary/40 shadow-primary/5" 
          : "border-border/40 hover:border-border/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        {/* 装饰性渐变边框 */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200",
          "bg-gradient-to-r from-primary/10 via-transparent to-primary/10",
          isFocused && "opacity-100"
        )} />

        {/* 输入容器 - Discord/微信风格的紧凑布局 */}
        <div className="relative flex items-end gap-3 p-3">
          {/* 左侧工具按钮组 */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-lg transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary hover:scale-105",
                "active:scale-95"
              )}
              disabled={disabled}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 文本输入区域 - 始终保持合理的最小高度 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              className={cn(
                "w-full resize-none border-0 bg-transparent outline-none",
                "text-sm leading-relaxed placeholder-muted-foreground/60",
                "py-2 px-3 min-h-[36px] max-h-[120px] overflow-y-auto rounded-lg",
                "scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent",
                "transition-colors duration-200",
                isFocused && "bg-muted/20"
              )}
            />
          </div>

          {/* 右侧操作按钮组 */}
          <div className="flex items-center gap-1">
            {/* 表情和语音按钮 */}
            {!value.trim() && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary hover:scale-105",
                    "active:scale-95"
                  )}
                  disabled={disabled}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary hover:scale-105",
                    "active:scale-95"
                  )}
                  disabled={disabled}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* 发送按钮 - 更精致的设计 */}
            <Button
              onClick={onSend}
              disabled={!canSend}
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-lg transition-all duration-300 relative overflow-hidden",
                canSend
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed",
                "group"
              )}
            >
              {/* 发送按钮背景动画 */}
              {canSend && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary rounded-lg transform scale-0 group-hover:scale-100 transition-transform duration-200" />
              )}
              
              {/* 图标 */}
              <div className="relative z-10">
                {canSend ? (
                  <ArrowUp className={cn(
                    "w-4 h-4 transition-all duration-200",
                    "group-hover:translate-y-[-1px] group-active:translate-y-0"
                  )} />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </div>

              {/* 发送成功的脉冲效果 */}
              {canSend && (
                <div className="absolute inset-0 rounded-lg bg-primary/30 scale-0 group-active:scale-150 opacity-0 group-active:opacity-100 transition-all duration-150" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 思考状态覆盖 - 更优雅的设计 */}
      {disabled && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground bg-background/80 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm">AI正在思考中...</span>
          </div>
        </div>
      )}

      {/* 底部状态指示器 */}
      {canSend && isFocused && (
        <div className="mt-2 flex items-center justify-end">
          <div className="flex items-center gap-2 text-xs text-primary/60 bg-primary/5 px-2 py-1 rounded-md">
            <Sparkles className="w-3 h-3" />
            <span>准备发送</span>
          </div>
        </div>
      )}
    </div>
  );
} 