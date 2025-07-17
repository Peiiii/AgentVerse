import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { fileTreeService } from '@/common/lib/file-tree.service';
import { useDelayedLoading } from './use-delayed-loading';

function useAsyncRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrap = useCallback(<T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    return fn()
      .catch((e) => {
        setError((e as Error)?.message || '请求失败');
        throw e;
      })
      .finally(() => setLoading(false));
  }, []);
  return { loading, error, wrap };
}

export interface UseFileTreeOptions {
  delayedLoading?: boolean;
  delay?: number;
}

export function useFileTree(rootPath: string = '/', options: UseFileTreeOptions = {}) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([rootPath]);
  const { loading, error, wrap } = useAsyncRequest();
  const { loadingKeys: expandedLoadingKeys, start, stop } = useDelayedLoading(!!options.delayedLoading, options.delay ?? 200);

  // 订阅全局 treeData$
  const treeData = useSyncExternalStore(
    (cb) => {
      const sub = fileTreeService.treeData$.subscribe(() => cb());
      return () => sub.unsubscribe();
    },
    () => fileTreeService.treeData$.getValue()
  );

  // 首次加载全局 loading
  const globalLoading = loading && !treeData;

  // 初始化根节点
  useEffect(() => {
    wrap(() => fileTreeService.getTree(rootPath, 1)).catch(() => {});
  }, [rootPath, wrap]);

  // 懒加载某个节点的 children（可插拔延迟 loading）
  const loadChildren = useCallback(async (path: string) => {
    start(path);
    try {
      await fileTreeService.getChildren(path);
    } finally {
      stop(path);
    }
  }, [start, stop]);

  // 展开/收起节点
  const onExpand = useCallback((key: string) => {
    setExpandedKeys(keys => {
      const next = keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key];
      if (!keys.includes(key)) {
        loadChildren(key);
      }
      return next;
    });
  }, [loadChildren]);

  // 刷新节点
  const refreshNode = useCallback(async (path: string) => {
    start(path);
    try {
      await fileTreeService.refreshNode(path);
      await fileTreeService.getChildren(path);
    } finally {
      stop(path);
    }
  }, [start, stop]);

  // 清理缓存
  const clearCache = useCallback((path?: string) => {
    fileTreeService.clearCache(path);
  }, []);

  return {
    treeData,
    expandedKeys,
    expandedLoadingKeys,
    onExpand,
    refreshNode,
    clearCache,
    loading: globalLoading,
    error,
    loadChildren,
  };
} 