import { PluginRouter } from "@/common/components/common/plugin-router";
import { useTheme } from "@/common/components/common/theme";
import { ActivityBarComponent } from "@/common/components/layout/activity-bar";
import { useSetupApp } from "@/core/hooks/use-setup-app";
import { agentsExtension } from "@/common/features/agents/extensions";
import { desktopChatExtension } from "@/desktop/features/chat/extensions";
import { githubExtension } from "@/common/features/github/extensions";
import { settingsExtension } from "@/common/features/settings/extensions";
import { useMessages } from "@/core/hooks/useMessages";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { cn } from "@/common/lib/utils";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { useEffect } from "react";

export function DesktopApp() {
  useSetupApp({
    extensions: [desktopChatExtension, agentsExtension, settingsExtension, githubExtension],
  });
  const { rootClassName } = useTheme();
  const { messages } = useMessages();

  const { height } = useViewportHeight();


  useEffect(() => {
    discussionControlService.setMessages(messages);
  }, [messages]);


  return (
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

