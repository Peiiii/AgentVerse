
import { ChatArea } from "@/common/components/chat/chat-area";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { DiscussionController } from "@/common/components/discussion/control/discussion-controller";
import { DiscussionList } from "@/common/components/discussion/list/discussion-list";
import { MemberList } from "@/common/components/discussion/member/member-list";
import { ResponsiveContainer } from "@/common/components/layout/responsive-container";
import { UI_PERSIST_KEYS } from "@/core/config/ui-persist";
import { useAgents } from "@/core/hooks/useAgents";
import { useMessages } from "@/core/hooks/useMessages";
import { usePersistedState } from "@/core/hooks/usePersistedState";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { useEffect, useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";


export function ChatPage() {
    const { isDesktop } = useBreakpointContext();
    const { getAgentName, getAgentAvatar } = useAgents();
    const { messages, addMessage } = useMessages();
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

    const handleMessage = async (content: string, agentId: string) => {
        const agentMessage = await addMessage({
            content,
            agentId,
            type: "text",
        });
        if (agentMessage) discussionControlService.onMessage(agentMessage);
    };

    useEffect(() => {
        discussionControlService.setMessages(messages);
    }, [messages]);

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
                                        messages={messages}
                                        onSendMessage={handleMessage}
                                        getAgentName={getAgentName}
                                        getAgentAvatar={getAgentAvatar}
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