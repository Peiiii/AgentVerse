# Agent Tools 目录

这个目录包含了所有智能体相关的工具，每个工具都独立成文件，便于维护和扩展。

## 目录结构

```
agent-tools/
├── index.ts                    # 主导出文件
├── tool-factories.ts           # 工具集合工厂函数
├── get-current-time.tool.ts    # 获取当前时间工具
├── agent-analysis.tool.ts      # 智能体分析工具
├── file-system.tool.ts         # 文件系统工具
├── network.tool.ts             # 网络请求工具
├── code-analysis.tool.ts       # 代码分析工具
├── update-agent.tool.ts        # 智能体配置工具
└── README.md                   # 本文档
```

## 工具列表

### 1. get-current-time.tool.ts
- **功能**: 获取当前时间和时区信息
- **参数**: 无
- **返回**: 当前时间、时区、状态消息

### 2. agent-analysis.tool.ts
- **功能**: 分析智能体的能力和配置
- **参数**: 无（基于传入的agentDef）
- **返回**: 智能体能力分析结果

### 3. file-system.tool.ts
- **功能**: 基于LightningFS的文件系统操作
- **支持操作**: list, read, write, create, delete, rename, search, info, upload, download
- **参数**: operation, path, content, newPath, pattern, isDirectory

### 4. network.tool.ts
- **功能**: HTTP网络请求工具
- **支持方法**: GET, POST, PUT, DELETE, PATCH
- **参数**: method, url, headers, body, timeout

### 5. code-analysis.tool.ts
- **功能**: 代码分析工具
- **分析类型**: structure, complexity, quality, summary
- **参数**: type, code, language

### 6. update-agent.tool.ts
- **功能**: 智能体配置工具
- **主要功能**: 创建和更新智能体配置
- **参数**: name, prompt, personality, role, expertise, bias, responseStyle, avatar



## 工具集合工厂

### getDefaultPreviewTools(agentDef)
默认工具集合，包含：
- 获取当前时间
- 智能体分析
- 文件系统操作
- 网络请求

### getEnhancedPreviewTools(agentDef)
增强工具集合，包含：
- 默认工具集合
- 代码分析工具

### getBasicPreviewTools(agentDef)
基础工具集合，包含：
- 获取当前时间
- 智能体分析

### getFileManagementTools()
文件管理工具集合，包含：
- 文件系统操作

### getDevelopmentTools()
开发工具集合，包含：
- 代码分析
- 网络请求

## 使用示例

```typescript
import { 
  getDefaultPreviewTools, 
  getEnhancedPreviewTools,
  getCurrentTimeTool,
  fileSystemTool 
} from '@/common/features/agents/components/agent-tools';

// 使用默认工具集合
const defaultTools = getDefaultPreviewTools(agentDef);

// 使用增强工具集合
const enhancedTools = getEnhancedPreviewTools(agentDef);

// 使用单个工具
const tools = [getCurrentTimeTool, fileSystemTool];
```

## 向后兼容

为了保持向后兼容，原有的导入路径仍然有效：

```typescript
// 这些导入仍然有效
import { getDefaultPreviewTools, getEnhancedPreviewTools } from './tool-factories';

```

## 扩展新工具

要添加新工具，请按照以下步骤：

1. 在 `agent-tools/` 目录下创建新的工具文件
2. 在 `index.ts` 中导出新工具
3. 在 `tool-factories.ts` 中添加新工具到相应的工具集合中
4. 更新本文档

### 工具文件模板

```typescript
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

export const yourToolName: AgentTool = {
  name: "yourToolName",
  description: "工具描述",
  parameters: {
    type: "object",
    properties: {
      // 参数定义
    },
    required: ["必需参数"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      // 工具逻辑
      return {
        toolCallId: toolCall.id,
        result: {
          // 返回结果
        },
        status: "success" as const,
      };
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: {
          error: error instanceof Error ? error.message : "未知错误",
        },
        status: "error" as const,
      };
    }
  },
};
```

## 注意事项

1. 所有工具都应该遵循 `AgentTool` 接口
2. 工具执行函数应该包含适当的错误处理
3. 工具参数应该使用 JSON Schema 格式定义
4. 工具返回结果应该包含 `toolCallId` 和 `status`
5. 保持工具文件简洁，单个文件不超过250行 