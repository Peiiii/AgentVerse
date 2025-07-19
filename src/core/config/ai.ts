import { ProviderConfigs, SupportedAIProvider } from "@/common/types/ai";

// 默认配置
export const AI_PROVIDER_CONFIG: ProviderConfigs = {
  [SupportedAIProvider.DEEPSEEK]: {
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    baseUrl:
      import.meta.env.VITE_DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
    model: import.meta.env.VITE_DEEPSEEK_MODEL || "deepseek-chat",
    maxTokens: Number(import.meta.env.VITE_DEEPSEEK_MAX_TOKENS) || 1000,
  },

  [SupportedAIProvider.MOONSHOT]: {
    apiKey: import.meta.env.VITE_MOONSHOT_API_KEY,
    baseUrl:
      import.meta.env.VITE_MOONSHOT_API_URL || "https://api.moonshot.cn/v1",
    model: import.meta.env.VITE_MOONSHOT_MODEL || "moonshot-v1-8k",
    maxTokens: Number(import.meta.env.VITE_MOONSHOT_MAX_TOKENS) || 1000,
  },

  [SupportedAIProvider.DOBRAIN]: {
    apiKey: import.meta.env.VITE_DOBRAIN_API_KEY,
    baseUrl: import.meta.env.VITE_DOBRAIN_API_URL,
    model: import.meta.env.VITE_DOBRAIN_MODEL || "dobrain-v1",
    maxTokens: Number(import.meta.env.VITE_DOBRAIN_MAX_TOKENS) || 1000,
    topP: Number(import.meta.env.VITE_DOBRAIN_TOP_P) || 0.7,
    presencePenalty: Number(import.meta.env.VITE_DOBRAIN_PRESENCE_PENALTY) || 0,
    frequencyPenalty:
      Number(import.meta.env.VITE_DOBRAIN_FREQUENCY_PENALTY) || 0,
  },

  [SupportedAIProvider.OPENAI]: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: import.meta.env.VITE_OPENAI_API_URL || "https://api.openai.com/v1",
    model: import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
    maxTokens: Number(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 1000,
  },

  [SupportedAIProvider.DASHSCOPE]: {
    apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY,
    baseUrl:
      import.meta.env.VITE_DASHSCOPE_API_URL ||
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: import.meta.env.VITE_DASHSCOPE_MODEL || "deepseek-v3",
    maxTokens: Number(import.meta.env.VITE_DASHSCOPE_MAX_TOKENS) || 1000,
  },

  [SupportedAIProvider.OPENROUTER]: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    baseUrl: import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
    model: import.meta.env.VITE_OPENROUTER_MODEL || "gpt-3.5-turbo",
    maxTokens: Number(import.meta.env.VITE_OPENROUTER_MAX_TOKENS) || 1000,
  },
};

export const BasicAIConfig = {
  AI_PROVIDER_NAME: import.meta.env.VITE_AI_PROVIDER as SupportedAIProvider,
  AI_USE_PROXY: import.meta.env.VITE_AI_USE_PROXY === "true",
  AI_PROXY_URL: import.meta.env.VITE_AI_PROXY_URL,
};
