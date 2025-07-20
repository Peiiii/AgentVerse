import { FileText, Eye, Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { FilePreviewProps } from "../types/file-preview.types";

export function MarkdownPreviewer({
  filePath: _filePath,
  content,
  fileInfo: _fileInfo,
  loading,
  error,
  onRefresh: _onRefresh,
  onSave,
  supportsEdit = true,
  supportsRefresh: _supportsRefresh = false,
}: FilePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [tab, setTab] = useState<'preview' | 'source'>('preview');

  // 当内容变化时更新编辑内容
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // 简单的 Markdown 渲染函数
  const renderMarkdown = (markdown: string) => {
    return markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 列表
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u|o|p|li|pre|code])(.*$)/gim, '<p>$1</p>')
      // 清理多余的标签
      .replace(/<p><\/p>/g, '')
      .replace(/<p><(h[1-6]|ul|ol|pre|code)>/g, '<$1>')
      .replace(/<\/(h[1-6]|ul|ol|pre|code)><\/p>/g, '</$1>');
  };

  // 保存功能
  const handleSave = async () => {
    if (!onSave) return;
    try {
      await onSave(editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ borderRadius: 12, background: '#fff', boxShadow: '0 1.5px 8px rgba(60,60,60,0.06)' }}>
      {/* Header */}
      <div className="p-4 border-b border-[#ececec] font-bold flex items-center justify-between text-lg text-[#6a82fb]">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <span>Markdown 预览</span>
        </div>
        <div className="flex items-center gap-2">
          {supportsEdit && onSave && !isEditing && (
            <button
              className="px-4 py-1 rounded text-[15px] font-medium transition-all border border-[#6a82fb] text-[#6a82fb] bg-white hover:bg-[#f5f7ff] shadow-sm"
              style={{ borderRadius: 8 }}
              onClick={() => setIsEditing(true)}
            >
              编辑
            </button>
          )}
        </div>
      </div>

      {/* 标签页切换 */}
      {!isEditing && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium text-sm transition-colors duration-150 ${tab === 'preview' ? 'bg-indigo-50 text-indigo-600 shadow' : 'hover:bg-slate-100 text-slate-500'}`}
            onClick={() => setTab('preview')}
          >
            <Eye size={16} className="mr-1" /> 预览
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium text-sm transition-colors duration-150 ${tab === 'source' ? 'bg-indigo-50 text-indigo-600 shadow' : 'hover:bg-slate-100 text-slate-500'}`}
            onClick={() => setTab('source')}
          >
            <Code2 size={16} className="mr-1" /> 源码
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col overflow-auto p-8" style={{ fontSize: 16, lineHeight: 1.7, color: '#222', minHeight: 0 }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#6a82fb] animate-pulse">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4" />
            加载中...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <rect width="48" height="48" rx="12" fill="#f3f4f6" />
              <path d="M16 24h16M24 16v16" stroke="#fc5c7d" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="mt-2 text-[#fc5c7d] font-bold">{error}</div>
          </div>
        ) : isEditing ? (
          // 编辑模式
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
                保存
              </button>
              <button
                className="px-4 py-1 rounded text-[#888] font-medium border border-[#ececec] bg-white hover:bg-[#f5f7ff] transition-all"
                style={{ borderRadius: 8 }}
                onClick={handleCancelEdit}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          // 预览/源码模式
          <div className="rounded-xl shadow-lg overflow-hidden bg-white h-full border border-slate-100 flex flex-col">
            {tab === 'preview' ? (
              <div 
                className="flex-1 overflow-auto p-6"
                style={{ fontSize: 15, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(content) 
                }}
              />
            ) : (
              <div className="flex-1 overflow-auto bg-slate-900 p-6">
                <pre className="text-slate-100 whitespace-pre-wrap break-all text-sm">
                  {content}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 