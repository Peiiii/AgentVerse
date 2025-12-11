import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { useIframeManager } from "@/common/features/world-class-chat/hooks/use-iframe-manager";
import { i18n } from "@/core/hooks/use-i18n";

export interface SendMessageToIframeToolParams {
  iframeId: string;
  message: unknown;
  targetOrigin?: string;
}

export interface SendMessageToIframeToolResult {
  success: boolean;
  message: string;
  sentMessage?: {
    type: string;
    data: unknown;
    targetOrigin: string;
  };
  error?: string;
}

export function createSendMessageToIframeTool(
  getIframeManager?: () => ReturnType<typeof useIframeManager> | null
): AgentTool {
  return {
    name: "sendMessageToIframe",
    description: i18n.t("tool.sendMessageToIframe.description"),
    parameters: {
      type: "object",
      properties: {
        iframeId: {
          type: "string",
          description: i18n.t("tool.sendMessageToIframe.iframeIdDescription"),
        },
        message: {
          type: "object",
          description: i18n.t("tool.sendMessageToIframe.messageDescription"),
        },
        targetOrigin: {
          type: "string",
          description: i18n.t("tool.sendMessageToIframe.targetOriginDescription"),
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
            message: i18n.t("tool.sendMessageToIframe.missingRequiredParams"),
            error: i18n.t("tool.sendMessageToIframe.needIframeIdAndMessage"),
          },
          status: "error" as const,
        };
      }

      const iframeId = args.iframeId;
      const message = args.message;
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
              message: i18n.t("tool.sendMessageToIframe.iframeNotExists", { iframeId }),
              error: i18n.t("tool.sendMessageToIframe.invalidIframeId"),
            },
            status: "error" as const,
          };
        }
      }

      // 直接发送 message 参数
      const success = iframeManager?.postMessage(iframeId, message, targetOrigin) || false;
      if (!success) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: i18n.t("tool.sendMessageToIframe.sendFailed"),
            error: i18n.t("tool.sendMessageToIframe.cannotSendMessage"),
          },
          status: "error" as const,
        };
      }

      return {
        toolCallId: toolCall.id,
        result: {
          success: true,
          message: i18n.t("tool.sendMessageToIframe.sendSuccess", { iframeId }),
          sentMessage: message,
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
            📤 {i18n.t("tool.sendMessageToIframe.title")}
          </div>
          <div style={{ fontSize: 15, color: "#64748b" }}>
            {result?.success ? "✅ " : "❌ "}
            {result?.message}
          </div>
          {result?.sentMessage && (
            <div style={{ fontSize: 14, color: "#0ea5e9", background: "#f0f9ff", padding: "8px 12px", borderRadius: 6 }}>
              {i18n.t("tool.sendMessageToIframe.messageType")}: {result.sentMessage.type}
            </div>
          )}
          {result?.error && (
            <div style={{ fontSize: 14, color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>
              {i18n.t("tool.sendMessageToIframe.error")}: {result.error}
            </div>
          )}
        </div>
      );
    },
  };
} 
