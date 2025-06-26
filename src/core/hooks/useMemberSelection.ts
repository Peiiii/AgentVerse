import { discussionControlService } from "@/core/services/discussion-control.service";
import { AgentDef } from "@/common/types/agent";
import { useEffect, useMemo, useState } from "react";
import { useProxyBeanState } from "rx-nested-bean";
import { useAgents } from "./useAgents";
import { useDiscussionMembers } from "./useDiscussionMembers";

export interface Member {
  agentId: string;
  role?: string;
  isSelf?: boolean;
}

// 定义用户自己的成员常量
const SELF_MEMBER: Member = {
  agentId: "user",
  role: "user",
  isSelf: true,
};

const SELF_AGENT: AgentDef = {
  id: "user",
  name: "我",
  avatar: "",
  prompt: "",
  role: "moderator",
  personality: "",
  bias: "",
  responseStyle: "",
  expertise: [],
};

export function useMemberSelection(isFirstMessage: boolean = false) {
  const { agents } = useAgents();
  const { members } = useDiscussionMembers();
  const { data: currentDiscussionId } = useProxyBeanState(
    discussionControlService.store,
    "currentDiscussionId"
  );

  // 可用成员列表，添加"我"的选项
  const availableMembers = useMemo(() => {
    if (isFirstMessage) {
      const moderators = members.filter(
        (m) => agents.find((a) => a.id === m.agentId)?.role === "moderator"
      );
      return [SELF_MEMBER, ...moderators];
    }
    return [SELF_MEMBER, ...members];
  }, [agents, isFirstMessage, members]);

  // 直接将初始值设置为 SELF_MEMBER.agentId
  const [selectedMemberId, setSelectedMemberId] = useState(SELF_MEMBER.agentId);

  // 当前选中的 agent
  const selectedAgent = useMemo(
    () => agents.concat(SELF_AGENT).find((a) => a.id === selectedMemberId),
    [agents, selectedMemberId]
  );

  // 修改重置逻辑，移除自动重置的部分，因为我们希望保持用户选择
  useEffect(() => {
    const shouldReset =
      currentDiscussionId &&
      selectedMemberId !== SELF_MEMBER.agentId &&
      (!selectedMemberId ||
        !members.find((m) => m.agentId === selectedMemberId));

    if (shouldReset) {
      setSelectedMemberId(SELF_MEMBER.agentId);
    }
  }, [currentDiscussionId, members, selectedMemberId]);

  return {
    selectedMemberId,
    setSelectedMemberId,
    selectedAgent,
    availableMembers,
    isSelectDisabled: false,
  };
}
