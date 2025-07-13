# Agent 预览组件 - 文件管理功能

本目录包含了增强的 Agent 预览组件，提供了强大的文件操作功能。

## 组件概览

### 1. AgentPreviewChat
基础的 Agent 预览聊天组件，支持可插拔的工具配置。

## 文件管理功能

### 核心服务
- `FileManagerService`: 基于 LightningFS 的文件管理服务
- `useAgentFileManager`: 专门为 Agent 预览设计的文件管理 Hook

### 支持的操作
- **文件操作**: 读取、写入、创建、删除、重命名
- **目录操作**: 创建目录、导航、返回上级
- **搜索功能**: 按文件名搜索
- **文件信息**: 获取文件详细信息
- **下载功能**: 下载文件到本地

## 使用方法

### 基础使用

```tsx
import { AgentPreviewChat } from "@/common/features/agents/components/preview";

function MyComponent() {
  return (
    <AgentPreviewChat
      agentDef={agentDef}
      // 可选：tools={...} 传入自定义工具
    />
  );
}
```

### 自定义工具配置

```tsx
import { AgentPreviewChat } from "@/common/features/agents/components/preview";
import { getCurrentTimeTool, fileSystemTool, codeAnalysisTool, networkTool } from "@/common/features/agents/components/agent-tools";
import { createDisplayQuickActionsTool } from "@/common/features/agents/components/agent-tools/show-suggestion.tool";

function MyComponent() {
  const [suggestions, setSuggestions] = useState([]);
  const suggestionTool = createDisplayQuickActionsTool(setSuggestions);
  const customTools = [getCurrentTimeTool, fileSystemTool, codeAnalysisTool, networkTool, suggestionTool];
  
  return (
    <AgentPreviewChat
      agentDef={agentDef}
      tools={customTools}
    />
  );
}
```

## 增强的工具

### 文件系统工具
支持以下操作：
- `list`: 列出目录内容
- `read`: 读取文件内容
- `write`: 写入文件内容
- `create`: 创建文件或目录
- `delete`: 删除文件或目录
- `rename`: 重命名文件或目录
- `search`: 搜索文件
- `info`: 获取文件信息
- `navigate`: 导航到指定目录
- `back`: 返回上级目录
- `download`: 下载文件

### 代码分析工具
支持以下分析类型：
- `structure`: 分析代码结构（函数、类、导入）
- `complexity`: 分析代码复杂度
- `quality`: 分析代码质量
- `summary`: 生成代码摘要

### 网络工具
支持 HTTP 请求操作。

## 代码复用

### 桌面端文件管理器
桌面端的文件管理器已经重构为使用相同的 `FileManagerService`，确保代码复用：

```tsx
// 桌面端文件管理器使用相同的服务
import { defaultFileManager } from "@/common/lib/file-manager.service";
```

### Agent 预览工具
Agent 预览工具使用相同的文件管理服务，确保功能一致性。

## 技术架构

```
src/common/lib/file-manager.service.ts     # 核心文件管理服务
src/common/hooks/use-agent-file-manager.ts # Agent 专用 Hook
src/desktop/features/file-manager/         # 桌面端文件管理器
src/common/features/agents/components/preview/ # Agent 预览组件
```

## 注意事项

1. **浏览器兼容性**: 基于 LightningFS，支持现代浏览器
2. **数据持久化**: 文件数据存储在浏览器的 IndexedDB 中
3. **安全性**: 所有文件操作都在浏览器沙箱环境中进行
4. **性能**: 大文件操作可能需要一些时间，建议添加加载状态

## 扩展开发

如需添加新的文件操作功能：

1. 在 `FileManagerService` 中添加新方法
2. 在 `useAgentFileManager` Hook 中暴露新功能
3. 在 Agent 工具中添加对应的操作
4. 在 UI 组件中添加相应的界面元素 