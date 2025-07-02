# @agent-labs/agent-chat 使用教程

@agent-labs/agent-chat 是一个功能强大的 React 组件库，用于快速构建 AI 助手聊天界面。本教程将帮助你了解如何安装和使用这个库。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
  - [基础组件 (AgentChatCore)](#基础组件-agentchatcore)
  - [窗口组件 (AgentChatWindow)](#窗口组件-agentchatwindow)
- [Context Provider 架构](#context-provider-架构)
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

就这么简单！

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

## Context Provider 架构

所有 hooks 默认使用全局实例，无需配置 Provider，只有多实例隔离时才需要。

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

使用 hooks 来管理动态上下文，默认情况下无需额外配置：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import { useProvideAgentContexts } from '@agent-labs/agent-chat'

// 直接使用动态上下文 - 使用默认全局实例
function DynamicContextChat() {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    lastActive: new Date().toISOString(),
  })

  // 使用 hook 提供上下文 - 自动使用默认全局实例
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">动态上下文聊天</h1>
          <p className="text-gray-600">
            当前用户: {userInfo.name} ({userInfo.role})
          </p>
        </header>
        <AgentChatWindow agent={agent} />
      </div>
    </div>
  )
}

// 如果需要多实例隔离，可以使用Provider包装：
function IsolatedDynamicContextApp() {
  return (
    <AgentProvidersProvider>
      <DynamicContextChat />
    </AgentProvidersProvider>
  )
}

export default DynamicContextChat
```

### 插件式工具系统

使用 hooks 来管理动态工具，默认情况下无需额外配置：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useState } from 'react'
import type { ToolDefinition } from '@agent-labs/agent-chat'
import { useProvideAgentToolDefs } from '@agent-labs/agent-chat'

// 插件管理组件 - 直接使用默认全局实例
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

  // 使用 hook 提供工具定义 - 自动使用默认全局实例
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

  // 移除工具的函数
  const removeLastTool = () => {
    setDynamicTools(prev => prev.slice(0, -1))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">插件式工具系统</h1>
          <p className="text-gray-600">
            当前工具数量: {baseTools.length + dynamicTools.length}
          </p>
        </header>
        
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            agent={agent}
            className="h-[600px]"
          />
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={addNewTool}
            disabled={dynamicTools.some(t => t.name === 'getTime')}
          >
            添加时间工具
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={removeLastTool}
            disabled={dynamicTools.length === 0}
          >
            移除最后一个工具
          </button>
        </div>
        
        {/* 工具列表显示 */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">当前可用工具:</h3>
          <ul className="space-y-1">
            {[...baseTools, ...dynamicTools].map((tool, index) => (
              <li key={index} className="text-sm">
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                  {tool.name}
                </span>
                - {tool.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// 如果需要插件隔离，可以使用Provider包装：
function IsolatedPluginSystemApp() {
  return (
    <AgentProvidersProvider>
      <PluginSystemChat />
    </AgentProvidersProvider>
  )
}

export default PluginSystemChat
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

使用 hooks 来管理工具渲染器，默认情况下无需额外配置：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import type { ToolRenderer } from '@agent-labs/agent-chat'
import { 
  useProvideAgentToolRenderers,
  useProvideAgentToolDefs 
} from '@agent-labs/agent-chat'

// 自定义工具界面组件 - 直接使用默认全局实例
function CustomToolUI() {
  // 工具定义 - 需要同时提供工具定义和渲染器
  const toolDefinitions = [
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

  // 自定义工具渲染器
  const customRenderers: ToolRenderer[] = [
    {
      render: (toolCall, onResult) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-bold mb-2 text-blue-800">🔍 高级搜索</h3>
            <div className="space-y-4">
              <input
                type="text"
                defaultValue={args.query}
                className="w-full p-2 border rounded"
                placeholder="输入搜索关键词"
                id={`search-input-${toolCall.id}`}
              />
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    const input = document.getElementById(`search-input-${toolCall.id}`) as HTMLInputElement
                    const query = input?.value || args.query
                    
                    onResult({
                      toolCallId: toolCall.id,
                      result: {
                        title: '搜索结果',
                        content: `已完成对 "${query}" 的搜索，找到了相关信息...`,
                        results: [
                          `关于 ${query} 的结果 1`,
                          `关于 ${query} 的结果 2`,
                          `关于 ${query} 的结果 3`,
                        ]
                      },
                      status: 'success',
                    })
                  }}
                >
                  🔍 开始搜索
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => {
                    onResult({
                      toolCallId: toolCall.id,
                      result: null,
                      status: 'cancelled',
                    })
                  }}
                >
                  ❌ 取消
                </button>
              </div>
            </div>
          </div>
        )
      },
      definition: toolDefinitions[0],
    },
  ]

  // 使用 hooks 提供工具定义和渲染器 - 自动使用默认全局实例
  useProvideAgentToolDefs(toolDefinitions)
  useProvideAgentToolRenderers(customRenderers)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">自定义工具界面</h1>
          <p className="text-gray-600">
            展示自定义的工具渲染器，提供更丰富的交互体验
          </p>
        </header>
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatWindow agent={agent} />
        </div>
      </div>
    </div>
  )
}

// 如果需要渲染器隔离，可以使用Provider包装：
function IsolatedCustomToolUIApp() {
  return (
    <AgentProvidersProvider>
      <CustomToolUI />
    </AgentProvidersProvider>
  )
}

export default CustomToolUI
```

