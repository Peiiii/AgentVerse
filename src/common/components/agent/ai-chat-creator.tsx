import { useProvideAgentConfig } from "@/common/hooks/use-provide-agent-config";
import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import type { ToolCall, ToolDefinition } from "@agent-labs/agent-chat";
import { useAgentChat } from "@agent-labs/agent-chat";
import {
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AgentChatInput, AgentChatMessages } from "../chat/agent-chat";
import { ChatWelcomeHeader } from "../chat/chat-welcome-header";
import { AgentChatProviderWrapper } from "../chat/agent-chat/agent-chat-provider-wrapper";


interface AiChatCreatorProps {
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void;
  className?: string;
  editingAgent?: AgentDef;
}

function useAgentCreatorConfigHook(onAgentCreate: (agent: Omit<AgentDef, "id">) => void, editingAgent?: AgentDef) {
  // 定义agent编辑工具
  const agentEditTools: ToolDefinition[] = [
    {
      name: "updateAgent",
      description: "更新或创建智能体配置。当用户要求创建或修改智能体时使用此工具。",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "智能体的名称"
          },
          prompt: {
            type: "string",
            description: "智能体的系统提示词，定义其行为和角色"
          },
          personality: {
            type: "string",
            description: "智能体的性格特征，如友善、专业、幽默等"
          },
          role: {
            type: "string",
            enum: ["participant", "moderator"],
            description: "智能体的角色类型：participant（参与者）或moderator（主持人）"
          },
          expertise: {
            type: "array",
            items: {
              type: "string"
            },
            description: "智能体的专业技能和知识领域列表"
          },
          bias: {
            type: "string",
            description: "智能体的倾向性或偏好"
          },
          responseStyle: {
            type: "string",
            description: "智能体的回应风格，如正式、casual、技术性等"
          },
          avatar: {
            type: "string",
            description: "智能体头像URL（可选）"
          }
        },
        required: ["name", "prompt", "personality", "role"]
      }
    }
  ];

  useProvideAgentConfig({
    tools: agentEditTools,
    executors: {
      updateAgent: async (toolCall: ToolCall) => {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const agentConfig: Omit<AgentDef, "id"> = {
            name: args.name,
            prompt: args.prompt,
            personality: args.personality,
            role: args.role,
            expertise: args.expertise || [],
            bias: args.bias || "",
            responseStyle: args.responseStyle || "友好专业",
            avatar: args.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(args.name)}`,
          };
          if (onAgentCreate) {
            onAgentCreate(agentConfig);
          }
          return {
            toolCallId: toolCall.id,
            result: {
              success: true,
              message: `智能体 "${args.name}" 已成功创建！配置已应用。`,
              agentConfig: agentConfig
            },
            status: "success" as const
          };
        } catch (error) {
          console.error("更新agent失败:", error);
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              message: `更新智能体失败: ${error instanceof Error ? error.message : "未知错误"}`,
              error: error
            },
            status: "error" as const
          };
        }
      }
    },
    renderers: [
      {
        definition: {
          name: "updateAgent",
          description: "更新或创建智能体配置。当用户要求创建或修改智能体时使用此工具。",
          parameters: agentEditTools[0].parameters,
        },
        render: (toolInvocation, onResult) => {
          const args = JSON.parse(toolInvocation.function.arguments);
          setTimeout(() => {
            onResult({
              toolCallId: toolInvocation.id,
              result: { confirmed: true, ...args },
              status: "success",
            });
          }, 300);
          return (
            <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/60 dark:to-blue-900/60 shadow dark:border-gray-700">
              <h3 className="font-bold mb-2 text-violet-700 dark:text-violet-200 flex items-center gap-2">
                🪄 智能体配置预览
              </h3>
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                <strong>名称：</strong>{args.name}<br />
                <strong>角色：</strong>{args.role}<br />
                <strong>性格：</strong>{args.personality}<br />
                <strong>技能：</strong>{Array.isArray(args.expertise) ? args.expertise.join("、") : "-"}<br />
                <strong>系统提示：</strong><span className="break-all">{args.prompt}</span><br />
                <strong>回应风格：</strong>{args.responseStyle || "-"}<br />
              </div>
              <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">AI已自动确认创建，无需手动操作</div>
            </div>
          );
        },
      },
    ],
    contexts: [
      {
        description: "当前正在编辑的智能体信息",
        value: JSON.stringify(editingAgent || {}),
      },
    ],
  });
}

function AiChatCreatorInner({ onAgentCreate, className, editingAgent }: AiChatCreatorProps) {
  useAgentCreatorConfigHook(onAgentCreate, editingAgent);
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
    tools: [], // 工具已由useProvideAgentConfig注册
    contexts,
  });

  console.log("[AiChatCreator] uiMessages", uiMessages);

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
      {/* 聊天区域 - 使用AgentChatMessages替换 */}
      <div className="flex-1 overflow-hidden">
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
      </div>
      {/* 使用AgentChatInput替换原有输入区域 */}
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

export function AiChatCreator(props: AiChatCreatorProps) {
  return (
    <AgentChatProviderWrapper>
      <AiChatCreatorInner {...props} />
    </AgentChatProviderWrapper>
  );
} 