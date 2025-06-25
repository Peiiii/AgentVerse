import { useState, useEffect, useCallback } from 'react';

export interface PersistOptions<T> {
  key: string;
  version?: number;
  migrate?: (oldValue: unknown, oldVersion: number) => T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

const defaultSerialize = <T>(value: T): string => JSON.stringify(value);
const defaultDeserialize = <T>(value: string): T => JSON.parse(value);

export function usePersistedState<T>(
  defaultValue: T | (() => T),
  options: PersistOptions<T>
) {
  // 确保 key 的唯一性
  const storageKey = `persisted_state:${options.key}:v${options.version || 1}`;
  
  // 初始化函数 - 尝试从存储中读取,如果没有则使用默认值
  const getInitialValue = (): T => {
    try {
      const serializedValue = localStorage.getItem(storageKey);
      if (serializedValue === null) {
        return typeof defaultValue === 'function' 
          ? (defaultValue as () => T)() 
          : defaultValue;
      }

      // 如果有版本迁移函数,则进行迁移
      if (options.migrate) {
        const oldVersion = Number(localStorage.getItem(`${storageKey}:version`)) || 1;
        if (oldVersion < (options.version || 1)) {
          const deserialize = options.deserialize || defaultDeserialize;
          const oldValue = deserialize(serializedValue);
          return options.migrate(oldValue, oldVersion);
        }
      }

      const deserialize = options.deserialize || defaultDeserialize;
      return deserialize(serializedValue);
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${options.key}":`, error);
      return typeof defaultValue === 'function' 
        ? (defaultValue as () => T)() 
        : defaultValue;
    }
  };

  const [state, setState] = useState<T>(getInitialValue);

  // 持久化到 localStorage
  const persistState = useCallback((value: T) => {
    try {
      const serialize = options.serialize || defaultSerialize;
      localStorage.setItem(storageKey, serialize(value));
      if (options.version) {
        localStorage.setItem(`${storageKey}:version`, String(options.version));
      }
    } catch (error) {
      console.warn(`Failed to persist state for key "${options.key}":`, error);
    }
  }, [storageKey, options]);

  // 更新状态的包装函数
  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof value === 'function' 
        ? (value as ((prev: T) => T))(prev) 
        : value;
      persistState(nextValue);
      return nextValue;
    });
  }, [persistState]);

  // 订阅 storage 事件,实现跨标签页同步
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        try {
          const deserialize = options.deserialize || defaultDeserialize;
          const newValue = deserialize(event.newValue);
          setState(newValue);
        } catch (error) {
          console.warn(`Failed to sync state for key "${options.key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, options]);

  return [state, setPersistedState] as const;
} 