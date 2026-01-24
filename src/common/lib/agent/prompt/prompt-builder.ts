import { IAgentConfig } from "@/common/types/agent-config";
import { ChatMessage } from "@/common/lib/ai-service";
import { Capability } from "@/common/lib/capabilities";
import { AgentDef } from "@/common/types/agent";
import { AgentMessage, NormalMessage } from "@/common/types/discussion";
import {
  createRolePrompt,
  formatMessage,
  generateCapabilityPrompt,
} from "./prompts";

export class PromptBuilder {
  buildPrompt(context: {
    currentAgent: AgentDef;
    currentAgentConfig: IAgentConfig;
    agents: AgentDef[];
    messages: AgentMessage[];
    triggerMessage?: NormalMessage;
    capabilities: Capability[];
    discussionNote?: string;
  }): ChatMessage[] {
    const {
      currentAgent,
      currentAgentConfig,
      agents,
      messages,
      capabilities,
    } = context;
    const canUseActions = Boolean(currentAgentConfig.canUseActions);
    const systemPromptList = [
      createRolePrompt(currentAgent, agents),
      canUseActions
        ? generateCapabilityPrompt(capabilities, { role: currentAgent.role })
        : "",
    ].filter(Boolean);
    const note = context.discussionNote?.trim();
    if (note) {
      systemPromptList.push(`【共享笔记】\n${note}`);
    }

    const systemPrompt = systemPromptList.join("\n\n");

    const getAgentName = (agentId: string) => {
      const agent = agents.find((agent) => agent.id === agentId);
      return agent?.name ?? agentId;
    };

    // 处理历史消息，使用公式：最终消息条数 = min(c, max(a+1,b))
    const MAX_CHARS = 20000; // 最大字符数限制
    const messageCountThreshold = currentAgentConfig.conversation?.contextMessages ?? 10; // b: 消息条数阈值
    
    // 先格式化所有消息
    const formattedMessages = messages
      .map((msg) => {
        if (msg.type !== "text") {
          return null;
        }
        return {
          role: "user" as const,
          content: formatMessage(
            (msg as NormalMessage).content,
            msg.agentId === currentAgentConfig.agentId,
            getAgentName(msg.agentId)
          ),
        };
      })
      .filter(Boolean) as ChatMessage[];
    
    // c: 实际消息总条数
    const totalMessageCount = formattedMessages.length;
    
    // 计算在不超过字符阈值前提下能包含的最大消息数量 a
    let charCount = 0;
    let messagesWithinCharLimit = 0; // a
    
    // 从最近的消息开始计算
    for (let i = formattedMessages.length - 1; i >= 0; i--) {
      const msgLength = formattedMessages[i].content.length;
      if (charCount + msgLength <= MAX_CHARS) {
        charCount += msgLength;
        messagesWithinCharLimit++;
      } else {
        break;
      }
    }
    
    // 应用公式：最终消息条数 = min(c, max(a+1,b))
    const finalMessageCount = Math.min(
      totalMessageCount, // c
      Math.max(messagesWithinCharLimit + 1, messageCountThreshold) // max(a+1,b)
    );
    
    // 获取最终的消息列表
    const chatMessages = formattedMessages.slice(-finalMessageCount);

    return [{ role: "system", content: systemPrompt }, ...chatMessages];
  }
}
