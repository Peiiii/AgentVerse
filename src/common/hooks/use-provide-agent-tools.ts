import {
  useProvideAgentToolDefs,
  useProvideAgentToolExecutors,
  useProvideAgentToolRenderers,
} from '@agent-labs/agent-chat'
import type { ToolDefinition, ToolExecutor, ToolRenderer } from '@agent-labs/agent-chat'

export interface AgentTool extends ToolDefinition {
  execute?: ToolExecutor
  render?: ToolRenderer['render']
}

export function useProvideAgentTools(agentTools: AgentTool[]) {
  // 提取工具定义 - 直接使用，因为 AgentTool 继承了 ToolDefinition
  const toolDefinitions: ToolDefinition[] = agentTools

  // 提取工具执行器
  const toolExecutors: Record<string, ToolExecutor> = Object.fromEntries(
    agentTools
      .filter(agentTool => agentTool.execute)
      .map(agentTool => [agentTool.name, agentTool.execute!])
  )

  // 提取工具渲染器
  const toolRenderers: ToolRenderer[] = agentTools
    .filter(agentTool => agentTool.render)
    .map(agentTool => ({
      render: agentTool.render!,
      definition: agentTool, // 直接使用 agentTool，因为它已经是 ToolDefinition
    }))

  // 调用原始 hooks
  useProvideAgentToolDefs(toolDefinitions)
  useProvideAgentToolExecutors(toolExecutors)
  useProvideAgentToolRenderers(toolRenderers)
} 