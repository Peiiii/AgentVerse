import { Button } from "@/common/components/ui/button";
import { UI_PERSIST_KEYS, createUIPersistOptions } from "@/core/config/ui-persist";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { usePersistedState } from "@/core/hooks/usePersistedState";
import { cn } from "@/common/lib/utils";
import { agentListResource } from "@/core/resources";
import { ITypingIndicator } from "@/core/services/typing-indicator.service";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { TypingIndicator } from "../../chat/typing-indicator";
import { MemberToggleButton } from "../member/member-toggle-button";
import { DiscussionSettingsButton } from "../settings/discussion-settings-button";
import { DiscussionSettingsPanel } from "../settings/discussion-settings-panel";
import { ClearMessagesButton } from "./clear-messages-button";
import { useDiscussionControl } from "./use-discussion-control";

// 控制按钮组件
function ControlButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "destructive" : "default"}
      size="icon"
      className={cn(
        "shrink-0 transition-all duration-300",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_3px_rgba(0,0,0,0.1)]",
        "bg-gradient-to-r",
        isActive 
          ? "from-red-500/90 to-red-600/90 hover:from-red-600/90 hover:to-red-700/90 text-white"
          : "from-green-500/90 to-green-600/90 hover:from-green-600/90 hover:to-green-700/90 text-white",
        "rounded-md"
      )}
      title={isActive ? "暂停讨论" : "开始讨论"}
    >
      {isActive ? (
        <PauseCircle className="w-5 h-5" />
      ) : (
        <PlayCircle className="w-5 h-5" />
      )}
    </Button>
  );
}

// 状态指示器组件
function StatusIndicator({ 
  isActive, 
  messageCount, 
  indicators,
  getAgentInfo 
}: { 
  isActive: boolean;
  messageCount: number;
  indicators: Map<string, ITypingIndicator>;
  getAgentInfo: { getName: (id: string) => string; getAvatar: (id: string) => string };
}) {
  return (
    <div className="hidden md:flex items-center gap-3">
      <div className={cn(
        "px-2.5 py-1 rounded-md text-sm transition-colors duration-200",
        "border border-border/30",
        isActive 
          ? "bg-green-500/5 text-green-600 dark:text-green-400"
          : "bg-muted/10 text-muted-foreground"
      )}>
        <span className="relative">
          {isActive ? "讨论进行中" : "讨论已暂停"}
          {isActive && (
            <span className="absolute -right-1 -top-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </span>
      </div>
      {isActive && messageCount > 0 && (
        <span className="text-sm text-muted-foreground/60">
          本轮消息: {messageCount}
        </span>
      )}
      <div className="ml-1">
        <TypingIndicator
          indicators={indicators}
          getMemberName={getAgentInfo.getName}
          getMemberAvatar={getAgentInfo.getAvatar}
        />
      </div>
    </div>
  );
}

// 操作按钮组组件
function ActionButtons({ 
  enableSettings,
  showSettings,
  onToggleSettings,
  onToggleMembers,
  memberCount 
}: { 
  enableSettings: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
  onToggleMembers?: () => void;
  memberCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <ClearMessagesButton
        size="icon"
        className={cn(
          "shrink-0 transition-all duration-200",
          "hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10",
          "rounded-md"
        )}
        variant="ghost"
      />

      {enableSettings && (
        <DiscussionSettingsButton
          isOpen={showSettings}
          onClick={onToggleSettings}
          className={cn(
            "transition-transform duration-300 rounded-md",
            showSettings && "rotate-180"
          )}
        />
      )}

      <MemberToggleButton
        onClick={onToggleMembers}
        memberCount={memberCount}
        className={cn(
          "bg-primary/5 hover:bg-primary/10 text-primary rounded-md",
          "border border-border/30"
        )}
      />
    </div>
  );
}

interface DiscussionControllerProps {
  status: "active" | "paused" | "completed";
  onToggleMembers?: () => void;
  enableSettings?: boolean;
}

export function DiscussionController({
  status,
  onToggleMembers,
  enableSettings = true,
}: DiscussionControllerProps) {
  const {
    settings,
    setSettings,
    indicators,
    messageCount,
    handleStatusChange,
  } = useDiscussionControl({ status });

  // 直接使用 usePersistedState，配合工具函数
  const [showSettings, setShowSettings] = usePersistedState(
    false,
    createUIPersistOptions(UI_PERSIST_KEYS.DISCUSSION.SETTINGS_PANEL_VISIBLE)
  );

  const { members } = useDiscussionMembers();
  const isActive = status === "active";

  const getAgentInfo = useMemo(() => {
    const agents = agentListResource.read().data;
    return {
      getName: (agentId: string) =>
        agents.find((agent) => agent.id === agentId)?.name || agentId,
      getAvatar: (agentId: string) =>
        agents.find((agent) => agent.id === agentId)?.avatar || "",
    };
  }, []);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings, setShowSettings]);

  return (
    <div className={cn(
      "border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70",
      "transition-[background-color,border-color] duration-200"
    )}>
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ControlButton 
              isActive={isActive} 
              onClick={() => handleStatusChange(!isActive)} 
            />
            <StatusIndicator 
              isActive={isActive}
              messageCount={messageCount}
              indicators={indicators}
              getAgentInfo={getAgentInfo}
            />
          </div>

          <div className="flex-1" />

          <ActionButtons 
            enableSettings={enableSettings}
            showSettings={showSettings}
            onToggleSettings={handleToggleSettings}
            onToggleMembers={onToggleMembers}
            memberCount={members.length}
          />
        </div>

        {enableSettings && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              showSettings 
                ? "mt-3 max-h-[500px] opacity-100 border-t pt-3" 
                : "max-h-0 opacity-0"
            )}
          >
            <DiscussionSettingsPanel 
              settings={settings} 
              onSettingsChange={setSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
