import { AgentForm } from "@/common/features/agents/components/forms";
import { ModernAgentCard } from "@/common/features/agents/components/cards/modern-agent-card";
import { PageContainer } from "@/common/components/layout/page-container";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { useAgentForm } from "@/core/hooks/useAgentForm";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { AgentDef } from "@/common/types/agent";
import { Sparkles, Users } from "lucide-react";
import match from "pinyin-match";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleBadge } from "@/common/components/common/role-badge";

export function AgentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("");
  
  const presenter = usePresenter();
  const { agents, isLoading } = useAgents();
  const {
    isFormOpen,
    setIsFormOpen,
    editingAgent,
    handleSubmit,
  } = useAgentForm(agents, presenter.agents.update);

  // 处理查看智能体详情
  const handleViewAgent = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  // 处理 AI 编辑智能体
  const handleEditAgentWithAI = useCallback((agent: AgentDef) => {
    navigate(`/agents/${agent.id}?tab=ai-create`);
  }, [navigate]);

  // 获取所有角色和专长用于筛选
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    agents.forEach(agent => {
      if (agent.role) roles.add(agent.role);
    });
    return Array.from(roles);
  }, [agents]);

  const allExpertises = useMemo(() => {
    const expertises = new Set<string>();
    agents.forEach(agent => {
      if (agent.expertise) {
        agent.expertise.forEach(exp => expertises.add(exp));
      }
    });
    return Array.from(expertises);
  }, [agents]);

  // 过滤agents
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agent) => {
        const nameMatch = agent.name?.toLowerCase().includes(query) || 
                         (agent.name ? match.match(agent.name, query) : false);
        const personalityMatch = agent.personality?.toLowerCase().includes(query) || 
                                (agent.personality ? match.match(agent.personality, query) : false);
        const idMatch = agent.id?.toLowerCase().includes(query) || false;
        return nameMatch || personalityMatch || idMatch;
      });
    }

    // 角色过滤
    if (selectedRole) {
      filtered = filtered.filter(agent => agent.role === selectedRole);
    }

    // 专长过滤
    if (selectedExpertise) {
      filtered = filtered.filter(agent => 
        agent.expertise?.some(exp => exp === selectedExpertise)
      );
    }

    return filtered;
  }, [agents, searchQuery, selectedRole, selectedExpertise]);

  // 渲染网格布局
  const renderGridLayout = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAgents.map((agent) => (
          <ModernAgentCard
            key={agent.id}
            agent={agent}
            variant="default"
            onEditWithAI={handleEditAgentWithAI}
            onDelete={presenter.agents.remove}
            onView={handleViewAgent}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );

  // 渲染列表布局
  const renderListLayout = () => (
    <div className="w-full">
      <div className="space-y-4 p-6">
        {filteredAgents.map((agent) => (
          <ModernAgentCard
            key={agent.id}
            agent={agent}
            variant="compact"
            onEditWithAI={handleEditAgentWithAI}
            onDelete={presenter.agents.remove}
            onView={handleViewAgent}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );

  // 筛选器组件
  const renderFilters = () => (
    <div className="flex flex-wrap gap-2">
      {/* 角色筛选 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">角色:</span>
        <div className="flex gap-1">
          <Badge
            variant={selectedRole === "" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setSelectedRole("")}
          >
            全部
          </Badge>
          {allRoles.map(role => (
            <Badge
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
              onClick={() => setSelectedRole(role)}
            >
              <RoleBadge 
                role={role} 
                size="sm"
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* 专长筛选 */}
      {allExpertises.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">专长:</span>
          <div className="flex gap-1">
            <Badge
              variant={selectedExpertise === "" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setSelectedExpertise("")}
            >
              全部
            </Badge>
            {allExpertises.slice(0, 5).map(expertise => (
              <Badge
                key={expertise}
                variant={selectedExpertise === expertise ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setSelectedExpertise(expertise)}
              >
                {expertise}
              </Badge>
            ))}
            {allExpertises.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{allExpertises.length - 5}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PageContainer
      title="AI 智能体管理"
      description="创建、管理和配置您的AI智能体，打造专属的智能团队"
      searchPlaceholder="搜索智能体名称、性格特征..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      primaryAction={{
        label: "创建智能体",
        icon: <Sparkles className="w-4 h-4" />,
        onClick: () => presenter.agents.addDefault(),
        disabled: isLoading
      }}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      filters={renderFilters()}
      showSearch={true}
      showFilters={true}
      showViewToggle={true}
    >
      {/* 统计信息 */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>总计: {agents.length} 个智能体</span>
          </div>
          <div className="flex items-center gap-2">
            <span>主持人: {agents.filter(a => a.role === "moderator").length} 个</span>
          </div>
          <div className="flex items-center gap-2">
            <span>参与者: {agents.filter(a => a.role === "participant").length} 个</span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载智能体中...</p>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">暂无智能体</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedRole || selectedExpertise 
                ? "没有找到匹配的智能体，请尝试调整搜索条件"
                : "开始创建您的第一个AI智能体吧！"
              }
            </p>
            {!searchQuery && !selectedRole && !selectedExpertise && (
              <Button onClick={() => presenter.agents.addDefault()} className="gap-2">
                <Sparkles className="w-4 h-4" />
                创建智能体
              </Button>
            )}
          </div>
        </div>
      ) : (
        viewMode === "grid" ? renderGridLayout() : renderListLayout()
      )}

      {/* Agent表单 */}
      <AgentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </PageContainer>
  );
}
