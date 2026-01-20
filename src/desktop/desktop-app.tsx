import { PluginRouter } from "@/common/components/common/plugin-router";
import { useTheme } from "@/common/components/common/theme";
import { ActivityBarComponent } from "@/common/features/app/components/activity-bar";
import { allInOneAgentExtension } from "@/common/features/all-in-one-agent";
import { settingsExtension } from "@/common/features/settings/extensions";
import { cn } from "@/common/lib/utils";
import { useSetupApp } from "@/core/hooks/use-setup-app";
import { useAppBootstrap } from "@/core/hooks/use-app-bootstrap";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { desktopAgentsExtension } from "@/desktop/features/agents/extensions";
import { desktopChatExtension } from "@/desktop/features/chat/extensions";
import { HashRouter } from "react-router-dom";

export function DesktopAppInner() {
  useAppBootstrap();
  const { initialized } = useSetupApp({
    extensions: [
      allInOneAgentExtension,
      desktopChatExtension,
      desktopAgentsExtension,
      settingsExtension,
      // desktopIndexedDBExtension,
      // desktopFileManagerExtension,
      // desktopPortalDemoExtension
    ],
  });
  const { rootClassName } = useTheme();

  const { height } = useViewportHeight();

  // messages are managed by manager/store; no need to mirror into runtime

  return !initialized ? (
    <div>Loading...</div>
  ) : (
    <div className="fixed inset-0 flex flex-col" style={{ height }}>
      <div className={cn(rootClassName, "flex flex-col h-full")}>
        <div className="flex-1 min-h-0 flex">
          <ActivityBarComponent className="flex" />
          <PluginRouter />
        </div>
      </div>
    </div>
  );
}

export function DesktopApp() {
  // 桌面端路由, 和mobile端不共享路由实例
  return (
    <HashRouter>
      <DesktopAppInner />
    </HashRouter>
  );
}
