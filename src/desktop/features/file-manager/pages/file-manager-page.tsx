import { ChevronRight, Download, Edit, FileText, Folder, Home, Plus, Trash2, Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { FilePreview } from "../components/file-preview";
import { FileTree } from "../components/file-tree";
import { useFileOps } from "../hooks/use-file-ops";
import { useFileTree } from "../hooks/use-file-tree";
import { useWorkingDirectory } from "../hooks/use-working-directory";

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
        renameEntry,
        uploadFile,
        downloadFile,
        loading: opsLoading,
        error: opsError,
    } = useFileOps();

    // UI 状态
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [showNewDir, setShowNewDir] = useState(false);
    const [showNewFile, setShowNewFile] = useState(false);
    const [newDirName, setNewDirName] = useState("");
    const [newFileName, setNewFileName] = useState("");

    // 世界级面包屑导航
    const renderBreadcrumb = () => {
        // 分割cwd为路径片段
        const parts = cwd === '/' ? [] : cwd.split('/').filter(Boolean);
        // 构造每一级的完整路径
        const paths = parts.map((_, i) => '/' + parts.slice(0, i + 1).join('/'));
        return (
            <div className="h-12 flex items-center gap-2 text-sm text-muted-foreground px-6 py-3 border-b bg-white/80 sticky top-0 z-10" style={{ backdropFilter: 'blur(4px)' }}>
                <span
                    className={`flex items-center gap-1 cursor-pointer hover:text-primary font-semibold ${cwd === '/' ? 'text-primary' : ''}`}
                    onClick={() => setCwd('/')}
                >
                    <Home className="w-4 h-4" />
                </span>
                {paths.map((path, idx) => (
                    <div key={path} className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4" />
                        <span
                            className={`cursor-pointer hover:text-primary ${cwd === path ? 'text-primary font-semibold' : ''}`}
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
        <div className="w-72 border-r bg-muted/20 flex flex-col">
            <div className="p-4 border-b font-semibold flex items-center gap-2">
                <Folder className="w-5 h-5" />
                目录树
            </div>
            <FileTree
                cwd={cwd}
                selectedPath={selectedFile || cwd}
                onSelect={(path, type, eventType) => {
                    if (type === 'file') {
                        setSelectedFile(path);
                    } else if (type === 'dir' && eventType === 'doubleClick') {
                        setCwd(path);
                    }
                }}
            />
            <div className="p-2 border-t flex gap-2">
                {showNewDir ? (
                    <>
                        <input className="input input-sm" value={newDirName} onChange={e => setNewDirName(e.target.value)} placeholder="目录名" />
                        <button className="btn btn-sm" onClick={async () => { await createDirectory(cwd.endsWith('/') ? cwd + newDirName : cwd + '/' + newDirName); setShowNewDir(false); setNewDirName(""); refreshNode && refreshNode(cwd); }}>确定</button>
                        <button className="btn btn-sm" onClick={() => setShowNewDir(false)}>取消</button>
                    </>
                ) : (
                    <button className="btn btn-sm flex gap-1 items-center" onClick={() => setShowNewDir(true)}><Plus className="w-4 h-4" />新建目录</button>
                )}
            </div>
        </div>
    );

    // 文件列表区域（当前 cwd 下文件）
    const files = treeData && treeData.children ? treeData.children.filter((e: any) => e.type === 'file') : [];
    const renderFileList = () => (
        <div className="w-96 border-r bg-muted/10 flex flex-col">
            <div className="p-4 border-b font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                文件列表
            </div>
            <div className="flex-1 overflow-auto p-2 text-sm">
                {files.map((file: any) => {
                    const isSelected = selectedFile === file.path;
                    return (
                        <div
                            key={file.path}
                            className={`cursor-pointer rounded p-2 ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'}`}
                            onClick={() => startTransition(() => setSelectedFile(file.path))}
                        >
                            <FileText className="inline w-4 h-4 mr-1" />{file.name}
                            <button className="ml-2 text-xs text-destructive" onClick={async e => { e.stopPropagation(); await deleteEntry(file.path); refreshNode && refreshNode(cwd); }}> <Trash2 className="w-3 h-3" /> </button>
                            <button className="ml-1 text-xs" onClick={async e => { e.stopPropagation(); await downloadFile(file.path); }}> <Download className="w-3 h-3" /> </button>
                            <button className="ml-1 text-xs" onClick={async e => { e.stopPropagation(); startTransition(() => setSelectedFile(file.path)); }}> <Edit className="w-3 h-3" /> </button>
                        </div>
                    );
                })}
            </div>
            <div className="p-2 border-t flex gap-2">
                {showNewFile ? (
                    <>
                        <input className="input input-sm" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="文件名" />
                        <button className="btn btn-sm" onClick={async () => { await createFile(cwd.endsWith('/') ? cwd + newFileName : cwd + '/' + newFileName, ""); setShowNewFile(false); setNewFileName(""); refreshNode && refreshNode(cwd); }}>确定</button>
                        <button className="btn btn-sm" onClick={() => setShowNewFile(false)}>取消</button>
                    </>
                ) : (
                    <button className="btn btn-sm flex gap-1 items-center" onClick={() => setShowNewFile(true)}><Plus className="w-4 h-4" />新建文件</button>
                )}
                <label className="btn btn-sm flex gap-1 items-center cursor-pointer">
                    <Upload className="w-4 h-4" />上传
                    <input type="file" className="hidden" onChange={e => { if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0], cwd); refreshNode && refreshNode(cwd); }} />
                </label>
            </div>
        </div>
    );

    // 文件预览区
    const renderFilePreview = () => (
        <FilePreview
            selectedFile={selectedFile}
            cwd={cwd}
            refreshNode={refreshNode}
            fileLoading={opsLoading}
        />
    );

    return (
        <div className="h-full w-full flex flex-col">
            {renderBreadcrumb()}
            <div className="flex-1 flex min-h-0">
                {renderDirTree()}
                {renderFileList()}
                {renderFilePreview()}
            </div>
        </div>
    );
} 