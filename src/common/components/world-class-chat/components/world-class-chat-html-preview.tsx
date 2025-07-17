import { Code2, Eye, X } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface WorldClassChatHtmlPreviewProps {
  html: string;
  onClose: () => void;
}

export function WorldClassChatHtmlPreview({ html, onClose }: WorldClassChatHtmlPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);

  // 复制源码
  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex-1 min-w-0 overflow-hidden bg-white shadow-xl flex flex-col relative animate-fadeInRight h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-2">
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
        <button
          onClick={onClose}
          className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg p-2 cursor-pointer shadow transition-colors"
          title="关闭预览"
        >
          <X size={18} color="#6366f1" />
        </button>
      </div>
      {/* loading 动画 */}
      {loading && tab === 'preview' && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 h-full ">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
      {/* 错误提示 */}
      {error && tab === 'preview' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30 h-full">
          <div className="text-red-500 font-bold text-lg mb-2">预览加载失败</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      )}
      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-4 h-full">
        <div className="rounded-xl shadow-lg overflow-hidden bg-white h-full border border-slate-100 flex flex-col">
          {tab === 'preview' ? (
            <iframe
              srcDoc={html}
              title="HTML 预览"
              className="w-full h-full bg-white flex-1"
              style={{ border: "none", borderRadius: 12 }}
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError("HTML 渲染出错"); }}
            />
          ) : (
            <div className="relative h-full bg-slate-900 min-w-0 max-w-full  overflow-x-auto">
              <button
                className="absolute top-3 right-3 z-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 text-xs font-medium shadow transition-colors"
                onClick={handleCopy}
                title="复制源码"
              >
                {copied ? '已复制' : '复制源码'}
              </button>
              <div className="h-full overflow-auto pt-8 pb-4 px-2 min-w-0 max-w-full overflow-x-auto">
                <div className=" max-w-full min-w-0">
                  <SyntaxHighlighter
                    language="html"
                    style={oneDark}
                    customStyle={{ background: "transparent", fontSize: 15, margin: 0, padding: 0, width: '100%', maxWidth: '100%', minWidth: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowX: 'auto' }}
                    wrapLongLines
                    showLineNumbers={false}
                  >
                    {html}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 动画 keyframes */}
      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(48px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
} 