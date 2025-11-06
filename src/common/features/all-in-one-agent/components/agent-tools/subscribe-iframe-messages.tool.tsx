import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { useIframeManager } from "@/common/components/world-class-chat/hooks/use-iframe-manager";
import { Message } from "@ag-ui/core";

export interface SubscribeIframeMessagesToolParams {
  iframeId: string;
  messageTypes?: string[];
  timeout?: number;
  description?: string;
}

export interface SubscribeIframeMessagesToolResult {
  success: boolean;
  message: string;
  subscriptionId?: string;
  receivedMessages?: Array<{
    type: string;
    data: unknown;
    timestamp: number;
    source: string;
  }>;
  error?: string;
}

// 消息订阅管理器
class IframeMessageSubscriptionManager {
  private subscriptions = new Map<string, {
    iframeId: string;
    messageTypes: string[];
    callback: (message: { type?: string; data?: unknown; timestamp?: number; source?: string }) => void;
    timeout?: number;
    startTime: number;
    receivedMessages: Array<{
      type: string;
      data: unknown;
      timestamp: number;
      source: string;
    }>;
    isActive: boolean;
  }>();

  private nextSubscriptionId = 1;

  // 订阅 iframe 消息
  subscribe(
    iframeId: string,
    messageTypes: string[] = ['*'],
    timeout?: number,
    callback?: (message: { type?: string; data?: unknown; timestamp?: number; source?: string }) => void
  ): string {
    const subscriptionId = `sub-${this.nextSubscriptionId++}`;
    
    const subscription = {
      iframeId,
      messageTypes,
      callback: callback || (() => {}),
      timeout,
      startTime: Date.now(),
      receivedMessages: [],
      isActive: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // 设置超时清理
    if (timeout) {
      setTimeout(() => {
        this.unsubscribe(subscriptionId);
      }, timeout);
    }

    return subscriptionId;
  }

  // 取消订阅
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);
      return true;
    }
    return false;
  }

  // 处理接收到的消息
  handleMessage(iframeId: string, message: { type?: string; data?: unknown }): void {
    const timestamp = Date.now();
    
    this.subscriptions.forEach((subscription) => {
      if (!subscription.isActive || subscription.iframeId !== iframeId) {
        return;
      }

      // 检查消息类型是否匹配
      const messageType = message.type || 'unknown';
      const shouldHandle = subscription.messageTypes.includes('*') || 
                          subscription.messageTypes.includes(messageType);

      if (shouldHandle) {
        const messageRecord = {
          type: messageType,
          data: message.data || message,
          timestamp,
          source: iframeId,
        };

        subscription.receivedMessages.push(messageRecord);
        subscription.callback(messageRecord);
      }
    });
  }

  // 获取订阅信息
  getSubscription(subscriptionId: string) {
    return this.subscriptions.get(subscriptionId);
  }

  // 获取所有订阅
  getAllSubscriptions() {
    return Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
      id,
      iframeId: sub.iframeId,
      messageTypes: sub.messageTypes,
      isActive: sub.isActive,
      receivedCount: sub.receivedMessages.length,
      startTime: sub.startTime,
    }));
  }

  // 清理所有订阅
  clearAll() {
    this.subscriptions.clear();
  }
}

// 全局订阅管理器实例
const globalSubscriptionManager = new IframeMessageSubscriptionManager();

// 设置全局消息监听器
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    // 检查消息是否来自我们的 iframe
    const source = event.source as Window;
    const iframeId = source?.frameElement?.id;
    if (iframeId) {
      globalSubscriptionManager.handleMessage(iframeId, event.data);
    }
  });
}

