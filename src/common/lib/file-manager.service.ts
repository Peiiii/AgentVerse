import LightningFS from '@isomorphic-git/lightning-fs';

export interface FsEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  modifiedTime?: Date;
}

export interface FileOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface FileListResult extends FileOperationResult {
  data?: {
    entries: FsEntry[];
    currentPath: string;
    totalCount: number;
  };
}

export interface FileReadResult extends FileOperationResult {
  data?: {
    content: string;
    path: string;
    size: number;
    modifiedTime: Date;
  };
}

export interface FileWriteResult extends FileOperationResult {
  data?: {
    path: string;
    size: number;
  };
}

export interface StatResultData {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  mtimeMs: number;
}
export interface StatResult {
  success: boolean;
  data?: StatResultData;
  error?: string;
}

export class FileManagerService {
  private fs: LightningFS;
  private currentPath: string = "/";

  constructor(fsName: string = 'file-manager') {
    this.fs = new LightningFS(fsName, { wipe: false });
  }

  // 获取当前路径
  getCurrentPath(): string {
    return this.currentPath;
  }

  // 设置当前路径
  setCurrentPath(path: string): void {
    this.currentPath = path;
  }

  // 列出目录内容
  async listDirectory(path?: string): Promise<FileListResult> {
    const targetPath = path || this.currentPath;
    
    try {
      const names: string[] = await this.fs.promises.readdir(targetPath);
      const entries: FsEntry[] = [];

      for (const name of names) {
        const entryPath = targetPath.endsWith('/') ? targetPath + name : targetPath + '/' + name;
        const stat = await this.fs.promises.stat(entryPath);
        
        entries.push({
          name,
          path: entryPath,
          type: stat.isDirectory() ? 'dir' : 'file',
          size: stat.isFile() ? stat.size : undefined,
          modifiedTime: new Date(stat.mtimeMs),
        });
      }

      return {
        success: true,
        data: {
          entries,
          currentPath: targetPath,
          totalCount: entries.length,
        },
        message: `成功列出 ${entries.length} 个文件/文件夹`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取目录失败',
      };
    }
  }

  // 读取文件内容
  async readFile(path: string): Promise<FileReadResult> {
    try {
      const content = await this.fs.promises.readFile(path, { encoding: 'utf8' });
      const stat = await this.fs.promises.stat(path);
      
      return {
        success: true,
        data: {
          content,
          path,
          size: stat.size,
          modifiedTime: new Date(stat.mtimeMs),
        },
        message: `成功读取文件 ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取文件失败',
      };
    }
  }

  // 写入文件内容
  async writeFile(path: string, content: string): Promise<FileWriteResult> {
    try {
      await this.fs.promises.writeFile(path, content, { encoding: 'utf8', mode: 0o666 });
      const stat = await this.fs.promises.stat(path);
      
      return {
        success: true,
        data: {
          path,
          size: stat.size,
        },
        message: `成功写入文件 ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '写入文件失败',
      };
    }
  }

  // 创建目录
  async createDirectory(path: string): Promise<FileOperationResult> {
    try {
      await this.fs.promises.mkdir(path);
      return {
        success: true,
        message: `成功创建目录 ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建目录失败',
      };
    }
  }

  // 删除文件或目录
  async deleteEntry(path: string): Promise<FileOperationResult> {
    try {
      const stat = await this.fs.promises.stat(path);
      if (stat.isDirectory()) {
        await this.fs.promises.rmdir(path);
      } else {
        await this.fs.promises.unlink(path);
      }
      
      return {
        success: true,
        message: `成功删除 ${stat.isDirectory() ? '目录' : '文件'} ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除失败',
      };
    }
  }

  // 重命名文件或目录
  async renameEntry(oldPath: string, newPath: string): Promise<FileOperationResult> {
    try {
      await this.fs.promises.rename(oldPath, newPath);
      return {
        success: true,
        message: `成功重命名 ${oldPath} 为 ${newPath}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重命名失败',
      };
    }
  }

  // 上传文件
  async uploadFile(file: File, targetPath?: string): Promise<FileOperationResult> {
    try {
      const path = targetPath || (this.currentPath.endsWith('/') ? this.currentPath + file.name : this.currentPath + '/' + file.name);
      const content = await file.text();
      await this.fs.promises.writeFile(path, content, { encoding: 'utf8', mode: 0o666 });
      
      return {
        success: true,
        message: `成功上传文件 ${file.name}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传文件失败',
      };
    }
  }

  // 下载文件
  async downloadFile(path: string): Promise<FileOperationResult> {
    try {
      const content = await this.fs.promises.readFile(path, { encoding: 'utf8' });
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download.txt';
      a.click();
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `成功下载文件 ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '下载文件失败',
      };
    }
  }

  // 检查文件是否存在
  async exists(path: string): Promise<boolean> {
    try {
      await this.fs.promises.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  // 获取文件信息
  async getFileInfo(path: string): Promise<FileOperationResult> {
    try {
      const stat = await this.fs.promises.stat(path);
      return {
        success: true,
        data: {
          name: path.split('/').pop(),
          path,
          type: stat.isDirectory() ? 'dir' : 'file',
          size: stat.isFile() ? stat.size : undefined,
          modifiedTime: new Date(stat.mtimeMs),
          createdTime: new Date(stat.ctimeMs),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取文件信息失败',
      };
    }
  }

  // 搜索文件
  async searchFiles(pattern: string, searchPath?: string): Promise<FileOperationResult> {
    const targetPath = searchPath || this.currentPath;
    
    try {
      const names: string[] = await this.fs.promises.readdir(targetPath);
      const results: FsEntry[] = [];

      for (const name of names) {
        if (name.toLowerCase().includes(pattern.toLowerCase())) {
          const entryPath = targetPath.endsWith('/') ? targetPath + name : targetPath + '/' + name;
          const stat = await this.fs.promises.stat(entryPath);
          
          results.push({
            name,
            path: entryPath,
            type: stat.isDirectory() ? 'dir' : 'file',
            size: stat.isFile() ? stat.size : undefined,
            modifiedTime: new Date(stat.mtimeMs),
          });
        }
      }

      return {
        success: true,
        data: {
          entries: results,
          searchPattern: pattern,
          totalCount: results.length,
        },
        message: `找到 ${results.length} 个匹配的文件/文件夹`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索文件失败',
      };
    }
  }

  // 获取文件/目录 stat 信息
  async stat(path: string): Promise<StatResult> {
    try {
      const stat = await this.fs.promises.stat(path);
      return {
        success: true,
        data: {
          size: stat.size,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          mtimeMs: stat.mtimeMs,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'stat 失败',
      };
    }
  }
}

// 创建默认的文件管理器实例
export const defaultFileManager = new FileManagerService(); 