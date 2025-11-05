import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent } from "@/common/components/ui/dialog";
import { Download, Loader2 } from "lucide-react";

interface MessagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  onDownload: () => void;
  isGenerating: boolean;
  error?: string | null;
  isMobile?: boolean;
}

export function MessagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  onDownload,
  isGenerating,
  error,
  isMobile,
}: MessagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden bg-background">
        {/* 顶部标题栏 */}
        <div className="flex items-center px-6 py-4 border-b bg-background">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">预览与分享</h2>
            {isMobile && (
              <p className="text-xs text-muted-foreground mt-1">
                提示：在移动设备上，消息过多可能会导致生成失败
              </p>
            )}
          </div>
        </div>

        <div className="relative flex flex-col h-[80vh]">
          {/* 预览区域 */}
          <div
            className="flex-1 overflow-auto px-6 py-8 bg-background"
            style={{ scrollbarGutter: "stable both-edges" }}
          >
            <div className="min-h-full flex items-center justify-center">
              {error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => onOpenChange(false)}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">正在生成预览...</p>
                </div>
              ) : imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-black/5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.18)] bg-white">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="block max-w-full h-auto"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">暂无可预览的内容</div>
              )}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-background">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium">准备就绪</h3>
              <p className="text-xs text-muted-foreground">
                生成的图片已优化，可供下载分享
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-4"
              >
                取消
              </Button>
              <Button
                onClick={onDownload}
                disabled={isGenerating || !imageUrl}
                className="gap-2 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                <Download className="h-4 w-4" />
                下载图片
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
