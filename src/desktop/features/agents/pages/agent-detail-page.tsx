import { AgentEmbeddedForm } from "@/common/features/agents/components/forms";
import { AgentConfigurationAssistant } from "@/common/features/agents/components/configuration";
import { AgentPreviewChat } from "@/common/features/agents/components/preview";
// Avatar primitives are not used directly here
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useEffectFromObservable, useObservableFromState } from "@/common/lib/rx-state";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { isEqual } from "lodash-es";
import { ArrowLeft, Bot, Edit3, Settings, Sparkles, Wand2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { combineLatest, distinctUntilChanged, filter, map, take, tap } from "rxjs";
import { useAgentChatPageHelper } from "@/core/hooks/use-agent-chat-page-helper";

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presenter = usePresenter();
  const { agents } = useAgents();

  const { enterAgentChat } = useAgentChatPageHelper();

  const [agent, setAgent] = useState<AgentDef | null>(null);
  const initialTab = (searchParams.get("tab") as "configure" | "ai-create" | null) || "ai-create";
  const [sidebarTab, setSidebarTab] = useState<"configure" | "ai-create">(initialTab);

  // 所有回调函数必须在条件返回之前定义
  const handleAgentUpdate = useCallback((updatedAgentData: Omit<AgentDef, "id">) => {
    if (!agent) return;

    const updatedAgent = { ...updatedAgentData, id: agent.id };
    setAgent(updatedAgent);
    presenter.agents.update(agent.id, updatedAgentData);
  }, [agent, presenter]);

  // 查找当前agent
  const agentId$ = useObservableFromState(agentId);
  const agents$ = useObservableFromState(agents);
  useEffectFromObservable(() => combineLatest([agentId$, agents$]).pipe(
    map(([aId, aList]) => {
      return aList.find(a => a.id === aId);
    }),
    filter(Boolean),
    distinctUntilChanged((pre, cur) => isEqual(pre, cur)),
    tap((agent) => {
      setAgent(agent);
    }),
    take(1)
  ), () => {})

  // 一键和TA对话逻辑
  const handleChatWithAgent = useCallback(async () => {
    if (!agent) return;
    await enterAgentChat(agent);
  }, [agent, enterAgentChat]);

  // 如果agent未找到，显示错误页面
  if (!agentId || !agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">智能体未找到</h2>
          <p className="text-muted-foreground mb-4">请检查链接是否正确或返回智能体列表</p>
          <Button onClick={() => navigate("/agents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回智能体列表
          </Button>
        </div>
      </div>
    );
  }

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "moderator":
        return {
          icon: Bot,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/50",
          borderColor: "border-amber-200 dark:border-amber-800",
          label: "主持人"
        };
      case "participant":
        return {
          icon: Bot,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
          borderColor: "border-emerald-200 dark:border-emerald-800",
          label: "参与者"
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "智能体"
        };
    }
  };

  const roleConfig = getRoleConfig(agent.role);

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* 左侧设置区 - 统一使用50%宽度 */}
      <div className="w-1/2 border-r flex flex-col">
        {/* 左侧头部 - 配置导向 */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/agents")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative">
                <SmartAvatar
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-12 h-12 ring-2 ring-primary/20 shadow-lg"
                  fallback={<span className="bg-gradient-to-br from-primary/20 to-primary/40">{agent.name?.[0] || "?"}</span>}
                />
                <div className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-background",
                  roleConfig.bgColor
                )}>
                  <roleConfig.icon className={cn("w-2.5 h-2.5", roleConfig.color)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {agent.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 mt-1",
                    roleConfig.borderColor,
                    roleConfig.bgColor,
                    roleConfig.color
                  )}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  配置中心
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleChatWithAgent}
              >
                <Bot className="w-4 h-4 mr-1" />
                和TA对话
              </Button>
            </div>
          </div>

          <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as "configure" | "ai-create")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configure" className="text-xs gap-1">
                <Settings className="w-3 h-3" />
                手动配置
              </TabsTrigger>
              <TabsTrigger value="ai-create" className="text-xs gap-1">
                <Wand2 className="w-3 h-3" />
                AI创建
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 内容区 - 简洁的背景 */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <Tabs value={sidebarTab} className="h-full">
            <TabsContent value="configure" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {/* 添加一个温暖的卡片容器 */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">智能体配置</h3>
                        <p className="text-sm text-muted-foreground">详细设置智能体的各项属性和行为特征</p>
                      </div>
                    </div>
                    <AgentEmbeddedForm
                      onSubmit={handleAgentUpdate}
                      initialData={agent}
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai-create" className="h-full m-0">
              <AgentConfigurationAssistant
                onAgentCreate={handleAgentUpdate}
                className="h-full" 
                editingAgent={agent}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧智能体预览聊天区 */}
      <AgentPreviewChat
        className="w-1/2"
        agentDef={agent}
      />
    </div>
  );
} 
