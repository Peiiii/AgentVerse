import { FilePreviewer, FilePreviewRegistry, FileMatcher } from '../types/file-preview.types';

// 简单的 glob 模式匹配函数
function matchPattern(pattern: string, text: string): boolean {
  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
  return regex.test(text);
}

// 检查文件是否匹配预览器
function matchesPreviewer(
  previewer: FilePreviewer,
  filePath: string,
  fileName: string,
  fileExtension: string
): boolean {
  const { matcher } = previewer;

  // 检查扩展名匹配
  if (matcher.extensions && matcher.extensions.length > 0) {
    const normalizedExtension = fileExtension.toLowerCase();
    if (!matcher.extensions.some(ext => ext.toLowerCase() === normalizedExtension)) {
      return false;
    }
  }

  // 检查文件名模式匹配
  if (matcher.patterns && matcher.patterns.length > 0) {
    if (!matcher.patterns.some(pattern => matchPattern(pattern, fileName))) {
      return false;
    }
  }

  // 检查自定义匹配函数
  if (matcher.test && !matcher.test(filePath, fileName, fileExtension)) {
    return false;
  }

  return true;
}

// 文件预览器注册表实现
class FilePreviewRegistryImpl implements FilePreviewRegistry {
  private previewers: Map<string, FilePreviewer> = new Map();

  register(previewer: FilePreviewer): void {
    if (this.previewers.has(previewer.id)) {
      console.warn(`File previewer with id "${previewer.id}" already exists. Overwriting...`);
    }
    this.previewers.set(previewer.id, previewer);
  }

  unregister(id: string): void {
    this.previewers.delete(id);
  }

  getAll(): FilePreviewer[] {
    return Array.from(this.previewers.values()).sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA; // 优先级高的排在前面
    });
  }

  findForFile(filePath: string, fileName: string, fileExtension: string): FilePreviewer | null {
    const matchingPreviewers = this.getAll().filter(previewer =>
      matchesPreviewer(previewer, filePath, fileName, fileExtension)
    );

    if (matchingPreviewers.length === 0) {
      return null;
    }

    // 返回优先级最高的匹配预览器
    return matchingPreviewers[0];
  }

  clear(): void {
    this.previewers.clear();
  }
}

// 创建全局预览器注册表实例
export const filePreviewRegistry = new FilePreviewRegistryImpl();

// 导出类型
export type { FilePreviewer, FileMatcher }; 