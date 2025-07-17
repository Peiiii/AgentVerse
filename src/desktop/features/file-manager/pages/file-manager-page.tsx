import { ChevronRight, Download, Edit, FileText, Folder, Home, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { FilePreview } from "../components/file-preview";
import { FileTree } from "../components/file-tree";
import { useFileOps } from "../hooks/use-file-ops";
import { useFileTree } from "../hooks/use-file-tree";
import { useWorkingDirectory } from "../hooks/use-working-directory";

// 极简主色
const MAIN_BG = '#f7f8fa';
const CARD_BG = '#fff';
const BORDER_COLOR = '#ececec';
const CARD_RADIUS = 12;
const CARD_SHADOW = '0 1.5px 8px rgba(60,60,60,0.06)';
const BTN_RADIUS = 8;
const BTN_MAIN = '#6a82fb';
const BTN_DANGER = '#fc5c7d';

// 定义 FileTreeNode 类型
interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  children?: FileTreeNode[];
}

export function FileManagerPage() {
    // 目录树和 cwd
    const { cwd, setCwd } = useWorkingDirectory("/");
    // 当前目录树节点（用于文件列表）
    const { treeData, refreshNode } = useFileTree(cwd);
    // 文件操作
    const {
        createFile,
        createDirectory,
        deleteEntry,
        uploadFile,
        downloadFile,
        loading: opsLoading,
    } = useFileOps();

    // UI 状态
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [showNewDir, setShowNewDir] = useState(false);
    const [showNewFile, setShowNewFile] = useState(false);
    const [newDirName, setNewDirName] = useState("");
    const [newFileName, setNewFileName] = useState("");

    // 世界级面包屑导航
    const renderBreadcrumb = () => {
        const parts = cwd === '/' ? [] : cwd.split('/').filter(Boolean);
        const paths = parts.map((_, i) => '/' + parts.slice(0, i + 1).join('/'));
        return (
            <div
                className="h-16 flex items-center gap-2 text-base px-8 py-4 sticky top-0 z-20 border-b"
                style={{
                    background: CARD_BG,
                    color: '#222',
                    borderRadius: `${CARD_RADIUS}px ${CARD_RADIUS}px 0 0`,
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    boxShadow: CARD_SHADOW,
                    fontSize: 16,
                    fontWeight: 500
                }}
            >
                <span
                    className={`flex items-center gap-1 cursor-pointer hover:opacity-80 font-bold transition-all duration-150 ${cwd === '/' ? 'opacity-100' : 'opacity-80'}`}
                    onClick={() => setCwd('/')}
                >
                    <Home className="w-5 h-5" />
                </span>
                {paths.map((path, idx) => (
                    <div key={path} className="flex items-center gap-1">
                        <ChevronRight className="w-5 h-5 opacity-70" />
                        <span
                            className={`cursor-pointer hover:opacity-100 transition-all duration-150 ${cwd === path ? 'font-bold opacity-100' : 'opacity-80'}`}
                            onClick={() => setCwd(path)}
                        >
                            {parts[idx]}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // 递归目录树区域
    const renderDirTree = () => (
        <div className="w-80 min-w-[18rem] max-w-[22rem] flex flex-col flex-1 h-full p-4 border-r" style={{ background: CARD_BG, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px`, boxShadow: CARD_SHADOW, borderColor: BORDER_COLOR }}>
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-[#6a82fb]">
                <Folder className="w-6 h-6" />
                目录树
            </div>
            <div className="flex-1 overflow-auto rounded-lg bg-white/80 p-2 shadow-inner">
            <FileTree
                selectedPath={selectedFile || cwd}
                onSelect={(path, type, eventType) => {
                    if (type === 'file') {
                        setSelectedFile(path);
                    } else if (type === 'dir' && eventType === 'doubleClick') {
                        setCwd(path);
                    }
                }}
            />
            </div>
            <div className="mt-4 flex gap-2">
                {showNewDir ? (
                    <>
                        <input className="input input-sm flex-1 rounded border border-[#6a82fb] focus:ring-2 focus:ring-[#6a82fb]" value={newDirName} onChange={e => setNewDirName(e.target.value)} placeholder="目录名" />
                        <button className="btn btn-sm px-4 py-1 rounded" style={{ border: `1.5px solid ${BTN_MAIN}`, color: BTN_MAIN, background: '#fff', borderRadius: BTN_RADIUS }} onClick={async () => { await createDirectory(cwd.endsWith('/') ? cwd + newDirName : cwd + '/' + newDirName); setShowNewDir(false); setNewDirName(""); if (refreshNode) { await refreshNode(cwd); } }}>确定</button>
                        <button className="btn btn-sm px-4 py-1" onClick={() => setShowNewDir(false)}>取消</button>
                    </>
                ) : (
                    <button className="btn btn-sm flex gap-1 items-center px-4 py-1 rounded" style={{ border: `1.5px solid ${BTN_MAIN}`, color: BTN_MAIN, background: '#fff', borderRadius: BTN_RADIUS }} onClick={() => setShowNewDir(true)}><Plus className="w-4 h-4" />新建目录</button>
                )}
            </div>
        </div>
    );

    // 文件列表区域（当前 cwd 下文件）
    const files = treeData && treeData.children ? treeData.children.filter((e: FileTreeNode) => e.type === 'file') : [];
    const renderFileList = () => (
        <div className="w-96 min-w-[22rem] max-w-[28rem] flex flex-col flex-1 h-full p-4 border-r" style={{ background: CARD_BG, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px`, boxShadow: CARD_SHADOW, borderColor: BORDER_COLOR }}>
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-[#fc5c7d]">
                <FileText className="w-6 h-6" />
                文件列表
            </div>
            <div className="flex-1 overflow-auto rounded-lg bg-white/80 p-2 shadow-inner">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                        <svg width="64" height="64" fill="none" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#f3f4f6"/><path d="M20 32h24M32 20v24" stroke="#6a82fb" strokeWidth="2" strokeLinecap="round"/></svg>
                        <div className="mt-4 text-base font-medium">暂无文件</div>
                        <div className="text-xs mt-1">点击下方按钮新建或上传文件</div>
                    </div>
                ) : files.map((file: FileTreeNode) => {
                    const isSelected = selectedFile === file.path;
                    return (
                        <div
                            key={file.path}
                            className={`group flex items-center justify-between gap-2 cursor-pointer rounded-lg px-3 py-2 mb-2 transition-all duration-150 ${isSelected ? 'bg-gradient-to-r from-[#6a82fb]/10 to-[#fc5c7d]/10 text-[#6a82fb] font-bold shadow' : 'hover:bg-gradient-to-r hover:from-[#6a82fb]/5 hover:to-[#fc5c7d]/5'}`}
                            onClick={() => setSelectedFile(file.path)}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="inline w-5 h-5 mr-1" />{file.name}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <button className="btn btn-sm px-2 py-1 rounded-full bg-[#fc5c7d] text-white hover:bg-gradient-to-r hover:from-[#fc5c7d] hover:to-[#6a82fb]" title="删除" onClick={async e => { e.stopPropagation(); await deleteEntry(file.path); if (refreshNode) { await refreshNode(cwd); } }}><Trash2 className="w-4 h-4" /></button>
                                <button className="btn btn-sm px-2 py-1 rounded-full bg-[#6a82fb] text-white hover:bg-gradient-to-r hover:from-[#6a82fb] hover:to-[#fc5c7d]" title="下载" onClick={async e => { e.stopPropagation(); await downloadFile(file.path); }}><Download className="w-4 h-4" /></button>
                                <button className="btn btn-sm px-2 py-1 rounded-full bg-[#6a82fb] text-white hover:bg-gradient-to-r hover:from-[#6a82fb] hover:to-[#fc5c7d]" title="编辑" onClick={async e => { e.stopPropagation(); setSelectedFile(file.path); }}><Edit className="w-4 h-4" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex gap-2">
                {showNewFile ? (
                    <>
                        <input className="input input-sm flex-1 rounded border border-[#fc5c7d] focus:ring-2 focus:ring-[#fc5c7d]" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="文件名" />
                        <button className="btn btn-sm px-4 py-1 rounded" style={{ background: BTN_DANGER, color: '#fff', border: 'none', borderRadius: BTN_RADIUS }} onClick={async () => { await createFile(cwd.endsWith('/') ? cwd + newFileName : cwd + '/' + newFileName, ""); setShowNewFile(false); setNewFileName(""); if (refreshNode) { await refreshNode(cwd); } }}>确定</button>
                        <button className="btn btn-sm px-4 py-1" onClick={() => setShowNewFile(false)}>取消</button>
                    </>
                ) : (
                    <button className="btn btn-sm flex gap-1 items-center px-4 py-1 rounded" style={{ border: `1.5px solid ${BTN_MAIN}`, color: BTN_MAIN, background: '#fff', borderRadius: BTN_RADIUS }} onClick={() => setShowNewFile(true)}><Plus className="w-4 h-4" />新建文件</button>
                )}
                <label className="btn btn-sm flex gap-1 items-center px-4 py-1 cursor-pointer bg-[#6a82fb] text-white hover:bg-gradient-to-r hover:from-[#6a82fb] hover:to-[#fc5c7d]" style={{ minWidth: 0 }}>
                    <Upload className="w-4 h-4" />上传
                    <input type="file" className="hidden" onChange={e => { if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0], cwd); if (refreshNode) { refreshNode(cwd); } }} />
                </label>
            </div>
        </div>
    );

    // 文件预览区
    const renderFilePreview = () => (
        <div className="flex-1 flex flex-col h-full p-4" style={{ background: CARD_BG, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px`, boxShadow: CARD_SHADOW }}>
        <FilePreview
            selectedFile={selectedFile}
            cwd={cwd}
            refreshNode={refreshNode}
            fileLoading={opsLoading}
        />
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col" style={{ background: MAIN_BG }}>
            {renderBreadcrumb()}
            <div className="flex-1 flex min-h-0 gap-6 p-6 items-stretch">
                {renderDirTree()}
                {renderFileList()}
                {renderFilePreview()}
            </div>
        </div>
    );
} 