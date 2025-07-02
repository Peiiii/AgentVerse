# @agent-labs/agent-chat 使用教程

@agent-labs/agent-chat 是一个功能强大的 React 组件库，用于快速构建 AI 助手聊天界面。本教程将帮助你了解如何安装和使用这个库。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
  - [基础组件 (AgentChatCore)](#基础组件-agentchatcore)
  - [窗口组件 (AgentChatWindow)](#窗口组件-agentchatwindow)
- [典型场景](#典型场景)
  - [基础聊天界面](#基础聊天界面)
  - [动态上下文管理](#动态上下文管理)
  - [插件式工具系统](#插件式工具系统)
  - [动态注册工具执行器](#动态注册工具执行器)
  - [自定义工具界面](#自定义工具界面)
  - [组合使用场景](#组合使用场景)
  - [预加载消息](#预加载消息)
  - [程序化消息管理](#程序化消息管理)
- [高级功能](#高级功能)
  - [Ref API](#ref-api)
  - [useAgentChat Hook](#useagentchat-hook)
- [API 参考](#api-参考)
- [Hooks 参考](#hooks-参考)

## 安装

使用 npm 或 yarn 安装必要的依赖：

```bash
# 安装 agent-chat 组件库
npm install @agent-labs/agent-chat
# 安装 HTTP Agent 客户端
npm install @ag-ui/client

# 或者使用 yarn
yarn add @agent-labs/agent-chat @ag-ui/client
```

注意：`@ag-ui/client` 是必需的依赖，用于创建 HTTP Agent 实例与后端服务通信。

## 快速开始

首先，创建一个 Agent 实例：

```tsx
import { HttpAgent } from '@ag-ui/client'

// 创建一个全局的 Agent 实例
export const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})
```

然后，在你的应用中使用它：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'

function App() {
  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

## 使用方式

### 基础组件 (AgentChatCore)

`AgentChatCore` 是一个基础的聊天组件，提供了核心的聊天功能，适合需要自定义 UI 的场景：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'

function BasicExample() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <AgentChatCore
          agent={agent}
          className="h-[600px]"
        />
      </div>
    </div>
  )
}
```

`AgentChatCore` 组件提供了：
- 消息列表显示
- 消息输入框
- 工具调用渲染
- 加载状态管理

你可以完全控制组件的样式和布局，适合需要深度定制的场景。

### 窗口组件 (AgentChatWindow)

`AgentChatWindow` 是一个完整的窗口组件，提供了开箱即用的聊天窗口体验：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'

function WindowExample() {
  return (
    <AgentChatWindow
      agent={agent}
      className="fixed bottom-4 right-4"
    />
  )
}
```

`AgentChatWindow` 组件提供了：
- 可拖拽的窗口
- 最大化/最小化功能
- 高度自适应
- 关闭/重新打开功能
- 清除对话功能

适合需要快速集成聊天功能的场景。

## 典型场景

### 基础聊天界面

使用 `AgentChatCore` 构建基础聊天界面：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'

function BasicChat() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">AI 助手</h1>
        </header>
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            agent={agent}
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  )
}
```

### 动态上下文管理

使用 hooks 来管理动态上下文：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import { useProvideAgentContexts } from '@agent-labs/agent-chat'

function DynamicContextChat() {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    lastActive: new Date().toISOString(),
  })

  // 使用 hook 提供上下文
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
  ])

  // 定期更新用户活跃时间
  useEffect(() => {
    const timer = setInterval(() => {
      setUserInfo(prev => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

### 插件式工具系统

使用 hooks 来管理动态工具：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useState } from 'react'
import type { ToolDefinition } from '@agent-labs/agent-chat'
import { useProvideAgentToolDefs } from '@agent-labs/agent-chat'

function PluginSystemChat() {
  // 基础工具
  const baseTools: ToolDefinition[] = [
    {
      name: 'search',
      description: '搜索网络信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词',
          },
        },
        required: ['query'],
      },
    },
  ]

  // 动态工具列表
  const [dynamicTools, setDynamicTools] = useState<ToolDefinition[]>([])

  // 使用 hook 提供工具定义
  useProvideAgentToolDefs([...baseTools, ...dynamicTools])

  // 添加新工具的函数
  const addNewTool = () => {
    const newTool: ToolDefinition = {
      name: 'getTime',
      description: '获取当前时间',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    }
    setDynamicTools(prev => [...prev, newTool])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            agent={agent}
            className="h-[600px]"
          />
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={addNewTool}
          >
            添加时间工具
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 动态注册工具执行器

`useProvideAgentToolExecutors` 用于在组件中动态注册工具执行器（ToolExecutor），实现自动工具调用和结果推送。支持同步和异步函数，配合 `useAgentChat` 可实现自动工具链路。

#### 典型用法

```tsx
import { useProvideAgentToolExecutors } from '@agent-labs/agent-chat'
import type { ToolCall, ToolResult } from '@agent-labs/agent-chat'

function ToolExecutorProvider() {
  // 注册工具执行器
  useProvideAgentToolExecutors({
    search: async (toolCall: ToolCall) => {
      const args = JSON.parse(toolCall.function.arguments)
      // 这里可以调用实际的搜索 API
      return {
        title: '搜索结果',
        content: `你搜索了：${args.query}`,
      }
    },
    getTime: () => {
      // 同步返回
      return { now: new Date().toISOString() }
    },
  })
  return null
}
```

#### ToolExecutor 类型签名

```typescript
export type ToolExecutor = (
  toolCall: ToolCall,
  context?: any
) => ToolResult | Promise<ToolResult>
```
- `toolCall`：工具调用的详细信息
- `context`：可选上下文参数
- 返回值：可以是同步 ToolResult，也可以是 Promise<ToolResult>

#### 自动工具执行链路

- 只需注册 ToolExecutor，`useAgentChat` 会自动监听工具调用事件，自动查找并执行对应的 executor，执行结果自动推送到消息流并可自动触发 agent。
- 你无需手动管理工具调用和结果推送，极大简化业务代码。

#### 场景说明

- 适用于插件式工具、动态扩展工具、自动化工具链等场景。
- 支持在任意组件中动态注册/移除工具执行器，适合微前端、插件化架构。

### 自定义工具界面

使用 hooks 来管理工具渲染器：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import type { ToolRenderer } from '@agent-labs/agent-chat'
import { useProvideAgentToolRenderers } from '@agent-labs/agent-chat'

function CustomToolUI() {
  // 自定义工具渲染器
  const customRenderers: ToolRenderer[] = [
    {
      render: (toolCall, onResult) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">高级搜索</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={args.query}
                className="w-full p-2 border rounded"
                placeholder="输入搜索关键词"
              />
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => {
                    onResult({
                      toolCallId: toolCall.id,
                      result: {
                        title: '搜索结果',
                        content: `这是关于 ${args.query} 的搜索结果...`,
                      },
                      status: 'success',
                    })
                  }}
                >
                  搜索
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={() => {
                    onResult({
                      toolCallId: toolCall.id,
                      result: null,
                      status: 'cancelled',
                    })
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )
      },
      definition: {
        name: 'search',
        description: '搜索网络信息',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词',
            },
          },
          required: ['query'],
        },
      },
    },
  ]

  // 使用 hook 提供工具渲染器
  useProvideAgentToolRenderers(customRenderers)

  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

### 组合使用场景

在实际应用中，通常需要组合使用多个功能：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import type { ToolDefinition, ToolRenderer } from '@agent-labs/agent-chat'
import {
  useProvideAgentContexts,
  useProvideAgentToolDefs,
  useProvideAgentToolRenderers,
} from '@agent-labs/agent-chat'

function AdvancedChat() {
  // 1. 状态管理
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
    },
  })

  // 2. 动态工具
  const [tools, setTools] = useState<ToolDefinition[]>([
    {
      name: 'search',
      description: '搜索网络信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词',
          },
        },
        required: ['query'],
      },
    },
  ])

  // 3. 自定义渲染器
  const toolRenderers: ToolRenderer[] = [
    {
      render: (toolCall, onResult) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">搜索结果</h3>
            <p>正在搜索: {args.query}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                onResult({
                  toolCallId: toolCall.id,
                  result: {
                    title: '搜索结果',
                    content: `这是关于 ${args.query} 的搜索结果...`,
                  },
                  status: 'success',
                })
              }}
            >
              搜索
            </button>
          </div>
        )
      },
      definition: tools[0],
    },
  ]

  // 4. 使用 hooks 提供各种资源
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
  ])
  useProvideAgentToolDefs(tools)
  useProvideAgentToolRenderers(toolRenderers)

  // 5. 动态更新
  useEffect(() => {
    const timer = setInterval(() => {
      setUserInfo(prev => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            高级 AI 助手
          </h1>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AgentChatWindow
            agent={agent}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              // 添加新工具
              const newTool: ToolDefinition = {
                name: 'getTime',
                description: '获取当前时间',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              }
              setTools(prev => [...prev, newTool])
            }}
          >
            添加时间工具
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 预加载消息

使用 `initialMessages` 属性可以在聊天界面初始化时预加载消息：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import type { Message } from '@ag-ui/client'

function PreloadedChat() {
  // 预加载的消息
  const initialMessages: Message[] = [
    {
      id: '1',
      role: 'system',
      content: '欢迎使用 AI 助手！',
    },
    {
      id: '2',
      role: 'assistant',
      content: '你好！我是你的 AI 助手，有什么我可以帮助你的吗？',
    },
  ]

  return (
    <AgentChatWindow
      agent={agent}
      initialMessages={initialMessages}
    />
  )
}
```

这个功能在以下场景特别有用：
- 显示欢迎消息
- 恢复之前的对话
- 提供使用指南
- 设置初始上下文

### 程序化消息管理

使用 `addMessages` API 可以程序化地添加消息到聊天界面：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useRef } from 'react'
import type { AgentChatRef, Message } from '@agent-labs/agent-chat'

function ProgrammaticChat() {
  const chatRef = useRef<AgentChatRef>(null)

  // 添加批量历史消息（不触发 AI 响应）
  const loadHistory = async () => {
    const historyMessages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: '你好，我是张三',
      },
      {
        id: '2',
        role: 'assistant',
        content: '你好张三！很高兴认识你。有什么我可以帮助你的吗？',
      },
      {
        id: '3',
        role: 'user',
        content: '我想了解一下你的功能',
      },
    ]

    await chatRef.current?.addMessages(historyMessages, { triggerAgent: false })
  }

  // 模拟用户输入（触发 AI 响应）
  const simulateUserInput = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: '请介绍一下你自己',
    }

    await chatRef.current?.addMessages([userMessage], { triggerAgent: true })
  }

  // 注入系统消息
  const injectSystemMessage = async () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: '用户当前在移动设备上，请简化你的回答',
    }

    await chatRef.current?.addMessages([systemMessage], { triggerAgent: false })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="mb-4 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={loadHistory}
          >
            加载历史记录
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={simulateUserInput}
          >
            模拟用户输入
          </button>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded"
            onClick={injectSystemMessage}
          >
            注入系统消息
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            ref={chatRef}
            agent={agent}
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  )
}
```

## 高级功能

### Ref API

通过 ref 可以获取到 AgentChat 组件的实例方法：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useRef } from 'react'
import type { AgentChatRef } from '@agent-labs/agent-chat'

function RefExample() {
  const chatRef = useRef<AgentChatRef>(null)

  const handleReset = () => {
    // 重置聊天记录
    chatRef.current?.reset()
  }

  const handleAddMessages = async () => {
    // 添加消息
    await chatRef.current?.addMessages([
      {
        id: Date.now().toString(),
        role: 'user',
        content: '这是通过 ref 添加的消息',
      }
    ])
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleReset}
        >
          重置对话
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleAddMessages}
        >
          添加消息
        </button>
      </div>
      
      <AgentChatCore
        ref={chatRef}
        agent={agent}
        className="h-[600px]"
      />
    </div>
  )
}
```

#### AgentChatRef 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| reset | - | void | 重置聊天记录，清空所有消息 |
| addMessages | messages: Message[], options?: { triggerAgent?: boolean } | Promise<void> | 添加消息到聊天界面 |

### useAgentChat Hook

如果你需要更细粒度的控制，可以直接使用 `useAgentChat` hook：

```tsx
import { useAgentChat } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useState } from 'react'

function CustomChatInterface() {
  const [input, setInput] = useState('')
  const {
    uiMessages,
    isLoading,
    sendMessage,
    addMessages,
    addToolResult,
    reset,
  } = useAgentChat({
    agent,
    tools: [],
    contexts: [],
  })

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  const handleAddBatchMessages = async () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: '批量消息 1',
      },
      {
        id: '2',
        role: 'user' as const,
        content: '批量消息 2',
      },
    ]
    
    // 添加消息但不触发 AI 响应
    await addMessages(messages, { triggerAgent: false })
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4">
        {uiMessages.map((message, index) => (
          <div key={index} className="mb-4">
            <div className="font-semibold">{message.role}:</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            onClick={reset}
          >
            重置
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={handleAddBatchMessages}
          >
            批量添加
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="输入消息..."
            disabled={isLoading}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### useAgentChat 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| messages | Message[] | 原始消息数组 |
| uiMessages | UIMessage[] | 用于 UI 渲染的消息数组 |
| isLoading | boolean | 是否正在加载中 |
| threadId | string \| null | 当前对话线程 ID |
| sendMessage | (content: string) => Promise<void> | 发送消息函数 |
| addMessages | (messages: Message[], options?: { triggerAgent?: boolean }) => Promise<void> | 添加消息函数 |
| addToolResult | (result: ToolResult, options?: { triggerAgent?: boolean }) => Promise<void> | 添加工具结果函数 |
| reset | () => void | 重置聊天记录函数 |

## API 参考

### AgentChatCore Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| agent | HttpAgent | 是 | HTTP Agent 实例 |
| tools | ToolDefinition[] | 否 | 工具定义数组 |
| toolRenderers | Record<string, ToolRenderer> | 否 | 工具渲染器映射 |
| staticContext | Array<{description: string, value: string}> | 否 | 静态上下文信息 |
| className | string | 否 | 自定义 CSS 类名 |
| initialMessages | Message[] | 否 | 初始化时预加载的消息数组 |

### AgentChatWindow Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| agent | HttpAgent | 是 | HTTP Agent 实例 |
| tools | ToolDefinition[] | 否 | 工具定义数组 |
| toolRenderers | Record<string, ToolRenderer> | 否 | 工具渲染器映射 |
| staticContext | Array<{description: string, value: string}> | 否 | 静态上下文信息 |
| className | string | 否 | 自定义 CSS 类名 |
| initialMessages | Message[] | 否 | 初始化时预加载的消息数组 |

### addMessages API

`addMessages` 函数允许你程序化地添加消息到聊天界面：

#### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| messages | Message[] | 是 | 要添加的消息数组 |
| options | { triggerAgent?: boolean } | 否 | 配置选项 |
| options.triggerAgent | boolean | 否 | 是否触发 AI 响应，默认为 true |

#### 使用场景

1. **加载历史记录**: 设置 `triggerAgent: false`，仅添加消息不触发 AI
2. **模拟用户输入**: 设置 `triggerAgent: true`，模拟用户发送消息
3. **批量导入对话**: 一次性添加多条历史消息
4. **注入上下文**: 动态添加系统消息或背景信息

#### 示例

```tsx
// 添加单条消息并触发 AI 响应
await addMessages([{
  id: '1',
  role: 'user',
  content: '你好'
}])

// 批量添加历史消息，不触发 AI 响应
await addMessages([
  { id: '1', role: 'user', content: '历史消息 1' },
  { id: '2', role: 'assistant', content: '历史回复 1' },
  { id: '3', role: 'user', content: '历史消息 2' },
], { triggerAgent: false })

// 注入系统消息
await addMessages([{
  id: Date.now().toString(),
  role: 'system',
  content: '请用简洁的语言回答'
}], { triggerAgent: false })
```

### 工具定义

工具定义需要符合以下格式：

```typescript
interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}
```

### 工具渲染器

工具渲染器需要符合以下格式：

```typescript
interface ToolRenderer {
  render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => ReactNode
  definition: ToolDefinition
}
```

## Hooks 参考

### useProvideAgentContexts

用于提供动态上下文：

```typescript
function useProvideAgentContexts(contexts: Context[]): void
```

这个 hook 允许你在组件中动态提供上下文信息。当 contexts 数组发生变化时，上下文会自动更新。

### useProvideAgentToolDefs

用于提供动态工具定义：

```typescript
function useProvideAgentToolDefs(toolDefs: ToolDefinition[]): void
```

这个 hook 允许你在组件中动态提供工具定义。当 toolDefs 数组发生变化时，工具定义会自动更新。

### useProvideAgentToolRenderers

用于提供动态工具渲染器：

```typescript
function useProvideAgentToolRenderers(toolRenderers: ToolRenderer[]): void
```

这个 hook 允许你在组件中动态提供工具渲染器。当 toolRenderers 数组发生变化时，工具渲染器会自动更新。

### useProvideAgentToolExecutors

用于动态注册工具执行器：

```typescript
function useProvideAgentToolExecutors(toolExecutors: Record<string, ToolExecutor>): void
```
- `toolExecutors`：工具名到执行器的映射
- 支持同步和异步函数
- 组件卸载时自动移除

详见[动态注册工具执行器](#动态注册工具执行器)小节。

## 故障排除

如果遇到问题，请检查：

1. 后端服务是否正常运行
2. Agent URL 配置是否正确
3. 工具定义是否符合规范
4. 网络连接是否正常

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT 