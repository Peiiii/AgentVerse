import { IconRegistry } from "@/common/components/common/icon-registry";
import { ThemeToggle } from "@/common/components/common/theme";
import { cn } from "@/common/lib/utils";
import { useActivityBarService } from "@/core/services/activity-bar.service";
import { ActivityItem } from "@/core/stores/activity-bar.store";
import { ActivityBar } from "composite-kit";
import { LayoutDashboard } from "lucide-react";
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
  const mainGroupItems = items.filter(item => item.group === 'main');
  const footerItems = items.filter(item => item.group === 'footer');


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
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="AgentVerse"
        showSearch={false}
      />

      <ActivityBar.GroupList>
        <ActivityBar.Group title="main">
          {mainGroupItems.map((item: ActivityItem) => (
            <ActivityBar.Item
              key={item.id}
              id={item.id}
              icon={<IconRegistry id={item.icon} />}
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
              icon={<IconRegistry id={item.icon} />}
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