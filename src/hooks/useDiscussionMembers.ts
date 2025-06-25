import { discussionMembersResource } from "@/resources";
import { discussionMemberService } from "@/services/discussion-member.service";
import { DiscussionMember } from "@/types/discussion-member";
import { useMemoizedFn } from "ahooks";
import { useResourceState } from "@/common/lib/resource";
import { discussionControlService } from "@/services/discussion-control.service";
import { useCallback } from "react";
import { useOptimisticUpdate } from "./useOptimisticUpdate";

interface UseDiscussionMembersProps {
  onChange?: (members: DiscussionMember[]) => void;
}

export function useDiscussionMembers({ onChange }: UseDiscussionMembersProps = {}) {
  const resource = useResourceState(discussionMembersResource.current);
  const { data: members = [] } = resource;

  const withOptimisticUpdate = useOptimisticUpdate(resource, { onChange });

  const getMembersForDiscussion = useCallback((discussionId: string) => {
    return discussionMemberService.list(discussionId);
  }, []);

  const addMember = useMemoizedFn(async (agentId: string, isAutoReply: boolean = false) => {
    const discussionId = discussionControlService.getCurrentDiscussionId();
    if (!discussionId) return;

    const tempId = `temp-${Date.now()}`;
    const tempMember: DiscussionMember = {
      id: tempId,
      discussionId,
      agentId,
      isAutoReply,
      joinedAt: new Date().toISOString()
    };

    return withOptimisticUpdate(
      // 乐观更新
      (members) => [...members, tempMember],
      // API 调用
      () => discussionMemberService.create(discussionId, agentId, isAutoReply)
    );
  });

  const addMembers = useMemoizedFn(async (members: { agentId: string; isAutoReply: boolean }[]) => {
    const discussionId = discussionControlService.getCurrentDiscussionId();
    if (!discussionId) return;

    const tempMembers = members.map((member, index) => ({
      id: `temp-${Date.now()}-${index}`,
      discussionId,
      agentId: member.agentId,
      isAutoReply: member.isAutoReply,
      joinedAt: new Date().toISOString()
    }));

    return withOptimisticUpdate(
      // 乐观更新
      (currentMembers) => [...currentMembers, ...tempMembers],
      // API 调用
      () => discussionMemberService.createMany(discussionId, members)
    );
  });

  const updateMember = useMemoizedFn(async (memberId: string, data: Partial<DiscussionMember>) => {
    return withOptimisticUpdate(
      // 乐观更新
      (members) => members.map(m => m.id === memberId ? { ...m, ...data } : m),
      // API 调用
      () => discussionMemberService.update(memberId, data)
    );
  });

  const removeMember = useMemoizedFn(async (memberId: string) => {
    return withOptimisticUpdate(
      // 乐观更新
      (members) => members.filter(m => m.id !== memberId),
      // API 调用
      () => discussionMemberService.delete(memberId)
    );
  });

  const toggleAutoReply = useMemoizedFn(async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    return updateMember(memberId, { isAutoReply: !member.isAutoReply });
  });

  return {
    members,
    isLoading: resource.isLoading,
    error: resource.error,
    addMember,
    addMembers,
    updateMember,
    removeMember,
    toggleAutoReply,
    getMembersForDiscussion
  };
} 