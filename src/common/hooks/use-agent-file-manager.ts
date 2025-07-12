import { useCallback, useEffect, useState } from 'react';
import { defaultFileManager, type FsEntry } from '@/common/lib/file-manager.service';

// 文件信息类型定义
interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'dir';
  modifiedTime: Date;
  createdTime: Date;
}

export interface AgentFileManagerState {
  currentPath: string;
  entries: FsEntry[];
  selectedFile: string | null;
  fileContent: string;
  loading: boolean;
  error: string | null;
}

export interface AgentFileManagerActions {
  // 导航操作
  navigateTo: (path: string) => Promise<void>;
  goBack: () => Promise<void>;
  
  // 文件操作
  readFile: (path: string) => Promise<string | null>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  createFile: (name: string, content?: string) => Promise<boolean>;
  createDirectory: (name: string) => Promise<boolean>;
  deleteEntry: (path: string) => Promise<boolean>;
  renameEntry: (oldPath: string, newName: string) => Promise<boolean>;
  
  // 搜索操作
  searchFiles: (pattern: string) => Promise<FsEntry[]>;
  
  // 工具操作
  getFileInfo: (path: string) => Promise<FileInfo | null>;
  downloadFile: (path: string) => Promise<boolean>;
  
  // 状态操作
  refresh: () => Promise<void>;
  clearError: () => void;
  selectFile: (path: string | null) => void;
}

export function useAgentFileManager(initialPath: string = "/"): AgentFileManagerState & AgentFileManagerActions {
  const [state, setState] = useState<AgentFileManagerState>({
    currentPath: initialPath,
    entries: [],
    selectedFile: null,
    fileContent: "",
    loading: false,
    error: null,
  });

  // 设置当前路径并刷新目录
  const navigateTo = useCallback(async (path: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      defaultFileManager.setCurrentPath(path);
      const result = await defaultFileManager.listDirectory(path);
      if (result.success && result.data?.entries) {
        setState(prev => ({
          ...prev,
          currentPath: path,
          entries: result.data!.entries,
          loading: false,
          selectedFile: null,
          fileContent: "",
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '导航失败',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '导航失败',
      }));
    }
  }, []);

  // 返回上级目录
  const goBack = useCallback(async () => {
    const currentPath = state.currentPath;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const targetPath = parentPath || '/';
    await navigateTo(targetPath);
  }, [state.currentPath, navigateTo]);

  // 读取文件
  const readFile = useCallback(async (path: string): Promise<string | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await defaultFileManager.readFile(path);
      if (result.success && result.data?.content) {
        setState(prev => ({
          ...prev,
          selectedFile: path,
          fileContent: result.data!.content,
          loading: false,
        }));
        return result.data!.content;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '读取文件失败',
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '读取文件失败',
      }));
      return null;
    }
  }, []);

  // 写入文件
  const writeFile = useCallback(async (path: string, content: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await defaultFileManager.writeFile(path, content);
      if (result.success) {
        setState(prev => ({
          ...prev,
          fileContent: content,
          loading: false,
        }));
        // 直接刷新当前目录，避免循环依赖
        const refreshResult = await defaultFileManager.listDirectory(state.currentPath);
        if (refreshResult.success && refreshResult.data?.entries) {
          setState(prev => ({
            ...prev,
            entries: refreshResult.data!.entries,
          }));
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '写入文件失败',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '写入文件失败',
      }));
      return false;
    }
  }, [state.currentPath]);

  // 创建文件
  const createFile = useCallback(async (name: string, content: string = ""): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const path = state.currentPath.endsWith('/') ? state.currentPath + name : state.currentPath + '/' + name;
      const result = await defaultFileManager.writeFile(path, content);
      if (result.success) {
        // 直接刷新当前目录，避免循环依赖
        const refreshResult = await defaultFileManager.listDirectory(state.currentPath);
        if (refreshResult.success && refreshResult.data?.entries) {
          setState(prev => ({
            ...prev,
            entries: refreshResult.data!.entries,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '创建文件失败',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '创建文件失败',
      }));
      return false;
    }
  }, [state.currentPath]);

  // 创建目录
  const createDirectory = useCallback(async (name: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const path = state.currentPath.endsWith('/') ? state.currentPath + name : state.currentPath + '/' + name;
      const result = await defaultFileManager.createDirectory(path);
      if (result.success) {
        // 直接刷新当前目录，避免循环依赖
        const refreshResult = await defaultFileManager.listDirectory(state.currentPath);
        if (refreshResult.success && refreshResult.data?.entries) {
          setState(prev => ({
            ...prev,
            entries: refreshResult.data!.entries,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '创建目录失败',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '创建目录失败',
      }));
      return false;
    }
  }, [state.currentPath]);

  // 删除文件或目录
  const deleteEntry = useCallback(async (path: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await defaultFileManager.deleteEntry(path);
      if (result.success) {
        // 直接刷新当前目录，避免循环依赖
        const refreshResult = await defaultFileManager.listDirectory(state.currentPath);
        if (refreshResult.success && refreshResult.data?.entries) {
          setState(prev => ({
            ...prev,
            entries: refreshResult.data!.entries,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '删除失败',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '删除失败',
      }));
      return false;
    }
  }, [state.currentPath]);

  // 重命名文件或目录
  const renameEntry = useCallback(async (oldPath: string, newName: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = dir + '/' + newName;
      const result = await defaultFileManager.renameEntry(oldPath, newPath);
      if (result.success) {
        // 直接刷新当前目录，避免循环依赖
        const refreshResult = await defaultFileManager.listDirectory(state.currentPath);
        if (refreshResult.success && refreshResult.data?.entries) {
          setState(prev => ({
            ...prev,
            entries: refreshResult.data!.entries,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '重命名失败',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '重命名失败',
      }));
      return false;
    }
  }, [state.currentPath]);

  // 搜索文件
  const searchFiles = useCallback(async (pattern: string): Promise<FsEntry[]> => {
    try {
      const result = await defaultFileManager.searchFiles(pattern, state.currentPath);
      if (result.success && result.data && typeof result.data === 'object' && result.data !== null && 'entries' in result.data) {
        return (result.data as { entries: FsEntry[] }).entries;
      }
      return [];
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '搜索失败',
      }));
      return [];
    }
  }, [state.currentPath]);

  // 获取文件信息
  const getFileInfo = useCallback(async (path: string): Promise<FileInfo | null> => {
    try {
      const result = await defaultFileManager.getFileInfo(path);
      if (result.success && result.data && typeof result.data === 'object' && result.data !== null) {
        return result.data as FileInfo;
      }
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '获取文件信息失败',
      }));
      return null;
    }
  }, []);

  // 下载文件
  const downloadFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      const result = await defaultFileManager.downloadFile(path);
      return result.success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '下载失败',
      }));
      return false;
    }
  }, []);

  // 刷新当前目录
  const refresh = useCallback(async () => {
    await navigateTo(state.currentPath);
  }, [state.currentPath, navigateTo]);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 选择文件
  const selectFile = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, selectedFile: path }));
  }, []);

  // 初始化
  useEffect(() => {
    navigateTo(initialPath);
  }, [initialPath, navigateTo]);

  return {
    ...state,
    navigateTo,
    goBack,
    readFile,
    writeFile,
    createFile,
    createDirectory,
    deleteEntry,
    renameEntry,
    searchFiles,
    getFileInfo,
    downloadFile,
    refresh,
    clearError,
    selectFile,
  };
} 