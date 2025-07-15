import { PluginRouter } from "@/common/components/common/plugin-router";
import { useTheme } from "@/common/components/common/theme";
import { ActivityBarComponent } from "@/common/components/layout/activity-bar";
import { githubExtension } from "@/common/features/github/extensions";
import { settingsExtension } from "@/common/features/settings/extensions";
import { cn } from "@/common/lib/utils";
import { useSetupApp } from "@/core/hooks/use-setup-app";
import { useMessages } from "@/core/hooks/useMessages";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { desktopAgentsExtension } from "@/desktop/features/agents/extensions";
import { desktopChatExtension } from "@/desktop/features/chat/extensions";
import { desktopIndexedDBExtension } from "@/desktop/features/indexeddb/extensions";
import { desktopMCPExtension } from "@/desktop/features/mcp/extensions";
import { desktopFileManagerExtension } from "@/desktop/features/file-manager/extensions";
import { allInOneAgentExtension } from "@/common/features/all-in-one-agent";
import { useEffect } from "react";
import { HashRouter } from "react-router-dom";

export function DesktopAppInner() {
  const { initialized } = useSetupApp({
    extensions: [
      allInOneAgentExtension,
      desktopChatExtension,
      desktopAgentsExtension,
      settingsExtension,
      desktopMCPExtension,
      desktopIndexedDBExtension,
      desktopFileManagerExtension,
      githubExtension,
    ],
  });
  const { rootClassName } = useTheme();
  const { messages } = useMessages();

  const { height } = useViewportHeight();

  useEffect(() => {
    discussionControlService.setMessages(messages);
  }, [messages]);

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
