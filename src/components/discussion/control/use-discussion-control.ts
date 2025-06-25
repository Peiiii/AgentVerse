import { discussionControlService } from "@/core/services/discussion-control.service";
import { AgentMessage } from "@/common/types/discussion";
import { useEffect, useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";
import { ITypingIndicator, typingIndicatorService } from "@/core/services/typing-indicator.service";
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
  const { data: settings, set: setSettings } = useProxyBeanState(
    discussionControlService.store,
    "settings"
  );
  const [indicators, setIndicators] = useState<Map<string, ITypingIndicator>>(
    typingIndicatorService.getIndicators()
  );
  const [messageCount, setMessageCount] = useState(0);
  const { members } = useDiscussionMembers();

  useEffect(() => {
    discussionControlService.setMembers(members);
  }, [members]);

  useEffect(() => {
    if (status === "active") {
      const activeMembers = members.filter((m) => m.isAutoReply);
      if (activeMembers.length > 0) {
        discussionControlService.run();
      }
    } else {
      discussionControlService.pause();
    }
  }, [status, members]);

  useEffect(() => {
    return () => {
      discussionControlService.pause();
    };
  }, []);

  useEffect(() => {
    return typingIndicatorService.onIndicatorsChange$.listen(setIndicators);
  }, []);

  useEffect(() => {
    const sub =
      discussionControlService.env.speakScheduler.messageCounterBean.$.subscribe(
        (count) => setMessageCount(count)
      );
    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleStatusChange = (isActive: boolean) => {
    if (!isActive) {
      discussionControlService.pause();
    } else {
      discussionControlService.run();
    }
  };

  return {
    showSettings,
    setShowSettings,
    settings,
    setSettings,
    indicators,
    messageCount,
    handleStatusChange,
  };
} 