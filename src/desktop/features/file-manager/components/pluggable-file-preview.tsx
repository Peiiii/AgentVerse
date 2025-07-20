import { defaultFileManager } from '@/common/lib/file-manager.service';
import { useEffect, useState } from 'react';
import { filePreviewRegistry } from '../services/file-preview-registry.service';
import { FileInfo, FilePreviewProps } from '../types/file-preview.types';
import { TextPreviewer } from '../previewers/text-previewer';

interface PluggableFilePreviewProps {
  selectedFile: string | null;
  cwd: string;
  refreshNode?: (cwd: string) => void;
  fileLoading?: boolean;
  maxPreviewSize?: number;
}

const DEFAULT_MAX_PREVIEW_SIZE = 1048576; // 1MB

export function PluggableFilePreview({
  selectedFile,
  cwd,
  refreshNode,
  fileLoading,
  maxPreviewSize = DEFAULT_MAX_PREVIEW_SIZE,
}: PluggableFilePreviewProps) {
  const [content, setContent] = useState('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 加载文件内容
  useEffect(() => {
    const loadFile = async () => {
      if (!selectedFile) {
        setContent('');
        setFileInfo(null);
        setPreviewError(null);
        return;
      }

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        // 获取文件信息
        const stat = await defaultFileManager.stat(selectedFile);
        if (!stat.success || !stat.data) {
          setPreviewError('无法获取文件信息');
          setContent('');
          setFileInfo(null);
          return;
        }

        // 检查文件大小
        if (stat.data.size > maxPreviewSize) {
          setContent('');
          setPreviewError('文件过大，无法预览内容。');
          setFileInfo(null);
          return;
        }

        // 读取文件内容
        const result = await defaultFileManager.readFile(selectedFile);
        if (result.success && result.data) {
          setContent(result.data.content);
          
          // 构建文件信息
          const fileName = selectedFile.split('/').pop() || '';
          const fileExtension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
          
          setFileInfo({
            path: selectedFile,
            name: fileName,
            extension: fileExtension,
            size: stat.data.size,
            lastModified: new Date(stat.data.mtimeMs),
          });
        } else {
          setContent('');
          setPreviewError(result.error || '读取文件失败');
          setFileInfo(null);
        }
      } catch (e) {
        setContent('');
        setPreviewError((e as Error)?.message || '读取文件失败');
        setFileInfo(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    loadFile();
  }, [selectedFile, maxPreviewSize]);

  // 刷新文件内容
  const handleRefresh = async () => {
    if (!selectedFile) return;
    
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const result = await defaultFileManager.readFile(selectedFile);
      if (result.success && result.data) {
        setContent(result.data.content);
      } else {
        setPreviewError(result.error || '刷新失败');
      }
    } catch (e) {
      setPreviewError((e as Error)?.message || '刷新失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 保存文件内容
  const handleSave = async (newContent: string) => {
    if (!selectedFile) return;
    
    setPreviewLoading(true);
    try {
      await defaultFileManager.writeFile(selectedFile, newContent);
      setContent(newContent);
      refreshNode?.(cwd);
    } catch (e) {
      setPreviewError((e as Error)?.message || '保存失败');
      throw e;
    } finally {
      setPreviewLoading(false);
    }
  };

  // 查找匹配的预览器
  const findPreviewer = () => {
    if (!fileInfo) return null;
    
    return filePreviewRegistry.findForFile(
      fileInfo.path,
      fileInfo.name,
      fileInfo.extension
    );
  };

  // 获取预览器
  const previewer = findPreviewer();
  const PreviewComponent = previewer?.component || TextPreviewer;

  // 构建预览器属性
  const previewProps: FilePreviewProps = {
    filePath: selectedFile || '',
    content,
    fileInfo: fileInfo || {
      path: '',
      name: '',
      extension: '',
      size: 0,
    },
    loading: previewLoading || fileLoading || false,
    error: previewError,
    onRefresh: handleRefresh,
    onSave: handleSave,
    supportsEdit: previewer?.supportsEdit ?? true,
    supportsRefresh: previewer?.supportsRefresh ?? false,
  };

  // 如果没有选择文件，显示空状态
  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col min-h-0" style={{ borderRadius: 12, background: '#fff', boxShadow: '0 1.5px 8px rgba(60,60,60,0.06)' }}>
        <div className="p-4 border-b border-[#ececec] font-bold flex items-center gap-2 text-lg text-[#6a82fb]">
          <span>文件预览</span>
        </div>
        <div className="flex-1 flex flex-col overflow-auto p-8" style={{ fontSize: 16, lineHeight: 1.7, color: '#222', minHeight: 0 }}>
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <rect width="48" height="48" rx="12" fill="#f3f4f6" />
              <path d="M16 24h16M24 16v16" stroke="#6a82fb" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="mt-2 text-base font-medium">请选择文件</div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染匹配的预览器
  return <PreviewComponent {...previewProps} />;
} 