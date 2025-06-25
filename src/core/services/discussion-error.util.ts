export enum DiscussionErrorType {
  GENERATE_RESPONSE = "GENERATE_RESPONSE",
  GENERATE_SUMMARY = "GENERATE_SUMMARY",
  NO_MODERATOR = "NO_MODERATOR",
  NO_DISCUSSION = "NO_DISCUSSION",
  AGENT_NOT_FOUND = "AGENT_NOT_FOUND",
  NO_PARTICIPANTS = "NO_PARTICIPANTS",
  NO_MEMBERS = "NO_MEMBERS",
  NO_TOPIC = "NO_TOPIC",
  AGENT_SELECTION_FAILED = "AGENT_SELECTION_FAILED",
  NO_MESSAGES = "NO_MESSAGES",
}

export class DiscussionError extends Error {
  constructor(
    public type: DiscussionErrorType,
    message: string,
    public originalError?: unknown,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DiscussionError";
  }
}

export function handleDiscussionError(error: DiscussionError) {
  console.error({
    type: error.type,
    message: error.message,
    context: error.context,
    originalError: error.originalError,
  });
  
  // 根据错误类型返回处理建议
  switch (error.type) {
    case DiscussionErrorType.GENERATE_RESPONSE:
    case DiscussionErrorType.GENERATE_SUMMARY:
      return { shouldPause: true };
    case DiscussionErrorType.NO_MODERATOR:
    case DiscussionErrorType.NO_DISCUSSION:
    default:
      return { shouldPause: false };
  }
} 