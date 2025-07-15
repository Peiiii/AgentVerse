import { AgentDef } from "@/common/types/agent";
import { WorldClassChatContainer } from "@/common/components/world-class-chat";

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

export function AllInOneAgentPage() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    }}>
      <WorldClassChatContainer agentDef={AGENT_DEF} />
    </div>
  );
}

export default AllInOneAgentPage; 