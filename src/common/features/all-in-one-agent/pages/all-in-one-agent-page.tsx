import {
  WorldClassChatContainer,
  WorldClassChatContainerRef,
} from "@/common/components/world-class-chat";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { useMemo, useRef, useEffect } from "react";
import { calculatorTool, weatherTool } from "../components/agent-tools";
import { fileSystemTool } from "../components/agent-tools/file-system.tool";
import { getCurrentTimeTool } from "../components/agent-tools/get-current-time.tool";
import { createHtmlPreviewFromFileTool } from "../components/agent-tools/html-preview-from-file.tool";
import { createSubscribeIframeMessagesTool } from "../components/agent-tools/subscribe-iframe-messages.tool";
import { createSendMessageToIframeTool } from "../components/agent-tools/send-message-to-iframe.tool";
import { createRequestUserChoiceTool } from "../components/agent-tools/request-user-choice.tool";
import { createRecommendTopicsTool } from "../components/agent-tools/recommend-topics.tool";
import { createProvideNextStepsTool } from "../components/agent-tools/provide-next-steps.tool";
import { createClearSuggestionsTool } from "../components/agent-tools/clear-suggestions.tool";

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

// 默认的 suggestions
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: "1",
    type: "question",
    actionName: "你能做什么？",
    content: "你能做什么？",
  },
  { 
    id: "2", 
    type: "action", 
    actionName: "清空对话", 
    content: "清空对话" 
  },
  {
    id: "3",
    type: "question",
    actionName: "帮我总结一下今天的工作",
    content: "帮我总结一下今天的工作",
  },
  {
    id: "4",
    type: "question",
    actionName: "推荐几个提升效率的AI工具",
    content: "推荐几个提升效率的AI工具",
  },
];

export function AllInOneAgentPage() {
  const chatRef = useRef<WorldClassChatContainerRef>(null);
  
  // 创建 HTML 预览工具
  const htmlPreviewFromFileTool = useMemo(
    () =>
      createHtmlPreviewFromFileTool(
        (key, config, props) =>
          chatRef.current?.openCustomPanel(key, config, props) || null,
        () => chatRef.current?.iframeManager || null
      ),
    []
  );

  // 创建 iframe 消息订阅工具
  const subscribeIframeMessagesTool = useMemo(
    () =>
      createSubscribeIframeMessagesTool(
        () => chatRef.current?.iframeManager || null
      ),
    []
  );

  // 创建 iframe 消息发送工具
  const sendMessageToIframeTool = useMemo(
    () =>
      createSendMessageToIframeTool(
        () => chatRef.current?.iframeManager || null
      ),
    []
  );

  // 创建建议管理工具
  const requestUserChoiceTool = useMemo(
    () => createRequestUserChoiceTool(() => chatRef.current?.suggestionsManager || null),
    []
  );

  const recommendTopicsTool = useMemo(
    () => createRecommendTopicsTool(() => chatRef.current?.suggestionsManager || null),
    []
  );

  const provideNextStepsTool = useMemo(
    () => createProvideNextStepsTool(() => chatRef.current?.suggestionsManager || null),
    []
  );

  const clearSuggestionsTool = useMemo(
    () => createClearSuggestionsTool(() => chatRef.current?.suggestionsManager || null),
    []
  );

  // 基础工具列表
  const baseTools: AgentTool[] = useMemo(
    () => [
      getCurrentTimeTool,
      weatherTool,
      calculatorTool,
      fileSystemTool,
      htmlPreviewFromFileTool,
      subscribeIframeMessagesTool,
      sendMessageToIframeTool,
      requestUserChoiceTool,
      recommendTopicsTool,
      provideNextStepsTool,
      clearSuggestionsTool,
    ],
    [htmlPreviewFromFileTool, subscribeIframeMessagesTool, sendMessageToIframeTool, requestUserChoiceTool, recommendTopicsTool, provideNextStepsTool, clearSuggestionsTool]
  );

  // 提供工具给 agent
  useProvideAgentTools(baseTools);

  // 处理 suggestions 管理
  useEffect(() => {
    if (chatRef.current) {
      // 这里可以添加动态 suggestions 管理逻辑
      // 例如：根据对话内容动态添加相关建议
      // 或者：根据用户行为模式调整建议
      // const { suggestionsManager } = chatRef.current;
    }
  }, []);

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
        initialSuggestions={DEFAULT_SUGGESTIONS}
      />
    </div>
  );
}

export default AllInOneAgentPage;
