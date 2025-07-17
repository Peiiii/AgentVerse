import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import { useFileTree } from "../hooks/use-file-tree";

interface FileTreeProps {
  cwd: string;
  onSelect: (path: string, type: 'file' | 'dir', eventType?: 'click' | 'doubleClick') => void;
  selectedPath?: string;
}

function Spinner() {
  return <span className="ml-1 animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-primary rounded-full align-middle" />;
}

export function FileTree({ cwd, onSelect, selectedPath }: FileTreeProps) {
  const { treeData, expandedKeys, expandedLoadingKeys, onExpand, loading, loadChildren } = useFileTree("/", { delayedLoading: true });

  // 展开节点时懒加载子节点
  const handleExpand = (node: any) => {
    onExpand(node.path);
    if (node.type === 'dir' && (!node.children || node.children.length === 0)) {
      loadChildren(node.path);
    }
  };

  // 递归渲染节点
  const renderNode = (node: any, depth = 0) => {
    if (!node) return null;
    const isExpanded = expandedKeys.includes(node.path);
    const isSelected = selectedPath === node.path;
    const isLoading = expandedLoadingKeys.includes(node.path);
    return (
      <div key={node.path} style={{ marginLeft: depth * 16 }}>
        <div
          className={`flex items-center gap-1 cursor-pointer rounded p-1 ${isSelected ? 'bg-primary/10 font-bold' : 'hover:bg-muted/40'}`}
          onClick={e => {
            if (node.type === 'file') onSelect(node.path, node.type, 'click');
          }}
          onDoubleClick={e => {
            if (node.type === 'dir') onSelect(node.path, node.type, 'doubleClick');
          }}
        >
          {node.type === 'dir' ? (
            <span onClick={e => { e.stopPropagation(); handleExpand(node); }}>
              {isExpanded ? <ChevronDown className="inline w-4 h-4" /> : <ChevronRight className="inline w-4 h-4" />}
            </span>
          ) : (
            <span style={{ width: 16, display: 'inline-block' }} />
          )}
          {node.type === 'dir' ? <Folder className="inline w-4 h-4 mr-1" /> : <FileText className="inline w-4 h-4 mr-1" />}
          {node.name}
          {isLoading && <Spinner />}
        </div>
        {node.type === 'dir' && isExpanded && node.children && node.children.map((child: any) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto text-sm text-muted-foreground">
      {loading ? <div className="p-2">加载中...</div> : treeData ? renderNode(treeData) : <div className="p-2">无数据</div>}
    </div>
  );
} 