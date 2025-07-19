import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { useIframeManager } from "@/common/components/world-class-chat/hooks/use-iframe-manager";

export interface SendMessageToIframeToolParams {
  iframeId: string;
  message: any;
  messageType?: string;
  targetOrigin?: string;
}

export interface SendMessageToIframeToolResult {
  success: boolean;
  message: string;
  sentMessage?: {
    type: string;
    data: any;
    targetOrigin: string;
  };
  error?: string;
}

export function createSendMessageToIframeTool(
  getIframeManager?: () => ReturnType<typeof useIframeManager> | null
): AgentTool {
  return {
    name: "sendMessageToIframe",
    description: "向特定 iframe 发送 postMessage 消息",
    parameters: {
      type: "object",
      properties: {
        iframeId: {
          type: "string",
          description: "目标 iframe 的 ID",
        },
        message: {
          type: "object",
          description: "要发送的消息内容",
        },
        messageType: {
          type: "string",
          description: "消息类型标识符",
        },
        targetOrigin: {
          type: "string",
          description: "目标源，默认为 '*'",
        },
      },
      required: ["iframeId", "message"],
    },
    async execute(toolCall: ToolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      
      if (!args || !args.iframeId || !args.message) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: "缺少必要参数",
            error: "需要提供 iframeId 和 message",
          },
          status: "error" as const,
        };
      }

      const iframeId = args.iframeId;
      const message = args.message;
      const messageType = args.messageType || 'agent-message';
      const targetOrigin = args.targetOrigin || '*';

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

      // 构造发送的消息
      const messageToSend = {
        type: messageType,
        data: message,
        timestamp: Date.now(),
        source: 'agent',
      };

      // 发送消息
      const success = iframeManager?.postMessage(iframeId, messageToSend, targetOrigin) || false;

      if (!success) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: "消息发送失败",
            error: "无法向指定的 iframe 发送消息",
          },
          status: "error" as const,
        };
      }

      return {
        toolCallId: toolCall.id,
        result: {
          success: true,
          message: `已成功向 iframe ${iframeId} 发送消息`,
          sentMessage: {
            type: messageType,
            data: message,
            targetOrigin,
          },
        },
        status: "success" as const,
      };
    },
    render(toolCall: ToolCall & { result?: SendMessageToIframeToolResult }) {
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
            📤 iframe 消息发送工具
          </div>
          <div style={{ fontSize: 15, color: "#64748b" }}>
            {result?.success ? "✅ " : "❌ "}
            {result?.message}
          </div>
          {result?.sentMessage && (
            <div style={{ fontSize: 14, color: "#0ea5e9", background: "#f0f9ff", padding: "8px 12px", borderRadius: 6 }}>
              消息类型: {result.sentMessage.type}
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