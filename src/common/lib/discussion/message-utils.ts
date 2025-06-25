import { MarkdownActionResults } from "@/components/chat/markdown";
import {
  AgentMessage,
  MessageWithResults,
  NormalMessage,
} from "@/types/discussion";

// 定义消息合并的时间阈值（毫秒）
const MESSAGE_MERGE_THRESHOLD = 3 * 60 * 1000; // 3分钟

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

/**
 * 第一阶段：合并消息和其对应的action结果
 */
function mergeActionResults(messages: AgentMessage[]): MessageWithResults[] {
  const result: MessageWithResults[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];

    if (current.type === "text") {
      const next = messages[i + 1];

      if (
        next?.type === "action_result" &&
        next.originMessageId === current.id
      ) {
        // 构建 actionResults 对象
        const actionResults = next.results.reduce(
          (acc: MarkdownActionResults, r) => {
            acc[r.operationId] = {
              // capability: r.capability,
              // params: r.params,
              status: r.status,
              result: r.result,
              error: r.error,
              // description: r.description,
            };
            return acc;
          },
          {}
        );

        result.push({
          ...current,
          actionResults,
        });
        i++; // 跳过action结果消息
      } else {
        result.push(current as MessageWithResults);
      }
    }
  }

  return result;
}

/**
 * 合并两个消息的actionResults
 */
function mergeActionResultsObjects(
  current: MessageWithResults["actionResults"],
  next: MessageWithResults["actionResults"]
): MessageWithResults["actionResults"] {
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
  messages: MessageWithResults[]
): MessageWithResults[] {
  const result: MessageWithResults[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    let mergedContent = current.content;
    let mergedActionResults = current.actionResults;
    let nextIndex = i + 1;

    // 检查并合并后续消息
    while (
      nextIndex < messages.length &&
      shouldMergeMessages(current, messages[nextIndex])
    ) {
      const next = messages[nextIndex];
      mergedContent += "\n\n" + next.content;
      mergedActionResults = mergeActionResultsObjects(
        mergedActionResults,
        next.actionResults
      );
      nextIndex++;
    }

    if (nextIndex > i + 1) {
      // 有消息被合并
      result.push({
        ...current,
        content: mergedContent,
        actionResults: mergedActionResults,
      });
      i = nextIndex - 1; // 跳过已合并的消息
    } else {
      // 没有消息需要合并
      result.push(current);
    }
  }

  return result;
}

/**
 * 将消息列表重组，合并相邻的 action 结果和连续消息
 */
export function reorganizeMessages(
  messages: AgentMessage[]
): MessageWithResults[] {
  // 第一阶段：合并action结果
  const messagesWithActions = mergeActionResults(messages);

  // 第二阶段：合并相邻消息
  return mergeAdjacentMessages(messagesWithActions);
}
