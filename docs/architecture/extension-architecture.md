# Extension 架构设计文档

## 概述

本文档描述了基于 `@cardos/extension` 的插件化架构设计，该架构为 AgentVerse 项目提供了高度模块化、可扩展的功能组织方式。通过这套架构，我们可以实现功能的动态加载、独立开发和部署，同时保持系统的整体一致性。

## 核心设计原则

### 1. 模块化设计
- **功能隔离**：每个功能模块独立开发、测试和部署
- **依赖解耦**：模块间通过标准接口通信，避免直接依赖
- **可插拔**：支持运行时动态加载和卸载功能模块

### 2. 状态管理
- **集中式状态**：使用 Zustand 进行全局状态管理
- **状态隔离**：每个模块可以管理自己的局部状态
- **状态同步**：通过事件机制实现状态间的同步

### 3. 路由系统
- **动态路由**：支持运行时注册和注销路由
- **路由映射**：活动栏与路由系统的双向映射
- **嵌套路由**：支持复杂的路由嵌套结构

### 4. 生命周期管理
- **激活/停用**：完整的模块生命周期管理
- **资源清理**：自动处理模块卸载时的资源清理
- **依赖管理**：处理模块间的依赖关系

## 架构组件

### 1. Extension Manager

Extension Manager 是整个架构的核心，负责管理所有扩展的生命周期。

```typescript
// src/core/extension-manager.ts
import { ExtensionManager } from "@cardos/extension";

export const extensionManager = new ExtensionManager();
```

**主要职责：**
- 注册和注销扩展
- 激活和停用扩展
- 管理扩展依赖关系
- 提供扩展查询接口

### 2. Extension Hook

`useExtensions` Hook 提供了在 React 组件中使用扩展的标准方式。

```typescript
// src/core/hooks/use-extensions.ts
export const useExtensions = (extensions: ExtensionDefinition<unknown>[]) => {
    const [initialized, setInitialized] = useState(false);
    const processedExtensionsRef = useRef<Set<string>>(new Set());

    // 注册扩展
    useEffect(() => {
        extensions.forEach((extension) => {
            const extensionId = extension.manifest.id;
            if (!extensionManager.getExtension(extensionId)) {
                extensionManager.registerExtension(extension);
            }
        });
    }, [extensions]);

    // 激活扩展
    useEffect(() => {
        const currentExtensionIds = new Set(extensions.map(ext => ext.manifest.id));
        const processedIds = processedExtensionsRef.current;

        // 激活新的扩展
        extensions.forEach((extension) => {
            const extensionId = extension.manifest.id;
            if (!processedIds.has(extensionId)) {
                extensionManager.activateExtension(extensionId);
                processedIds.add(extensionId);
            }
        });

        // 停用不再需要的扩展
        const idsToDeactivate = Array.from(processedIds).filter(id => !currentExtensionIds.has(id));
        idsToDeactivate.forEach(extensionId => {
            extensionManager.deactivateExtension(extensionId);
            processedIds.delete(extensionId);
        });

        setInitialized(true);
    }, [extensions]);

    // 清理函数
    useEffect(() => {
        return () => {
            const processedIds = processedExtensionsRef.current;
            const idsToCleanup = Array.from(processedIds);
            idsToCleanup.forEach(extensionId => {
                extensionManager.deactivateExtension(extensionId);
            });
            processedIds.clear();
        };
    }, []);

    return { initialized };
};
```

### 3. 状态管理系统

#### Activity Bar Store

管理活动栏的状态，包括活动项、激活状态等。

```typescript
// src/core/stores/activity-bar.store.ts
export interface ActivityItem {
  id: string;
  icon: string;
  label: string;
  title?: string;
  group?: string;
  order?: number;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export interface ActivityBarState {
  items: ActivityItem[];
  activeId?: string;
  expanded: boolean;
  addItem: (item: ActivityItem) => ()=>void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ActivityItem>) => void;
  setActiveId: (id: string) => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  reset: () => void;
}
```

#### Route Tree Store

管理动态路由树，支持嵌套路由结构。

