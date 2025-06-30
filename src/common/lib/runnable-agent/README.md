# ExperimentalInBrowserAgent

基于OpenAI API的前端agent实现，支持流式响应和工具调用。

## 功能特性

- ✅ 基于OpenAI API的流式对话
- ✅ 支持工具调用（Function Calling）
- ✅ 支持上下文信息
- ✅ 完整的事件流处理
- ✅ 错误处理和重试机制
- ✅ 可配置的模型参数

## 环境变量配置

在项目根目录创建 `.env` 文件：

```env
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_API_URL=https://api.openai.com/v1
```

## 基本使用

```typescript
import { ExperimentalInBrowserAgent } from '@/common/lib/runnable-agent';

// 创建agent实例
const agent = new ExperimentalInBrowserAgent({
  // 可选配置
  // openaiApiKey: 'your-api-key',
  // model: 'gpt-4',
  // temperature: 0.7,
  // maxTokens: 1000,
  // baseURL: 'https://api.openai.com/v1',
});

// 运行agent
const events$ = agent.run({
  threadId: 'thread-123',
  runId: 'run-456',
  messages: [
    {
      id: '1',
      role: 'user',
      content: '你好，请介绍一下你自己',
    },
  ],
  tools: [],
  context: [],
});

// 监听事件
events$.subscribe({
  next: (event) => {
    console.log('Agent event:', event);
  },
  error: (error) => {
    console.error('Agent error:', error);
  },
  complete: () => {
    console.log('Agent completed');
  },
});
```

## 支持的事件类型

- `RUN_STARTED` - 运行开始
- `THINKING_START` - 思考开始
- `TEXT_MESSAGE_START` - 文本消息开始
- `TEXT_MESSAGE_CONTENT` - 文本消息内容
- `TEXT_MESSAGE_CHUNK` - 文本消息块
- `TEXT_MESSAGE_END` - 文本消息结束
- `THINKING_END` - 思考结束
- `RUN_FINISHED` - 运行完成
- `RUN_ERROR` - 运行错误

## 工具调用支持

```typescript
const tools = [
  {
    name: 'get_weather',
    description: '获取天气信息',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: '城市名称',
        },
      },
      required: ['location'],
    },
  },
];

const events$ = agent.run({
  threadId: 'thread-123',
  runId: 'run-456',
  messages: [
    {
      id: '1',
      role: 'user',
      content: '北京今天天气怎么样？',
    },
  ],
  tools,
  context: [],
});
```

## 上下文支持

```typescript
const context = [
  {
    description: '用户偏好',
    value: '用户喜欢简洁的回答',
  },
  {
    description: '当前时间',
    value: '2024年1月1日 12:00',
  },
];

const events$ = agent.run({
  threadId: 'thread-123',
  runId: 'run-456',
  messages: [
    {
      id: '1',
      role: 'user',
      content: '请给我一些建议',
    },
  ],
  tools: [],
  context,
});
```

## 配置方法

### 设置API密钥

```typescript
agent.setApiKey('your-new-api-key');
```

### 设置模型

```typescript
agent.setModel('gpt-4');
```

### 获取当前配置

```typescript
const config = agent.getConfig();
console.log(config);
// {
//   model: 'gpt-3.5-turbo',
//   hasApiKey: true,
//   temperature: 0.7,
//   maxTokens: 1000,
// }
```

## 注意事项

1. **版本兼容性**: 当前实现使用了 `@ag-ui/core@0.0.30`，与 `@agent-labs/agent-chat` 期望的 `@ag-ui/core@0.0.28` 存在版本冲突。建议在项目中统一版本。

2. **浏览器安全**: 使用 `dangerouslyAllowBrowser: true` 选项允许在浏览器中直接调用OpenAI API，请确保API密钥的安全性。

3. **错误处理**: 所有错误都会通过 `RUN_ERROR` 事件返回，建议实现适当的错误处理逻辑。

4. **流式响应**: 支持实时流式响应，可以用于构建打字机效果的用户界面。

## 依赖项

- `openai` - OpenAI API客户端
- `rxjs` - 响应式编程库
- `uuid` - UUID生成器
- `@agent-labs/agent-chat` - Agent聊天框架
- `@ag-ui/core` - UI核心库 