
export enum SupportedAIProvider {
  DEEPSEEK = "deepseek",
  MOONSHOT = "moonshot",
  DOBRAIN = "dobrain",
  OPENAI = "openai",
  DASHSCOPE = "dashscope",
  OPENROUTER = "openrouter",
  GLM = "glm",
}

export interface BaseProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
}

export interface DobrainProviderConfig extends BaseProviderConfig {
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export type ProviderConfig = BaseProviderConfig | DobrainProviderConfig;

export type ProviderConfigs = {
  [key in SupportedAIProvider]: ProviderConfig;
};
