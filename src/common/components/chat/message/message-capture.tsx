import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent } from "@/common/components/ui/dialog";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { Loader2, Share2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

// 懒加载预览对话框组件
const MessagePreviewDialog = lazy(() =>
  import("./message-preview-dialog").then((module) => ({
    default: module.MessagePreviewDialog,
  }))
);

interface MessageCaptureProps {
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export function MessageCapture({
  containerRef,
  className,
}: MessageCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useBreakpointContext();

  // 使用 html-to-image，直接捕获可渲染根节点，避免离屏克隆导致的布局/计算异常
  const captureImage = async () => {
    if (!containerRef.current) return null;

    const node = containerRef.current;
    const captureRoot = (node as HTMLElement).closest(
      "[data-capture-root]"
    ) as HTMLElement | null;
    // 为了生成完整内容，优先截取消息内容容器本身（node），
    // 仅将 captureRoot 用于解析背景与宽度参考，避免被滚动容器裁切
    const root = node as HTMLElement;
    const bgScope = (captureRoot ?? root) as HTMLElement;

    try {
      const htmlToImage = await import("html-to-image");

      // 背景色：取最近的非透明背景，保证导出一致性
      const resolveBackgroundColor = (el: HTMLElement | null): string | null => {
        let cur: HTMLElement | null = el;
        while (cur) {
          const bg = window.getComputedStyle(cur).backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            return bg;
          }
          cur = cur.parentElement;
        }
        return window.getComputedStyle(document.body).backgroundColor || null;
      };
      const backgroundColor = resolveBackgroundColor(bgScope) || undefined;
      const width = Math.round(bgScope.getBoundingClientRect().width);

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      // 直接对 root 生成 PNG，并过滤带有 data-ignore-capture 的节点（如悬浮按钮）
      const dataUrl = await htmlToImage.toPng(root, {
        cacheBust: true,
        pixelRatio,
        skipFonts: false,
        backgroundColor,
        filter: (n: Node) => {
          if (!(n instanceof Element)) return true;
          return !n.closest('[data-ignore-capture]');
        },
        width,
      });

      // 将 dataURL 转回 Canvas，以复用下游处理流程
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res, rej) => {
        img.onload = res as any;
        img.onerror = rej as any;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");
      ctx.drawImage(img, 0, 0);
      return canvas;
    } catch (error) {
      console.error("Failed to capture messages:", error);
      throw error;
    }
  };

  const generatePreview = async () => {
    // 防重入；若当前无容器，直接弹窗并提示
    if (isCapturing) return;
    if (!containerRef.current) {
      setError("没有可捕获的消息内容");
      setShowPreview(true);
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);
      setShowPreview(true);

      const canvas = await captureImage();

      if (!canvas) {
        setError(isMobile
          ? "未找到可捕获的内容。在移动设备上，建议向上滚动以加载更多消息后重试。"
          : "未找到可捕获的内容，请稍后重试");
        return;
      }

      // 生成预览URL
      const imageUrl = canvas.toDataURL("image/png");
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error("Failed to capture messages:", error);
      if (isMobile) {
        setError('生成图片失败。在移动设备上，消息过多可能会导致生成失败，建议减少截图范围或在电脑上操作。');
      } else {
        setError('生成图片失败，请稍后重试');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.download = `chat-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={generatePreview}
        disabled={isCapturing}
        title={isMobile ? "在移动设备上，消息过多可能会导致生成失败" : "生成分享图片"}
      >
        {isCapturing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>

      {showPreview && (
        <Suspense
          fallback={
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogContent className="max-w-md w-full p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">正在打开预览...</span>
                </div>
              </DialogContent>
            </Dialog>
          }
        >
          <MessagePreviewDialog
            open={showPreview}
            onOpenChange={setShowPreview}
            imageUrl={previewUrl}
            onDownload={handleDownload}
            isGenerating={isCapturing}
            error={error}
            isMobile={isMobile}
          />
        </Suspense>
      )}
    </>
  );
}
