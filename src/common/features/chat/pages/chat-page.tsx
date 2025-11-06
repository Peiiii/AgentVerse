import { AddAgentDialogContent } from "@/common/components/agent/add-agent-dialog/add-agent-dialog-content";
import { ChatArea } from "@/common/components/chat/chat-area";
import { useTheme } from "@/common/components/common/theme";
import { ThemeToggle } from "@/common/components/common/theme-toggle";
import { DiscussionController } from "@/common/components/discussion/control/discussion-controller";
import { DiscussionList } from "@/common/components/discussion/list/discussion-list";
import { MemberList } from "@/common/components/discussion/member/member-list";
import { MobileMemberDrawer } from "@/common/components/discussion/member/mobile-member-drawer";
import { MobileBottomBar } from "@/common/components/layout/mobile-bottom-bar";
import { MobileHeader } from "@/common/components/layout/mobile-header";
import { ResponsiveContainer } from "@/common/components/layout/responsive-container";
import { useSettingsDialog } from "@/common/components/settings/settings-dialog";
import { Button } from "@/common/components/ui/button";
import { Switch } from "@/common/components/ui/switch";
import { UI_PERSIST_KEYS } from "@/core/config/ui-persist";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { usePersistedState } from "@/core/hooks/usePersistedState";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { cn } from "@/common/lib/utils";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { Discussion } from "@/common/types/discussion";
import { useEffect, useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";

// 场景类型
type Scene = "discussions" | "chat" | "agents" | "settings";

export function ChatPage() {
    const { isDesktop, isMobile } = useBreakpointContext();
    const { rootClassName } = useTheme();
    // agents/messages 由内部业务组件直连 presenter/store，无需在此处传递
    const { currentDiscussion, clearMessages } = useDiscussions();
    const [currentScene, setCurrentScene] = useState<Scene>("chat");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showMembersForDesktop, setShowMembersForDesktop] = usePersistedState(
        false,
        {
            key: UI_PERSIST_KEYS.DISCUSSION.MEMBER_PANEL_VISIBLE,
            version: 1,
        }
    );
    const [isInitialState, setIsInitialState] = useState(false);
    const showDesktopMembers = isDesktop && showMembersForDesktop && !isInitialState;
    const { data: currentDiscussionId } = useProxyBeanState(
        discussionControlService.store,
        "currentDiscussionId"
    );
    const { data: isPaused, set: setIsPaused } = useProxyBeanState(
        discussionControlService.store,
        "isPaused"
    );
    const status = isPaused ? "paused" : "active";
    const { height } = useViewportHeight();
    const { openSettingsDialog } = useSettingsDialog();
    const [showMobileMemberDrawer, setShowMobileMemberDrawer] = useState(false);

    // 处理场景切换
    useEffect(() => {
        if (currentDiscussion && isMobile) {
            setCurrentScene("chat");
        }
    }, [currentDiscussion, isMobile]);

    const handleStatusChange = (status: Discussion["status"]) => {
        setIsPaused(status === "paused");
    };

    const handleToggleMembers = () => {
        if (isDesktop) {
            setShowMembersForDesktop(!showMembersForDesktop);
        } else {
            setShowMobileMemberDrawer(true);
        }
    };

    // 业务消息在 ChatArea 内部处理

    const handleSelectDiscussion = () => {
        if (!isDesktop) {
            setShowMobileSidebar(false);
            setCurrentScene("chat");
        }
    };

    // 渲染当前场景内容
    const renderSceneContent = () => {
        if (currentScene === "chat" && currentDiscussion) {
            return (
                <div className="flex flex-col h-full">
                    <MobileHeader
                        onToggleSidebar={() => setCurrentScene("discussions")}
                        className="lg:hidden flex-none"
                        title={currentDiscussion.title || "讨论系统"}
                        status={status}
                        onStatusChange={handleStatusChange}
                        onManageMembers={handleToggleMembers}
                        onOpenSettings={() => openSettingsDialog()}
                        onClearMessages={() => {
                            if (currentDiscussion) {
                                clearMessages(currentDiscussion.id);
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
                    {currentScene === "agents" ? (
                        <div className="h-full p-4 overflow-y-auto">
                            <AddAgentDialogContent />
                        </div>
                    ) : currentScene === "settings" ? (
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
                                            onClick={openSettingsDialog}
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
                        <DiscussionList onSelectDiscussion={handleSelectDiscussion} />
                    )}
                </div>
                {/* 只在主场景页面显示底部导航 */}
                {currentScene !== "chat" && (
                    <MobileBottomBar
                        currentScene={currentScene}
                        onSceneChange={setCurrentScene}
                        className="lg:hidden"
                    />
                )}
            </div>
        );
    };

    // 桌面端布局
    if (isDesktop) {
        return (
            <>
                <div className="flex-1 flex justify-center w-full">
                    <div className="w-full max-w-[1920px]">
                        <ResponsiveContainer
                            sidebarContent={
                                <div className="h-full bg-card">
                                    <DiscussionList
                                        onSelectDiscussion={handleSelectDiscussion}
                                    />
                                </div>
                            }
                            mainContent={
                                <div className="flex flex-col h-full">
                                    {!isInitialState && (
                                        <DiscussionController
                                            status={status}
                                            onToggleMembers={handleToggleMembers}
                                            enableSettings={false}
                                        />
                                    )}
                                    <div className="flex-1 min-h-0">
                                    <ChatArea
                                        key={currentDiscussionId}
                                        onInitialStateChange={setIsInitialState}
                                    />
                                    </div>
                                </div>
                            }
                            showMobileSidebar={showMobileSidebar}
                            onMobileSidebarChange={setShowMobileSidebar}
                        />
                    </div>
                </div>
                {showDesktopMembers && (
                    <div className="w-80 flex-none border-l border-border bg-card">
                        <div className="p-4 h-full">
                            <MemberList />
                        </div>
                    </div>
                )}</>
        );
    }

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
