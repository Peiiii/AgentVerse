import { ChatArea } from "@/components/chat/chat-area";
import { DiscussionController } from "@/components/discussion/control/discussion-controller";
import { DiscussionList } from "@/components/discussion/discussion-list";
import { MemberList } from "@/components/discussion/member/member-list";
import { Header } from "@/components/layout/Header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { useBreakpointContext } from "@/contexts/breakpoint-context";
import { useAgents } from "@/hooks/useAgents";
import { useDiscussionMembers } from "@/hooks/useDiscussionMembers";
import { useMessages } from "@/hooks/useMessages";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { discussionControlService } from "@/services/discussion-control.service";
import { Discussion, NormalMessage } from "@/types/discussion";
import { useEffect, useState } from "react";
import { useBeanState } from "rx-nested-bean";
import { DiscussionSetupPage } from "./components/discussion/setup/discussion-setup-page";
import React from "react";

// 动态导入非首屏组件
const SettingsDialog = React.lazy(() => import("@/components/settings/settings-dialog").then(module => ({ default: module.SettingsDialog })));
const AddAgentDialog = React.lazy(() => import("@/components/agent/add-agent-dialog").then(module => ({ default: module.AddAgentDialog })));
const MobileMemberDrawer = React.lazy(() => import("@/components/discussion/member/mobile-member-drawer").then(module => ({ default: module.MobileMemberDrawer })));

export function App() {
  const { isDarkMode, toggleDarkMode, rootClassName } = useTheme();
  const { getAgentName, getAgentAvatar } = useAgents();
  const { messages, addMessage } = useMessages();
  const { members } = useDiscussionMembers();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showMobileMembers, setShowMobileMembers] = useState(false);
  const [showMobileAgentsDialog, setShowMobileAgentsDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isDesktop } = useBreakpointContext();
  const { data: currentDiscussionId } = useBeanState(
    discussionControlService.currentDiscussionIdBean
  );
  const { data: isPaused, set: setIsPaused } = useBeanState(
    discussionControlService.isPausedBean
  );
  const status = isPaused ? "paused" : "active";

  const handleStatusChange = (status: Discussion["status"]) => {
    setIsPaused(status === "active");
  };

  const handleToggleMembers = () => {
    if (window.innerWidth >= 1024) {
      setShowMembers(!showMembers);
    } else {
      setShowMobileMembers(true);
    }
  };

  // 处理第一条消息，设置为主题
  const handleMessage = async (content: string, agentId: string) => {
    const agentMessage = await addMessage({
      content,
      agentId,
      type: "text",
    });
    // 如果是第一条消息，设置为主题
    if (messages.length === 0) {
      discussionControlService.setTopic(content);
    }
    if (agentMessage) discussionControlService.onMessage(agentMessage);
  };

  useEffect(() => {
    if (messages.length > 0) {
      discussionControlService.setTopic((messages[0] as NormalMessage).content);
    }
    discussionControlService.setMessages(messages);
  }, [messages]);

  const handleSelectDiscussion = () => {
    if (!isDesktop) {
      setShowMobileSidebar(false);
    }
  };

  // 侧边栏内容
  const sidebarContent = (
    <div className="h-full bg-card">
      <DiscussionList onSelectDiscussion={handleSelectDiscussion} />
    </div>
  );

  // 主要内容
  const mainContent = (
    <div className="flex flex-col h-full">
      <MobileHeader
        onToggleSidebar={() => setShowMobileSidebar(true)}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleDarkMode}
        onShowAgentManagementPanel={() => setShowMobileAgentsDialog(true)}
        onShowSettings={() => setShowSettings(true)}
        className="lg:hidden"
      />

      <div className="flex-1 flex min-h-0">
        {members.length === 0 ? (
          <div className="flex-1">
            <DiscussionSetupPage />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-none p-4 border-b">
                <DiscussionController
                  status={status}
                  onSendMessage={addMessage}
                  onToggleMembers={handleToggleMembers}
                />
              </div>
              <div className="flex-1 min-h-0">
                <ChatArea
                  key={currentDiscussionId}
                  messages={messages}
                  onSendMessage={handleMessage}
                  getAgentName={getAgentName}
                  getAgentAvatar={getAgentAvatar}
                  onStartDiscussion={() => {
                    if (status === "paused") {
                      handleStatusChange("active");
                    }
                  }}
                  className="h-full"
                />
              </div>
            </div>

            <div
              className={cn(
                "w-80 flex-none border-l border-border bg-card hidden lg:block",
                !showMembers && "lg:hidden"
              )}
            >
              <div className="p-4 h-full">
                <MemberList />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(rootClassName)} data-testid="app-root">
      {/* PC端顶部Header */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        status={status}
        className="hidden lg:flex"
      />

      <div className="flex-1 min-h-0">
        <ResponsiveContainer
          sidebarContent={sidebarContent}
          mainContent={mainContent}
          showMobileSidebar={showMobileSidebar}
          onMobileSidebarChange={setShowMobileSidebar}
        />
      </div>

      {/* 移动端成员管理抽屉 */}
      <React.Suspense>
        <MobileMemberDrawer
          open={showMobileMembers}
          onOpenChange={setShowMobileMembers}
        />
        <AddAgentDialog
          isOpen={showMobileAgentsDialog}
          onOpenChange={setShowMobileAgentsDialog}
        />
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </React.Suspense>
    </div>
  );
}
