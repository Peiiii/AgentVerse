import { useCallback, useEffect, useState } from 'react';
import { defaultFileManager, type FsEntry } from '@/common/lib/file-manager.service';

export function useLightningFSManager() {
  const [cwd, setCwd] = useState<string>("/");
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [fileContent, setFileContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 读取目录内容
  const refreshEntries = useCallback(async (dir: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await defaultFileManager.listDirectory(dir);
      if (result.success && result.data) {
        setEntries(result.data.entries);
      } else {
        setEntries([]);
        setError(result.error || '读取目录失败');
      }
    } catch (e: unknown) {
      setEntries([]);
      setError((e as Error)?.message || '读取目录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化文件管理器
  useEffect(() => {
    defaultFileManager.setCurrentPath(cwd);
    refreshEntries(cwd);
  }, [cwd, refreshEntries]);

  // 进入目录
  const enterDir = useCallback((dir: string) => {
    setCwd(dir);
    defaultFileManager.setCurrentPath(dir);
    refreshEntries(dir);
    setSelectedFile("");
    setFileContent("");
  }, [refreshEntries]);

  // 选择文件并读取内容
  const openFile = useCallback(async (filePath: string) => {
    setSelectedFile(filePath);
    setError("");
    setLoading(true);
    try {
      const result = await defaultFileManager.readFile(filePath);
      if (result.success && result.data) {
        setFileContent(result.data.content);
      } else {
        setFileContent("");
        setError(result.error || '读取文件失败');
      }
    } catch (e: unknown) {
      setFileContent("");
      setError((e as Error)?.message || '读取文件失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 新建目录
  const createDir = useCallback(async (dirName: string) => {
    setError("");
    setLoading(true);
    try {
      const newPath = cwd.endsWith('/') ? cwd + dirName : cwd + '/' + dirName;
      const result = await defaultFileManager.createDirectory(newPath);
      if (result.success) {
        await refreshEntries(cwd);
      } else {
        setError(result.error || '创建目录失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '创建目录失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 新建文件
  const createFile = useCallback(async (fileName: string, content = "") => {
    setError("");
    setLoading(true);
    try {
      const newPath = cwd.endsWith('/') ? cwd + fileName : cwd + '/' + fileName;
      const result = await defaultFileManager.writeFile(newPath, content);
      if (result.success) {
        await refreshEntries(cwd);
      } else {
        setError(result.error || '创建文件失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '创建文件失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 删除文件或目录
  const deleteEntry = useCallback(async (path: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await defaultFileManager.deleteEntry(path);
      if (result.success) {
        await refreshEntries(cwd);
      } else {
        setError(result.error || '删除失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '删除失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 重命名
  const renameEntry = useCallback(async (oldPath: string, newName: string) => {
    setError("");
    setLoading(true);
    try {
      const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = dir + '/' + newName;
      const result = await defaultFileManager.renameEntry(oldPath, newPath);
      if (result.success) {
        await refreshEntries(cwd);
      } else {
        setError(result.error || '重命名失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '重命名失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 写入文件内容
  const writeFile = useCallback(async (filePath: string, content: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await defaultFileManager.writeFile(filePath, content);
      if (result.success) {
        await refreshEntries(cwd);
        setFileContent(content);
      } else {
        setError(result.error || '写入失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '写入失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 上传文件
  const uploadFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const result = await defaultFileManager.uploadFile(file, cwd);
      if (result.success) {
        await refreshEntries(cwd);
      } else {
        setError(result.error || '上传失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '上传失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 下载文件
  const downloadFile = useCallback(async (filePath: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await defaultFileManager.downloadFile(filePath);
      if (!result.success) {
        setError(result.error || '下载失败');
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || '下载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cwd,
    entries,
    fileContent,
    selectedFile,
    error,
    loading,
    enterDir,
    openFile,
    createDir,
    createFile,
    deleteEntry,
    renameEntry,
    writeFile,
    uploadFile,
    downloadFile,
    refreshEntries,
    setSelectedFile,
    setCwd,
  };
} 