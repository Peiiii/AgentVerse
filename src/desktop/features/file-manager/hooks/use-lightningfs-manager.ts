import LightningFS from '@isomorphic-git/lightning-fs';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface FsEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

export function useLightningFSManager() {
  const fsRef = useRef<any>(null);
  const [cwd, setCwd] = useState<string>("/");
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [fileContent, setFileContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 初始化 LightningFS
  useEffect(() => {
    if (!fsRef.current) {
      fsRef.current = new LightningFS('file-manager', { wipe: false });
    }
    refreshEntries(cwd);
    // eslint-disable-next-line
  }, []);

  // 读取目录内容
  const refreshEntries = useCallback(async (dir: string) => {
    setLoading(true);
    setError("");
    try {
      const fs = fsRef.current;
      const names: string[] = await fs.promises.readdir(dir);
      const stats = await Promise.all(
        names.map(async (name) => {
          const path = dir.endsWith('/') ? dir + name : dir + '/' + name;
          const stat = await fs.promises.stat(path);
          return {
            name,
            path,
            type: stat.isDirectory() ? 'dir' : 'file',
          } as FsEntry;
        })
      );
      setEntries(stats);
    } catch (e: any) {
      setEntries([]);
      setError(e.message || '读取目录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 进入目录
  const enterDir = useCallback((dir: string) => {
    setCwd(dir);
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
      const fs = fsRef.current;
      const buf = await fs.promises.readFile(filePath, { encoding: 'utf8' });
      setFileContent(buf);
    } catch (e: any) {
      setFileContent("");
      setError(e.message || '读取文件失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 新建目录
  const createDir = useCallback(async (dirName: string) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const newPath = cwd.endsWith('/') ? cwd + dirName : cwd + '/' + dirName;
      await fs.promises.mkdir(newPath);
      await refreshEntries(cwd);
    } catch (e: any) {
      setError(e.message || '创建目录失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 新建文件
  const createFile = useCallback(async (fileName: string, content = "") => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const newPath = cwd.endsWith('/') ? cwd + fileName : cwd + '/' + fileName;
      await fs.promises.writeFile(newPath, content, { encoding: 'utf8' });
      await refreshEntries(cwd);
    } catch (e: any) {
      setError(e.message || '创建文件失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 删除文件或目录
  const deleteEntry = useCallback(async (path: string) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const stat = await fs.promises.stat(path);
      if (stat.isDirectory()) {
        await fs.promises.rmdir(path);
      } else {
        await fs.promises.unlink(path);
      }
      await refreshEntries(cwd);
    } catch (e: any) {
      setError(e.message || '删除失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 重命名
  const renameEntry = useCallback(async (oldPath: string, newName: string) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = dir + '/' + newName;
      await fs.promises.rename(oldPath, newPath);
      await refreshEntries(cwd);
    } catch (e: any) {
      setError(e.message || '重命名失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 写入文件内容
  const writeFile = useCallback(async (filePath: string, content: string) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      await fs.promises.writeFile(filePath, content, { encoding: 'utf8' });
      await refreshEntries(cwd);
      setFileContent(content);
    } catch (e: any) {
      setError(e.message || '写入失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 上传文件
  const uploadFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const newPath = cwd.endsWith('/') ? cwd + file.name : cwd + '/' + file.name;
      const text = await file.text();
      await fs.promises.writeFile(newPath, text, { encoding: 'utf8' });
      await refreshEntries(cwd);
    } catch (e: any) {
      setError(e.message || '上传失败');
    } finally {
      setLoading(false);
    }
  }, [cwd, refreshEntries]);

  // 下载文件
  const downloadFile = useCallback(async (filePath: string) => {
    setError("");
    setLoading(true);
    try {
      const fs = fsRef.current;
      const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || '下载失败');
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