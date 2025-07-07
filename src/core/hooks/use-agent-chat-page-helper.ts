import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscussions } from "./useDiscussions";
import { useDiscussionMembers } from "./useDiscussionMembers";
import { AgentDef } from "@/common/types/agent";

/**
 * 一键进入AI对话空间的hook
 * 可插拔使用，支持查找现有空间或新建空间
 */
export function useAgentChatPageHelper() {
  const navigate = useNavigate();
  const { discussions, createDiscussion, selectDiscussion } = useDiscussions();
  const { getMembersForDiscussion, addMembers } = useDiscussionMembers();

  /**
   * 进入与指定AI的对话空间
   * @param agent 目标AI
   * @param options 配置选项
   */
  const enterAgentChat = useCallback(async (
    agent: AgentDef,
    options?: {
      /** 是否强制新建空间 */
      forceNew?: boolean;
      /** 自定义空间标题 */
      customTitle?: string;
      /** 是否设置AI为自动回复 */
      autoReply?: boolean;
    }
  ) => {
    const {
      forceNew = false,
      customTitle,
      autoReply = true
    } = options || {};

    // 1. 如果不强制新建，先查找现有空间
    if (!forceNew) {
      for (const d of discussions || []) {
        const members = await getMembersForDiscussion(d.id);
        // 匹配条件：只有1个成员且是该AI
        if (members.length === 1 && members[0].agentId === agent.id) {
          selectDiscussion(d.id);
          navigate("/chat");
          return d;
        }
      }
    }

    // 2. 没有找到或强制新建，则创建新空间
    const title = customTitle || `与${agent.name}的对话`;
    const newDiscussion = await createDiscussion(title);
    
    // 只添加AI为成员，user不需要添加
    await addMembers([
      { agentId: agent.id, isAutoReply: autoReply },
    ]);
    
    selectDiscussion(newDiscussion.id);
    navigate("/chat");
    return newDiscussion;
  }, [discussions, getMembersForDiscussion, createDiscussion, addMembers, selectDiscussion, navigate]);

  return {
    enterAgentChat
  };
} 