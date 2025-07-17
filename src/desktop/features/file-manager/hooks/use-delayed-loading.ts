import { useRef, useState } from 'react';

export function useDelayedLoading(enabled: boolean, delay = 200) {
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);
  const timers = useRef<Map<string, NodeJS.Timeout | number>>(new Map());

  const start = (key: string) => {
    if (!enabled) return;
    if (timers.current.has(key)) return;
    const timer = setTimeout(() => setLoadingKeys(keys => [...keys, key]), delay);
    timers.current.set(key, timer);
  };

  const stop = (key: string) => {
    if (!enabled) return;
    const t = timers.current.get(key);
    if (t) clearTimeout(t as number);
    timers.current.delete(key);
    setLoadingKeys(keys => keys.filter(k => k !== key));
  };

  return { loadingKeys, start, stop };
} 