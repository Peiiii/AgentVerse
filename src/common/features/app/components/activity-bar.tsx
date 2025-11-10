import { IconRegistry } from "@/common/components/common/icon-registry";
import { ThemeToggle } from "@/common/components/common/theme";
import { cn } from "@/common/lib/utils";
import { usePresenter } from "@/core/presenter";
import { useActivityBarStore, type ActivityItem } from "@/core/stores/activity-bar.store";
import { ActivityBar } from "composite-kit";
import { LayoutDashboard } from "lucide-react";
interface ActivityBarProps {
  className?: string;
}

export function ActivityBarComponent({ className }: ActivityBarProps) {
  // subscribe state directly from zustand store (MVP: view subscribes state)
  const expanded = useActivityBarStore((s) => s.expanded);
  const activeId = useActivityBarStore((s) => s.activeId);
  const rawItems = useActivityBarStore((s) => s.items);

  // actions are exposed via manager on presenter (MVP: actions via manager)
  const presenter = usePresenter();

  // sort items by order without mutating store state
  const items = [...rawItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  // 按组筛选
  const mainGroupItems = items.filter((item) => item.group === "main");
  const footerItems = items.filter((item) => item.group === "footer");

  const handleExpandedChange = (newExpanded: boolean) => {
    presenter.activityBar.setExpanded(newExpanded);
  };

  const handleActiveChange = (nextActiveId: string) => {
    const clicked = items.find((it) => it.id === nextActiveId);

    // per-item click handler if provided by extension/feature
    if (clicked?.onClick) {
      try { clicked.onClick(); } catch (e: unknown) { /* no-op */ }
    }

    // update active state after handling side effects
    presenter.activityBar.setActiveId(nextActiveId);
  };

  return (
    <ActivityBar.Root
      expanded={expanded}
      activeId={activeId}
      expandedWidth={200}
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
