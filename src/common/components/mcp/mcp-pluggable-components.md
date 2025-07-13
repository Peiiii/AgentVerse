# MCP 可插拔组件系统

## 概述

AgentVerse 的 MCP 系统采用了可插拔的组件架构，提供了高度模块化和可扩展的 MCP 服务器管理功能。所有组件都支持编辑功能，并且可以独立使用或组合使用。

## 核心组件

### 1. 编辑对话框组件

**文件**: `src/common/components/mcp/edit-mcp-server-dialog.tsx`

提供完整的 MCP 服务器编辑功能：

```tsx
import { useEditMCPServerDialog, EditMCPServerButton } from "@/common/components/mcp";

// 使用 Hook
function MyComponent() {
  const { openEditMCPServerDialog } = useEditMCPServerDialog();
  
  const handleEdit = (server: MCPServerConfig) => {
    openEditMCPServerDialog(server, (id, updates) => {
      updateServer(id, updates);
    });
  };
}

// 使用按钮组件
function ServerList() {
  return (
    <EditMCPServerButton
      server={server}
      onUpdate={handleUpdateServer}
      size="sm"
      variant="ghost"
    />
  );
}
```

**特性**:
- ✅ 支持所有服务器配置字段编辑
- ✅ 响应式设计，支持移动端
- ✅ 表单验证和错误处理
- ✅ 可自定义按钮样式和大小

### 2. 服务器管理组件

**文件**: `src/common/components/mcp/mcp-server-manager.tsx`

提供完整的服务器列表管理功能：

```tsx
import { MCPServerManager, MCPServerCard } from "@/common/components/mcp";

// 使用管理器组件
function ServerManagement() {
  return (
    <MCPServerManager
      servers={servers}
      getConnection={getConnection}
      getServerStatus={getServerStatus}
      isConnected={isConnected}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onUpdate={handleUpdateServer}
      onRemove={handleRemoveServer}
      onRefreshTools={handleRefreshTools}
      showEditButton={true}
      showRemoveButton={true}
      showRefreshButton={true}
    />
  );
}

// 使用单个卡片组件
function CustomServerCard() {
  return (
    <MCPServerCard
      server={server}
      connection={connection}
      status={status}
      connected={connected}
      onConnect={() => handleConnect(server.id)}
      onDisconnect={() => handleDisconnect(server.id)}
      onUpdate={(updates) => handleUpdateServer(server.id, updates)}
      onRemove={() => handleRemoveServer(server.id)}
      onRefreshTools={() => handleRefreshTools(server.id)}
      showEditButton={true}
      showRemoveButton={false}
      showRefreshButton={true}
    />
  );
}
```

**特性**:
- ✅ 可插拔的按钮显示控制
- ✅ 完整的服务器状态管理
- ✅ 支持连接、断开、编辑、删除、刷新操作
- ✅ 自动处理空状态和错误状态

### 3. 工具展示组件

**文件**: `src/common/components/mcp/mcp-tools-display.tsx`

提供 MCP 工具的可视化展示：

```tsx
import { MCPToolsDisplay, MCPToolsStats } from "@/common/components/mcp";

// 工具列表展示
function ToolsList() {
  return (
    <MCPToolsDisplay
      servers={servers}
      getConnection={getConnection}
      showServerInfo={true}
      showToolCount={true}
    />
  );
}

// 统计信息展示
function Statistics() {
  return (
    <MCPToolsStats
      servers={servers}
      getConnection={getConnection}
      className="mb-6"
    />
  );
}
```

**特性**:
- ✅ 自动过滤已连接的服务器
- ✅ 可配置服务器信息和工具数量显示
- ✅ 完整的统计信息（服务器、工具、资源、提示）
- ✅ 响应式布局设计

### 4. 表单组件

**文件**: `src/common/components/mcp/mcp-server-form.tsx`

提供服务器添加和导入功能：

```tsx
import { MCPServerForm, MCPImportForm } from "@/common/components/mcp";

// 添加服务器表单
function AddServerForm() {
  return (
    <MCPServerForm
      onSubmit={handleAddServer}
      title="添加MCP服务器"
      description="配置新的MCP服务器连接"
      showDescription={true}
    />
  );
}

// 批量导入表单
function ImportForm() {
  return (
    <MCPImportForm
      onImport={handleImportServers}
      title="批量导入"
      description="通过JSON格式批量导入服务器配置"
    />
  );
}
```

**特性**:
- ✅ 完整的表单验证
- ✅ 支持多种 JSON 导入格式
- ✅ 自动表单重置
- ✅ 错误处理和用户反馈

## 可插拔特性

### 1. 按钮控制

所有组件都支持通过 props 控制按钮的显示：

```tsx
<MCPServerManager
  showEditButton={true}      // 显示编辑按钮
  showRemoveButton={false}   // 隐藏删除按钮
  showRefreshButton={true}   // 显示刷新按钮
/>
```

### 2. 样式自定义

