import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { useWorldClassChatSettingsStore } from "../../stores/world-class-chat-settings.store";
import type { SettingItemComponent } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PromptSetting(_props: SettingItemComponent) {
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

  return (
    <div className="w-full space-y-3">
      {/* 标题和说明 */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-900">自定义 Prompt</h4>
        <p className="text-xs text-gray-600">
          让 AI 以你想要的方式思考和表达，支持多行、可随时修改
        </p>
      </div>

      {/* 输入区域 */}
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
            "w-full pr-12 text-sm bg-background/80 backdrop-blur resize-none rounded-lg border shadow-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 scrollbar-thin overflow-hidden",
            isFocused && "ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/60",
            isHovered && !isFocused && "ring-1 ring-indigo-200 border-indigo-200 bg-indigo-50/30"
          )}
          style={{ minHeight: 48, paddingLeft: 16, paddingRight: 44, paddingTop: 12, paddingBottom: 12 }}
        />
        <div
          className={cn(
            "absolute flex items-center justify-center cursor-pointer z-10 transition-colors duration-200",
            "hover:scale-105 active:scale-95"
          )}
          style={{
            position: 'absolute',
            height: '24px',
            width: '24px',
            right: 12,
            bottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="让你的 AI 更懂你"
          onClick={() => textareaRef.current?.focus()}
        >
          <Sparkles
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isFocused ? "text-indigo-500" : (isHovered ? "text-indigo-400/80" : "text-indigo-200/80")
            )}
          />
        </div>
      </div>
      
      {/* 保存按钮 */}
      <div className="flex justify-end pt-1">
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={!localPrompt.trim()}
        >
          保存设置
        </button>
      </div>
    </div>
  );
} 