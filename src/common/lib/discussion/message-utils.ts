import {
  AgentMessage,
  NormalMessage,
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

/**
 * 第二阶段：合并相邻的消息
 */
function mergeAdjacentMessages(
  messages: NormalMessage[]
): NormalMessage[] {
  const result: NormalMessage[] = [];

  const cloneSegments = (segments?: MessageSegment[] | null) => {
    if (!segments?.length) return null;
    return segments.map((segment) =>
      segment.type === "text"
        ? { ...segment }
        : { ...segment, call: { ...segment.call } }
    );
  };

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    let mergedContent = current.content;
    let mergedSegments: MessageSegment[] | null = cloneSegments(current.segments);
    let nextIndex = i + 1;

    // 检查并合并后续消息
    while (
      nextIndex < messages.length &&
      shouldMergeMessages(current, messages[nextIndex])
    ) {
      const next = messages[nextIndex];
      mergedContent += "\n\n" + next.content;
      if (mergedSegments || next.segments?.length) {
        if (!mergedSegments) {
          mergedSegments = current.content
            ? [createTextSegment(current.content)]
            : [];
        }
        const nextSegments: MessageSegment[] = next.segments?.length
          ? (cloneSegments(next.segments) ?? [])
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
): NormalMessage[] {
  return mergeAdjacentMessages(messages as NormalMessage[]);
}
