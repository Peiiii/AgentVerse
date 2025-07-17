import { useCallback } from 'react';
import { useState } from 'react';

export function useWorkingDirectory(initialCwd: string = '/') {
  const [cwd, setCwd] = useState(initialCwd);
  // 可扩展为 zustand store
  const updateCwd = useCallback((path: string) => {
    setCwd(path);
  }, []);
  return { cwd, setCwd: updateCwd };
} 