```typescript
// src/core/stores/route-tree.store.ts
export interface RouteTreeState {
  routes: RouteNode[];
  addRoute: (route: RouteNode, parentId?: string) => () => void;
  addRoutes: (routes: RouteNode[], parentId?: string) =>()=> void;
  removeRoute: (id: string) => void;
  updateRoute: (id: string, updates: Partial<RouteNode>) => void;
  getRoutes: () => RouteNode[];
  reset: () => void;
}
```

### 4. 路由连接工具

`connectRouterWithActivityBar` 工具函数实现了路由系统与活动栏的双向映射。

```typescript
// src/core/utils/connect-router-with-activity-bar.ts
export interface RouteConfig {
  activityKey: string;
  routerPath?: string;
  routerPaths?: string[];
  matchOptions?: RouteMatchOptions;
  children?: RouteConfig[];
}

export function connectRouterWithActivityBar(
  routes: RouteConfig[],
  options: RouteMatchOptions = {}
) {
  const unsubscribeRouter = mapRouterToActivityBar(routes, options);
  const unsubscribeActivityBar = mapActivityBarToRouter(routes);

  return () => {
    unsubscribeRouter();
    unsubscribeActivityBar();
  };
}
```

## Extension 定义模式

### 1. 基础 Extension 结构

每个 Extension 都遵循标准的定义模式：

```typescript
import { defineExtension, Disposable } from "@cardos/extension";

export const myExtension = defineExtension({
  manifest: {
    id: "my-extension",
    name: "My Extension",
    description: "Extension description",
    version: "1.0.0",
    author: "Author Name",
    icon: "icon-name",
  },
  activate: ({ subscriptions }) => {
    // 注册图标
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          "icon-name": MyIcon,
        })
      )
    );

    // 注册活动栏项
    subscriptions.push(
      Disposable.from(
        useActivityBarStore.getState().addItem({
          id: "my-extension",
          label: "My Extension",
          title: "My Extension Title",
          group: "main",
          icon: "icon-name",
          order: 100,
        })
      )
    );

    // 注册路由
    subscriptions.push(
      Disposable.from(
        useRouteTreeStore.getState().addRoutes([
          {
            id: "my-extension",
            path: "/my-extension",
            element: <MyExtensionPage />,
          },
        ])
      )
    );

    // 连接路由与活动栏
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "my-extension",
            routerPath: "/my-extension",
          },
        ])
      )
    );
  },
});
```

### 2. 典型 Extension 示例

#### Chat Extension

```typescript
// src/desktop/features/chat/extensions/index.tsx
export const desktopChatExtension = defineExtension({
  manifest: {
    id: "chat",
    name: "Chat",
    description: "Chat with the user",
    version: "1.0.0",
    author: "AgentVerse",
    icon: "message",
  },
  activate: ({ subscriptions }) => {
    // 注册图标
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          "message": MessageSquare,
        })
      )
    );

    // 注册活动栏项
    subscriptions.push(
      Disposable.from(
        useActivityBarStore.getState().addItem({
          id: "chat",
          label: "Chat",
          title: "Chat with the user",
          group: "main",
          icon: "message",
          order: ModuleOrderEnum.CHAT,
        })
      )
    );

    // 注册路由
    subscriptions.push(
      Disposable.from(
        useRouteTreeStore.getState().addRoutes([
          {
            id: "chat",
            path: "/chat",
            order: 0,
            element: <ChatPage />,
          },
          {
            id: "redirect",
            path: "/",
            order: 9999,
            element: <RedirectToChat />,
          }
        ])
      )
    );

    // 连接路由与活动栏
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "chat",
            routerPath: "/chat",
          },
        ])
      )
    );
  },
});
```

#### MCP Extension

```typescript
// src/desktop/features/mcp/extensions/index.tsx
export const desktopMCPExtension = defineExtension({
  manifest: {
    id: "mcp",
    name: "MCP Tools",
    description: "Model Context Protocol tools integration",
    version: "1.0.0",
    author: "AgentVerse",
    icon: "server",
  },
  activate: ({ subscriptions }) => {
    // 注册图标
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          "cpu": Cpu,
        })
      )
    );

    // 注册活动栏项
    subscriptions.push(
      Disposable.from(
        useActivityBarStore.getState().addItem({
          id: "mcp",
          label: "MCP Tools",
          title: "Model Context Protocol tools",
          group: "main",
          icon: "cpu",
          order: ModuleOrderEnum.MCP,
        })
      )
    );

    // 注册路由
    subscriptions.push(
      Disposable.from(
        useRouteTreeStore.getState().addRoutes([
          {
            id: "mcp-demo",
            path: "/mcp",
            element: <MCPDemoPage />,
          }
        ])
      )
    );

    // 连接路由与活动栏
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "mcp",
            routerPath: "/mcp",
          },
        ])
      )
    );
  },
});
```

