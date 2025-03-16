import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AgentCard, 
  AgentSelectCard, 
  AgentChatCard, 
  AgentGroupCard 
} from "@/components/agent/cards";
import {
  AgentSelectList,
  AgentCombinationList
} from "@/components/agent/lists";
import { Agent } from "@/types/agent";
import { AgentCombinationType, PARTICIPANTS_MAP, MODERATORS_MAP, PARTICIPANT_IDS, MODERATOR_IDS } from "@/config/agents/index";

export function AgentCardSystemDemo() {
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
    responseStyle: "科学与哲学并重，使用概率语言，提供多元视角"
  };
  
  // 示例Agent列表
  const exampleAgents: Agent[] = [
    {
      id: PARTICIPANT_IDS.QUANTUM_ADVISOR,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.QUANTUM_ADVISOR]
    },
    {
      id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE]
    },
    {
      id: PARTICIPANT_IDS.EMOTION_METEOROLOGIST,
      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.EMOTION_METEOROLOGIST]
    },
    {
      id: MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR,
      ...MODERATORS_MAP[MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR]
    }
  ];
  
  // 示例组合
  const exampleCombinations = [
    {
      type: "cognitiveTeam" as AgentCombinationType,
      name: "认知融合团队",
      description: "专注于概念转化和模式识别的高级思维团队",
      moderator: {
        id: MODERATOR_IDS.THINKING_MODERATOR,
        ...MODERATORS_MAP[MODERATOR_IDS.THINKING_MODERATOR]
      },
      participants: [
        {
          id: PARTICIPANT_IDS.CONCEPT_ALCHEMIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.CONCEPT_ALCHEMIST]
        },
        {
          id: PARTICIPANT_IDS.PATTERN_LINGUIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.PATTERN_LINGUIST]
        },
        {
          id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE]
        }
      ]
    },
    {
      type: "emotionalDecision" as AgentCombinationType,
      name: "情感决策团队",
      description: "结合情感智能和决策分析的专业团队",
      moderator: {
        id: MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR,
        ...MODERATORS_MAP[MODERATOR_IDS.META_COGNITIVE_ORCHESTRATOR]
      },
      participants: [
        {
          id: PARTICIPANT_IDS.EMOTION_METEOROLOGIST,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.EMOTION_METEOROLOGIST]
        },
        {
          id: PARTICIPANT_IDS.DECISION_GARDENER,
          ...PARTICIPANTS_MAP[PARTICIPANT_IDS.DECISION_GARDENER]
        }
      ]
    }
  ];
  
  // 状态
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  
  // 处理Agent选择
  const handleAgentSelect = (agent: Agent, selected: boolean) => {
    if (selected) {
      setSelectedAgentIds(prev => [...prev, agent.id]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agent.id));
    }
  };
  
  // 处理组合选择
  const handleCombinationSelect = (type: string) => {
    alert(`选择了组合: ${type}`);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Agent卡片系统示例</h1>
      
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">基础卡片</TabsTrigger>
          <TabsTrigger value="select">选择卡片</TabsTrigger>
          <TabsTrigger value="chat">聊天卡片</TabsTrigger>
          <TabsTrigger value="group">组合卡片</TabsTrigger>
          <TabsTrigger value="lists">列表组件</TabsTrigger>
        </TabsList>
        
        {/* 基础卡片 */}
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>预览模式</CardTitle>
                <CardDescription>轻量级展示，适用于弹出框</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentCard
                  agent={exampleAgent}
                  mode="preview"
                  description="这是一个Agent的简要描述"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>详情模式</CardTitle>
                <CardDescription>可展开查看详情</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentCard
                  agent={exampleAgent}
                  mode="detail"
                  defaultExpanded={false}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>管理模式</CardTitle>
                <CardDescription>包含编辑和删除功能</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentCard
                  agent={exampleAgent}
                  mode="management"
                  onEdit={() => alert("编辑Agent")}
                  onDelete={() => alert("删除Agent")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* 选择卡片 */}
        <TabsContent value="select">
          <Card>
            <CardHeader>
              <CardTitle>选择卡片</CardTitle>
              <CardDescription>用于选择Agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgentSelectCard
                  agent={exampleAgent}
                  selected={false}
                  onSelect={(agent, selected) => alert(`选择状态: ${selected}`)}
                  description="可选择的Agent卡片"
                />
                
                <AgentSelectCard
                  agent={exampleAgent}
                  selected={true}
                  onSelect={(agent, selected) => alert(`选择状态: ${selected}`)}
                  description="已选择的Agent卡片"
                />
                
                <AgentSelectCard
                  agent={exampleAgent}
                  disabled={true}
                  onSelect={(agent, selected) => alert(`选择状态: ${selected}`)}
                  description="禁用的Agent卡片"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 聊天卡片 */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>聊天卡片</CardTitle>
              <CardDescription>用于聊天/讨论界面</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <AgentChatCard
                  agent={exampleAgent}
                  isActive={true}
                  lastMessage="这是最后一条消息的预览..."
                  unreadCount={3}
                  timestamp={new Date()}
                  onClick={() => alert("点击聊天卡片")}
                />
                
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
        </TabsContent>
        
        {/* 组合卡片 */}
        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>组合卡片</CardTitle>
              <CardDescription>用于展示Agent组合</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgentGroupCard
                  name="认知融合团队"
                  description="专注于概念转化和模式识别的高级思维团队"
                  moderator={{
                    id: MODERATOR_IDS.THINKING_MODERATOR,
                    ...MODERATORS_MAP[MODERATOR_IDS.THINKING_MODERATOR]
                  }}
                  participants={[
                    {
                      id: PARTICIPANT_IDS.CONCEPT_ALCHEMIST,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.CONCEPT_ALCHEMIST]
                    },
                    {
                      id: PARTICIPANT_IDS.PATTERN_LINGUIST,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.PATTERN_LINGUIST]
                    },
                    {
                      id: PARTICIPANT_IDS.COGNITIVE_DETECTIVE,
                      ...PARTICIPANTS_MAP[PARTICIPANT_IDS.COGNITIVE_DETECTIVE]
                    }
                  ]}
                  onClick={() => alert("选择组合")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 列表组件 */}
        <TabsContent value="lists">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent选择列表</CardTitle>
                <CardDescription>用于选择多个Agent</CardDescription>
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
            
            <Card>
              <CardHeader>
                <CardTitle>组合列表</CardTitle>
                <CardDescription>用于展示和选择Agent组合</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentCombinationList
                  combinations={exampleCombinations}
                  onSelect={handleCombinationSelect}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 