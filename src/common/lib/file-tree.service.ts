import type { FileManagerService } from './file-manager.service';
import { defaultFileManager } from './file-manager.service';
import { BehaviorSubject } from 'rxjs';

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  modifiedTime?: Date;
  children?: FileTreeNode[];
  isLoaded?: boolean;
}

export interface FileTreeService {
  getNode(path: string): Promise<FileTreeNode | null>;
  getChildren(path: string): Promise<FileTreeNode[]>;
  getFileInfo(path: string): Promise<FileTreeNode | null>;
  getTree(rootPath?: string, depth?: number): Promise<FileTreeNode>;
  refreshNode(path: string): Promise<FileTreeNode | null>;
  clearCache(path?: string): void;
  treeData$: BehaviorSubject<FileTreeNode | null>;
}

export class FileTreeServiceImpl implements FileTreeService {
  private cache = new Map<string, FileTreeNode>();
  private fileManager: FileManagerService;
  public treeData$: BehaviorSubject<FileTreeNode | null> = new BehaviorSubject<FileTreeNode | null>(null);

  constructor(fileManager: FileManagerService) {
    this.fileManager = fileManager;
  }

  async getNode(path: string): Promise<FileTreeNode | null> {
    if (this.cache.has(path)) return this.cache.get(path)!;
    const info = await this.getFileInfo(path);
    if (info) this.cache.set(path, info);
    return info;
  }

  async getChildren(path: string): Promise<FileTreeNode[]> {
    const res = await this.fileManager.listDirectory(path);
    if (!res.success || !res.data) return [];
    const children: FileTreeNode[] = res.data.entries.map(e => ({
      ...e,
      children: e.type === 'dir' ? undefined : undefined,
      isLoaded: false,
    }));
    children.forEach(child => this.cache.set(child.path, child));
    const parent = this.cache.get(path);
    if (parent) {
      parent.children = children;
      parent.isLoaded = true;
      this.cache.set(path, parent);
      // 递归更新 treeData$
      this.updateTreeDataNode(path, children);
    }
    return children;
  }

  async getFileInfo(path: string): Promise<FileTreeNode | null> {
    const stat = await this.fileManager.stat(path);
    if (!stat.success || !stat.data) return null;
    return {
      name: path.split('/').pop() || path,
      path,
      type: stat.data.isDirectory ? 'dir' : 'file',
      size: stat.data.size,
      modifiedTime: stat.data.mtimeMs ? new Date(stat.data.mtimeMs) : undefined,
      isLoaded: false,
    };
  }

  async getTree(rootPath: string = '/', depth: number = 1): Promise<FileTreeNode> {
    const root = await this.getNode(rootPath) || {
      name: rootPath.split('/').pop() || rootPath,
      path: rootPath,
      type: 'dir',
      isLoaded: false,
    };
    if (depth > 0 && root.type === 'dir') {
      const children = await this.getChildren(rootPath);
      root.children = children;
      root.isLoaded = true;
      for (const child of children) {
        if (child.type === 'dir') {
          await this.getTree(child.path, depth - 1);
        }
      }
    }
    this.cache.set(rootPath, root);
    this.treeData$.next(root);
    return root;
  }

  async refreshNode(path: string): Promise<FileTreeNode | null> {
    this.cache.delete(path);
    if (path !== '/') {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      this.cache.delete(parentPath);
    }
    return this.getNode(path);
  }

  clearCache(path?: string): void {
    if (!path) {
      this.cache.clear();
    } else {
      this.cache.delete(path);
    }
    this.treeData$.next(null);
  }

  // 递归更新 treeData$ 某节点的 children
  private updateTreeDataNode(path: string, children: FileTreeNode[]) {
    const current = this.treeData$.getValue();
    if (!current) return;
    const update = (node: FileTreeNode): FileTreeNode => {
      if (node.path === path) {
        return { ...node, children, isLoaded: true };
      }
      if (node.children) {
        return { ...node, children: node.children.map(update) };
      }
      return node;
    };
    this.treeData$.next(update(current));
  }
}

export const fileTreeService = new FileTreeServiceImpl(defaultFileManager); 