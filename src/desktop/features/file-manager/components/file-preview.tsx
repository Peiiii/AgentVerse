import { defaultFileManager } from '@/common/lib/file-manager.service';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FilePreviewProps {
  selectedFile: string | null;
  cwd: string;
  refreshNode?: (cwd: string) => void;
  fileLoading?: boolean;
}

const MAX_PREVIEW_SIZE = 1048576; // 1MB

export function FilePreview({
  selectedFile,
  cwd,
  refreshNode,
  fileLoading,
}: FilePreviewProps) {
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setEditContent('');
    const load = async () => {
      if (!selectedFile) {
        setEditContent('');
        setPreviewError(null);
        return;
      }
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        // 先 stat 判断 size
        const stat = await import('@/common/lib/file-manager.service').then(m => m.defaultFileManager.stat(selectedFile));
        if (!stat.success || !stat.data) {
          setPreviewError('无法获取文件信息');
          setEditContent('');
          return;
        }
        if (stat.data.size > MAX_PREVIEW_SIZE) {
          setEditContent('');
          setPreviewError('文件过大，无法预览内容。');
          return;
        }
        // 再读取内容
        const result = await import('@/common/lib/file-manager.service').then(m => m.defaultFileManager.readFile(selectedFile));
        if (result.success && result.data) {
          setEditContent(result.data.content);
        } else {
          setEditContent('');
          setPreviewError(result.error || '读取文件失败');
        }
      } catch (e) {
        setEditContent('');
        setPreviewError((e as Error)?.message || '读取文件失败');
      } finally {
        setPreviewLoading(false);
      }
    };
    load();
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setPreviewLoading(true);
    try {
      await defaultFileManager.writeFile(selectedFile, editContent);
      setIsEditing(false);
      refreshNode?.(cwd);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ borderRadius: 12, background: '#fff', boxShadow: '0 1.5px 8px rgba(60,60,60,0.06)' }}>
      <div className="p-4 border-b border-[#ececec] font-bold flex items-center gap-2 text-lg text-[#6a82fb] relative">
        <FileText className="w-6 h-6" />
        <span>文件预览</span>
        {selectedFile && !isEditing && !previewLoading && !previewError && (
          <button
            className="absolute right-6 top-4 px-4 py-1 rounded text-[15px] font-medium transition-all border border-[#6a82fb] text-[#6a82fb] bg-white hover:bg-[#f5f7ff] shadow-sm"
            style={{ borderRadius: 8 }}
            onClick={() => setIsEditing(true)}
          >
            编辑
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-auto p-8" style={{ fontSize: 16, lineHeight: 1.7, color: '#222', minHeight: 0 }}>
        {selectedFile ? (
          isEditing ? (
            <div className="flex flex-col flex-1 min-h-0">
              <textarea
                className="w-full h-64 border border-[#ececec] rounded p-4 focus:ring-2 focus:ring-[#6a82fb] bg-[#f7f8fa] text-base flex-1 min-h-40"
                style={{ borderRadius: 8, fontSize: 15, lineHeight: 1.7, resize: 'vertical' }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  className="px-4 py-1 rounded text-white font-medium transition-all"
                  style={{ background: '#6a82fb', border: 'none', borderRadius: 8 }}
                  onClick={handleSave}
                >
                  {fileLoading || previewLoading ? '保存中...' : '保存'}
                </button>
                <button
                  className="px-4 py-1 rounded text-[#888] font-medium border border-[#ececec] bg-white hover:bg-[#f5f7ff] transition-all"
                  style={{ borderRadius: 8 }}
                  onClick={() => setIsEditing(false)}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            previewLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#6a82fb] animate-pulse">加载中...</div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-40">
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#f3f4f6" /><path d="M16 24h16M24 16v16" stroke="#fc5c7d" strokeWidth="2" strokeLinecap="round" /></svg>
                <div className="mt-2 text-[#fc5c7d] font-bold">{previewError}</div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <pre className="bg-[#f7f8fa] rounded p-6 whitespace-pre-wrap break-all text-base shadow-inner flex-1 min-h-40" style={{ borderRadius: 8, fontSize: 15, lineHeight: 1.7 }}>{editContent}</pre>
              </div>
            )
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#f3f4f6" /><path d="M16 24h16M24 16v16" stroke="#6a82fb" strokeWidth="2" strokeLinecap="round" /></svg>
            <div className="mt-2 text-base font-medium">请选择文件</div>
          </div>
        )}
      </div>
    </div>
  );
} 