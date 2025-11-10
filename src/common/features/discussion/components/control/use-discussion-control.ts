import { discussionControlService } from "@/core/services/discussion-control.service";
import { AgentMessage } from "@/common/types/discussion";
import { useEffect, useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";
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
  const [showSettings, setShowSettings] = useState(false);
  const { data: settings } = useProxyBeanState(
    discussionControlService.store,
    "settings"
  );
  const [messageCount, setMessageCount] = useState(0);
  const { members } = useDiscussionMembers();

  useEffect(() => {
    discussionControlService.setMembers(members);
  }, [members]);

  useEffect(() => {
    if (status === "active") {
      void discussionControlService.startIfEligible();
    } else {
      discussionControlService.pause();
    }
  }, [status, members]);

  useEffect(() => {
    return () => {
      discussionControlService.pause();
    };
  }, []);

  // 简化后不再有内部调度器计数，这里保留占位。
  useEffect(() => {
    setMessageCount(0);
  }, []);

  const handleStatusChange = (isActive: boolean) => {
    if (!isActive) discussionControlService.pause();
    else void discussionControlService.startIfEligible();
  };

  const setSettings = (next: typeof settings) => {
    // Forward settings updates through service to keep runtime in sync
    discussionControlService.setSettings(next);
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
