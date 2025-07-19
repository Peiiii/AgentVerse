import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { useWorldClassChatSettingsStore } from "../../stores/world-class-chat-settings.store";
import type { SettingItemComponent } from "./types";

export function PromptSetting({}: SettingItemComponent) {
  const prompt = useWorldClassChatSettingsStore(s => s.prompt);
  const setPrompt = useWorldClassChatSettingsStore(s => s.setPrompt);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 确保初始化时状态同步
  useEffect(() => {
    if (!isInitialized) {
      setLocalPrompt(prompt);
      setIsInitialized(true);
    }
  }, [prompt, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setPrompt(localPrompt, { persist: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPrompt, isInitialized]);

  const handleSave = () => {
    setPrompt(localPrompt, { persist: true });
  };

  const showHintText = isInitialized && localPrompt.length === 0;

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg relative overflow-hidden">
      <div className="relative p-6">
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
              "w-full pr-12 text-base bg-background/80 backdrop-blur resize-none rounded-xl border shadow-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 scrollbar-thin overflow-hidden",
              isFocused && "ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/60",
              isHovered && !isFocused && "ring-1 ring-indigo-200 border-indigo-200 bg-indigo-50/30"
            )}
            style={{ minHeight: 56, paddingLeft: 20, paddingRight: 48, paddingTop: 16, paddingBottom: 16 }}
          />
          <div
            className={cn(
              "absolute flex items-center justify-center cursor-pointer z-10 transition-colors duration-200",
              "hover:scale-105 active:scale-95"
            )}
            style={{
              position: 'absolute',
              height: '28px',
              width: '28px',
              right: 16,
              bottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="让你的 AI 更懂你"
            onClick={() => textareaRef.current?.focus()}
          >
            <Sparkles
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-indigo-500" : (isHovered ? "text-indigo-400/80" : "text-indigo-200/80")
              )}
            />
          </div>
        </div>
        
        {/* 提示文案 - 只在初始化后且无内容时显示 */}
        {showHintText && (
          <div className="text-center text-sm text-muted-foreground/70 mt-2">
            让 AI 以你想要的方式思考和表达，支持多行、可随时修改
          </div>
        )}
        
        {/* 保存提示 - 只在有内容时显示 */}
        {localPrompt.length > 0 && (
          <div className="absolute right-2 -bottom-7 text-xs text-indigo-500/70 font-medium">
            按下保存按钮提交
          </div>
        )}
        
        {/* 保存按钮 - 移到输入框附近 */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!localPrompt.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
} 