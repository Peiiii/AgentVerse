import {
  AgentMessage,
  NormalMessage,
  MessageWithTools,
  ToolResultMessage,
  MessageSegment,
} from "@/common/types/discussion";

// 定义消息合并的时间阈值（毫秒）
const MESSAGE_MERGE_THRESHOLD = 3 * 60 * 1000; // 3分钟

const createTextSegment = (content: string): MessageSegment => ({
  type: "text",
  content,
});

/**
 * 判断两条消息是否应该合并
 */
function shouldMergeMessages(
  current: NormalMessage,
  next: NormalMessage
): boolean {
  // 如果不是同一个发送者，不合并
  if (current.agentId !== next.agentId) {
    return false;
  }

  // 如果是回复消息，不合并
  if (next.replyTo) {
    return false;
  }

  // 如果时间间隔超过阈值，不合并
  const timeGap =
    new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
  if (timeGap > MESSAGE_MERGE_THRESHOLD) {
    return false;
  }

  return true;
}

// type ActionResultType = {
//   capability: string;
//   params: Record<string, unknown>;
//   status: "success" | "error";
//   result?: unknown;
//   error?: string;
//   description: string;
// };

type ToolResultMap = Record<string, ToolResultMessage>;

/**
 * 第一阶段：合并消息和其对应的 tool 结果
 */
function mergeToolResults(messages: AgentMessage[]): MessageWithTools[] {
  const result: MessageWithTools[] = [];
  const messageIndex = new Map<string, number>();
  const toolResultsByOrigin = new Map<string, ToolResultMap>();

  const updateToolResults = (
    originMessageId: string,
    patch: ToolResultMap
  ) => {
    const current = toolResultsByOrigin.get(originMessageId) ?? {};
    const next = { ...current, ...patch };
    toolResultsByOrigin.set(originMessageId, next);
    return next;
  };

  for (const message of messages) {
    if (message.type === "tool_result") {
      const toolResult = message as ToolResultMessage;
      const nextToolResults = updateToolResults(toolResult.originMessageId, {
        [toolResult.toolCallId]: toolResult,
      });
      const targetIndex = messageIndex.get(toolResult.originMessageId);
      if (targetIndex !== undefined) {
        const current = result[targetIndex];
        result[targetIndex] = {
          ...current,
          toolResults: nextToolResults,
        };
      }
      continue;
    }

    const toolResults = toolResultsByOrigin.get(message.id);
    result.push({
      ...(message as NormalMessage),
      toolResults: toolResults ? { ...toolResults } : undefined,
    });
    messageIndex.set(message.id, result.length - 1);
  }

  return result;
}

/**
 * 合并两个消息的 toolResults
 */
function mergeToolResultObjects(
  current: MessageWithTools["toolResults"],
  next: MessageWithTools["toolResults"]
): MessageWithTools["toolResults"] {
  if (!current) return next;
  if (!next) return current;

  return {
    ...current,
    ...next,
  };
}

/**
 * 第二阶段：合并相邻的消息
 */
function mergeAdjacentMessages(
  messages: MessageWithTools[]
): MessageWithTools[] {
  const result: MessageWithTools[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    let mergedContent = current.content;
    let mergedToolResults = current.toolResults;
    let mergedSegments: MessageSegment[] | null = current.segments?.length
      ? [...current.segments]
      : null;
    let nextIndex = i + 1;

    // 检查并合并后续消息
    while (
      nextIndex < messages.length &&
      shouldMergeMessages(current, messages[nextIndex])
    ) {
      const next = messages[nextIndex];
      mergedContent += "\n\n" + next.content;
      mergedToolResults = mergeToolResultObjects(
        mergedToolResults,
        next.toolResults
      );
      if (mergedSegments || next.segments?.length) {
        if (!mergedSegments) {
          mergedSegments = current.content
            ? [createTextSegment(current.content)]
            : [];
        }
        const nextSegments: MessageSegment[] = next.segments?.length
          ? [...next.segments]
          : next.content
            ? [createTextSegment(next.content)]
            : [];
        mergedSegments = mergeSegmentsWithSeparator(
          mergedSegments,
          nextSegments
        );
      }
      nextIndex++;
    }

    if (nextIndex > i + 1) {
      // 有消息被合并
      result.push({
        ...current,
        content: mergedContent,
        toolResults: mergedToolResults,
        segments: mergedSegments?.length ? mergedSegments : undefined,
      });
      i = nextIndex - 1; // 跳过已合并的消息
    } else {
      // 没有消息需要合并
      result.push(current);
    }
  }

  return result;
}

function mergeSegmentsWithSeparator(
  current: MessageSegment[],
  next: MessageSegment[]
): MessageSegment[] {
  if (next.length === 0) return current;
  const merged = [...current];
  if (merged.length === 0) return next;

  const last = merged[merged.length - 1];
  if (last.type === "text") {
    last.content += "\n\n";
  } else {
    merged.push({ type: "text", content: "\n\n" });
  }

  const firstNext = next[0];
  if (firstNext && firstNext.type === "text") {
    const lastMerged = merged[merged.length - 1];
    if (lastMerged.type === "text") {
      lastMerged.content += firstNext.content;
      merged.push(...next.slice(1));
      return merged;
    }
  }

  merged.push(...next);
  return merged;
}

/**
 * 将消息列表重组，合并相邻的 action 结果和连续消息
 */
export function reorganizeMessages(
  messages: AgentMessage[]
): MessageWithTools[] {
  // 第一阶段：合并 tool 结果
  const messagesWithTools = mergeToolResults(messages);

  // 第二阶段：合并相邻消息
  return mergeAdjacentMessages(messagesWithTools);
}
