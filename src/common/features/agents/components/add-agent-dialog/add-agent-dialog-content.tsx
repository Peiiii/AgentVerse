import { AgentForm } from "@/common/features/agents/components/forms";
import { AgentList } from "@/common/features/agents/components/lists/agent-list";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useAgentForm } from "@/core/hooks/useAgentForm";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { Loader2, PlusCircle, Search } from "lucide-react";
import match from "pinyin-match";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AddAgentDialogContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const presenter = usePresenter();
  const { agents, isLoading } = useAgents();
  const {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleSubmit,
  } = useAgentForm(agents, presenter.agents.update);

  // 使用 useMemo 优化搜索过滤逻辑
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents;
    }

    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => {
      // 添加空值检查
      const nameMatch =
        (agent.name?.toLowerCase().includes(query) || false) ||
        (agent.name ? match.match(agent.name, query) : false);
      const personalityMatch =
        (agent.personality?.toLowerCase().includes(query) || false) ||
        (agent.personality ? match.match(agent.personality, query) : false);
      const idMatch = agent.id?.toLowerCase().includes(query) || false;

      return nameMatch || personalityMatch || idMatch;
    });
  }, [agents, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
            onClick={presenter.agents.addDefault}
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <AgentList
            agents={filteredAgents}
            loading={isLoading}
            onEditAgentWithAI={(agent) => {
              navigate(`/agents/${agent.id}?tab=ai-create`);
            }}
            onDeleteAgent={presenter.agents.remove}
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
