import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";
import {
  WorldClassChatContainer,
  WorldClassChatContainerRef,
} from "@/common/features/world-class-chat";
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@/core/hooks/use-i18n";
import { calculatorTool, weatherTool } from "../components/agent-tools";
import { createClearSuggestionsTool } from "../components/agent-tools/clear-suggestions.tool";
import { fileSystemTool } from "../components/agent-tools/file-system.tool";
import { getCurrentTimeTool } from "../components/agent-tools/get-current-time.tool";
import { createHtmlPreviewFromFileTool } from "../components/agent-tools/html-preview-from-file.tool";
import { createProvideNextStepsTool } from "../components/agent-tools/provide-next-steps.tool";
import { createRecommendTopicsTool } from "../components/agent-tools/recommend-topics.tool";
import { createRequestUserChoiceTool } from "../components/agent-tools/request-user-choice.tool";
import { createSendMessageToIframeTool } from "../components/agent-tools/send-message-to-iframe.tool";
import { createSubscribeIframeMessagesTool } from "../components/agent-tools/subscribe-iframe-messages.tool";

export function AllInOneAgentPage() {
  const { t } = useTranslation();
  const chatRef = useRef<WorldClassChatContainerRef>(null);
  
  const AGENT_DEF: AgentDef = useMemo(() => ({
    id: "atlas-all-in-one",
    name: t("allInOneAgent.name"),
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Atlas",
    prompt: t("allInOneAgent.prompt"),
    role: "participant",
    personality: t("allInOneAgent.personality"),
    expertise: [
      t("allInOneAgent.expertise.globalControl"),
      t("allInOneAgent.expertise.aiAssistant"),
      t("allInOneAgent.expertise.systemManagement"),
    ],
    bias: t("allInOneAgent.bias"),
    responseStyle: t("allInOneAgent.responseStyle"),
  }), [t]);

  // 默认的 suggestions
  const DEFAULT_SUGGESTIONS: Suggestion[] = useMemo(() => [
    {
      id: "1",
      type: "question",
      actionName: t("allInOneAgent.suggestions.whatCanYouDo"),
      content: t("allInOneAgent.suggestions.whatCanYouDo"),
    },
    { 
      id: "2", 
      type: "action", 
      actionName: t("allInOneAgent.suggestions.clearChat"), 
      content: t("allInOneAgent.suggestions.clearChat") 
    },
    {
      id: "3",
      type: "question",
      actionName: t("allInOneAgent.suggestions.summarizeToday"),
      content: t("allInOneAgent.suggestions.summarizeToday"),
    },
    {
      id: "4",
      type: "question",
      actionName: t("allInOneAgent.suggestions.recommendTools"),
      content: t("allInOneAgent.suggestions.recommendTools"),
    },
  ], [t]);

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
        () => chatRef.current?.iframeManager || null,
        () => chatRef.current?.addMessages || null
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
