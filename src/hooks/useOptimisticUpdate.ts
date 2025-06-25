import { useMemoizedFn } from "ahooks";
import { ReadyResourceState } from "@/common/lib/resource";

interface UseOptimisticUpdateOptions<T> {
  onChange?: (data: T) => void;
}

export function useOptimisticUpdate<T>(
  resource: Pick<ReadyResourceState<T>, 'data' | 'mutate'>,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const { onChange } = options;

  return useMemoizedFn(async <R>(
    // 乐观更新函数
    optimisticUpdate: (currentData: T) => T,
    // API 调用
    apiCall: () => Promise<R>
  ) => {
    const currentData = resource.data;
    const originalData = currentData;

    try {
      // 乐观更新
      const optimisticData = optimisticUpdate(currentData);
      await resource.mutate(optimisticData, false);
      onChange?.(optimisticData);

      // 执行 API 调用
      const result = await apiCall();
      
      // 重新验证数据
      await resource.mutate();
      
      return result;
    } catch (error) {
      // 发生错误时回滚
      await resource.mutate(originalData, true);
      throw error;
    }
  });
} 