# MCP (Model Context Protocol) 集成指南

## 概述

AgentVerse 现在支持 MCP (Model Context Protocol) 服务器连接，允许 AI 助手使用外部工具来完成任务。这个功能是可插拔的，不与具体 agent 绑定，可以在任何对话中使用。

## 功能特性

- **动态连接**: 支持运行时连接/断开 MCP 服务器
- **工具自动发现**: 自动获取 MCP 服务器的工具列表
- **类型安全**: 完整的 TypeScript 类型支持
- **错误处理**: 连接失败、工具执行错误等处理
- **可扩展**: 支持多种 MCP 服务器类型

## 快速开始

### 1. 启动 MCP 服务器

首先，你需要启动一个 MCP 服务器。例如，使用 [filesystem-mcp-server](https://github.com/atxtechbro/filesystem-mcp-server)：

```bash
# 克隆并安装
git clone https://github.com/atxtechbro/filesystem-mcp-server
cd filesystem-mcp-server
npm install

# 启动服务器
npm start
```

### 2. 在 AgentVerse 中连接 MCP 服务器

1. 打开 AgentVerse 应用
2. 进入 MCP 演示页面
3. 在左侧连接管理面板中：
   - 输入服务器名称：`文件系统服务器`
   - 选择传输协议：`WebSocket`
   - 输入服务器地址：`ws://localhost:3000`
   - 点击"连接服务器"

### 3. 使用 MCP 工具

连接成功后，AI 助手将自动获得 MCP 服务器提供的工具。你可以：

- 在对话中直接描述需求，AI 会自动选择合适的工具
- 查看"可用工具"标签页，了解所有可用的工具
- 观察工具调用的实时执行过程

## 架构设计

### 核心组件

```
MCP连接层
├── MCPConnectionManager (连接管理)
├── MCPToolAdapter (工具适配)
└── MCPProvider (Provider包装)

工具集成层
├── useMCPTools (Hook)
├── MCPToolRenderer (渲染器)
└── MCPToolExecutor (执行器)

应用层
├── AgentChatContainer (集成到聊天)
└── 其他组件 (按需使用)
```

### 文件结构

```
src/common/
├── lib/mcp/
│   ├── mcp-connection-manager.ts    # MCP连接管理器
│   └── mcp-tool-adapter.ts          # 工具适配器
├── hooks/
│   └── use-mcp-tools.ts             # MCP工具Hook
└── components/mcp/
    ├── mcp-connection-manager.tsx   # 连接管理UI
    └── mcp-provider.tsx             # Provider组件

src/desktop/features/mcp/
└── pages/
    └── mcp-demo-page.tsx            # 演示页面
```

## 使用方法

### 基本使用

```tsx
import { MCPProvider } from "@/common/features/mcp/components/mcp-provider";
import { useMCPTools } from "@/common/hooks/use-mcp-tools";

function App() {
  return (
    <MCPProvider>
      <YourApp />
    </MCPProvider>
  );
}

function YourComponent() {
  const { connections, connectToServer, mcpToolDefinitions } = useMCPTools();
  
  // 连接MCP服务器
  const handleConnect = async () => {
    await connectToServer({
      name: "文件系统服务器",
      url: "ws://localhost:3000",
      transport: "websocket"
    });
  };
  
  return (
    <div>
      {/* 你的组件内容 */}
    </div>
  );
}
```

### 在聊天中使用

MCP 工具会自动集成到所有使用 `@agent-labs/agent-chat` 的聊天组件中。AI 助手会根据对话内容自动选择合适的工具。

### 自定义工具渲染

你可以自定义 MCP 工具的渲染方式：

```tsx
import { useMCPTools } from "@/common/hooks/use-mcp-tools";

function CustomMCPRenderer() {
  const { mcpToolRenderers } = useMCPTools();
  
  // 自定义渲染器会覆盖默认的渲染方式
  const customRenderers = mcpToolRenderers.map(renderer => ({
    ...renderer,
    render: (toolInvocation, onResult) => {
      // 自定义渲染逻辑
      return <YourCustomComponent />;
    }
  }));
  
  return <div>{/* 你的自定义渲染内容 */}</div>;
}
```

## 支持的 MCP 服务器

### 文件系统服务器

- **仓库**: [filesystem-mcp-server](https://github.com/atxtechbro/filesystem-mcp-server)
- **功能**: 文件读写、目录操作、文件搜索
- **连接地址**: `ws://localhost:3000`

### 其他服务器

你可以连接任何符合 MCP 协议的服务器，包括：

- 数据库服务器
- API 代理服务器
- 系统监控服务器
- 自定义业务服务器

## 配置选项

### MCP 服务器配置

```typescript
interface MCPServerConfig {
  name: string;           // 服务器名称
  url: string;            // 服务器地址
  transport?: "stdio" | "tcp" | "websocket";  // 传输协议
  credentials?: {         // 认证信息
    token?: string;
    username?: string;
    password?: string;
  };
}
```

### 连接管理

```typescript
// 连接服务器
const connectionId = await connectToServer(config);

// 断开连接
await disconnectFromServer(connectionId);

// 获取连接信息
const connection = getConnection(connectionId);
const tools = getTools(connectionId);
```

## 错误处理

### 常见错误

1. **连接失败**
   - 检查服务器地址是否正确
   - 确认服务器是否正在运行
   - 检查网络连接

2. **工具执行失败**
   - 检查工具参数是否正确
   - 确认服务器权限
   - 查看服务器日志

3. **类型错误**
   - 检查工具定义是否符合 MCP 规范
   - 确认参数类型匹配

### 调试技巧

1. 打开浏览器开发者工具
2. 查看控制台日志
3. 检查网络请求
4. 使用 MCP 演示页面进行测试

## 最佳实践

### 1. 服务器命名

使用描述性的服务器名称，例如：
- `文件系统服务器`
- `数据库服务器`
- `API代理服务器`

### 2. 工具描述

确保 MCP 服务器的工具描述清晰明确，这样 AI 才能正确理解和使用工具。

### 3. 错误处理

在 MCP 服务器中实现适当的错误处理，返回有意义的错误信息。

### 4. 安全性

- 使用适当的认证机制
- 限制工具的执行权限
- 监控工具的使用情况

## 扩展开发

### 创建自定义 MCP 服务器

1. 实现 MCP 协议
2. 定义工具接口
3. 处理工具调用
4. 返回执行结果

### 集成到 AgentVerse

1. 创建连接配置
2. 测试工具功能
3. 优化用户体验
4. 添加错误处理

## 故障排除

### 连接问题

```bash
# 检查服务器状态
curl http://localhost:3000/health

# 检查端口是否开放
netstat -an | grep 3000

# 查看服务器日志
tail -f server.log
```

### 工具问题

1. 检查工具定义是否正确
2. 确认参数格式
3. 查看执行日志
4. 测试工具功能

## 更新日志

### v1.0.0
- 初始 MCP 集成实现
- 支持 WebSocket 连接
- 基本工具调用功能
- 连接管理 UI

## 贡献

欢迎提交 Issue 和 Pull Request 来改进 MCP 集成功能。

## 许可证

本项目采用 MIT 许可证。 