import { DiscussionSettings } from "@/common/types/discussion";

export const DEFAULT_SETTINGS: DiscussionSettings = {
  maxRounds: 20,
  temperature: 0.7,
  interval: 3000,
  moderationStyle: "relaxed",
  focusTopics: [],
  allowConflict: true,
  toolPermissions: {
    moderator: true,
    participant: false,
  },
} as const;
