# Suggestions 组件

通用的建议系统，支持多种类型的建议：问题、操作、链接、工具、话题等。

## 组件概览

### 核心组件
- `SuggestionItem` - 单个建议项组件
- `SuggestionsList` - 建议列表组件
- `SuggestionsProvider` - 建议提供者组件

## 建议类型

### 支持的类型
- **question** - 问题建议（蓝色）
- **action** - 操作建议（绿色）
- **link** - 链接建议（紫色）
- **tool** - 工具建议（橙色）
- **topic** - 话题建议（灰色）

### 数据结构
```typescript
interface SuggestionItem {
  id: string;
  type: 'question' | 'action' | 'link' | 'tool' | 'topic';
  title: string;
  description?: string;
  content: string; // 点击后要执行的内容
  icon?: string; // 自定义图标
  metadata?: Record<string, any>; // 额外数据
}
```

## 使用案例

### 1. 基础使用

```tsx
import { SuggestionsProvider } from '@/common/components/chat/suggestions';

function ChatComponent() {
  const handleSuggestionClick = (suggestion) => {
    // 处理建议点击
    console.log('Suggestion clicked:', suggestion);
    // 可以发送消息、执行操作等
  };

  return (
    <div>
      {/* 聊天消息 */}
      <SuggestionsProvider
        messages={uiMessages}
        agent={agentDef}
        onSuggestionClick={handleSuggestionClick}
        maxSuggestions={4}
      />
    </div>
  );
}
```

### 2. 自定义建议列表

```tsx
import { SuggestionsList, SuggestionItem } from '@/common/components/chat/suggestions';

const customSuggestions: SuggestionItem[] = [
  {
    id: 'custom-1',
    type: 'question',
    title: '自定义问题',
    description: '这是一个自定义的问题建议',
    content: '请回答我的自定义问题',
    metadata: { custom: true }
  },
  {
    id: 'custom-2',
    type: 'action',
    title: '执行操作',
    description: '点击执行特定操作',
    content: 'execute:some-action',
    metadata: { action: 'some-action' }
  }
];

function CustomSuggestions() {
  return (
    <SuggestionsList
      suggestions={customSuggestions}
      onSuggestionClick={handleClick}
      layout="grid"
      maxItems={6}
    />
  );
}
```

### 3. 在 Agent Chat 中集成

```tsx
// 在 AgentChatMessages 组件中添加
import { SuggestionsProvider } from '@/common/components/chat/suggestions';

function AgentChatMessages({ uiMessages, agent, ...props }) {
  const handleSuggestionClick = (suggestion) => {
    // 将建议内容发送为消息
    sendMessage(suggestion.content);
  };

  return (
    <div>
      {/* 消息列表 */}
      <div className="messages-container">
        {/* 现有的消息渲染逻辑 */}
      </div>
      
      {/* 建议区域 */}
      <SuggestionsProvider
        messages={uiMessages}
        agent={agent}
        onSuggestionClick={handleSuggestionClick}
        className="mt-4"
      />
    </div>
  );
}
```

## 布局选项

### SuggestionsList 布局
- **list** - 垂直列表（默认）
- **grid** - 网格布局
- **horizontal** - 水平滚动布局

```tsx
<SuggestionsList
  suggestions={suggestions}
  layout="grid" // 或 "list" 或 "horizontal"
  maxItems={4}
/>
```

## 自定义样式

### 自定义建议项样式
```tsx
<SuggestionItem
  suggestion={suggestion}
  onClick={handleClick}
  className="custom-suggestion-class"
/>
```

### 自定义建议列表样式
```tsx
<SuggestionsList
  suggestions={suggestions}
  className="custom-list-class"
  showTitle={false}
  title="自定义标题"
/>
```

## 扩展建议生成

### 创建自定义建议生成器
```tsx
const generateCustomSuggestions = (messages, agent) => {
  const suggestions = [];
  
  // 基于对话历史生成建议
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      suggestions.push({
        id: 'follow-up',
        type: 'question',
        title: '继续深入',
        content: '请继续详细说明',
        metadata: { followUp: true }
      });
    }
  }
  
  // 基于智能体特性生成建议
  if (agent.expertise) {
    agent.expertise.forEach(expertise => {
      suggestions.push({
        id: `expertise-${expertise}`,
        type: 'topic',
        title: `探讨${expertise}`,
        content: `请详细介绍${expertise}`,
        metadata: { expertise }
      });
    });
  }
  
  return suggestions;
};
```

## 最佳实践

1. **上下文感知**：根据当前对话内容生成相关建议
2. **智能体适配**：基于智能体的专业领域生成建议
3. **用户友好**：建议内容应该简洁明了，易于理解
4. **可操作性强**：建议应该能够直接执行或引导用户操作
5. **适度数量**：建议数量不宜过多，通常 3-6 个为宜 