支持通过 className 自定义样式：

```tsx
<MCPToolsDisplay
  className="custom-tools-display"
  showServerInfo={false}
  showToolCount={true}
/>
```

### 3. 事件处理

所有组件都通过回调函数处理事件，避免内部状态管理：

```tsx
<MCPServerCard
  onConnect={() => handleConnect(server.id)}
  onDisconnect={() => handleDisconnect(server.id)}
  onUpdate={(updates) => handleUpdateServer(server.id, updates)}
  onRemove={() => handleRemoveServer(server.id)}
  onRefreshTools={() => handleRefreshTools(server.id)}
/>
```

## 使用示例

### 完整的 MCP 管理页面

```tsx
import {
  MCPServerForm,
  MCPImportForm,
  MCPServerManager,
  MCPToolsDisplay,
  MCPToolsStats
} from "@/common/components/mcp";

function MCPManagementPage() {
  const {
    servers,
    addServer,
    updateServer,
    removeServer,
    importServers,
    connectServer,
    disconnectServer,
    refreshTools,
    getConnection,
    getServerStatus,
    isConnected,
  } = useMCPServers();

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <MCPToolsStats
        servers={servers}
        getConnection={getConnection}
      />

      {/* 添加服务器 */}
      <MCPServerForm
        onSubmit={addServer}
        title="添加MCP服务器"
      />

      {/* 批量导入 */}
      <MCPImportForm
        onImport={importServers}
        title="批量导入"
      />

      {/* 服务器管理 */}
      <MCPServerManager
        servers={servers}
        getConnection={getConnection}
        getServerStatus={getServerStatus}
        isConnected={isConnected}
        onConnect={connectServer}
        onDisconnect={disconnectServer}
        onUpdate={updateServer}
        onRemove={removeServer}
        onRefreshTools={refreshTools}
        showEditButton={true}
        showRemoveButton={true}
        showRefreshButton={true}
      />

      {/* 工具展示 */}
      <MCPToolsDisplay
        servers={servers}
        getConnection={getConnection}
        showServerInfo={true}
        showToolCount={true}
      />
    </div>
  );
}
```

### 只读工具展示

```tsx
function ReadOnlyToolsDisplay() {
  return (
    <MCPToolsDisplay
      servers={servers}
      getConnection={getConnection}
      showServerInfo={false}
      showToolCount={false}
      className="readonly-tools"
    />
  );
}
```

### 自定义编辑按钮

```tsx
function CustomEditButton() {
  return (
    <EditMCPServerButton
      server={server}
      onUpdate={handleUpdateServer}
      size="default"
      variant="outline"
    />
  );
}
```

## 最佳实践

### 1. 组件组合

根据需求选择合适的组件组合：

- **完整管理**: 使用 `MCPServerManager`
- **只读展示**: 使用 `MCPToolsDisplay`
- **统计信息**: 使用 `MCPToolsStats`
- **表单操作**: 使用 `MCPServerForm` 和 `MCPImportForm`

### 2. 按钮控制

通过 props 控制按钮显示，提供不同的用户体验：

```tsx
// 管理员视图
<MCPServerManager showEditButton={true} showRemoveButton={true} />

// 普通用户视图
<MCPServerManager showEditButton={false} showRemoveButton={false} />
```

### 3. 错误处理

所有组件都包含错误处理，但建议在父组件中添加额外的错误处理：

```tsx
const handleUpdateServer = (id: string, updates: Partial<MCPServerConfig>) => {
  try {
    updateServer(id, updates);
    toast.success("服务器更新成功");
  } catch (error) {
    toast.error("服务器更新失败");
    console.error(error);
  }
};
```

## 扩展开发

### 创建自定义组件

基于现有组件创建自定义功能：

```tsx
function CustomMCPServerCard({ server, ...props }) {
  return (
    <MCPServerCard
      {...props}
      server={server}
      showEditButton={false}  // 自定义按钮显示
      className="custom-server-card"
    />
  );
}
```

### 添加新的编辑字段

扩展编辑对话框支持新的配置字段：

```tsx
// 在 edit-mcp-server-dialog.tsx 中添加新字段
<div>
  <Label htmlFor="server-auth">认证信息</Label>
  <Input
    id="server-auth"
    value={serverAuth}
    onChange={(e) => setServerAuth(e.target.value)}
    placeholder="Bearer token"
  />
</div>
```

## 总结

MCP 可插拔组件系统提供了：

- ✅ **完整的编辑功能**: 支持所有服务器配置的编辑
- ✅ **高度可插拔**: 通过 props 控制组件行为
- ✅ **类型安全**: 完整的 TypeScript 类型支持
- ✅ **响应式设计**: 支持桌面端和移动端
- ✅ **错误处理**: 内置错误处理和用户反馈
- ✅ **易于扩展**: 基于现有组件快速构建新功能

这个系统使得 MCP 功能可以轻松集成到任何需要的地方，同时保持代码的简洁性和可维护性。 