import { Button } from "@/common/components/ui/button";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { usePresenter } from "@/core/presenter";
import { useAgents } from "@/core/hooks/useAgents";
import { cn } from "@/common/lib/utils";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddMemberDialog } from "./add-member-dialog";
import { useKeyboardExpandableList } from "@/core/hooks/useKeyboardExpandableList";
import type { DiscussionMember } from "@/common/types/discussion-member";
import { MemberItem } from "./member-item";
import { MemberSkeleton } from "./member-skeleton";
import { QuickMemberSelector } from "./quick-member-selector";
import { useAgentForm } from "@/core/hooks/useAgentForm";
import { AgentForm } from "@/common/features/agents/components/forms";
import { Switch } from "@/common/components/ui/switch";
import { Label } from "@/common/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/ui/tooltip";
import { MessageSquareOff, MessageSquareText } from "lucide-react";

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
  const presenter = usePresenter();
  const { members, isLoading } = useDiscussionMembers();
  const { agents } = useAgents();
  const {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleEditAgent,
    handleSubmit,
  } = useAgentForm(agents, presenter.agents.update);
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
        "flex-none flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-3.5 mb-3 border-b border-border/40",
        headerClassName
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">成员</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted/50">
            {memberCount}{autoReplyCount > 0 && ` · ${autoReplyCount} 自动回复`}
          </span>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-8 px-3 gap-1.5 hover:bg-muted/60 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>添加</span>
        </Button>
      </div>

      {memberCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Switch
                id="batch-auto-reply"
                checked={autoReplyCount === memberCount && memberCount > 0}
                onCheckedChange={(checked) => presenter.discussionMembers.setAllAutoReply(checked)}
                className="scale-90"
              />
              <Label htmlFor="batch-auto-reply" className="text-xs text-muted-foreground cursor-pointer select-none">
                全员自动回复
              </Label>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                  {autoReplyCount === memberCount ? (
                    <MessageSquareText className="w-3 h-3" />
                  ) : (
                    <MessageSquareOff className="w-3 h-3" />
                  )}
                  <span>控制所有 AI 的响应状态</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] max-w-[200px]">
                一键开启或关闭讨论组内所有 AI 成员的自动回复功能。
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
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
        <div className="space-y-6 py-8">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">还没有成员</p>
            <p className="text-sm text-muted-foreground">
              选择一个预设组合快速开始，或点击上方按钮手动添加成员
            </p>
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
          onToggleAutoReply={() => presenter.discussionMembers.toggleAutoReply(member.id)}
          onRemove={(e) => {
            e.stopPropagation();
            presenter.discussionMembers.remove(member.id);
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
        <div className={cn("flex-1 min-h-0 overflow-y-auto px-1", listClassName)}>
          <div className="space-y-2.5 pb-4">
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
