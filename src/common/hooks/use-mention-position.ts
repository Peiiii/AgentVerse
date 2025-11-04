import { useState, useEffect, useCallback } from "react";

interface MentionPosition {
  top: number;
  left: number;
}

interface UseMentionPositionOptions {
  isActive: boolean;
  startIndex: number;
  value: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

// Compute the floating menu position for @-mention suggestions.
// We mirror the textarea's layout (font, padding, width) in a hidden fixed-position
// container anchored to the textarea's top/left, then place a zero-width marker
// right after the text before the @. The marker's viewport rect gives us the
// coordinates to position the menu.
export function useMentionPosition({
  isActive,
  startIndex,
  value,
  inputRef,
}: UseMentionPositionOptions): MentionPosition | null {
  const [position, setPosition] = useState<MentionPosition | null>(null);

  const calculatePosition = useCallback(() => {
    if (!isActive || !inputRef.current) {
      setPosition(null);
      return;
    }

    const textarea = inputRef.current;
    const textBeforeMention = value.slice(0, startIndex);
    const textareaStyle = window.getComputedStyle(textarea);
    const textareaRect = textarea.getBoundingClientRect();

    // Hidden container that mirrors the textarea box at the same viewport position
    const container = document.createElement("div");
    container.style.position = "fixed"; // viewport-relative to match portal fixed positioning
    container.style.top = `${textareaRect.top}px`;
    container.style.left = `${textareaRect.left}px`;
    container.style.width = `${textareaRect.width}px`;
    container.style.boxSizing = "border-box";
    container.style.visibility = "hidden";
    container.style.whiteSpace = "pre-wrap";
    container.style.wordWrap = "break-word";
    // Mirror relevant text styles so wrapping/line breaks match
    container.style.font = textareaStyle.font;
    container.style.fontSize = textareaStyle.fontSize;
    container.style.fontFamily = textareaStyle.fontFamily;
    container.style.fontWeight = textareaStyle.fontWeight as string;
    container.style.lineHeight = textareaStyle.lineHeight;
    container.style.letterSpacing = textareaStyle.letterSpacing;
    container.style.padding = textareaStyle.padding;
    container.style.border = "0";

    // Put the text before the @ mention and a marker span at the end
    // Use textContent to avoid HTML injection; zero-width space ensures the span has a rect
    const textNode = document.createTextNode(textBeforeMention);
    const marker = document.createElement("span");
    marker.textContent = "\u200b"; // zero-width space creates measurable rect
    container.appendChild(textNode);
    container.appendChild(marker);
    document.body.appendChild(container);

    const markerRect = marker.getBoundingClientRect();

    // Cleanup the measurement DOM
    document.body.removeChild(container);

    // Width of the suggestions menu (w-64 = 256px). Keep menu within textarea right edge
    const MENU_WIDTH = 256;
    // Use caret's bottom as anchor; consumer decides to render above or below and add gaps/transform.
    const top = markerRect.bottom;
    const left = Math.min(markerRect.left, textareaRect.right - MENU_WIDTH);

    setPosition({ top, left });
  }, [isActive, startIndex, value, inputRef]);

  useEffect(() => {
    if (!isActive) {
      setPosition(null);
      return;
    }

    calculatePosition();
    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener("resize", handleResize);
    // capture scrolling on any ancestor to keep position in sync
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isActive, calculatePosition]);

  return position;
}
