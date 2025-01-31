
export enum ProviderType {
  DEEPSEEK = "deepseek",
  MOONSHOT = "moonshot",
  DOBRAIN = "dobrain",
  OPENAI = "openai",
  DASHSCOPE = "dashscope",
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
  [key in ProviderType]: ProviderConfig;
};
