import type { ToolCall } from "@/common/lib/ai-service";

// 基础消息类型
export interface BaseMessage {
  id: string;
  discussionId: string;
  agentId: string;
  timestamp: Date;
  type: string;
}

// 普通消息
export interface NormalMessage extends BaseMessage {
  type: "text" | "image" | "audio" | "video";
  content: string;
  segments?: MessageSegment[];
  mentions?: string[];    // 被 @ 的 agentId 列表
  replyTo?: string;      // 回复某条消息的ID
  status?: 'pending' | 'streaming' | 'completed' | 'error';  // 消息状态
  lastUpdateTime?: Date;  // 最后更新时间，用于判断是否超时
}

export type ToolInvocationStatus = "pending" | "success" | "error";

export type MessageSegment =
  | { type: "text"; content: string }
  | {
      type: "tool_invocation";
      key: string;
      call: ToolCall;
      status?: ToolInvocationStatus;
      result?: unknown;
      error?: string;
      startTime?: number;
      endTime?: number;
    };

export type ToolInvocationSegment = Extract<
  MessageSegment,
  { type: "tool_invocation" }
>;

export type MessageWithTools = NormalMessage;

export type AgentMessage = NormalMessage;

export interface Discussion {
  id: string;
  title: string;
  topic: string;
  status: "active" | "paused" | "completed";
  settings: DiscussionSettings;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageTime?: Date;  // 最新消息时间
  lastMessage?: string;    // 最新消息预览
}

export interface DiscussionSettings {
  maxRounds: number;
  temperature: number;
  interval: number;
  moderationStyle: "strict" | "relaxed";
  focusTopics: string[];
  allowConflict: boolean;
  toolPermissions: Record<"moderator" | "participant", boolean>;
}
