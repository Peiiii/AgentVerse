import { useCallback, useEffect, useState } from 'react';

interface ViewportState {
  height: number;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export function useViewportHeight(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => ({
    height: window.innerHeight,
    isKeyboardVisible: false,
    keyboardHeight: 0
  }));

  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  const getVisibleHeight = useCallback((): number => {
    if (window.visualViewport) {
      return window.visualViewport.height;
    }
    return window.innerHeight;
  }, []);

  const updateViewportState = useCallback(() => {
    if (!isMobile) {
      setState({
        height: window.innerHeight,
        isKeyboardVisible: false,
        keyboardHeight: 0
      });
      return;
    }

    const currentHeight = getVisibleHeight();
    const maxHeight = Math.max(window.innerHeight, currentHeight);
    const heightDiff = maxHeight - currentHeight;
    
    // 调整键盘检测阈值
    const keyboardThreshold = isAndroid ? maxHeight * 0.15 : maxHeight * 0.25;
    const isKeyboardVisible = heightDiff > keyboardThreshold;

    // 防止 Android Chrome 软键盘收起时的抽屉问题
    if (isAndroid && !isKeyboardVisible) {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.minHeight = '100%';
      
      // 强制重排
      requestAnimationFrame(() => {
        document.documentElement.style.height = '';
        document.body.style.height = '';
        document.body.style.minHeight = '';
      });
    }

    setState({
      height: currentHeight,
      isKeyboardVisible,
      keyboardHeight: isKeyboardVisible ? heightDiff : 0
    });
  }, [getVisibleHeight, isAndroid, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      // 使用 requestAnimationFrame 来确保视口更新的平滑性
      requestAnimationFrame(() => {
        setState({
          height: window.innerHeight,
          isKeyboardVisible: false,
          keyboardHeight: 0
        });
      });
    };

    window.addEventListener("resize", handleResize);
    // 初始化时立即执行一次
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('resize', updateViewportState);
      return () => window.removeEventListener('resize', updateViewportState);
    }

    const cleanup: (() => void)[] = [];

    if (window.visualViewport) {
      const handleViewportChange = () => {
        requestAnimationFrame(updateViewportState);
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);

      cleanup.push(() => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      });
    }

    if (isIOS) {
      const handleFocusIn = () => {
        setTimeout(updateViewportState, 300);
      };

      const handleFocusOut = () => {
        setTimeout(updateViewportState, 100);
      };

      window.addEventListener('focusin', handleFocusIn);
      window.addEventListener('focusout', handleFocusOut);

      cleanup.push(() => {
        window.removeEventListener('focusin', handleFocusIn);
        window.removeEventListener('focusout', handleFocusOut);
      });
    }

    if (!isIOS && isMobile) {
      const handleResize = () => {
        requestAnimationFrame(updateViewportState);
      };

      window.addEventListener('resize', handleResize);
      cleanup.push(() => window.removeEventListener('resize', handleResize));
    }

    const handleOrientationChange = () => {
      setTimeout(updateViewportState, 150);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    cleanup.push(() => window.removeEventListener('orientationchange', handleOrientationChange));

    updateViewportState();

    return () => cleanup.forEach(fn => fn());
  }, [isMobile, isIOS, updateViewportState]);

  return state;
} 