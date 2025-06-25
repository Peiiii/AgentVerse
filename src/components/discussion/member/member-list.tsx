import { Button } from "@/components/ui/button";
import { useDiscussionMembers } from "@/hooks/useDiscussionMembers";
import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/common/lib/utils";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddMemberDialog } from "./add-member-dialog";
import { useKeyboardExpandableList } from "@/hooks/useKeyboardExpandableList";
import type { DiscussionMember } from "@/types/discussion-member";
import { MemberItem } from "./member-item";
import { MemberSkeleton } from "./member-skeleton";
import { QuickMemberSelector } from "./quick-member-selector";
import { useAgentForm } from "@/hooks/useAgentForm";
import { AgentForm } from "@/components/agent/agent-form";

interface MemberListProps {
  className?: string;
  headerClassName?: string;
  listClassName?: string;
}

export function MemberList({
  className,
  headerClassName,
  listClassName
}: MemberListProps) {
  const { members, isLoading, removeMember, toggleAutoReply } = useDiscussionMembers();
  const { agents, updateAgent } = useAgents();
  const {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleEditAgent,
    handleSubmit,
  } = useAgentForm(agents, updateAgent);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { getItemProps } = useKeyboardExpandableList({
    items: members,
    selectedId: expandedId,
    getItemId: (member: DiscussionMember) => member.id,
    onSelect: setExpandedId
  });

  const memberCount = members.length;
  const autoReplyCount = members.filter(m => m.isAutoReply).length;

  const renderHeader = () => (
    <header
      className={cn(
        "flex-none flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10 py-3 mb-2",
        headerClassName
      )}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-medium">成员</h2>
        <span className="text-sm text-muted-foreground">
          {memberCount}{autoReplyCount > 0 && `/${autoReplyCount}自动回复`}
        </span>
      </div>
      <Button
        onClick={() => setShowAddDialog(true)}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="h-8 px-3"
      >
        <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
        添加成员
      </Button>
    </header>
  );

  const renderContent = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <MemberSkeleton key={i} />
      ));
    }

    if (members.length === 0) {
      return (
        <div className="space-y-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>选择一个预设组合快速开始</p>
            <p className="text-sm">或点击上方按钮手动添加成员</p>
          </div>
          <QuickMemberSelector />
        </div>
      );
    }

    const validMembers = members.filter(member => 
      agents.some(agent => agent.id === member.agentId)
    );

    return validMembers.map((member, index) => {
      const agent = agents.find(a => a.id === member.agentId)!;
      return (
        <MemberItem
          key={member.id}
          member={member}
          agent={agent}
          isExpanded={expandedId === member.id}
          onExpand={() => setExpandedId(expandedId === member.id ? null : member.id)}
          onToggleAutoReply={() => toggleAutoReply(member.id)}
          onRemove={(e) => {
            e.stopPropagation();
            removeMember(member.id);
          }}
          onEditAgent={() => handleEditAgent(agent)}
          {...getItemProps(index)}
        />
      );
    });
  };

  return (
    <>
      <div className={cn("flex flex-col h-full overflow-hidden", className)}>
        {renderHeader()}
        <div className={cn("flex-1 min-h-0 overflow-y-auto px-0.5", listClassName)}>
          <div className="space-y-2 pb-4">
            {renderContent()}
          </div>
        </div>
        <AddMemberDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      </div>

      <AgentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </>
  );
} 
