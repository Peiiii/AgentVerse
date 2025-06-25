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
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden bg-gradient-to-b from-background to-background/95">
        {/* 顶部标题栏 */}
        <div className="flex items-center px-6 py-4 border-b bg-background/50 backdrop-blur-sm">
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
          <div className="flex-1 overflow-auto px-6 py-8 bg-gradient-to-b from-background/5 to-background/10">
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
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    正在生成预览...
                  </p>
                </div>
              ) : imageUrl ? (
                <div className="relative group">
                  <div className="absolute -inset-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="relative max-w-full h-auto rounded-lg shadow-xl transition-transform group-hover:scale-[0.998]"
                    style={{
                      boxShadow: "0 8px 40px -12px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-background/50 backdrop-blur-sm">
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