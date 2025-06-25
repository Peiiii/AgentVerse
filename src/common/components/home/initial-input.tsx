import { cn } from "@/common/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";

interface InitialInputProps {
  onSubmit: (topic: string) => void;
  autoFocus?: boolean;
  className?: string;
}

export function InitialInput({
  onSubmit,
  autoFocus = true,
  className
}: InitialInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpointContext();

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      // 重置高度以获取正确的scrollHeight
      textareaRef.current.style.height = '56px';
      
      // 设置新高度
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(56, scrollHeight), 150);
      
      // 只有当高度真正需要改变时才更新
      if (newHeight !== 56 || input === '') {
        textareaRef.current.style.height = `${newHeight}px`;
      }
      
      // 检测是否为多行
      setIsMultiline(newHeight > 56);
    }
  }, [input]);

  // 确保图标位置正确
  useEffect(() => {
    if (textareaRef.current && iconRef.current) {
      if (isMultiline) {
        // 多行模式：固定在右下角
        iconRef.current.style.top = 'auto';
        iconRef.current.style.right = '12px'; // 调整右侧边距
        iconRef.current.style.bottom = '12px'; // 调整底部边距
      } else {
        // 单行模式：垂直居中
        const textareaHeight = textareaRef.current.offsetHeight;
        const iconHeight = iconRef.current.offsetHeight;
        const topPosition = (textareaHeight - iconHeight) / 2;
        iconRef.current.style.top = `${topPosition}px`;
        iconRef.current.style.right = '12px'; // 保持一致的右侧边距
        iconRef.current.style.bottom = 'auto';
      }
    }
  }, [isMultiline, isFocused, input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    console.log("提交输入:", input.trim());
    onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("检测到回车键");
      handleSubmit();
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (input.trim()) {
      console.log("点击图标提交");
      handleSubmit();
    } else {
      // 如果输入为空，聚焦到输入框
      textareaRef.current?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group",
        isFocused && "transform scale-[1.02] transition-transform duration-300",
        className
      )}
    >
      {/* 输入框装饰效果 */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 blur transition-all duration-300",
          isFocused && "opacity-100 -inset-1",
          isHovered && !isFocused && "opacity-50"
        )}
      />

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? "描述你想探讨的话题，点击✨开始..." : "描述你想探讨的话题，按回车开始..."}
            autoFocus={autoFocus}
            rows={1}
            className={cn(
              "w-full min-h-[56px] px-5 pr-12 py-4",
              "text-base bg-background/80 backdrop-blur resize-none",
              "rounded-xl border shadow-sm",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
              "transition-all duration-300",
              "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30",
              "overflow-hidden"
            )}
            style={{
              height: '56px'
            }}
          />
          <motion.div 
            ref={iconRef}
            className={cn(
              "absolute flex items-center justify-center",
              "cursor-pointer z-10",
              "hover:scale-110 active:scale-95",
              "transition-transform duration-150"
            )}
            animate={{
              scale: isFocused ? 1.2 : 1,
              rotate: isFocused ? [0, 15, -15, 0] : 0
            }}
            transition={{
              scale: { duration: 0.3 },
              rotate: { duration: 0.5, repeat: isFocused ? Infinity : 0, repeatDelay: 2 }
            }}
            style={{
              position: 'absolute',
              height: '28px', // 进一步增加高度使点击区域更大
              width: '28px', // 进一步增加宽度使点击区域更大
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'bottom 0.2s ease-out, top 0.2s ease-out, right 0.2s ease-out'
            }}
            onClick={handleIconClick}
          >
            <Sparkles
              className={cn(
                "w-5 h-5",
                "text-muted-foreground/40",
                isFocused ? "text-purple-500" : (isHovered ? "text-purple-500/60" : "text-muted-foreground/40")
              )}
            />
          </motion.div>
        </div>
      </form>

      {/* 提示文本 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: input.length > 0 ? 0 : 1,
          y: input.length > 0 ? 10 : 0
        }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "absolute -bottom-8 left-0 right-0 text-center text-sm",
          "text-muted-foreground/70",
          "transition-all duration-200"
        )}
      >
        {isMobile ? "输入话题，点击✨开始" : "按回车开始，让 AI 专家团队为你解答"}
      </motion.div>
      
      {/* 输入提示 */}
      {input.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 right-2 text-xs text-purple-500/70 font-medium"
        >
          {isMobile ? "点击✨提交" : "按回车键提交 ↵"}
        </motion.div>
      )}
    </motion.div>
  );
} 