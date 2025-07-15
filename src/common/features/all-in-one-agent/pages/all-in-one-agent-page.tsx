import { AgentDef } from "@/common/types/agent";
import { WorldClassChatContainer } from "@/common/components/world-class-chat";
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { getCurrentTimeTool } from "../components/agent-tools/get-current-time.tool";
import { calculatorTool, weatherTool } from "../components/agent-tools";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";

const AGENT_DEF: AgentDef = {
  id: "atlas-all-in-one",
  name: "Atlas 超级智能体",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Atlas",
  prompt: "你是世界级的超级智能助手，极致体验，极致能力。",
  role: "participant",
  personality: "极致智能、极致体验",
  expertise: ["全局控制", "AI助手", "系统管理"],
  bias: "中立",
  responseStyle: "专业、友好",
};

// 示例工具集合
const EXAMPLE_TOOLS: AgentTool[] = [
  getCurrentTimeTool,
  weatherTool,
  calculatorTool,
];

export function AllInOneAgentPage() {
  useProvideAgentTools(EXAMPLE_TOOLS);
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    }}>
      <WorldClassChatContainer agentDef={AGENT_DEF} tools={EXAMPLE_TOOLS} />
    </div>
  );
}

export default AllInOneAgentPage; 