# 文件管理器架构优化与解耦方案

## 1. 现状分析

- 现有 use-lightningfs-manager.ts 将 cwd、文件树、选中文件、文件内容、所有文件操作、loading/error 状态全部耦合在一个大 hook 内。
- file-manager-page.tsx 直接依赖大 hook，UI 逻辑与业务逻辑混杂，扩展性和可维护性较差。
- 未来如需支持多标签、分屏、拖拽、批量操作等高级体验会非常困难。

## 2. 主要问题

- 代码臃肿，难以维护和扩展
- 复用性差，未来如需支持多面板/多视图/多文件树等会很痛苦
- 任何小改动都可能影响全局
- UI 与业务逻辑未分层，类型定义分散

## 3. 分层解耦设计

### 3.1 核心分层

- **文件树（FileTree）Service/Hook**：只负责目录结构、节点展开/收起、刷新、缓存等
- **当前工作区（Working Directory）Store/Hook**：只负责 cwd 状态、切换目录
- **文件内容（FileContent）Hook**：只负责选中文件、读取内容、编辑、保存、大小判断
- **文件操作（FileOps）Hook**：只负责新建、删除、重命名、上传、下载等
- **错误与 loading 状态**：每个子模块有自己的 error/loading，主页面可统一展示

### 3.2 推荐 hooks/service 划分

- `useFileTree`：管理文件树结构、节点展开/收起、刷新、缓存
- `useWorkingDirectory`：管理 cwd 状态与切换
- `useFileContent`：管理选中文件、内容读取、编辑、保存、大小判断
- `useFileOps`：管理文件/目录的增删改查、上传、下载
- `useFileManagerError`、`useFileManagerLoading`：统一错误与 loading 状态

### 3.3 类型安全与最佳实践

- 所有类型定义集中管理，避免 any 和重复定义
- 充分利用 TypeScript 推断和类型保护
- 业务逻辑与 UI 彻底分离

## 4. UI 结构优化建议

- UI 只负责渲染和交互，所有业务逻辑通过独立 hooks/service 提供
- 目录树、文件列表、预览/编辑区全部组件化，便于未来扩展
- 支持多标签/分屏/拖拽等高级体验预留接口

## 5. 重构步骤建议

1. 实现 FileTreeService + useFileTree，只负责目录结构和节点管理
2. 实现 useWorkingDirectory，只负责 cwd 状态
3. 实现 useFileContent，只负责选中文件和内容读取/保存
4. 实现 useFileOps，只负责文件/目录的增删改查
5. 重构 file-manager-page.tsx，只组合这些 hooks，UI 组件化
6. 类型定义和错误/loading 状态分离

## 6. 目标

- 极致解耦、类型安全、可维护、可扩展
- 便于未来支持多标签、分屏、拖拽、批量操作等世界级体验
- 代码结构清晰，团队易于协作和持续优化

---

> 本文档为 AgentVerse 文件管理器架构优化与解耦方案，后续如有新需求或优化点请持续补充。 