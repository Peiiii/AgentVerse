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

    // 选择截图根节点：优先选择标记为 data-capture-root 的祖先，
    // 以保证包含正确的背景与上下文；否则回退到传入容器本身
    const node = containerRef.current;
    const captureRoot = (node as HTMLElement).closest(
      "[data-capture-root]"
    ) as HTMLElement | null;
    const root = (captureRoot ?? (node as HTMLElement)) as HTMLElement;
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
      const backgroundColor = resolveBackgroundColor(root) || undefined;

      // 设备像素比上限 2，避免超大图片
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      // 为了捕获完整内容，不对真实 DOM 进行改动，改为构造一个离屏容器，
      // 将消息内容节点克隆进去，按原宽度自然撑开到完整高度进行渲染
      const offscreen = document.createElement("div");
      const rootRect = root.getBoundingClientRect();
      offscreen.style.position = "fixed";
      offscreen.style.left = "-10000px";
      offscreen.style.top = "0";
      offscreen.style.width = `${Math.round(rootRect.width)}px`;
      offscreen.style.background = backgroundColor || "transparent";
      offscreen.style.boxSizing = "border-box";
      offscreen.style.padding = "0";
      offscreen.style.margin = "0";
      offscreen.style.overflow = "visible";
      // 克隆消息内容节点（包含所有消息），避免受滚动容器限制
      const cloned = node.cloneNode(true) as HTMLElement;
      // 规避动画/过渡导致的透明或位移：去除隐藏类与内联样式中的 opacity/transform
      const sanitizeClone = (rootEl: HTMLElement) => {
        const HIDE_CLASS = new Set(["opacity-0", "hidden", "invisible", "sr-only"]);
        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_ELEMENT);
        let current = walker.currentNode as HTMLElement | null;
        while (current) {
          // 去除 tailwind 隐藏类
          if (current.classList) {
            for (const c of Array.from(current.classList)) {
              if (HIDE_CLASS.has(c)) current.classList.remove(c);
            }
          }
          // 清除常见内联隐藏/位移动画样式
          const style = (current as HTMLElement).style as CSSStyleDeclaration;
          if (style) {
            if (style.opacity === "0") style.opacity = "1";
            if (style.transform && style.transform !== "none") style.transform = "none";
            if (style.transition) style.transition = "";
            if (style.visibility === "hidden") style.visibility = "visible";
          }
          current = walker.nextNode() as HTMLElement | null;
        }
      };
      sanitizeClone(cloned);
      // 确保克隆节点在离屏容器中按块级布局占满宽度
      cloned.style.display = "block";
      cloned.style.width = "100%";
      offscreen.appendChild(cloned);
      document.body.appendChild(offscreen);

      const dataUrl = await htmlToImage.toPng(offscreen, {
        cacheBust: true,
        pixelRatio,
        skipFonts: false,
        backgroundColor,
      });

      // 清理离屏容器
      document.body.removeChild(offscreen);

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
