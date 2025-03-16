import React, { useState } from "react";
import { AgentCard } from "@/components/agent/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@/types/agent";
import { QUANTUM_ADVISOR } from "@/config/agents/top-agents/quantum-advisor";

// 示例Agent数据
const exampleAgent: Agent = {
  id: "example-agent-1",
  ...QUANTUM_ADVISOR
};

export function AgentCardExamples() {
  const [selectedAgent, setSelectedAgent] = useState(exampleAgent);
  
  const handleEdit = (agent: Agent) => {
    console.log("编辑Agent:", agent);
    alert(`编辑Agent: ${agent.name}`);
  };
  
  const handleDelete = (agentId: string) => {
    console.log("删除Agent:", agentId);
    alert(`删除Agent: ${agentId}`);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Agent卡片组件示例</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">预览模式</h2>
          <Card>
            <CardHeader>
              <CardTitle>预览模式</CardTitle>
              <CardDescription>
                轻量级展示，适用于弹出框和简要信息展示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md border rounded-lg overflow-hidden">
                <AgentCard
                  agent={selectedAgent}
                  mode="preview"
                  description="这是一个Agent的简要描述，展示基本信息和专长领域。"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">详情模式</h2>
          <Card>
            <CardHeader>
              <CardTitle>详情模式</CardTitle>
              <CardDescription>
                可展开查看详情，适用于详情页面
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl">
                <AgentCard
                  agent={selectedAgent}
                  mode="detail"
                  defaultExpanded={false}
                />
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setSelectedAgent(exampleAgent)}>
                  重置Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">管理模式</h2>
          <Card>
            <CardHeader>
              <CardTitle>管理模式</CardTitle>
              <CardDescription>
                包含编辑和删除功能，适用于管理页面
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl">
                <AgentCard
                  agent={selectedAgent}
                  mode="management"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setSelectedAgent(exampleAgent)}>
                  重置Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">使用说明</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              AgentCard组件是一个通用的Agent信息展示组件，支持三种模式：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>预览模式(preview)</strong>：轻量级展示，适用于弹出框和简要信息展示</li>
              <li><strong>详情模式(detail)</strong>：可展开查看详情，适用于详情页面</li>
              <li><strong>管理模式(management)</strong>：包含编辑和删除功能，适用于管理页面</li>
            </ul>
            <p className="mt-4">
              详细使用方法请参考 <code>src/components/agent/cards/README.md</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 