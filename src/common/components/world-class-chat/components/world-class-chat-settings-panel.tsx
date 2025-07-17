import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { useWorldClassChatSettingsStore } from "../stores/world-class-chat-settings.store";

export function WorldClassChatSettingsPanel({ onClose }: { onClose: () => void }) {
  const prompt = useWorldClassChatSettingsStore(s => s.prompt);
  const setPrompt = useWorldClassChatSettingsStore(s => s.setPrompt);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPrompt(localPrompt, { persist: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPrompt]);

  const handleSave = () => {
    setPrompt(localPrompt, { persist: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full h-full flex flex-col bg-white shadow-lg p-6 relative overflow-visible"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">设置</h2>
        <button className="text-gray-400 hover:text-gray-700" onClick={onClose} title="关闭">✕</button>
      </div>
      <div className="mb-6 relative">
        <label className="block text-sm font-medium mb-2">自定义 Prompt</label>
        <div className="relative">
          <AutoResizeTextarea
            ref={textareaRef}
            value={localPrompt}
            onChange={e => setLocalPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            placeholder="请输入自定义 Prompt..."
            minRows={3}
            maxRows={8}
            className={cn(
              "w-full pr-12 text-base bg-background/80 backdrop-blur resize-none rounded-xl border shadow-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 scrollbar-thin overflow-hidden",
              isFocused && "ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/60",
              isHovered && !isFocused && "ring-1 ring-indigo-200 border-indigo-200 bg-indigo-50/30"
            )}
            style={{ minHeight: 56, paddingLeft: 20, paddingRight: 48, paddingTop: 16, paddingBottom: 16 }}
          />
          <motion.div
            ref={iconRef}
            className={cn(
              "absolute flex items-center justify-center cursor-pointer z-10 hover:scale-110 active:scale-95 transition-transform duration-150",
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
              height: '28px',
              width: '28px',
              right: 16,
              bottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'bottom 0.2s ease-out, top 0.2s ease-out, right 0.2s ease-out'
            }}
            title="让你的 AI 更懂你"
            onClick={() => textareaRef.current?.focus()}
          >
            <Sparkles
              className={cn(
                "w-5 h-5",
                isFocused ? "text-indigo-500" : (isHovered ? "text-indigo-400/80" : "text-indigo-200/80")
              )}
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: localPrompt.length > 0 ? 0 : 1, y: localPrompt.length > 0 ? 10 : 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(
            "absolute left-0 right-0 text-center text-sm text-muted-foreground/70 transition-all duration-200 mt-2"
          )}
        >
          让 AI 以你想要的方式思考和表达，支持多行、可随时修改
        </motion.div>
        {localPrompt.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-2 -bottom-7 text-xs text-indigo-500/70 font-medium"
          >
            按下保存按钮提交
          </motion.div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-auto">
        <button
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors duration-200"
          onClick={handleSave}
          disabled={!localPrompt.trim()}
        >保存</button>
      </div>
    </motion.div>
  );
} 