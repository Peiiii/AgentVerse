import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  Square,
  ArrowUp,
  Sparkles,
  Zap
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
      const maxHeight = 200; // 最大高度
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
      {/* 主输入区域 */}
      <div className={cn(
        "relative bg-background/80 backdrop-blur-xl border-2 rounded-2xl transition-all duration-300 ease-out",
        "shadow-lg hover:shadow-xl",
        isFocused 
          ? "border-primary/50 shadow-primary/10 bg-background/90" 
          : "border-border/50 hover:border-border/80",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        {/* 渐变背景装饰 */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
          "bg-gradient-to-r from-primary/5 via-transparent to-primary/5",
          isFocused && "opacity-100"
        )} />

        {/* 输入容器 */}
        <div className="relative flex items-end gap-2 p-3">
          {/* 左侧工具按钮 */}
          <div className="flex items-center gap-1 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary hover:scale-110",
                "active:scale-95"
              )}
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary hover:scale-110",
                "active:scale-95"
              )}
              disabled={disabled}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          {/* 文本输入区域 */}
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
                "py-2 px-0 min-h-[40px] max-h-[200px] overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              )}
              
            />
            
            {/* 字符计数 */}
            {(isFocused || isNearLimit) && (
              <div className={cn(
                "absolute bottom-1 right-2 text-xs transition-all duration-200",
                isNearLimit ? "text-orange-500" : "text-muted-foreground/50",
                charCount > maxLength && "text-red-500"
              )}>
                {charCount}/{maxLength}
              </div>
            )}
          </div>

          {/* 右侧发送按钮 */}
          <div className="flex items-center gap-1 pb-2">
            {/* 语音按钮 */}
            {!value.trim() && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-8 h-8 p-0 rounded-full transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary hover:scale-110",
                  "active:scale-95"
                )}
                disabled={disabled}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}

            {/* 发送按钮 */}
            <Button
              onClick={onSend}
              disabled={!canSend}
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all duration-300 relative overflow-hidden",
                canSend
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
                "group"
              )}
            >
              {/* 发送按钮背景动画 */}
              {canSend && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
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

              {/* 发送成功的波纹效果 */}
              {canSend && (
                <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-active:scale-150 opacity-0 group-active:opacity-100 transition-all duration-200" />
              )}
            </Button>
          </div>
        </div>

        {/* 底部提示 */}
        {isFocused && (
          <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>Enter 发送，Shift + Enter 换行</span>
            </div>
            {canSend && (
              <div className="flex items-center gap-1 text-primary/60">
                <Sparkles className="w-3 h-3" />
                <span>准备发送</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 输入状态指示器 */}
      {disabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Square className="w-4 h-4" />
            <span className="text-sm">AI正在思考中...</span>
          </div>
        </div>
      )}
    </div>
  );
} 