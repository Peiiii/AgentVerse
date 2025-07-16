import { useCallback, useRef } from "react";

/**
 * 可插拔的聊天消息缓存 Hook
 * @param cacheKey 缓存唯一 key
 * @returns { initialMessages, handleMessagesChange }
 */
export function useChatMessageCache<T = unknown>(cacheKey: string) {
  // 只在首次加载时恢复缓存
  const initialMessagesRef = useRef<T[]>([]);
  const loadedRef = useRef(false);
  if (!loadedRef.current) {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        initialMessagesRef.current = JSON.parse(raw);
      }
    } catch { /* ignore */ }
    loadedRef.current = true;
  }

  // 消息变更时自动缓存
  const handleMessagesChange = useCallback((messages: T[]) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [cacheKey]);

  return {
    initialMessages: initialMessagesRef.current,
    handleMessagesChange,
  };
} 