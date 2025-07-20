import { Code2, Eye, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FilePreviewProps } from "../types/file-preview.types";

export function HtmlPreviewer({
  filePath: _filePath,
  content,
  fileInfo: _fileInfo,
  loading,
  error,
  onRefresh,
  onSave,
  supportsEdit = false,
  supportsRefresh = true,
}: FilePreviewProps) {
  const [tab, setTab] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 当内容变化时更新编辑内容
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // 复制源码
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // 刷新功能
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
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
          <Code2 className="w-6 h-6" />
          <span>HTML 预览</span>
        </div>
        <div className="flex items-center gap-2">
          {supportsRefresh && onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-indigo-100 hover:bg-indigo-200 border-none rounded-lg p-2 cursor-pointer shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新文件内容"
            >
              <RefreshCw size={18} color="#6366f1" className={refreshing ? "animate-spin" : ""} />
            </button>
          )}
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
              <iframe
                ref={iframeRef}
                srcDoc={content}
                title="HTML 预览"
                className="w-full h-full bg-white flex-1"
                style={{ border: "none", borderRadius: 12 }}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="relative h-full bg-slate-900 min-w-0 max-w-full overflow-x-auto">
                <button
                  className="absolute top-3 right-3 z-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 text-xs font-medium shadow transition-colors"
                  onClick={handleCopy}
                  title="复制源码"
                >
                  {copied ? '已复制' : '复制源码'}
                </button>
                <div className="h-full overflow-auto pt-8 pb-4 px-2 min-w-0 max-w-full overflow-x-auto">
                  <div className="max-w-full min-w-0">
                    <SyntaxHighlighter
                      language="html"
                      style={oneDark}
                      customStyle={{ 
                        background: "transparent", 
                        fontSize: 15, 
                        margin: 0, 
                        padding: 0, 
                        width: '100%', 
                        maxWidth: '100%', 
                        minWidth: 0, 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-all', 
                        overflowX: 'auto' 
                      }}
                      wrapLongLines
                      showLineNumbers={false}
                    >
                      {content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 