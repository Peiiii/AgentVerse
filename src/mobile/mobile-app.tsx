import { AddAgentDialogContent } from "@/common/features/agents/components/add-agent-dialog/add-agent-dialog-content";
import { ChatArea } from "@/common/features/chat/components/chat-area";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { useTheme } from "@/common/components/common/theme";
import { DiscussionList } from "@/common/features/discussion/components/list/discussion-list";
import { MobileMemberDrawer } from "@/common/features/discussion/components/member/mobile-member-drawer";
import { MobileBottomBar } from "@/common/features/app/components/mobile-bottom-bar";
import { MobileHeader } from "@/common/features/discussion/components/mobile/mobile-header";
import { commonAgentsExtension } from "@/common/features/agents/extensions";
import { allInOneAgentExtension } from "@/common/features/all-in-one-agent";
import { cn } from "@/common/lib/utils";
import { Discussion } from "@/common/types/discussion";
import { UI_PERSIST_KEYS } from "@/core/config/ui-persist";
import { useSetupApp } from "@/core/hooks/use-setup-app";
import { useAppBootstrap } from "@/core/hooks/use-app-bootstrap";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { usePresenter } from "@/core/presenter";
import { usePersistedState } from "@/core/hooks/usePersistedState";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { useCurrentDiscussionId } from "@/core/hooks/useCurrentDiscussionId";
import { useIsPaused } from "@/core/hooks/useDiscussionRuntime";
import { mobileChatExtension } from "@/mobile/features/chat/extensions";
import { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import { getPresenter } from "@/core/presenter/presenter";
import { useMobileChatSceneStore } from "@/mobile/features/chat/stores/mobile-chat-scene.store";
import { mobileChatSceneManager } from "@/mobile/features/chat/managers/mobile-chat-scene.manager";

// 场景类型
export function MobileAppInner() {
  useAppBootstrap();
  useSetupApp({
    extensions: [
      allInOneAgentExtension,
      mobileChatExtension,
      commonAgentsExtension,
    ],
  });
  const { isDesktop, isMobile } = useBreakpointContext();
  const { rootClassName } = useTheme();
  // agents/messages 由业务组件直连 presenter/store
  const presenter = usePresenter();
  const { currentDiscussion } = useDiscussions();
  const [showMembersForDesktop, setShowMembersForDesktop] = usePersistedState(
    false,
    {
      key: UI_PERSIST_KEYS.DISCUSSION.MEMBER_PANEL_VISIBLE,
      version: 1,
    }
  );
  const currentDiscussionId = useCurrentDiscussionId();
  const isPaused = useIsPaused();
  const status = isPaused ? "paused" : "active";
  const { height } = useViewportHeight();
  
  const [showMobileMemberDrawer, setShowMobileMemberDrawer] = useState(false);
  const scene = useMobileChatSceneStore((state) => state.scene);
  const { toChat, toDiscussions, toAgents } = mobileChatSceneManager;

  useEffect(() => {
    if (!isMobile || !currentDiscussionId) {
      return;
    }
    mobileChatSceneManager.handleDiscussionChange(currentDiscussionId);
  }, [currentDiscussionId, isMobile]);

  const handleStatusChange = (status: Discussion["status"]) => {
    const discussionControl = getPresenter().discussionControl;
    if (status === "paused") discussionControl.pause();
    else void discussionControl.startIfEligible();
  };

  const handleToggleMembers = () => {
    if (isDesktop) {
      setShowMembersForDesktop(!showMembersForDesktop);
    } else {
      setShowMobileMemberDrawer(true);
    }
  };

  // 业务消息在 ChatArea 内部处理

  // 渲染当前场景内容
  const renderSceneContent = () => {
    if (scene === "chat" && currentDiscussion) {
      return (
        <div className="flex flex-col h-full">
          <MobileHeader
            onToggleSidebar={toDiscussions}
            className="lg:hidden flex-none"
            title={currentDiscussion.title || "讨论系统"}
            status={status}
            onStatusChange={handleStatusChange}
            onManageMembers={handleToggleMembers}
            onClearMessages={() => {
              if (currentDiscussion) {
                presenter.discussions.clearMessages(currentDiscussion.id);
              }
            }}
          />
          <div className="flex-1 min-h-0">
            <ChatArea
              key={currentDiscussionId}
              onStartDiscussion={() => {
                if (status === "paused") {
                  handleStatusChange("active");
                }
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          {scene === "agents" ? (
            <div className="h-full p-4 overflow-y-auto">
              <AddAgentDialogContent />
            </div>
          ) : (
            <DiscussionList />
          )}
        </div>
        {/* 只在主场景页面显示底部导航 */}
        {scene !== "chat" && (
          <MobileBottomBar
            currentScene={scene}
            onSceneChange={(nextScene) => {
              switch (nextScene) {
                case "chat":
                  toChat();
                  break;
                case "discussions":
                  toDiscussions();
                  break;
                case "agents":
                  toAgents();
                  break;
              }
            }}
            className="lg:hidden"
          />
        )}
      </div>
    );
  };

  // 移动端布局
  return (
    <div className="fixed inset-0 flex flex-col" style={{ height }}>
      <div className={cn(rootClassName, "flex flex-col h-full")}>
        {renderSceneContent()}
        <MobileMemberDrawer
          open={showMobileMemberDrawer}
          onOpenChange={setShowMobileMemberDrawer}
        />
      </div>
    </div>
  );
}

export function MobileApp() {
  return (
    <HashRouter>
      <MobileAppInner />
    </HashRouter>
  );
}
