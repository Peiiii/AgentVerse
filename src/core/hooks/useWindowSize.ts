import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 使用 ResizeObserver 监听 body 大小变化
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);

    // 同时也监听 window resize 事件，因为有些场景 ResizeObserver 可能捕获不到
    // 比如移动端键盘弹出导致的视口变化
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
} 