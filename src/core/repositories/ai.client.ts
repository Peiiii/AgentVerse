import { getLLMProviderConfig } from "@/core/config/ai";
import type { ProviderConfig, SupportedAIProvider } from "@/common/types/ai";
import {
  BaseConfig,
  ChatMessage,
  StreamEvent,
  ToolDefinition,
  DirectAPIAdapter,
  LLMProvider,
  ProxyAPIAdapter,
  StandardProvider,
} from "@/common/lib/ai-service";
import { filterNormalMessages } from "@/core/utils/message.util";
import { AgentMessage } from "@/common/types/discussion";
import { Observable } from "rxjs";
// 核心服务类
export class AIService {
  constructor(private readonly provider: LLMProvider) { }

  configure(config: BaseConfig) {
    this.provider.configure(config);
  }

  public chatCompletion(messages: ChatMessage[]): Promise<string> {
    return this.provider.generateCompletion(messages);
  }

  public streamChatCompletion(options: {
    messages: ChatMessage[];
    tools?: ToolDefinition[];
  }): Observable<StreamEvent> {
    return this.provider.generateStreamCompletion(
      options.messages,
      undefined,
      undefined,
      options.tools
    );
  }

  public async generateDiscussionTitle(
    messages: AgentMessage[]
  ): Promise<string> {
    const prompt = [
      {
        role: "system" as const,
        content:
          "你是一个帮助生成讨论标题的助手。请根据对话内容生成一个简短、准确的中文标题。标题应该：\n1. 长度在 5-15 个字之间\n2. 概括对话的主要主题\n3. 不要包含具体的技术细节\n4. 使用自然的表达方式",
      },
      {
        role: "user" as const,
        content: `请根据以下对话生成一个合适的标题：\n\n${filterNormalMessages(
          messages
        )
          .map((m) => `${m.agentId}: ${m.content}`)
          .join("\n")}`,
      },
    ];

    const response = await this.chatCompletion(prompt);
    return response.trim();
  }
}

// 工厂函数
export function createAIService(): AIService {
  const { useProxy, proxyUrl, providerType, providerConfig, model } =
    getLLMProviderConfig();

  return createAIServiceForProvider(providerType, providerConfig, {
    useProxy,
    proxyUrl,
    model,
  });
}

// 默认实例
export const aiService = createAIService();

export function createAIServiceForProvider(
  providerType: SupportedAIProvider,
  providerConfig: ProviderConfig,
  options?: { useProxy?: boolean; proxyUrl?: string; model?: string }
): AIService {
  const useProxy =
    options?.useProxy ?? getLLMProviderConfig().useProxy;
  const proxyUrl =
    options?.proxyUrl ?? getLLMProviderConfig().proxyUrl;
  const model =
    options?.model ||
    providerConfig.models[0] ||
    "";

  const adapter = useProxy
    ? new ProxyAPIAdapter(proxyUrl)
    : new DirectAPIAdapter(providerConfig.apiKey, providerConfig.baseUrl);

  const config = {
    apiKey: providerConfig.apiKey,
    baseUrl: providerConfig.baseUrl,
    model,
    maxTokens: providerConfig.maxTokens,
    ...("topP" in providerConfig ? { topP: providerConfig.topP } : {}),
    ...("presencePenalty" in providerConfig
      ? { presencePenalty: providerConfig.presencePenalty }
      : {}),
    ...("frequencyPenalty" in providerConfig
      ? { frequencyPenalty: providerConfig.frequencyPenalty }
      : {}),
  };
  const provider = new StandardProvider(config, adapter, providerType);
  return new AIService(provider);
}
