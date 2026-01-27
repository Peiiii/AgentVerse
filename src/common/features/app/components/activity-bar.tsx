import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconRegistry } from "@/common/components/common/icon-registry";
import { ThemeToggle } from "@/common/components/common/theme";
import { LanguageToggle } from "@/common/components/common/language";
import { cn } from "@/common/lib/utils";
import { usePresenter } from "@/core/presenter";
import { useActivityBarStore, type ActivityItem } from "@/core/stores/activity-bar.store";
import { useAuth } from "@/core/hooks/use-auth";
import { ActivityBar } from "composite-kit";
import { CircleUserRound, Github, LayoutDashboard } from "lucide-react";
interface ActivityBarProps {
  className?: string;
}

const AUTH_ITEM_ID = "auth-entry";
const GITHUB_ITEM_ID = "github-entry";

export function ActivityBarComponent({ className }: ActivityBarProps) {
  // subscribe state directly from zustand store (MVP: view subscribes state)
  const expanded = useActivityBarStore((s) => s.expanded);
  const activeId = useActivityBarStore((s) => s.activeId);
  const rawItems = useActivityBarStore((s) => s.items);
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectRef = useRef("");

  // actions are exposed via manager on presenter (MVP: actions via manager)
  const presenter = usePresenter();
  const activityBar = presenter.activityBar;

  // sort items by order without mutating store state
  const items = [...rawItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  // 按组筛选
  const mainGroupItems = items.filter((item) => item.group === "main");
  const footerItems = items.filter((item) => item.group === "footer");
  const hasFooterItems = footerItems.length > 0;

  const handleExpandedChange = (newExpanded: boolean) => {
    presenter.activityBar.setExpanded(newExpanded);
  };

  const handleActiveChange = (nextActiveId: string) => {
    const clicked = items.find((it) => it.id === nextActiveId);

    // per-item click handler if provided by extension/feature
    if (clicked?.onClick) {
      try { clicked.onClick(); } catch { /* no-op */ }
    }

    if (clicked?.id === AUTH_ITEM_ID || clicked?.id === GITHUB_ITEM_ID) {
      return;
    }

    // update active state after handling side effects
    presenter.activityBar.setActiveId(nextActiveId);
  };

  useEffect(() => {
    presenter.icon.addIcons({
      [AUTH_ITEM_ID]: CircleUserRound,
      [GITHUB_ITEM_ID]: Github,
    });
  }, [presenter]);

  useEffect(() => {
    redirectRef.current = `${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  const handleAuthClick = useCallback(() => {
    const redirect = redirectRef.current || "/chat";
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [navigate]);

  const handleGithubClick = useCallback(() => {
    window.open("https://github.com/Peiiii/AgentVerse", "_blank", "noopener,noreferrer");
  }, []);

  useEffect(() => {
    const shouldShowAuthEntry = status !== "authenticated";
    const existing = activityBar.getItems().some((item) => item.id === AUTH_ITEM_ID);
    if (!shouldShowAuthEntry) {
      if (existing) {
        activityBar.removeItem(AUTH_ITEM_ID);
      }
      return;
    }

    if (!existing) {
      activityBar.addItem({
        id: AUTH_ITEM_ID,
        icon: AUTH_ITEM_ID,
        label: "登录 / 注册",
        title: "登录或注册",
        group: "footer",
        order: 999,
        onClick: handleAuthClick,
      });
    }
  }, [activityBar, handleAuthClick, status]);

  useEffect(() => {
    const existing = activityBar.getItems().some((item) => item.id === GITHUB_ITEM_ID);
    if (existing) return;

    activityBar.addItem({
      id: GITHUB_ITEM_ID,
      icon: GITHUB_ITEM_ID,
      label: "GitHub",
      title: "查看项目仓库",
      group: "footer",
      order: 950,
      onClick: handleGithubClick,
    });
  }, [activityBar, handleGithubClick]);

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
        {hasFooterItems && <ActivityBar.Separator />}
        {hasFooterItems && (
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
        )}
        {hasFooterItems && <ActivityBar.Separator />}
        <div className="px-3 py-2 space-y-2">
          <LanguageToggle className="w-full" />
          <ThemeToggle className="w-full" />
        </div>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  );
} 
