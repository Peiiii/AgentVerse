import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { SidePanelConfig } from "@/common/components/world-class-chat/hooks/use-side-panel-manager";
import { WorldClassChatHtmlPreview } from "@/common/components/world-class-chat/components/world-class-chat-html-preview";
import { useIframeManager } from "@/common/components/world-class-chat/hooks/use-iframe-manager";

export interface HtmlPreviewFromFileToolParams {
  filePath: string;
}

export interface HtmlPreviewFromFileToolResult {
  success: boolean;
  message: string;
  htmlContent?: string;
  iframeId?: string;
  error?: string;
}

// 读取 HTML 文件的函数
async function readHtmlFile(filePath: string): Promise<{ success: boolean; htmlContent?: string; error?: string }> {
  try {
    // 这里应该实现实际的文件读取逻辑
    // 目前返回模拟数据
    const mockHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HTML Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>HTML 预览</h1>
          <div class="content">
            <p>这是从文件 <strong>${filePath}</strong> 读取的 HTML 内容。</p>
            <p>当前时间: <span id="time"></span></p>
            <script>
              document.getElementById('time').textContent = new Date().toLocaleString();
            </script>
          </div>
        </body>
      </html>
    `;
    
    return {
      success: true,
      htmlContent: mockHtmlContent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "文件读取失败",
    };
  }
}

export function createHtmlPreviewFromFileTool(
  openCustomPanel: (key: string, config: SidePanelConfig, props?: any) => string | null,
  getIframeManager?: () => ReturnType<typeof useIframeManager> | null
): AgentTool {
  let currentPreviewInfo: {
    filePath: string;
    htmlContent: string;
    panelKey: string;
    iframeId?: string;
  } | null = null;

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
      
      // 获取 iframe 管理器
      const iframeManager = getIframeManager?.();
      
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
          const newIframeId = openCustomPanel(
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
                  iframeId={currentPreviewInfo!.iframeId}
                  onIframeReady={(element) => {
                    if (iframeManager && currentPreviewInfo?.iframeId) {
                      iframeManager.registerElement(currentPreviewInfo.iframeId, element);
                    }
                  }}
                />
              ),
            },
            { filePath: currentPreviewInfo.filePath }
          );
          
          // 更新 iframe ID
          if (newIframeId) {
            currentPreviewInfo.iframeId = newIframeId;
          }
        }
      };

      // 打开自定义面板预览 HTML
      const returnedIframeId = openCustomPanel(
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
              iframeId={returnedIframeId || undefined}
              onIframeReady={(element) => {
                if (iframeManager && returnedIframeId) {
                  iframeManager.registerElement(returnedIframeId, element);
                }
              }}
            />
          ),
        },
        { filePath: args.filePath }
      );

      // 使用返回的 iframe ID
      const finalIframeId = returnedIframeId;
      if (currentPreviewInfo) {
        currentPreviewInfo.iframeId = finalIframeId || undefined;
      }

      return {
        toolCallId: toolCall.id,
        result: {
          success: true,
          message: `已成功打开 HTML 预览面板：${args.filePath}`,
          htmlContent: htmlContent.substring(0, 200) + "...", // 只显示前200字符
          iframeId: finalIframeId || undefined,
        },
        status: "success" as const,
      };
    },
    render(toolCall: ToolCall & { result?: HtmlPreviewFromFileToolResult }) {
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
              color: toolCall.result?.success ? "#0ea5e9" : "#ef4444",
              marginBottom: 4,
            }}
          >
            🖥️ HTML 文件预览工具
          </div>
          <div style={{ fontSize: 15, color: "#64748b" }}>
            {toolCall.result?.success ? "✅ " : "❌ "}
            {toolCall.result?.message}
          </div>
          {toolCall.result?.error && (
            <div style={{ fontSize: 14, color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>
              错误: {toolCall.result.error}
            </div>
          )}
        </div>
      );
    },
  };
} 