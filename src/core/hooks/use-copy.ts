
interface UseCopyOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onFinish?: () => void;
}

export function useCopy(options: UseCopyOptions = {}) {
  const { onSuccess, onError, onFinish } = options;

  const copy = async (text: string) => {
    try {
      // 首先尝试使用现代 API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用传统的 execCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          throw new Error("Copy failed");
        } finally {
          textArea.remove();
        }
      }

      onSuccess?.();
      return true;
    } catch (error) {
      onError?.(error);
      return false;
    } finally {
      onFinish?.();
    }
  };

  return {
    copy,
  };
}