export function createSubscribeIframeMessagesTool(
  getIframeManager?: () => ReturnType<typeof useIframeManager> | null,
  getAddMessages?: () => ((messages: Message[], options?: { triggerAgent?: boolean }) => Promise<void>) | null
): AgentTool {
  return {
    name: "subscribeIframeMessages",
    description: "订阅特定 iframe 的消息，监听 iframe 内部发送的 postMessage 消息，收到消息后自动通知 agent",
    parameters: {
      type: "object",
      properties: {
        iframeId: {
          type: "string",
          description: "要订阅消息的 iframe ID",
        },
        // messageTypes: {
        //   type: "array",
        //   items: { type: "string" },
        //   description: "要监听的消息类型数组，使用 \"*\" 监听所有类型",
        // },
        timeout: {
          type: "number",
          description: "订阅超时时间（毫秒），超时后自动取消订阅",
        },
        description: {
          type: "string",
          description: "订阅描述，用于标识订阅目的",
        },
        autoNotifyAgent: {
          type: "boolean",
          description: "是否在收到消息时自动通知 agent，默认为 true",
        },
      },
      required: ["iframeId"],
    },
    async execute(toolCall: ToolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      
      if (!args || !args.iframeId) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: "未指定 iframe ID",
            error: "缺少 iframeId 参数",
          },
          status: "error" as const,
        };
      }

      const iframeId = args.iframeId;
      const messageTypes = args.messageTypes || ['*'];
      const timeout = args.timeout;
      const autoNotifyAgent = args.autoNotifyAgent !== false; // 默认为 true

      // 验证 iframe 是否存在
      const iframeManager = getIframeManager?.();
      if (iframeManager) {
        const iframe = iframeManager.getIframe(iframeId);
        if (!iframe) {
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              message: `iframe ${iframeId} 不存在`,
              error: "指定的 iframe ID 无效",
            },
            status: "error" as const,
          };
        }
      }

      // 创建订阅
      const subscriptionId = globalSubscriptionManager.subscribe(
        iframeId,
        messageTypes,
        timeout,
        (message) => {
          // 这里可以添加消息处理逻辑
          console.log(`收到来自 ${iframeId} 的消息:`, message);
          
          // 如果启用了自动通知 agent，则发送系统消息
          if (autoNotifyAgent) {
            const addMessages = getAddMessages?.();
            if (addMessages) {
              const systemMessage = {
                id: `iframe-message-${Date.now()}`,
                role: 'system' as const,
                content: `收到来自 iframe ${iframeId} 的消息：
                
消息类型: ${message.type}
消息内容: ${JSON.stringify(message.data ?? null, null, 2)}
时间戳: ${new Date(message.timestamp ?? Date.now()).toLocaleString()}
来源: ${message.source}

请根据这个消息内容进行相应的处理或回复。`,
                timestamp: new Date().toISOString(),
              };
              
              addMessages([systemMessage], { triggerAgent: true });
            }
          }
        }
      );

      return {
        toolCallId: toolCall.id,
        result: {
          success: true,
          message: `已成功订阅 iframe ${iframeId} 的消息${autoNotifyAgent ? '，收到消息时将自动通知 agent' : ''}`,
          subscriptionId,
        },
        status: "success" as const,
      };
    },
    render(toolCall: ToolCall & { result?: SubscribeIframeMessagesToolResult }) {
      const result = toolCall.result;
      
      return (
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: 12,
            padding: "18px 24px",
            boxShadow: "0 2px 8px #6366f133",
            fontSize: 17,
            color: "#22223b",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 8,
            minWidth: 220,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: result?.success ? "#0ea5e9" : "#ef4444",
              marginBottom: 4,
            }}
          >
            📡 iframe 消息订阅工具
          </div>
          <div style={{ fontSize: 15, color: "#64748b" }}>
            {result?.success ? "✅ " : "❌ "}
            {result?.message}
          </div>
          {result?.subscriptionId && (
            <div style={{ fontSize: 14, color: "#0ea5e9", background: "#f0f9ff", padding: "8px 12px", borderRadius: 6 }}>
              订阅 ID: {result.subscriptionId}
            </div>
          )}
          {result?.error && (
            <div style={{ fontSize: 14, color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>
              错误: {result.error}
            </div>
          )}
        </div>
      );
    },
  };
}

// 导出订阅管理器，供其他工具使用
export { globalSubscriptionManager }; 
