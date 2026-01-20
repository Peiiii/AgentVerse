import { AgentChatInput, AgentChatMessages } from "@/common/features/chat/components/agent-chat";
import { AgentChatProviderWrapper } from "@/common/features/chat/components/agent-chat/agent-chat-provider-wrapper";
import { ChatWelcomeHeader } from "@/common/features/chat/components/chat-welcome-header";
import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { getLLMProviderConfig } from "@/core/config/ai";
import { useAgentChat } from "@agent-labs/agent-chat";
import {
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAgentConfigurationTools } from "./use-agent-configuration-tools";

interface AgentConfigurationAssistantProps {
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void;
  className?: string;
  editingAgent?: AgentDef;
}

function AgentConfigurationAssistantInner({ onAgentCreate, className, editingAgent }: AgentConfigurationAssistantProps) {
  // 使用拆分的工具Hook
  useAgentConfigurationTools(onAgentCreate, editingAgent);

  // 使用useMemo缓存agentCreatorDef，避免每次渲染重新创建
  const agentCreatorDef = useMemo((): Omit<AgentDef, "id"> => ({
    name: "Agent Creator",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=creator",
    prompt: `你是一个智能体定制助手，帮助用户通过对话创建专属AI智能体。

【你的目标】
- 用户只需一句话描述，AI应主动推断、自动补全、自动创建，无需用户多余操作。
- 如信息充足，直接调用 updateAgent 工具并自动确认创建，无需用户点击确认。
- 如需补充信息，一次性合并所有缺失项，给出建议值，尽量推断默认值，减少追问。
- 每次回复都要尽量输出完整的智能体配置预览，主动告知进度和补全内容。
- 避免重复、无效提问，始终推进创建流程。
- 支持用户一句话创建、极简交互。

【对话流程】
1. 用户一句话描述需求时，优先尝试直接创建并自动确认。
2. 信息不全时，合并追问所有缺失项，并给出建议。
3. 创建后，简洁确认并展示结果。

请用极简、主动的方式帮助用户"零操作"完成智能体创建。`,
    role: "participant",
    personality: "耐心、善于引导、专业",
    expertise: ["agent创建", "需求分析", "AI定制"],
    bias: "倾向于帮助用户明确需求并生成合适的agent配置",
    responseStyle: "简洁、结构化、引导式",
  }), []);

  // 使用useState缓存agent实例，避免无限重新创建
  const [agentCreatorAgent] = useState(() => {
    const { providerConfig } = getLLMProviderConfig();
    return new ExperimentalInBrowserAgent({
      ...agentCreatorDef,
      model: providerConfig.model,
      baseURL: providerConfig.baseUrl,
      apiKey: providerConfig.apiKey,
    });
  });

  const contexts = useMemo(() => [{
    description: "你的设定",
    value: JSON.stringify(agentCreatorDef),
  }], [agentCreatorDef]);

  const {
    uiMessages,
    isAgentResponding,
    sendMessage,
  } = useAgentChat({
    agent: agentCreatorAgent,
    defaultToolDefs: [], // 工具已由useAgentConfigurationTools注册
    defaultContexts: contexts,
  });

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      await sendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  // 创建自定义欢迎头部
  const customWelcomeHeader = (
    <ChatWelcomeHeader
      title="AI智能体创建助手"
      description="通过对话创建你的专属智能体。请告诉我你想要什么样的智能体？比如它的专业领域、性格特征和主要用途。"
      centerIcon={<Wand2 className="w-6 h-6" />}
      centerIconClassName="filter drop-shadow(0 0 8px rgba(255,255,255,0.8))"
      theme="magic"
      containerSize="md"
      showMagicCircles={true}
      showStarDecorations={true}
    />
  );

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <AgentChatMessages
        agent={{ id: "creator", ...agentCreatorDef }}
        uiMessages={uiMessages}
        isResponding={isAgentResponding}
        messageTheme="creator"
        avatarTheme="creator"
        emptyState={{
          title: "", // 不会被使用，因为有customWelcomeHeader
          description: "", // 不会被使用，因为有customWelcomeHeader
          customWelcomeHeader: customWelcomeHeader,
        }}
      />
      <AgentChatInput
        agent={{ id: "creator", ...agentCreatorDef }}
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        sendDisabled={isAgentResponding}
        customPlaceholder="描述你想要的智能体..."
        containerWidth="narrow"
      />
    </div>
  );
}

export function AgentConfigurationAssistant(props: AgentConfigurationAssistantProps) {
  return (
    <AgentChatProviderWrapper>
      <AgentConfigurationAssistantInner {...props} />
    </AgentChatProviderWrapper>
  );
} 
