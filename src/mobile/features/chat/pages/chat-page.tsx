import { AddAgentDialogContent } from "@/common/features/agents/components/add-agent-dialog/add-agent-dialog-content";
import { ChatArea } from "@/common/features/chat/components/chat-area";
import { useTheme } from "@/common/components/common/theme";
import { ThemeToggle } from "@/common/components/common/theme-toggle";
import { DiscussionList } from "@/common/features/discussion/components/list/discussion-list";
import { MobileMemberDrawer } from "@/common/features/discussion/components/member/mobile-member-drawer";
import { MobileBottomBar } from "@/common/features/app/components/mobile-bottom-bar";
import { MobileHeader } from "@/common/features/discussion/components/mobile/mobile-header";
import { Button } from "@/common/components/ui/button";
import { Switch } from "@/common/components/ui/switch";
import { cn } from "@/common/lib/utils";
import { Discussion } from "@/common/types/discussion";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { usePresenter } from "@/core/presenter";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { useIsPaused } from "@/core/hooks/useDiscussionRuntime";
import { useCurrentDiscussionId } from "@/core/hooks/useCurrentDiscussionId";
import { useState } from "react";
import { useMobileChatSceneStore } from "@/mobile/features/chat/stores/mobile-chat-scene.store";
import { mobileChatSceneManager } from "@/mobile/features/chat/managers/mobile-chat-scene.manager";

export function ChatPage() {
  const { rootClassName } = useTheme();
  // agents/messages 由业务组件直连 presenter/store
  const presenter = usePresenter();
  const { currentDiscussion } = useDiscussions();
  const currentDiscussionId = useCurrentDiscussionId();
  const isPaused = useIsPaused();
  const status = isPaused ? "paused" : "active";
  const { height } = useViewportHeight();
  
  const [showMobileMemberDrawer, setShowMobileMemberDrawer] = useState(false);
  const scene = useMobileChatSceneStore((state) => state.scene);
  const { toChat, toDiscussions, toAgents, toSettings } = mobileChatSceneManager;
  const handleToggleMembers = () => {
    setShowMobileMemberDrawer(!showMobileMemberDrawer);
  };

  const handleStatusChange = (status: Discussion["status"]) => {
    if (status === "paused") discussionControlService.pause();
    else void discussionControlService.startIfEligible();
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
            // 移除非必要的 prop 透传：设置入口统一用 presenter.settings.open
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
          ) : scene === "settings" ? (
            <div className="h-full overflow-y-auto">
              <div className="space-y-6 p-4">
                {/* 通用 */}
                <div className="space-y-3">
                  <h2 className="text-lg font-medium">通用</h2>
                  <div className="space-y-4 rounded-lg border bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">深色模式</div>
                        <div className="text-sm text-muted-foreground">
                          切换深色/浅色主题
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                {/* 讨论设置 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">讨论设置</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => presenter.settings.open()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      高级设置
                    </Button>
                  </div>
                  <div className="space-y-4 rounded-lg border bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">自动滚动</div>
                        <div className="text-sm text-muted-foreground">
                          新消息时自动滚动到底部
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">自动标题</div>
                        <div className="text-sm text-muted-foreground">
                          根据首条消息自动设置讨论标题
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* 关于 */}
                <div className="space-y-3">
                  <h2 className="text-lg font-medium">关于</h2>
                  <div className="space-y-4 rounded-lg border bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">版本</div>
                        <div className="text-sm text-muted-foreground">
                          当前版本 1.0.0
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                case "settings":
                  toSettings();
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
