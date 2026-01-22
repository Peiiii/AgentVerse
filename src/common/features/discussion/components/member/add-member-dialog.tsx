import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { Check, Search, X, UserPlus, Users, Trash2 } from "lucide-react";
import match from "pinyin-match";
import { useMemo, useState } from "react";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Badge } from "@/common/components/ui/badge";
import { Separator } from "@/common/components/ui/separator";

import { DiscussionMember } from "@/common/types/discussion-member";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: DiscussionMember[];
}

export function AddMemberDialog({ open, onOpenChange, members }: AddMemberDialogProps) {
  const presenter = usePresenter();
  const { agents } = useAgents();
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤可用的 agents，排除已加入的
  const availableAgents = useMemo(() => {
    const memberAgentIds = new Set(members.map(m => m.agentId));
    return agents.filter(agent => !memberAgentIds.has(agent.id));
  }, [agents, members]);

  // 搜索和分组过滤
  const filteredAndGroupedAgents = useMemo(() => {
    const filtered = availableAgents.filter((agent) => {
      const name = presenter.agents.getAgentName(agent.id);
      if (!searchQuery.trim()) return true;
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.match(name, searchQuery)
      );
    });

    // 按 Role 分组
    const groups: Record<string, AgentDef[]> = {};
    filtered.forEach((agent) => {
      const role = agent.role || "其他";
      if (!groups[role]) groups[role] = [];
      groups[role].push(agent);
    });

    return groups;
  }, [availableAgents, searchQuery, presenter]);

  const handleAgentToggle = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (selectedAgents.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const handleSelectAll = () => {
    const allFilteredIds = Object.values(filteredAndGroupedAgents).flat().map(a => a.id);
    const newSelected = new Set(selectedAgents);
    allFilteredIds.forEach(id => newSelected.add(id));
    setSelectedAgents(newSelected);
  };

  const handleClearAll = () => {
    setSelectedAgents(new Set());
  };

  const handleConfirm = async () => {
    await Promise.all(
      Array.from(selectedAgents).map((agentId) =>
        presenter.discussionMembers.add(agentId, true)
      )
    );
    onOpenChange(false);
    setSelectedAgents(new Set());
    setSearchQuery("");
  };

  const selectedList = useMemo(() => {
    return agents.filter(a => selectedAgents.has(a.id));
  }, [agents, selectedAgents]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden h-[600px] flex flex-col border-none shadow-2xl transition-all">
        <DialogHeader className="p-6 pb-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">添加讨论成员</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">邀请 AI 助手加入当前对话</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs hover:bg-primary/5 hover:text-primary transition-all"
              >
                全选
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-destructive hover:bg-destructive/5 hover:text-destructive transition-all"
              >
                重置
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：搜索与选择区 */}
          <div className="flex-1 flex flex-col border-right min-w-0 bg-background/30">
            <div className="p-4 space-y-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="搜索名称、拼音、角色..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 pb-4">
              <div className="space-y-6">
                {Object.entries(filteredAndGroupedAgents).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                    <Users className="w-12 h-12 opacity-10" />
                    <p className="text-sm">{searchQuery ? "未找到相关 AI" : "暂无可添加的成员"}</p>
                  </div>
                ) : (
                  Object.entries(filteredAndGroupedAgents).map(([role, list]) => (
                    <div key={role} className="space-y-3">
                      <div className="flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-md py-1 z-10">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{role}</span>
                        <Separator className="flex-1 opacity-40" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {list.map((agent) => (
                          <div
                            key={agent.id}
                            className={cn(
                              "group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
                              selectedAgents.has(agent.id)
                                ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                                : "bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/10"
                            )}
                            onClick={() => handleAgentToggle(agent.id)}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={presenter.agents.getAgentAvatar(agent.id)}
                                alt={agent.id}
                                className="w-9 h-9 rounded-full object-cover shadow-sm bg-muted ring-1 ring-black/5"
                              />
                              {selectedAgents.has(agent.id) && (
                                <div className="absolute -right-1 -bottom-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background animate-in zoom-in-50 duration-200">
                                  <Check className="w-2 h-2 stroke-[4]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <h4 className="text-[13px] font-bold truncate group-hover:text-primary transition-colors leading-tight">
                                    {presenter.agents.getAgentName(agent.id)}
                                  </h4>
                                  <div
                                    className="shrink-0 flex items-center gap-0.5 px-1 rounded bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(agent.id);
                                      // 简单提示
                                    }}
                                  >
                                    <span className="text-[8px] font-mono text-muted-foreground/50">
                                      {agent.id.slice(0, 8)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate opacity-70 mt-0.5">
                                {agent.personality || "AI Assistant"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* 右侧：已选择预览区 */}
          <div className="w-[300px] bg-muted/10 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b bg-background/20">
              <h3 className="text-sm font-bold flex items-center gap-2">
                已选中
                {selectedAgents.size > 0 && (
                  <Badge variant="default" className="h-5 px-1.5 min-w-[20px] justify-center">
                    {selectedAgents.size}
                  </Badge>
                )}
              </h3>
              {selectedAgents.size > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={handleClearAll}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {selectedList.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 mx-auto flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground/20" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      从左侧选择需要<br />加入讨论的 AI 成员
                    </p>
                  </div>
                ) : (
                  selectedList.map(agent => (
                    <div
                      key={agent.id}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-background/80 transition-all animate-in slide-in-from-right-2 duration-200"
                    >
                      <img
                        src={presenter.agents.getAgentAvatar(agent.id)}
                        alt={agent.id}
                        className="w-8 h-8 rounded-full bg-muted object-cover"
                      />
                      <span className="flex-1 text-sm font-medium truncate">
                        {presenter.agents.getAgentName(agent.id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleAgentToggle(agent.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-background/40 backdrop-blur-sm">
              <Button
                className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleConfirm}
                disabled={selectedAgents.size === 0}
              >
                确认添加 {selectedAgents.size > 0 && `(${selectedAgents.size})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