## 应用集成

### 1. 应用初始化

在应用启动时，通过 `useSetupApp` Hook 初始化所有扩展：

```typescript
// src/desktop/desktop-app.tsx
export function DesktopAppInner() {
  const { initialized } = useSetupApp({
    extensions: [
      allInOneAgentExtension,
      desktopChatExtension,
      desktopAgentsExtension,
      settingsExtension,
      desktopMCPExtension,
      desktopIndexedDBExtension,
      desktopFileManagerExtension,
      desktopPortalDemoExtension,
      githubExtension,
      desktopPluginManagerExtension,
    ],
  });

  return !initialized ? (
    <div>Loading...</div>
  ) : (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 flex">
          <ActivityBarComponent className="flex" />
          <PluginRouter />
        </div>
      </div>
    </div>
  );
}
```

### 2. 应用设置 Hook

```typescript
// src/core/hooks/use-setup-app.ts
export const useSetupApp = (options: {
  extensions: ExtensionDefinition[]
}) => {
  useConnectNavigationStore();
  const { initialized } = useExtensions(options.extensions);
  return { initialized };
};
```

## 目录结构规范

### 1. Feature 目录结构

每个功能模块都遵循统一的目录结构：

```
src/
├── desktop/
│   └── features/
│       └── [feature-name]/
│           ├── components/          # 功能组件
│           ├── pages/               # 页面组件
│           ├── services/            # 服务层
│           ├── hooks/               # 自定义 Hooks
│           ├── types/               # 类型定义
│           ├── extensions/          # Extension 定义
│           │   └── index.tsx        # 主 Extension
│           └── README.md            # 功能文档
└── common/
    └── features/
        └── [feature-name]/
            ├── components/          # 通用组件
            ├── extensions/          # 通用 Extension
            └── index.ts             # 导出文件
```

### 2. Extension 文件组织

Extension 文件应该包含：

- **manifest**: 扩展的基本信息
- **activate**: 激活逻辑，包括资源注册
- **deactivate**: 停用逻辑（可选）
- **dependencies**: 依赖声明（可选）

## 最佳实践

### 1. Extension 设计原则

#### 单一职责
每个 Extension 应该只负责一个明确的功能领域。

```typescript
// ✅ 好的设计：职责单一
export const chatExtension = defineExtension({
  manifest: { id: "chat", name: "Chat" },
  activate: ({ subscriptions }) => {
    // 只处理聊天相关功能
  }
});

// ❌ 避免：职责混乱
export const megaExtension = defineExtension({
  manifest: { id: "mega", name: "Mega Extension" },
  activate: ({ subscriptions }) => {
    // 处理聊天、文件、设置等多种功能
  }
});
```

#### 资源管理
使用 `Disposable` 确保资源正确清理。

```typescript
// ✅ 好的做法：正确的资源管理
activate: ({ subscriptions }) => {
  // 注册资源并返回清理函数
  const cleanup = useActivityBarStore.getState().addItem({
    id: "my-extension",
    label: "My Extension",
    icon: "icon",
  });
  
  // 添加到订阅列表，自动清理
  subscriptions.push(Disposable.from(cleanup));
}
```

#### 错误处理
在 Extension 激活过程中处理可能的错误。

```typescript
activate: ({ subscriptions }) => {
  try {
    // 注册资源
    subscriptions.push(Disposable.from(/* ... */));
  } catch (error) {
    console.error('Failed to activate extension:', error);
    // 可以选择重新抛出或记录错误
  }
}
```

### 2. 状态管理最佳实践

#### 状态隔离
每个 Extension 应该管理自己的状态，避免全局状态污染。

```typescript
// ✅ 好的做法：状态隔离
const useMyExtensionStore = create<MyExtensionState>((set) => ({
  // 只管理本扩展的状态
}));

// ❌ 避免：全局状态污染
const useGlobalStore = create<GlobalState>((set) => ({
  // 管理所有扩展的状态
}));
```

