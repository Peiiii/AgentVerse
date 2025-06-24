import { ThemeToggle } from "@/components/common/theme";
import { cn } from "@/lib/utils";
import { ActivityBar } from "composite-kit";
import { Github, MessageSquare, Settings, Users } from "lucide-react";
import { useActivityBarService } from "@/services/activity-bar.service";
import { ActivityItem } from "@/stores/activity-bar.store";

interface ActivityBarProps {
  className?: string;
}

export function ActivityBarComponent({ className }: ActivityBarProps) {
  const {
    expanded,
    setExpanded,
    activeId,
    handleItemClick,
    items,
  } = useActivityBarService();

  // 从items中按组筛选，避免重复订阅
  const mainGroupItems = items.filter(item => item.group === '主要功能');
  const footerItems = items.filter(item => item.group === 'footer');

  // 图标映射
  const iconMap = {
    chat: <MessageSquare className="w-4 h-4" />,
    agents: <Users className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
  };

  const handleExpandedChange = (newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  const handleActiveChange = (activeId: string) => {
    handleItemClick(activeId);
  };

  return (
    <ActivityBar.Root
      expanded={expanded}
      defaultActiveId={activeId}
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
          {mainGroupItems.map((item: ActivityItem) => (
            <ActivityBar.Item
              key={item.id}
              id={item.id}
              icon={item.icon || iconMap[item.id as keyof typeof iconMap]}
              label={item.label}
              title={item.title}
            />
          ))}
        </ActivityBar.Group>
      </ActivityBar.GroupList>

      <ActivityBar.Footer>
        <ActivityBar.Separator />
        <ActivityBar.Group>
          {footerItems.map((item: ActivityItem) => (
            <ActivityBar.Item
              key={item.id}
              id={item.id}
              icon={item.icon || iconMap[item.id as keyof typeof iconMap]}
              label={item.label}
              title={item.title}
            />
          ))}
        </ActivityBar.Group>
        <ActivityBar.Separator />
        <div className="px-3 py-2">
          <ThemeToggle className="w-full" />
        </div>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  );
} 