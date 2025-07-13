# Agent Chat 组件

Agent Chat 是一套完整的智能体聊天界面组件，提供消息显示、输入交互、工具调用等功能。

## 组件概览

### 核心组件
- `AgentChatContainer` - 完整的聊天容器（推荐使用）
- `AgentChatMessages` - 消息显示区域
- `AgentChatInput` - 消息输入区域
- `AgentChatHeader` - 聊天头部
- `AgentChatProviderWrapper` - 上下文提供者

## 使用案例

### 1. 智能体预览聊天

```tsx
// agent-preview-chat.tsx
import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { getCurrentTimeTool, fileSystemTool, codeAnalysisTool, networkTool } from "@/common/features/agents/components/agent-tools";
import { createDisplayQuickActionsTool } from "@/common/features/agents/components/agent-tools/show-suggestion.tool";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { useState } from "react";

function AgentPreviewChat({ agentDef, className, tools, enableSuggestions = true }) {
  const [chatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // 创建 suggestion tool
  const suggestionTool = createDisplayQuickActionsTool(setSuggestions);

  // 工具集合，直接组合单个工具
  const previewTools = [
    ...(tools || []),
    getCurrentTimeTool,
    fileSystemTool,
    codeAnalysisTool,
    networkTool,
    suggestionTool
  ];
  useProvideAgentTools(previewTools);

  return (
    <AgentChatProviderWrapper>
      <AgentChatContainer
        className={className}
        agentDef={agentDef}
        messages={chatMessages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        showInfoPanel={false}
        defaultInfoExpanded={false}
        compactInfo={true}
        enableFloatingInfo={true}
        // bottomContent={...} // 可选：建议区等自定义内容
      />
    </AgentChatProviderWrapper>
  );
}
```

**特点：**
- 使用 `AgentChatContainer` 提供完整功能
- 工具直接用数组组合，无需 getXxxTools 工厂函数
- 支持自定义扩展工具
- 启用悬浮信息面板
- 紧凑的信息显示

### 2. 智能体配置助手

```tsx
// agent-configuration-assistant.tsx
import { AgentChatMessages, AgentChatInput } from "@/common/components/chat/agent-chat";
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";

function AgentConfigurationAssistant({ onAgentCreate, className, editingAgent }) {
  // 使用拆分的工具Hook
  useAgentConfigurationTools(onAgentCreate, editingAgent);

  const {
    uiMessages,
    isAgentResponding,
    sendMessage,
  } = useAgentChat({
    agent: agentCreatorAgent,
    tools: [], // 工具已由useAgentConfigurationTools注册
    contexts,
  });

  return (
    <AgentChatProviderWrapper>
      <div className="h-full flex flex-col">
        <AgentChatMessages
          agent={{ id: "creator", ...agentCreatorDef }}
          uiMessages={uiMessages}
          isResponding={isAgentResponding}
          messageTheme="creator"
          avatarTheme="creator"
          emptyState={{
            customWelcomeHeader: customWelcomeHeader,
          }}
        />
        <AgentChatInput
          agent={{ id: "creator", ...agentCreatorDef }}
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          sendDisabled={isAgentResponding}
          customPlaceholder="描述你想要的智能体..."
          containerWidth="narrow"
        />
      </div>
    </AgentChatProviderWrapper>
  );
}
```

**特点：**
- 分离使用 `AgentChatMessages` 和 `AgentChatInput`
- 自定义欢迎头部
- 自定义输入占位符
- 特殊的消息主题

## API 参考

### AgentChatContainer

**Props:**
```tsx
interface AgentChatContainerProps {
  agentDef: AgentDef;                    // 智能体定义
  messages: ChatMessage[];               // 初始消息
  inputMessage: string;                  // 输入框内容
  onInputChange: (value: string) => void; // 输入变化回调
  showInfoPanel?: boolean;               // 是否显示信息面板
  defaultInfoExpanded?: boolean;         // 信息面板默认展开
  compactInfo?: boolean;                 // 紧凑信息显示
  enableFloatingInfo?: boolean;          // 启用悬浮信息
  className?: string;                    // 样式类名
}
```

**Ref 方法:**
```tsx
interface AgentChatContainerRef {
  showFloatingInfo: () => void;          // 显示悬浮信息
  hideFloatingInfo: () => void;          // 隐藏悬浮信息
  toggleFloatingInfo: () => void;        // 切换悬浮信息
  isFloatingInfoVisible: () => boolean;  // 检查悬浮信息状态
}
```

### AgentChatMessages

**Props:**
```tsx
interface AgentChatMessagesProps {
  agent: AgentDef;                       // 智能体定义
  uiMessages: UIMessage[];               // 消息列表
  isResponding: boolean;                 // 是否正在响应
  messageTheme?: string;                 // 消息主题
  avatarTheme?: string;                  // 头像主题
  emptyState?: EmptyStateConfig;         // 空状态配置
}
```

### AgentChatInput

**Props:**
```tsx
interface AgentChatInputProps {
  agent: AgentDef;                       // 智能体定义
  value: string;                         // 输入值
  onChange: (value: string) => void;     // 变化回调
  onSend: () => void;                    // 发送回调
  onAbort?: () => void;                  // 中止回调
  sendDisabled?: boolean;                // 发送按钮禁用
  customPlaceholder?: string;            // 自定义占位符
  containerWidth?: "narrow" | "wide";    // 容器宽度
}
```

## 使用建议

### 选择组件
- **完整功能**：使用 `AgentChatContainer`
- **自定义布局**：分离使用 `AgentChatMessages` + `AgentChatInput`
- **简单预览**：使用 `AgentChatContainer` + `enableFloatingInfo`

### 工具集成
- 直接用数组组合单个工具（如 getCurrentTimeTool、fileSystemTool、codeAnalysisTool、networkTool、suggestionTool 等）
- 使用 `useProvideAgentTools` 注册工具
- 使用 `useProvideAgentContexts` 提供上下文
- 工具在 `AgentChatProviderWrapper` 内生效

### 主题定制
- `messageTheme`: "default", "creator"
- `avatarTheme`: "default", "creator"
- 支持自定义空状态和欢迎头部 