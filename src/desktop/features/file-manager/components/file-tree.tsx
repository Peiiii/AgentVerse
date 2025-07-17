import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import { useFileTree } from "../hooks/use-file-tree";

// 定义 FileTreeNode 类型
interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  children?: FileTreeNode[];
}

interface FileTreeProps {
  cwd: string;
  onSelect: (path: string, type: 'file' | 'dir', eventType?: 'click' | 'doubleClick') => void;
  selectedPath?: string;
}

function Spinner() {
  return <span className="ml-1 animate-spin inline-block w-3 h-3 border-2 border-[#6a82fb] border-t-[#fc5c7d] rounded-full align-middle" />;
}

export function FileTree({ onSelect, selectedPath }: Omit<FileTreeProps, 'cwd'>) {
  const { treeData, expandedKeys, expandedLoadingKeys, onExpand, loading, loadChildren } = useFileTree("/", { delayedLoading: true });

  // 展开节点时懒加载子节点
  const handleExpand = (node: FileTreeNode) => {
    onExpand(node.path);
    if (node.type === 'dir' && (!node.children || node.children.length === 0)) {
      loadChildren(node.path);
    }
  };

  // 递归渲染节点
  const renderNode = (node: FileTreeNode, depth = 0) => {
    if (!node) return null;
    const isExpanded = expandedKeys.includes(node.path);
    const isSelected = selectedPath === node.path;
    const isLoading = expandedLoadingKeys.includes(node.path);
    return (
      <div key={node.path} style={{ marginLeft: depth * 16 }}>
        <div
          className={`flex items-center gap-1 cursor-pointer rounded-lg px-2 py-1 mb-1 transition-all duration-150 text-[15px] ${isSelected ? 'border border-[#6a82fb] bg-[#f5f7ff] font-bold shadow-sm' : 'hover:bg-[#f5f7ff]'}`}
          onClick={() => {
            if (node.type === 'file') onSelect(node.path, node.type, 'click');
          }}
          onDoubleClick={() => {
            if (node.type === 'dir') onSelect(node.path, node.type, 'doubleClick');
          }}
        >
          {node.type === 'dir' ? (
            <span onClick={e => { e.stopPropagation(); handleExpand(node); }}>
              {isExpanded ? <ChevronDown className="inline w-4 h-4 text-[#6a82fb]" /> : <ChevronRight className="inline w-4 h-4 text-[#fc5c7d]" />}
            </span>
          ) : (
            <span style={{ width: 16, display: 'inline-block' }} />
          )}
          {node.type === 'dir' ? <Folder className="inline w-4 h-4 mr-1 text-[#6a82fb]" /> : <FileText className="inline w-4 h-4 mr-1 text-[#fc5c7d]" />}
          <span className="truncate max-w-[120px]">{node.name}</span>
          {isLoading && <Spinner />}
        </div>
        {node.type === 'dir' && isExpanded && node.children && node.children.map((child: FileTreeNode) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto text-sm text-muted-foreground rounded-lg">
      {loading ? <div className="p-2 text-[#6a82fb]">加载中...</div> : treeData ? renderNode(treeData) : <div className="p-2 text-gray-400">无数据</div>}
    </div>
  );
} 