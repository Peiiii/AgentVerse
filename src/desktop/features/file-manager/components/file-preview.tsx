import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

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
  const [previewSize, setPreviewSize] = useState<number>(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setEditContent('');
    let ignore = false;
    const load = async () => {
      if (!selectedFile) {
        setPreviewSize(0);
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
          setPreviewSize(0);
          setEditContent('');
          return;
        }
        setPreviewSize(stat.data.size || 0);
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
        setPreviewSize(0);
      } finally {
        setPreviewLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setPreviewLoading(true);
    try {
      const m = await import('@/common/lib/file-manager.service');
      await m.defaultFileManager.writeFile(selectedFile, editContent);
      setIsEditing(false);
      refreshNode && refreshNode(cwd);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5" />
        文件预览
      </div>
      <div className="flex-1 overflow-auto p-4">
        {selectedFile ? (
          isEditing ? (
            <div>
              <textarea className="w-full h-64 border rounded p-2" value={editContent} onChange={e => setEditContent(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <button className="btn btn-sm" onClick={handleSave}>{fileLoading || previewLoading ? '保存中...' : '保存'}</button>
                <button className="btn btn-sm" onClick={() => setIsEditing(false)}>取消</button>
              </div>
            </div>
          ) : (
            previewLoading ? (
              <div className="text-muted-foreground">加载中...</div>
            ) : previewError ? (
              <div className="text-red-500 font-bold">{previewError}</div>
            ) : (
              <>
                <pre className="bg-muted/30 rounded p-4 whitespace-pre-wrap break-all">{editContent}</pre>
                <div className="mt-2">
                  <button className="btn btn-sm" onClick={() => setIsEditing(true)}>编辑</button>
                </div>
              </>
            )
          )
        ) : (
          <div className="text-muted-foreground">请选择文件</div>
        )}
      </div>
    </div>
  );
} 