### 组合使用场景

在实际应用中，通常需要组合使用多个功能，以下是一个完整的示例：

```tsx
import { AgentChatWindow, AgentProvidersProvider } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import type { ToolDefinition, ToolRenderer } from '@agent-labs/agent-chat'
import {
  useProvideAgentContexts,
  useProvideAgentToolDefs,
  useProvideAgentToolRenderers,
  useProvideAgentToolExecutors,
} from '@agent-labs/agent-chat'

// 主应用组件 - 使用Provider是为了演示完整功能组合
// 在实际应用中，如果不需要隔离，可以直接使用默认全局实例
function AdvancedChatApp() {
  return (
    <AgentProvidersProvider>
      <AdvancedChat />
    </AgentProvidersProvider>
  )
}

// 高级聊天组件 - 组合使用多个功能
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

  // 4. 工具执行器
  useProvideAgentToolExecutors({
    search: async (toolCall) => {
      const args = JSON.parse(toolCall.function.arguments)
      // 模拟搜索 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        title: '搜索结果',
        content: `已找到关于 "${args.query}" 的信息`,
        results: [
          `结果 1: ${args.query} 的定义`,
          `结果 2: ${args.query} 的应用场景`,
          `结果 3: ${args.query} 的最新发展`,
        ]
      }
    },
    getTime: () => {
      return {
        currentTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    },
  })

  // 5. 使用 hooks 提供各种资源 - 需要在 Provider 内部使用
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
    {
      description: '应用状态',
      value: JSON.stringify({
        theme: userInfo.preferences.theme,
        activeFeatures: ['search', 'time', 'chat'],
        sessionStartTime: new Date().toISOString(),
      }),
    },
  ])
  useProvideAgentToolDefs(tools)
  useProvideAgentToolRenderers(toolRenderers)

  // 6. 动态更新和生命周期管理
  useEffect(() => {
    const timer = setInterval(() => {
      setUserInfo(prev => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // 7. 工具管理函数
  const addTimeTool = () => {
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
  }

  const toggleTheme = () => {
    setUserInfo(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: prev.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }))
  }

  return (
    <div className={`min-h-screen transition-colors ${
      userInfo.preferences.theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                高级 AI 助手
              </h1>
              <p className="text-sm opacity-75 mt-1">
                用户: {userInfo.name} | 角色: {userInfo.role} | 
                主题: {userInfo.preferences.theme}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              切换主题
            </button>
          </div>
        </header>

        <div className={`rounded-lg shadow-lg ${
          userInfo.preferences.theme === 'dark' 
            ? 'bg-gray-800' 
            : 'bg-white'
        }`}>
          <AgentChatWindow agent={agent} />
        </div>

        <div className="mt-4 flex gap-4 flex-wrap">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={addTimeTool}
            disabled={tools.some(t => t.name === 'getTime')}
          >
            {tools.some(t => t.name === 'getTime') ? '时间工具已添加' : '添加时间工具'}
          </button>
          
          <div className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded">
            当前工具数量: {tools.length}
          </div>
        </div>

        {/* 状态显示面板 */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">系统状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>用户信息:</strong>
              <ul className="mt-1 space-y-1">
                <li>姓名: {userInfo.name}</li>
                <li>角色: {userInfo.role}</li>
                <li>最后活跃: {new Date(userInfo.lastActive).toLocaleTimeString()}</li>
              </ul>
            </div>
            <div>
              <strong>可用工具:</strong>
              <ul className="mt-1 space-y-1">
                {tools.map((tool, index) => (
                  <li key={index} className="font-mono text-xs">
                    {tool.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong>偏好设置:</strong>
              <ul className="mt-1 space-y-1">
                <li>主题: {userInfo.preferences.theme}</li>
                <li>语言: {userInfo.preferences.language}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 注意：在这个示例中，我们使用了Provider是为了演示完整的功能组合
// 在实际应用中，如果不需要隔离，可以移除Provider直接使用默认全局实例

export default AdvancedChatApp
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

**说明**: 默认使用全局实例，如需隔离可使用Provider。

### useProvideAgentToolDefs

用于提供动态工具定义：

```typescript
function useProvideAgentToolDefs(toolDefs: ToolDefinition[]): void
```

这个 hook 允许你在组件中动态提供工具定义。当 toolDefs 数组发生变化时，工具定义会自动更新。

**说明**: 默认使用全局实例，如需隔离可使用Provider。

### useProvideAgentToolRenderers

用于提供动态工具渲染器：

```typescript
function useProvideAgentToolRenderers(toolRenderers: ToolRenderer[]): void
```

这个 hook 允许你在组件中动态提供工具渲染器。当 toolRenderers 数组发生变化时，工具渲染器会自动更新。

**说明**: 默认使用全局实例，如需隔离可使用Provider。

### useProvideAgentToolExecutors

用于动态注册工具执行器：

```typescript
function useProvideAgentToolExecutors(toolExecutors: Record<string, ToolExecutor>): void
```

**参数说明**:
- `toolExecutors`：工具名到执行器的映射
- 支持同步和异步函数
- 组件卸载时自动移除

**说明**: 默认使用全局实例，如需隔离可使用Provider。

详见[动态注册工具执行器](#动态注册工具执行器)小节。

所有hooks默认使用全局实例，无需额外配置。只有在需要多实例隔离时才使用Provider。

## 故障排除


### 常见问题

#### 1. 动态资源不生效

**问题**: 使用 `useProvideAgent*` hooks 但工具或上下文没有生效

**解决方法**: 
- 检查传入的数据格式是否正确
- 验证工具名称是否与执行器名称完全匹配
- 确认 hooks 在组件的正确位置调用

#### 2. 工具执行器不响应

**问题**: 注册了工具执行器但工具调用没有自动执行

**解决方法**:
- 确保工具名称与执行器名称完全匹配
- 检查执行器函数是否正确返回 ToolResult
- 验证是否在正确的 Provider 范围内

#### 3. 多实例冲突

**问题**: 多个聊天实例之间工具或上下文互相影响

**解决方法**: 为每个聊天实例提供独立的 AgentProvidersProvider

### 技术问题

如果遇到其他问题，请检查：

1. **后端服务**: 确保 Agent 服务正常运行并可访问
2. **Agent URL**: 验证 HttpAgent 的 URL 配置是否正确
3. **工具定义**: 检查 ToolDefinition 是否符合 JSON Schema 规范
4. **网络连接**: 确认客户端与服务器之间的网络连通性
5. **依赖版本**: 确认 `@agent-labs/agent-chat` 和 `@ag-ui/client` 版本兼容

### 调试技巧

1. **开启浏览器开发者工具**: 查看控制台错误和网络请求
2. **使用 React DevTools**: 检查 Context 的值是否正确传递
3. **添加日志**: 在关键函数中添加 console.log 来跟踪执行流程

```tsx
function DebugExample() {
  useProvideAgentToolExecutors({
    debug: (toolCall) => {
      console.log('Tool called:', toolCall)
      return { debug: 'success' }
    }
  })
  
  return <AgentChatCore agent={agent} />
}
```

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT 