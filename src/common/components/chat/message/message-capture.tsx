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

  const captureImage = async () => {
    if (!containerRef.current || isCapturing) return null;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const container = containerRef.current;
      
      // 获取计算后的背景色
      const computedStyle = window.getComputedStyle(document.body);
      const backgroundColor = computedStyle.backgroundColor;
      
      // 准备截图：展开所有消息
      const originalHeight = container.style.height;
      const originalOverflow = container.style.overflow;
      
      // 临时修改样式以确保完整捕获
      container.style.height = 'auto';
      container.style.overflow = 'visible';
      
      // 生成截图
      const canvas = await html2canvas(container, {
        backgroundColor: backgroundColor, // 使用实际的背景色
        scale: window.devicePixelRatio <= 2 ? window.devicePixelRatio : 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
      });
      
      // 恢复原始样式
      container.style.height = originalHeight;
      container.style.overflow = originalOverflow;
      
      return canvas;
      
    } catch (error) {
      console.error('Failed to capture messages:', error);
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
