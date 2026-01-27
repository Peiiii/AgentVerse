import {
  ProviderConfig,
  ProviderConfigs,
  SupportedAIProvider,
} from "@/common/types/ai";

// 默认配置
export const AI_PROVIDER_CONFIG: ProviderConfigs = {
  [SupportedAIProvider.DEEPSEEK]: {
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat"],
    maxTokens: 1000,
  },

  [SupportedAIProvider.MOONSHOT]: {
    apiKey: import.meta.env.VITE_MOONSHOT_API_KEY,
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["kimi-k2-0711-preview"],
    maxTokens: 3000,
  },

  [SupportedAIProvider.DOBRAIN]: {
    apiKey: import.meta.env.VITE_DOBRAIN_API_KEY,
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    models: ["dobrain-v1"],
    maxTokens: 1000,
    topP: 0.7,
    presencePenalty: 0,
    frequencyPenalty: 0,
  },

  [SupportedAIProvider.OPENAI]: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-3.5-turbo"],
    maxTokens: 1000,
  },

  [SupportedAIProvider.DASHSCOPE]: {
    apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY,
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen3-max", "glm-4.7"],
    maxTokens: 1000,
  },

  [SupportedAIProvider.OPENROUTER]: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    baseUrl: "https://openrouter.ai/api/v1",
    models: ["google/gemini-2.0-flash-001"],
    maxTokens: 3000,
  },

  [SupportedAIProvider.GLM]: {
    apiKey: import.meta.env.VITE_GLM_API_KEY,
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4-flash"],
    maxTokens: 1000,
  },
};

export const BasicAIConfig = {
  AI_PROVIDER_NAME: import.meta.env.VITE_AI_PROVIDER as SupportedAIProvider,
  AI_USE_PROXY: import.meta.env.VITE_AI_USE_PROXY === "true",
  AI_PROXY_URL: import.meta.env.VITE_AI_PROXY_URL,
};

const getDefaultProviderModel = (config: ProviderConfig) =>
  config.models[0] || "";

export const getLLMProviderConfig = () => {
  const useProxy = BasicAIConfig.AI_USE_PROXY;
  const proxyUrl = BasicAIConfig.AI_PROXY_URL;
  const preferredProvider = BasicAIConfig.AI_PROVIDER_NAME;
  const providerType =
    preferredProvider && AI_PROVIDER_CONFIG[preferredProvider]
      ? (preferredProvider as SupportedAIProvider)
      : SupportedAIProvider.OPENAI;
  const providerConfig = AI_PROVIDER_CONFIG[providerType];
  const model = getDefaultProviderModel(providerConfig);

  return {
    useProxy,
    proxyUrl,
    providerType,
    providerConfig,
    model,
  };
};

export const resolveLLMProviderConfigByTags = (tags?: string[]) => {
  const preferredProvider = BasicAIConfig.AI_PROVIDER_NAME;
  const defaultProviderType =
    preferredProvider && AI_PROVIDER_CONFIG[preferredProvider]
      ? (preferredProvider as SupportedAIProvider)
      : SupportedAIProvider.OPENAI;
  const defaultProviderConfig = AI_PROVIDER_CONFIG[defaultProviderType];

  const normalizedTags = (tags || [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedTags.length === 0) {
    return {
      providerType: defaultProviderType,
      providerConfig: defaultProviderConfig as ProviderConfig,
      model: getDefaultProviderModel(defaultProviderConfig),
    };
  }

  const candidates = Object.entries(AI_PROVIDER_CONFIG).flatMap(
    ([provider, config]) =>
      (config.models.length > 0 ? config.models : [getDefaultProviderModel(config)]).map(
        (model) => ({
          providerType: provider as SupportedAIProvider,
          providerConfig: config,
          model,
          identifier: `${provider}:${model}`.toLowerCase(),
        })
      )
  );

  for (const tag of normalizedTags) {
    const match = candidates.find((candidate) =>
      candidate.identifier.includes(tag)
    );
    if (match) {
      return {
        providerType: match.providerType,
        providerConfig: match.providerConfig as ProviderConfig,
        model: match.model,
      };
    }
  }

  return {
    providerType: defaultProviderType,
    providerConfig: defaultProviderConfig as ProviderConfig,
    model: getDefaultProviderModel(defaultProviderConfig),
  };
};
