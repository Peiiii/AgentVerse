import { useEffect, useRef, useState, useCallback } from 'react'

interface UseChatAutoScrollOptions {
  threshold?: number // px，距离底部多少像素内自动 sticky
  deps?: any[] // 依赖项，通常是消息数组
}

export function useChatAutoScroll<T extends HTMLElement = HTMLDivElement>({
  threshold = 30,
  deps = [],
}: UseChatAutoScrollOptions = {}) {
  const containerRef = useRef<T | null>(null)
  const [isSticky, setIsSticky] = useState(true)
  const lastScrollHeight = useRef(0)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  // 监听用户滚动，判断是否 sticky
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsSticky(distanceToBottom <= threshold)
  }, [threshold])

  // 依赖变化时自动滚动到底部（如新消息）
  useEffect(() => {
    if (isSticky) {
      scrollToBottom()
    }
    // 记录上次高度
    if (containerRef.current) {
      lastScrollHeight.current = containerRef.current.scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // sticky模式下，监控高度变化自动滚动到底部
  useEffect(() => {
    if (!isSticky) return
    const el = containerRef.current
    if (!el) return
    let frame: number | null = null
    const check = () => {
      if (!el) return
      if (el.scrollHeight !== lastScrollHeight.current) {
        scrollToBottom()
        lastScrollHeight.current = el.scrollHeight
      }
      frame = requestAnimationFrame(check)
    }
    frame = requestAnimationFrame(check)
    return () => {
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isSticky, scrollToBottom])

  // 绑定滚动事件
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll)
    return () => {
      el.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    containerRef,
    isSticky,
    scrollToBottom,
    setSticky: setIsSticky,
  }
} 