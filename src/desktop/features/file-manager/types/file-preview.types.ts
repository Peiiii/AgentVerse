import { ReactNode } from 'react';

// 文件预览器接口
export interface FilePreviewer {
  // 唯一标识符
  id: string;
  // 显示名称
  name: string;
  // 描述
  description?: string;
  // 图标组件（函数形式）
  icon?: () => ReactNode;
  // 文件匹配规则
  matcher: FileMatcher;
  // 预览组件
  component: React.ComponentType<FilePreviewProps>;
  // 优先级（数字越大优先级越高）
  priority?: number;
  // 是否支持编辑
  supportsEdit?: boolean;
  // 是否支持刷新
  supportsRefresh?: boolean;
}

// 文件匹配器
export interface FileMatcher {
  // 文件扩展名匹配
  extensions?: string[];
  // 文件名模式匹配（支持 glob 模式）
  patterns?: string[];
  // 自定义匹配函数
  test?: (filePath: string, fileName: string, fileExtension: string) => boolean;
  // MIME 类型匹配
  mimeTypes?: string[];
}

// 文件预览组件属性
export interface FilePreviewProps {
  // 文件路径
  filePath: string;
  // 文件内容
  content: string;
  // 文件信息
  fileInfo: FileInfo;
  // 是否正在加载
  loading: boolean;
  // 错误信息
  error: string | null;
  // 刷新回调
  onRefresh?: () => Promise<void>;
  // 保存回调
  onSave?: (content: string) => Promise<void>;
  // 关闭回调
  onClose?: () => void;
  // 是否支持编辑
  supportsEdit?: boolean;
  // 是否支持刷新
  supportsRefresh?: boolean;
}

// 文件信息
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  mimeType?: string;
  lastModified?: Date;
}

// 预览器注册表
export interface FilePreviewRegistry {
  // 注册预览器
  register(previewer: FilePreviewer): void;
  // 注销预览器
  unregister(id: string): void;
  // 获取所有预览器
  getAll(): FilePreviewer[];
  // 根据文件路径查找匹配的预览器
  findForFile(filePath: string, fileName: string, fileExtension: string): FilePreviewer | null;
  // 清空所有预览器
  clear(): void;
}

// 预览器配置
export interface FilePreviewConfig {
  // 最大预览文件大小（字节）
  maxPreviewSize?: number;
  // 默认预览器（当没有匹配的预览器时使用）
  defaultPreviewer?: FilePreviewer;
  // 是否启用缓存
  enableCache?: boolean;
  // 缓存过期时间（毫秒）
  cacheExpiry?: number;
} 