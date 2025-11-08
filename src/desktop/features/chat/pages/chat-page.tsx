
import { ChatArea } from "@/common/components/chat/chat-area";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { DiscussionController } from "@/common/components/discussion/control/discussion-controller";
import { DiscussionList } from "@/common/components/discussion/list/discussion-list";
import { MemberList } from "@/common/components/discussion/member/member-list";
import { ResponsiveContainer } from "@/common/components/layout/responsive-container";
import { UI_PERSIST_KEYS } from "@/core/config/ui-persist";
import { usePersistedState } from "@/core/hooks/usePersistedState";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";


export function ChatPage() {
    const { isDesktop } = useBreakpointContext();
    // agents/messages 由内部业务组件直连 presenter/store，无需在此处传递
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
    const { data: isPaused } = useProxyBeanState(
        discussionControlService.store,
        "isPaused"
    );
    const status = isPaused ? "paused" : "active";


    const handleToggleMembers = () => {
        setShowMembersForDesktop(!showMembersForDesktop);
    };

    // 业务消息在 ChatArea 内部处理

    // 桌面端布局
    return (
        <>
            <div className="flex-1 flex justify-center w-full">
                <div className="w-full max-w-[1920px]">
                    <ResponsiveContainer
                        sidebarContent={
                            <div className="h-full bg-card">
                                <DiscussionList
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
