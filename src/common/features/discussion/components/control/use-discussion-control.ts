import { getPresenter } from "@/core/presenter/presenter";
import { AgentMessage } from "@/common/types/discussion";
import { useEffect, useState } from "react";
import { useDiscussionSettings } from "@/core/hooks/useDiscussionSettings";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";

interface UseDiscussionControlProps {
  status: "active" | "paused" | "completed";
  onSendMessage?: (params: {
    content: string;
    agentId: string;
    type?: AgentMessage["type"];
    replyTo?: string;
  }) => Promise<AgentMessage | undefined>;
}

export function useDiscussionControl({ status }: UseDiscussionControlProps) {
  const discussionControl = getPresenter().discussionControl;
  const [showSettings, setShowSettings] = useState(false);
  const settings = useDiscussionSettings();
  const [messageCount, setMessageCount] = useState(0);
  const { members } = useDiscussionMembers();

  useEffect(() => {
    discussionControl.setMembers(members);
  }, [discussionControl, members]);

  useEffect(() => {
    if (status === "active") {
      void discussionControl.startIfEligible();
    } else {
      discussionControl.pause();
    }
  }, [discussionControl, status, members]);

  useEffect(() => {
    return () => {
      discussionControl.pause();
    };
  }, [discussionControl]);

  // 简化后不再有内部调度器计数，这里保留占位。
  useEffect(() => {
    setMessageCount(0);
  }, []);

  const handleStatusChange = (isActive: boolean) => {
    if (!isActive) discussionControl.pause();
    else void discussionControl.startIfEligible();
  };

  const setSettings = (next: typeof settings) => {
    // Forward settings updates through service to keep runtime in sync
    discussionControl.setSettings(next);
  };

  return {
    showSettings,
    setShowSettings,
    settings,
    setSettings,
    messageCount,
    handleStatusChange,
  };
}
