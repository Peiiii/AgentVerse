import { useState, useCallback } from 'react';
import { defaultFileManager } from '@/common/lib/file-manager.service';

export function useFileOps() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新建文件
  const createFile = useCallback(async (path: string, content = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.writeFile(path, content);
      if (!result.success) setError(result.error || '创建文件失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '创建文件失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 新建目录
  const createDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.createDirectory(path);
      if (!result.success) setError(result.error || '创建目录失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '创建目录失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除文件或目录
  const deleteEntry = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.deleteEntry(path);
      if (!result.success) setError(result.error || '删除失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '删除失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 重命名
  const renameEntry = useCallback(async (oldPath: string, newPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.renameEntry(oldPath, newPath);
      if (!result.success) setError(result.error || '重命名失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '重命名失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 上传文件
  const uploadFile = useCallback(async (file: File, targetPath?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.uploadFile(file, targetPath);
      if (!result.success) setError(result.error || '上传失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '上传失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 下载文件
  const downloadFile = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await defaultFileManager.downloadFile(path);
      if (!result.success) setError(result.error || '下载失败');
      return result.success;
    } catch (e) {
      setError((e as Error)?.message || '下载失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createFile,
    createDirectory,
    deleteEntry,
    renameEntry,
    uploadFile,
    downloadFile,
    loading,
    error,
  };
} 