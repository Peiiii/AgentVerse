import { Button } from "@/common/components/ui/button";
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

  // 使用 html-to-image，规避 html2canvas 对 oklch 等新色彩语法不兼容的问题
  const captureImage = async () => {
    if (!containerRef.current || isCapturing) return null;

    const node = containerRef.current;
    try {
      const htmlToImage = await import("html-to-image");

      // 找到最接近的有背景色的祖先，保证导出图片背景与页面一致
      const resolveBackgroundColor = (el: HTMLElement | null): string | null => {
        let cur: HTMLElement | null = el;
        while (cur) {
          const bg = window.getComputedStyle(cur).backgroundColor;
          // 过滤透明背景
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            return bg;
          }
          cur = cur.parentElement;
        }
        return window.getComputedStyle(document.body).backgroundColor || null;
      };
      const backgroundColor = resolveBackgroundColor(node as HTMLElement) || undefined;

      // 暂存原始内联样式，临时展开内容，确保完整渲染
      const original = {
        height: (node as HTMLElement).style.height,
        overflow: (node as HTMLElement).style.overflow,
      };
      (node as HTMLElement).style.height = "auto";
      (node as HTMLElement).style.overflow = "visible";

      // 设备像素比上限 2，避免超大图片
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      // toPng 返回 base64 URL，这里不手动传入 backgroundColor，
      // 让库在 foreignObject 中复刻计算样式，避免 oklch 解析失败
      const dataUrl = await htmlToImage.toPng(node as HTMLElement, {
        cacheBust: true,
        pixelRatio,
        skipFonts: false,
        backgroundColor,
        // 只保留消息列表区域，避免截到浮层按钮
        filter: (el) => {
          // 过滤掉我们自己的浮动操作区域（例如含有 data-ignore-capture 标记的节点）
          const anyEl = el as HTMLElement;
          if (anyEl?.dataset?.ignoreCapture === "true") return false;
          return true;
        },
      });

      // 恢复样式
      (node as HTMLElement).style.height = original.height;
      (node as HTMLElement).style.overflow = original.overflow;

      // 转换为 Canvas 以保持后续流程不变
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
    if (!containerRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setError(null);
      setShowPreview(true);

      const canvas = await captureImage();

      if (canvas) {
        // 生成预览URL
        const imageUrl = canvas.toDataURL("image/png");
        setPreviewUrl(imageUrl);
      }
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
        <Suspense fallback={null}>
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