#### 状态同步
使用事件机制实现状态间的同步。

```typescript
// 监听其他扩展的状态变化
useEffect(() => {
  const unsubscribe = otherExtensionStore.subscribe((state) => {
    // 响应状态变化
  });
  
  return unsubscribe;
}, []);
```

### 3. 路由管理最佳实践

#### 路由命名
使用一致的命名规范。

```typescript
// ✅ 好的做法：一致的命名
const routes = [
  {
    id: "my-extension-main",
    path: "/my-extension",
    element: <MainPage />,
  },
  {
    id: "my-extension-settings",
    path: "/my-extension/settings",
    element: <SettingsPage />,
  },
];
```

#### 路由嵌套
合理使用路由嵌套结构。

```typescript
// ✅ 好的做法：合理的嵌套
const routes = [
  {
    id: "my-extension",
    path: "/my-extension",
    element: <Layout />,
    children: [
      {
        id: "my-extension-list",
        path: "/my-extension",
        element: <ListPage />,
      },
      {
        id: "my-extension-detail",
        path: "/my-extension/:id",
        element: <DetailPage />,
      },
    ],
  },
];
```



## 扩展开发指南

### 1. 创建新 Extension

#### 步骤 1：创建目录结构

```bash
mkdir -p src/desktop/features/my-extension/{components,pages,services,hooks,types,extensions}
```

#### 步骤 2：定义 Extension

```typescript
// src/desktop/features/my-extension/extensions/index.tsx
import { defineExtension, Disposable } from "@cardos/extension";
import { useActivityBarStore } from "@/core/stores/activity-bar.store";
import { useIconStore } from "@/core/stores/icon.store";
import { useRouteTreeStore } from "@/core/stores/route-tree.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { MyIcon } from "lucide-react";
import { MyExtensionPage } from "../pages/my-extension-page";

export const myExtension = defineExtension({
  manifest: {
    id: "my-extension",
    name: "My Extension",
    description: "A sample extension",
    version: "1.0.0",
    author: "Your Name",
    icon: "my-icon",
  },
  activate: ({ subscriptions }) => {
    // 注册图标
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          "my-icon": MyIcon,
        })
      )
    );

    // 注册活动栏项
    subscriptions.push(
      Disposable.from(
        useActivityBarStore.getState().addItem({
          id: "my-extension",
          label: "My Extension",
          title: "My Extension",
          group: "main",
          icon: "my-icon",
          order: 100,
        })
      )
    );

    // 注册路由
    subscriptions.push(
      Disposable.from(
        useRouteTreeStore.getState().addRoutes([
          {
            id: "my-extension",
            path: "/my-extension",
            element: <MyExtensionPage />,
          },
        ])
      )
    );

    // 连接路由与活动栏
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "my-extension",
            routerPath: "/my-extension",
          },
        ])
      )
    );
  },
});
```

#### 步骤 3：创建页面组件

```typescript
// src/desktop/features/my-extension/pages/my-extension-page.tsx
import React from 'react';

export function MyExtensionPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Extension</h1>
      <p>This is my extension page.</p>
    </div>
  );
}
```

#### 步骤 4：注册 Extension

```typescript
// src/desktop/desktop-app.tsx
import { myExtension } from "./features/my-extension/extensions";

export function DesktopAppInner() {
  const { initialized } = useSetupApp({
    extensions: [
      // ... 其他扩展
      myExtension,
    ],
  });
  
  // ...
}
```





## 总结

基于 `@cardos/extension` 的架构为 AgentVerse 项目提供了强大的插件化能力。通过这套架构，我们可以：

1. **实现功能模块化**：每个功能独立开发、测试和部署
2. **支持动态扩展**：运行时动态加载和卸载功能
3. **保持系统一致性**：统一的状态管理和路由系统
4. **提高开发效率**：标准化的开发模式和工具

这套架构不仅适用于当前项目，也可以作为其他 React 项目的参考架构，为构建可扩展的应用程序提供指导。

## 参考资料

- [@cardos/extension 文档](https://github.com/cardos/extension)
- [Zustand 状态管理](https://github.com/pmndrs/zustand)
- [React Router 路由管理](https://reactrouter.com/)
- [AgentVerse 项目](https://github.com/agentverse/agentverse) 