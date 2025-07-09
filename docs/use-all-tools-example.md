# useAllTools Hook 使用示例

`useAllTools` hook 提供了一个简洁的方式来将 MCP 工具集成到 `@agent-labs/agent-chat` 中，避免了耦合和重复实现。

## 基本用法

```tsx
import { useAllTools } from '@/common/hooks/use-all-tools';
import { useProvideAgentToolDefs, useProvideAgentToolExecutors } from '@agent-labs/agent-chat';
import { AgentChatContainer } from '@/common/components/chat/agent-chat';

function MCPChatComponent() {
  // 使用 useAllTools hook 获取转换后的工具
  const { toolDefinitions, toolExecutors, stats } = useAllTools();

  // 将 MCP 工具提供给 agent-chat
  useProvideAgentToolDefs(toolDefinitions);
  useProvideAgentToolExecutors(toolExecutors);

  return (
    <AgentChatContainer
      agent={agent}
      messages={messages}
      inputMessage={inputMessage}
      onInputChange={setInputMessage}
    />
  );
}
```

## Hook 返回值

### toolDefinitions
转换后的工具定义数组，符合 `@agent-labs/agent-chat` 的 `ToolDefinition` 格式：

```typescript
interface ToolDefinition {
  name: string;           // 格式: "服务器名-工具名"
  description: string;    // 包含服务器信息的描述
  parameters: {           // JSON Schema 格式的参数定义
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  metadata: {             // 原始 MCP 工具信息
    serverId: string;
    serverName: string;
    originalToolName: string;
    mcpTool: any;
  };
}
```

### toolExecutors
工具执行器映射，键为工具名称，值为执行函数：

```typescript
interface ToolExecutor {
  (toolCall: ToolCall): Promise<ToolResult>;
}
```

### stats
工具统计信息：

```typescript
interface ToolsStats {
  totalTools: number;                    // 总工具数量
  servers: string[];                     // 服务器名称列表
  toolsByServer: Record<string, string[]>; // 按服务器分组的工具列表
}
```

### mcpTools
原始 MCP 工具数据，用于高级用法。

## 工具名称规则

为了避免工具名称冲突，`useAllTools` 使用以下命名规则：

- 格式：`{服务器名}-{工具名}`
- 示例：`文件系统服务器-readFile`、`数据库服务器-query`

## 参数转换

### 有详细 Schema 的工具
如果 MCP 工具提供了详细的 `inputSchema`，会直接使用：

```json
{
  "name": "文件系统服务器-readFile",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "文件路径"
      }
    },
    "required": ["path"]
  }
}
```

### 无详细 Schema 的工具
如果 MCP 工具没有详细的 schema，会使用通用参数：

```json
{
  "name": "通用工具-execute",
  "parameters": {
    "type": "object",
    "properties": {
      "args": {
        "type": "string",
        "description": "工具参数（JSON格式）"
      }
    },
    "required": ["args"]
  }
}
```

## 错误处理

工具执行器包含完整的错误处理：

- 连接检查：确保 MCP 服务器已连接
- 参数解析：安全地解析工具调用参数
- 错误返回：返回结构化的错误信息

## 高级用法

### 自定义工具过滤

```tsx
function CustomMCPChat() {
  const { toolDefinitions, toolExecutors, mcpTools } = useAllTools();
  
  // 过滤特定服务器的工具
  const filteredTools = toolDefinitions.filter(tool => 
    tool.metadata.serverName === '文件系统服务器'
  );
  
  // 过滤特定类型的工具
  const fileTools = mcpTools.filter(({ tool }) => 
    tool.name.includes('File')
  );
  
  useProvideAgentToolDefs(filteredTools);
  // ...
}
```

### 动态工具更新

```tsx
function DynamicMCPChat() {
  const { toolDefinitions, toolExecutors, stats } = useAllTools();
  
  // 当工具数量变化时，自动更新
  useEffect(() => {
    console.log(`可用工具数量: ${stats.totalTools}`);
    console.log(`服务器列表: ${stats.servers.join(', ')}`);
  }, [stats.totalTools, stats.servers]);
  
  useProvideAgentToolDefs(toolDefinitions);
  useProvideAgentToolExecutors(toolExecutors);
  // ...
}
```

## 注意事项

1. **工具名称唯一性**：确保不同服务器的工具名称不冲突
2. **连接状态**：工具执行前会检查 MCP 服务器连接状态
3. **参数兼容性**：支持 MCP 工具的多种参数格式
4. **错误恢复**：工具执行失败时会返回详细的错误信息

## 完整示例

参考 `src/desktop/features/mcp/pages/mcp-demo-page.tsx` 查看完整的使用示例。 