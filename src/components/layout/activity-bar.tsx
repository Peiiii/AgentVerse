import { useAddAgentDialog } from "@/components/agent/add-agent-dialog/use-add-agent-dialog";
import { ThemeToggle } from "@/components/common/theme";
import { useSettingsDialog } from "@/components/settings/settings-dialog";
import { UI_PERSIST_KEYS } from "@/config/ui-persist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { cn } from "@/lib/utils";
import { ActivityBar } from "composite-kit";
import { Github, MessageSquare, Settings, Users } from "lucide-react";

interface ActivityBarProps {
  className?: string;
}

export function ActivityBarComponent({ className }: ActivityBarProps) {
  const { openAddAgentDialog } = useAddAgentDialog();
  const { openSettingsDialog } = useSettingsDialog();
  const [expanded, setExpanded] = usePersistedState(false, {
    key: UI_PERSIST_KEYS.ACTIVITY_BAR_EXPANDED,
    version: 1,
  });

  const handleGithubClick = () => {
    window.open("https://github.com/Peiiii/AgentVerse", "_blank");
  };

  const handleExpandedChange = (newExpanded: boolean) => {
    setExpanded(newExpanded);
  };


  const handleActiveChange = (activeId: string) => {
    console.log("[handleActiveChange] activeId", activeId);
    // 根据活动项执行相应操作
    switch (activeId) {
      case "agents":
        openAddAgentDialog();
        break;
      case "settings":
        openSettingsDialog();
        break;
      case "github":
        handleGithubClick();
        break;
      default:
        break;
    }
  };

  return (
    <ActivityBar.Root
      expanded={expanded}
      defaultActiveId="chat"
      onExpandedChange={handleExpandedChange}
      onActiveChange={handleActiveChange}
      className={cn("flex-shrink-0", className)}
    >
      <ActivityBar.Header
        icon={<MessageSquare className="w-5 h-5" />}
        title="AgentVerse"
        showSearch={false}
      />

      <ActivityBar.GroupList>
        <ActivityBar.Group title="主要功能">
          <ActivityBar.Item
            id="chat"
            icon={<MessageSquare className="w-4 h-4" />}
            label="聊天"
          />
          <ActivityBar.Item
            id="agents"
            icon={<Users className="w-4 h-4" />}
            label="智能体"
          />
        </ActivityBar.Group>
      </ActivityBar.GroupList>

      <ActivityBar.Footer>
        <ActivityBar.Separator />
        <ActivityBar.Group>
          <ActivityBar.Item
            id="settings"
            icon={<Settings className="w-4 h-4" />}
            label="设置"
          />
          <ActivityBar.Item
            id="github"
            icon={<Github className="w-4 h-4" />}
            label="GitHub"
            title="访问 GitHub 仓库"
          />
        </ActivityBar.Group>
        <ActivityBar.Separator />
        <div className="px-3 py-2">
          <ThemeToggle className="w-full" />
        </div>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  );
} 