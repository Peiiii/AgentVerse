import {
  WorldClassChatContainer,
  WorldClassChatContainerRef,
} from "@/common/components/world-class-chat";
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { useMemo, useRef } from "react";
import { calculatorTool, weatherTool } from "../components/agent-tools";
import { fileSystemTool } from "../components/agent-tools/file-system.tool";
import { getCurrentTimeTool } from "../components/agent-tools/get-current-time.tool";
import { createHtmlPreviewFromFileTool } from "../components/agent-tools/html-preview-from-file.tool";

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
  const chatRef = useRef<WorldClassChatContainerRef>(null);
  const htmlPreviewFromFileTool = useMemo(
    () =>
      createHtmlPreviewFromFileTool((key, config, props) =>
        chatRef.current?.openCustomPanel(key, config, props)
      ),
    []
  );
  const tools: AgentTool[] = useMemo(
    () => [
      getCurrentTimeTool,
      weatherTool,
      calculatorTool,
      fileSystemTool,
      htmlPreviewFromFileTool,
    ],
    [htmlPreviewFromFileTool]
  );
  useProvideAgentTools(tools);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
      }}
    >
      <WorldClassChatContainer
        ref={chatRef}
        agentDef={AGENT_DEF}
        tools={tools}
      />
    </div>
  );
}

export default AllInOneAgentPage;
