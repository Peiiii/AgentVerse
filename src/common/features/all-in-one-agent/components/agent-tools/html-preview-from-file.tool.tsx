import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { defaultFileManager } from "@/common/lib/file-manager.service";
import { SidePanelConfig } from "@/common/components/world-class-chat/hooks/use-side-panel-manager";
import { WorldClassChatHtmlPreview } from "@/common/components/world-class-chat/components/world-class-chat-html-preview";

export interface HtmlPreviewFromFileToolParams {
  filePath: string;
}

export interface HtmlPreviewFromFileToolResult {
  success: boolean;
  message: string;
  htmlContent?: string;
  error?: string;
}

// 用于 tool 渲染的 React 组件
export function HtmlPreviewFromFileToolResult({ result }: { result: HtmlPreviewFromFileToolResult }) {
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
          color: result.success ? "#0ea5e9" : "#ef4444",
          marginBottom: 4,
        }}
      >
        🖥️ HTML 文件预览工具
      </div>
      <div style={{ fontSize: 15, color: "#64748b" }}>
        {result.success ? "✅ " : "❌ "}
        {result.message}
      </div>
      {result.error && (
        <div style={{ fontSize: 14, color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>
          错误: {result.error}
        </div>
      )}
    </div>
  );
}

export function createHtmlPreviewFromFileTool(
  openCustomPanel: (key: string, config: SidePanelConfig, props?: any) => void
): AgentTool {
  // 存储当前预览的文件信息
  let currentPreviewInfo: { filePath: string; htmlContent: string; panelKey: string } | null = null;

  // 读取文件内容的函数
  const readHtmlFile = async (filePath: string): Promise<{ success: boolean; htmlContent?: string; error?: string }> => {
    try {
      const readResult = await defaultFileManager.readFile(filePath);
      
      if (!readResult.success) {
        return {
          success: false,
          error: readResult.error || "未知错误",
        };
      }

      const fileData = readResult.data as { content: string; path: string; size: number; modifiedTime: Date } | undefined;
      const htmlContent = fileData?.content;
      
      if (!htmlContent) {
        return {
          success: false,
          error: "文件内容为空或格式错误",
        };
      }

      if (!htmlContent.includes("<html") && !htmlContent.includes("<!DOCTYPE")) {
        return {
          success: false,
          error: "文件内容不包含 HTML 标签",
        };
      }

      return {
        success: true,
        htmlContent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  };

  return {
    name: "previewHtmlFromFile",
    description: "从指定文件路径读取 HTML 内容并在右侧面板中预览",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "要读取并预览的 HTML 文件路径",
        },
      },
      required: ["filePath"],
    },
    async execute(toolCall: ToolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      
      if (!args || !args.filePath) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: "未指定文件路径",
            error: "缺少 filePath 参数",
          },
          status: "error" as const,
        };
      }

      // 读取文件内容
      const readResult = await readHtmlFile(args.filePath);
      
      if (!readResult.success) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: "文件读取失败",
            error: readResult.error || "未知错误",
          },
          status: "error" as const,
        };
      }

      const htmlContent = readResult.htmlContent!;
      
      // 生成面板 key
      const panelKey = `html-preview-${Date.now()}`;
      
      // 存储当前预览信息
      currentPreviewInfo = {
        filePath: args.filePath,
        htmlContent,
        panelKey,
      };

      // 刷新回调函数
      const handleRefresh = async () => {
        if (!currentPreviewInfo) return;
        
        const refreshResult = await readHtmlFile(currentPreviewInfo.filePath);
        if (refreshResult.success && refreshResult.htmlContent) {
          // 更新存储的内容
          currentPreviewInfo.htmlContent = refreshResult.htmlContent;
          
          // 重新打开面板（这会触发重新渲染）
          openCustomPanel(
            currentPreviewInfo.panelKey,
            {
              key: currentPreviewInfo.panelKey,
              hideCloseButton: true,
              render: (_panelProps: any, close: () => void) => (
                <WorldClassChatHtmlPreview
                  html={currentPreviewInfo!.htmlContent}
                  onClose={close}
                  onRefresh={handleRefresh}
                  showRefreshButton={true}
                />
              ),
            },
            { filePath: currentPreviewInfo.filePath }
          );
        }
      };

        // 打开自定义面板预览 HTML
        openCustomPanel(
          panelKey,
          {
            key: panelKey,
            hideCloseButton: true,
            render: (_panelProps: any, close: () => void) => (
              <WorldClassChatHtmlPreview
                html={htmlContent}
                onClose={close}
                onRefresh={handleRefresh}
                showRefreshButton={true}
              />
            ),
          },
          { filePath: args.filePath }
        );

        return {
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: `已成功打开 HTML 预览面板：${args.filePath}`,
            htmlContent: htmlContent.substring(0, 200) + "...", // 只显示前200字符
          },
          status: "success" as const,
        };
    },
    render(toolCall: ToolCall & { result?: HtmlPreviewFromFileToolResult }) {
      return (
        <HtmlPreviewFromFileToolResult result={toolCall.result || { success: false, message: "未知状态" }} />
      );
    },
  };
} 