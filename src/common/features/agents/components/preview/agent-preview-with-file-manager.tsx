import { AgentPreviewChat } from "./agent-preview-chat";
import { AgentDef } from "@/common/types/agent";
import { useAgentFileManager } from "@/common/hooks/use-agent-file-manager";
import { defaultFileManager } from "@/common/lib/file-manager.service";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { 
  Folder, 
  FileText, 
  Upload, 
  Download, 
  Trash2,
  Plus,
  Search,
  ArrowLeft
} from "lucide-react";

interface AgentPreviewWithFileManagerProps {
  agentDef: AgentDef;
  className?: string;
}

export function AgentPreviewWithFileManager({ agentDef, className }: AgentPreviewWithFileManagerProps) {
  const {
    currentPath,
    entries,
    loading,
    error,
    navigateTo,
    goBack,
    createFile,
    createDirectory,
    deleteEntry,
    downloadFile,
    refresh
  } = useAgentFileManager();

  const handleCreateFile = async () => {
    const fileName = prompt("请输入文件名：");
    if (fileName) {
      const content = prompt("请输入文件内容：") || "";
      await createFile(`${currentPath}/${fileName}`, content);
    }
  };

  const handleCreateDirectory = async () => {
    const dirName = prompt("请输入目录名：");
    if (dirName) {
      await createDirectory(`${currentPath}/${dirName}`);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm(`确定要删除 ${path} 吗？`)) {
      await deleteEntry(path);
    }
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // 使用文件管理器的上传功能
          await defaultFileManager.uploadFile(file, currentPath);
          await refresh();
        }
      }
    };
    input.click();
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 h-full ${className}`}>
      {/* 文件管理器面板 */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            文件管理器
            <Badge variant="secondary" className="ml-auto">
              {entries.length} 项
            </Badge>
          </CardTitle>
          
          {/* 路径导航 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={currentPath === "/"}
              className="h-6 px-2"
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <span className="font-mono">{currentPath}</span>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateFile} className="flex-1">
              <Plus className="w-3 h-3 mr-1" />
              新建文件
            </Button>
            <Button size="sm" onClick={handleCreateDirectory} className="flex-1">
              <Plus className="w-3 h-3 mr-1" />
              新建目录
            </Button>
            <Button size="sm" onClick={handleUpload} variant="outline">
              <Upload className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={refresh} variant="outline">
              <Search className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading && (
            <div className="p-4 text-center text-muted-foreground">
              加载中...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-destructive">
              错误: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="max-h-96 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  当前目录为空
                </div>
              ) : (
                <div className="divide-y">
                  {entries.map((entry) => (
                    <div
                      key={entry.path}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => entry.type === 'dir' && navigateTo(entry.path)}
                    >
                      <div className="flex items-center gap-2">
                        {entry.type === 'dir' ? (
                          <Folder className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-medium">{entry.name}</span>
                        {entry.type === 'file' && (
                          <Badge variant="outline" className="text-xs">
                            {entry.size} B
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {entry.type === 'file' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(entry.path);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.path);
                          }}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent 聊天面板 */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span>
            {agentDef.name}
            <Badge variant="outline" className="ml-auto">
              增强工具
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <AgentPreviewChat
            agentDef={agentDef}
            useEnhancedTools={true}
            className="h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
} 