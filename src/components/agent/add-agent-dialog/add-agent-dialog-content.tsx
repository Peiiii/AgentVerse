import { AgentForm } from "@/components/agent/agent-form";
import { AgentList } from "@/components/agent/agent-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAgentForm } from "@/hooks/useAgentForm";
import { useAgents } from "@/hooks/useAgents";
import { Loader2, PlusCircle, Search } from "lucide-react";
import match from "pinyin-match";
import { useMemo, useState } from "react";

export function AddAgentDialogContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { agents, isLoading, addAgent, updateAgent, deleteAgent } = useAgents();
  const {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleEditAgent,
    handleSubmit,
  } = useAgentForm(agents, updateAgent);

  // 使用 useMemo 优化搜索过滤逻辑
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents;
    }

    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => {
      // 支持名称、个性和拼音匹配
      const nameMatch =
        agent.name.toLowerCase().includes(query) ||
        match.match(agent.name, query);
      const personalityMatch =
        agent.personality.toLowerCase().includes(query) ||
        match.match(agent.personality, query);

      return nameMatch || personalityMatch;
    });
  }, [agents, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* 固定的头部搜索区域 */}
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="搜索 Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/20 border-border/50 focus:bg-background/60"
            />
          </div>
          <Button
            onClick={addAgent}
            variant="default"
            size="sm"
            disabled={isLoading}
            className="h-9 px-4 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4 mr-2" />
            )}
            添加 Agent
          </Button>
        </div>
      </div>

      {/* 可滚动的内容区域 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          <AgentList
            agents={filteredAgents}
            loading={isLoading}
            onEditAgent={handleEditAgent}
            onDeleteAgent={deleteAgent}
          />
        </div>
      </div>

      <AgentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </div>
  );
} 