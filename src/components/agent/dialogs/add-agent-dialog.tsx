import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/components/ui/modal";
import { useBreakpointContext } from "@/components/common/breakpoint-provider";
import { useAgentForm } from "@/hooks/useAgentForm";
import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/common/lib/utils";
import { Loader2, PlusCircle, Search } from "lucide-react";
import match from "pinyin-match";
import { useCallback, useMemo, useState } from "react";
import { AgentForm } from "../agent-form";
import { AgentList } from "../lists/agent-list";

// 对话框内容组件
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
  
  const { isMobile } = useBreakpointContext();

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
        <div className={cn("flex items-center gap-4", isMobile ? "p-3" : "p-4")}>
          <div className="relative flex-1">
            <Search className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50",
              isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
            )} />
            <Input
              placeholder="搜索 Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 bg-muted/20 border-border/50 focus:bg-background/60",
                isMobile ? "h-8 text-sm" : "h-9"
              )}
            />
          </div>
          <Button
            onClick={addAgent}
            variant="default"
            size={isMobile ? "sm" : "default"}
            disabled={isLoading}
            className={cn(
              "px-4 shrink-0",
              isMobile ? "h-8 text-xs" : "h-9"
            )}
          >
            {isLoading ? (
              <Loader2 className={cn(
                "mr-2 animate-spin",
                isMobile ? "w-3 h-3" : "w-4 h-4"
              )} />
            ) : (
              <PlusCircle className={cn(
                "mr-2",
                isMobile ? "w-3 h-3" : "w-4 h-4"
              )} />
            )}
            添加 Agent
          </Button>
        </div>
      </div>

      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(isMobile ? "p-3" : "p-4")}>
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

// 钩子函数，用于打开对话框
export function useAddAgentDialog() {
  const modal = useModal();
  const { isMobile } = useBreakpointContext();

  const openAddAgentDialog = useCallback(() => {
    modal.show({
      title: "Agent 管理",
      content: <AddAgentDialogContent />,
      // 使用 className 来控制样式
      className: cn(
        "overflow-hidden",
        isMobile 
          ? "w-[95vw] h-[90vh]" 
          : "sm:max-w-3xl sm:h-[85vh]"
      ),
      // 不需要底部按钮
      showFooter: false
    });
  }, [modal, isMobile]);

  return {
    openAddAgentDialog
  };
}

// 导出组件
export const AddAgentDialog = {
  Content: AddAgentDialogContent,
  useAddAgentDialog
}; 