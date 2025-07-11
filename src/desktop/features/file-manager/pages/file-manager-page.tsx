import { useState } from "react";
import { Folder, FileText, Home, ChevronRight, Plus, Upload, Download, Trash2, Edit } from "lucide-react";
import { useLightningFSManager, FsEntry } from "../hooks/use-lightningfs-manager";

export function FileManagerPage() {
  const {
    cwd,
    entries,
    fileContent,
    selectedFile,
    error,
    loading,
    enterDir,
    openFile,
    createDir,
    createFile,
    deleteEntry,
    renameEntry,
    writeFile,
    uploadFile,
    downloadFile,
    setSelectedFile,
  } = useLightningFSManager();

  const [showNewDir, setShowNewDir] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // 目录树区域（仅一级，递归可后续扩展）
  const renderDirTree = () => (
    <div className="w-72 border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b font-semibold flex items-center gap-2">
        <Folder className="w-5 h-5" />
        目录树
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm text-muted-foreground">
        <div className={`cursor-pointer hover:bg-muted/40 rounded p-2 ${cwd === "/" ? 'bg-primary/10' : ''}`} onClick={() => enterDir("/")}>/</div>
        {cwd === "/" && entries.filter(e => e.type === 'dir').map(dir => (
          <div key={dir.path} className={`ml-4 cursor-pointer hover:bg-muted/40 rounded p-2 ${cwd === dir.path ? 'bg-primary/10' : ''}`} onClick={() => enterDir(dir.path)}>
            <Folder className="inline w-4 h-4 mr-1" />{dir.name}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex gap-2">
        {showNewDir ? (
          <>
            <input className="input input-sm" value={newDirName} onChange={e => setNewDirName(e.target.value)} placeholder="目录名" />
            <button className="btn btn-sm" onClick={async () => { await createDir(newDirName); setShowNewDir(false); setNewDirName(""); }}>确定</button>
            <button className="btn btn-sm" onClick={() => setShowNewDir(false)}>取消</button>
          </>
        ) : (
          <button className="btn btn-sm flex gap-1 items-center" onClick={() => setShowNewDir(true)}><Plus className="w-4 h-4" />新建目录</button>
        )}
      </div>
    </div>
  );

  // 文件列表区域
  const renderFileList = () => (
    <div className="w-96 border-r bg-muted/10 flex flex-col">
      <div className="p-4 border-b font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5" />
        文件列表
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        {entries.filter(e => e.type === 'file').map(file => (
          <div key={file.path} className={`cursor-pointer hover:bg-muted/40 rounded p-2 ${selectedFile === file.path ? 'bg-primary/10' : ''}`} onClick={() => openFile(file.path)}>
            <FileText className="inline w-4 h-4 mr-1" />{file.name}
            <button className="ml-2 text-xs text-destructive" onClick={e => { e.stopPropagation(); deleteEntry(file.path); }}><Trash2 className="w-3 h-3" /></button>
            <button className="ml-1 text-xs" onClick={e => { e.stopPropagation(); downloadFile(file.path); }}><Download className="w-3 h-3" /></button>
            <button className="ml-1 text-xs" onClick={e => { e.stopPropagation(); setIsEditing(true); setEditContent(fileContent); openFile(file.path); }}><Edit className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex gap-2">
        {showNewFile ? (
          <>
            <input className="input input-sm" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="文件名" />
            <button className="btn btn-sm" onClick={async () => { await createFile(newFileName, ""); setShowNewFile(false); setNewFileName(""); }}>确定</button>
            <button className="btn btn-sm" onClick={() => setShowNewFile(false)}>取消</button>
          </>
        ) : (
          <button className="btn btn-sm flex gap-1 items-center" onClick={() => setShowNewFile(true)}><Plus className="w-4 h-4" />新建文件</button>
        )}
        <label className="btn btn-sm flex gap-1 items-center cursor-pointer">
          <Upload className="w-4 h-4" />上传
          <input type="file" className="hidden" onChange={e => { if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0]); }} />
        </label>
      </div>
    </div>
  );

  // 文件预览/编辑区域
  const renderFilePreview = () => (
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
                <button className="btn btn-sm" onClick={async () => { await writeFile(selectedFile, editContent); setIsEditing(false); }}>{loading ? '保存中...' : '保存'}</button>
                <button className="btn btn-sm" onClick={() => setIsEditing(false)}>取消</button>
              </div>
            </div>
          ) : (
            <pre className="bg-muted/30 rounded p-4 whitespace-pre-wrap break-all">{fileContent}</pre>
          )
        ) : (
          <div className="text-muted-foreground">请选择文件</div>
        )}
      </div>
    </div>
  );

  // 面包屑导航
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-6 py-3 border-b">
      <Home className="w-4 h-4" />
      <span>文件管理</span>
      {cwd && cwd !== "/" && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span>{cwd}</span>
        </>
      )}
      {selectedFile && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span>{selectedFile}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      {renderBreadcrumb()}
      {error && <div className="text-red-500 px-6 py-2">{error}</div>}
      <div className="flex-1 flex min-h-0">
        {renderDirTree()}
        {renderFileList()}
        {renderFilePreview()}
      </div>
    </div>
  );
} 