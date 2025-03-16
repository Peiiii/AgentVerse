import { useState } from "react";
import {
  AgentCombinationType,
  MODERATOR_IDS,
  MODERATORS_MAP,
  PARTICIPANT_IDS,
  PARTICIPANTS_MAP,
} from "../../config/agents/index";
import { Agent } from "../../types/agent";
import {
  AddAgentDialog,
  AgentCard,
  AgentChatCard,
  AgentCombinationList,
  AgentGroupCard,
  AgentList,
  AgentSelectCard,
  AgentSelectList,
  EditAgentDialog,
} from "../agent";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function AgentSystemDemo() {
  // 示例Agent数据
  const exampleAgent: Agent = {
    id: "example-agent-1",
    name: "量子概率顾问",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=quantum-advisor",
    prompt: "你是一位量子概率顾问，专精于应用量子思维解决现实问题...",
    role: "participant",
    personality: "好奇、开放、思维跳跃",
    expertise: ["量子思维", "概率分析", "决策理论", "系统思考"],
    bias: "倾向于看到多种可能性而非单一答案",
    responseStyle: "科学与哲学并重，使用概率语言，提供多元视角",
  };

  // 示例Agent列表
  const exampleAgents: Agent[] = [
    {
      id: PARTICIPANT_IDS.QUANTUM_ADVISOR,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.QUANTUM_ADVISOR],
    },
    {
      id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE],
    },
    {
      id: PARTICIPANT_IDS.EMOTION_METEOROLOGIST,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.EMOTION_METEOROLOGIST],
    },
    {
      id: MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR,
      ...MODERATORS_MAP[MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR],
    },
  ];

  // 示例组合
  const exampleCombinations = [
    {
      type: "cognitiveTeam" as AgentCombinationType,
      name: "认知融合团队",
      description: "专注于概念转化和模式识别的高级思维团队",
      moderator: {
        id: MODERATOR_IDS.THINKING_MODERATOR,
        ...MODERATORS_MAP[MODERATOR_IDS.THINKING_MODERATOR],
      },
      participants: [
        {
          id: PARTICIPANT_IDS.CONCEPT_ALCHEMIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.CONCEPT_ALCHEMIST],
        },
        {
          id: PARTICIPANT_IDS.PATTERN_LINGUIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.PATTERN_LINGUIST],
        },
        {
          id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE],
        },
      ],
    },
    {
      type: "emotionalDecision" as AgentCombinationType,
      name: "情感决策团队",
      description: "结合情感智能和决策分析的专业团队",
      moderator: {
        id: MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR,
        ...MODERATORS_MAP[MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR],
      },
      participants: [
        {
          id: PARTICIPANT_IDS.EMOTION_METEOROLOGIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.EMOTION_METEOROLOGIST],
        },
        {
          id: PARTICIPANT_IDS.DECISION_GARDENER,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.DECISION_GARDENER],
        },
      ],
    },
  ];

  // 状态
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  // 处理Agent选择
  const handleAgentSelect = (agent: Agent, selected: boolean) => {
    if (selected) {
      setSelectedAgentIds((prev) => [...prev, agent.id]);
    } else {
      setSelectedAgentIds((prev) => prev.filter((id) => id !== agent.id));
    }
  };

  // 处理组合选择
  const handleCombinationSelect = (type: AgentCombinationType) => {
    alert(`选择了组合: ${type}`);
  };

  // 对话框钩子
  const { openAddAgentDialog } = AddAgentDialog.useAddAgentDialog();
  const { openEditAgentDialog } = EditAgentDialog.useEditAgentDialog();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Agent组件系统示例</h1>

      <Tabs defaultValue="cards">
        <TabsList className="mb-4">
          <TabsTrigger value="cards">卡片组件</TabsTrigger>
          <TabsTrigger value="lists">列表组件</TabsTrigger>
          <TabsTrigger value="dialogs">对话框</TabsTrigger>
        </TabsList>

        {/* 卡片组件 */}
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>基础卡片</CardTitle>
                <CardDescription>AgentCard组件的三种模式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">预览模式</h3>
                  <AgentCard
                    agent={exampleAgent}
                    mode="preview"
                    description="这是一个Agent的简要描述"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">详情模式</h3>
                  <AgentCard
                    agent={exampleAgent}
                    mode="detail"
                    defaultExpanded={false}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">管理模式</h3>
                  <AgentCard
                    agent={exampleAgent}
                    mode="management"
                    onEdit={() => alert("编辑Agent")}
                    onDelete={() => alert("删除Agent")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>选择卡片</CardTitle>
                <CardDescription>AgentSelectCard组件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">未选择状态</h3>
                  <AgentSelectCard
                    agent={exampleAgent}
                    selected={false}
                    onSelect={(_, selected) =>
                      alert(`选择状态: ${selected}`)
                    }
                    description="可选择的Agent卡片"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">已选择状态</h3>
                  <AgentSelectCard
                    agent={exampleAgent}
                    selected={true}
                    onSelect={(_, selected) =>
                      alert(`选择状态: ${selected}`)
                    }
                    description="已选择的Agent卡片"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">禁用状态</h3>
                  <AgentSelectCard
                    agent={exampleAgent}
                    disabled={true}
                    onSelect={(_, selected) => alert(`选择状态: ${selected}`)}
                    description="禁用的Agent卡片"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>聊天卡片</CardTitle>
                <CardDescription>AgentChatCard组件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">活跃状态</h3>
                  <AgentChatCard
                    agent={exampleAgent}
                    isActive={true}
                    lastMessage="这是最后一条消息的预览..."
                    unreadCount={3}
                    timestamp={new Date()}
                    onClick={() => alert("点击聊天卡片")}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">非活跃状态</h3>
                  <AgentChatCard
                    agent={exampleAgent}
                    isActive={false}
                    lastMessage="这是另一条消息的预览..."
                    timestamp={new Date(Date.now() - 3600000)}
                    onClick={() => alert("点击聊天卡片")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>组合卡片</CardTitle>
                <CardDescription>AgentGroupCard组件</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentGroupCard
                  name="认知融合团队"
                  description="专注于概念转化和模式识别的高级思维团队"
                  moderator={{
                    id: MODERATOR_IDS.THINKING_MODERATOR,
                    ...MODERATORS_MAP[MODERATOR_IDS.THINKING_MODERATOR],
                  }}
                  participants={[
                    {
                      id: PARTICIPANT_IDS.CONCEPT_ALCHEMIST,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.CONCEPT_ALCHEMIST],
                    },
                    {
                      id: PARTICIPANT_IDS.PATTERN_LINGUIST,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.PATTERN_LINGUIST],
                    },
                    {
                      id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE],
                    },
                  ]}
                  onClick={() => alert("选择组合")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 列表组件 */}
        <TabsContent value="lists">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent列表</CardTitle>
                <CardDescription>AgentList组件</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentList
                  agents={exampleAgents}
                  loading={false}
                  onEditAgent={(agent) => alert(`编辑Agent: ${agent.name}`)}
                  onDeleteAgent={(id) => alert(`删除Agent ID: ${id}`)}
                  cardMode="management"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent选择列表</CardTitle>
                <CardDescription>AgentSelectList组件</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentSelectList
                  agents={exampleAgents}
                  selectedIds={selectedAgentIds}
                  onSelect={handleAgentSelect}
                  showSearch={true}
                  searchPlaceholder="搜索Agent..."
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>组合列表</CardTitle>
                <CardDescription>AgentCombinationList组件</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentCombinationList
                  combinations={exampleCombinations}
                  onSelect={handleCombinationSelect}
                  columns={2}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 对话框 */}
        <TabsContent value="dialogs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>添加Agent对话框</CardTitle>
                <CardDescription>AddAgentDialog组件</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={openAddAgentDialog}>
                  打开添加Agent对话框
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>编辑Agent对话框</CardTitle>
                <CardDescription>EditAgentDialog组件</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => openEditAgentDialog(exampleAgent)}>
                  打开编辑Agent对话框
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
