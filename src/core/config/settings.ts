import { DiscussionSettings } from "@/common/types/discussion";

export const DEFAULT_SETTINGS: DiscussionSettings = {
  maxRounds: 20,
  temperature: 0.7,
  interval: 3000,
  moderationStyle: "relaxed",
  focusTopics: [],
  allowConflict: true,
} as const;

export const SETTING_KYES = {
  AI: {
    PROVIDER: {
      API_KEY: "ai.provider.apiKey",
      API_URL: "ai.provider.apiUrl",
      MODEL: "ai.provider.model",
      ID: "ai.provider.id",
    },
  },
};
