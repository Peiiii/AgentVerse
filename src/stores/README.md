# Stores 文档

## 概述

本目录包含了基于 Zustand 的状态管理 store，用于管理应用的各种状态。

## Store 列表

### 1. Activity Bar Store (`activity-bar.store.ts`)

管理 Activity Bar 的状态，包括：
- 活动项列表
- 当前激活项
- 展开/收起状态

**使用场景**：Activity Bar 组件的状态管理

### 2. Icon Store (`icon.store.ts`)

管理图标注册系统，提供动态图标配置功能。

**使用场景**：
- ✅ **适合**：需要动态配置图标的场景
  - 主题切换（不同主题使用不同图标）
  - 国际化（不同语言环境使用不同图标）
  - 用户自定义图标
  - 配置化的界面元素

- ❌ **不适合**：静态、固定的图标需求
  - 直接使用 Lucide 图标组件即可
  - 例如：`<MessageCircle className="w-4 h-4" />`

**组件位置**：`src/components/common/icon-registry.tsx`

**使用示例**：
```tsx
// 配置化场景 - 使用 IconRegistry
<IconRegistry id="message" className="w-4 h-4" />

// 静态场景 - 直接使用 Lucide 图标
<MessageCircle className="w-4 h-4" />
```

## 设计原则

1. **按需使用**：不要强制替换所有图标，根据实际需求选择合适的方案
2. **配置化优先**：对于需要动态配置的场景，使用 IconRegistry
3. **简洁性**：对于静态图标，直接使用 Lucide 组件更简洁
4. **可维护性**：保持代码的清晰和可维护性

## 文件组织

```
src/
├── stores/                    # Zustand stores
│   ├── activity-bar.store.ts
│   ├── icon.store.ts
│   └── README.md
├── components/
│   ├── common/
│   │   └── icon-registry.tsx  # 图标注册组件（配置化场景）
│   └── ui/                    # 静态 UI 组件
└── examples/
    └── icon-store-demo.tsx    # 使用示例
```

## 最佳实践

1. **评估需求**：在添加图标前，先评估是否需要配置化
2. **保持一致性**：在同一个组件中，保持图标使用方式的一致性
3. **文档化**：对于复杂的图标配置，添加适当的注释和文档
4. **性能考虑**：避免不必要的图标注册和注销操作

## 核心概念

### Icon Store

```typescript
interface IconState {
  icons: Record<string, LucideIcon>;  // 图标映射
  addIcon: (id: string, icon: LucideIcon) => void;
  removeIcon: (id: string) => void;
  getIcon: (id: string) => LucideIcon | undefined;
  reset: () => void;
}
```

### AppIcon 组件

```typescript
interface AppIconProps {
  id: string;                    // 图标ID
  className?: string;            // 样式类
  fallbackIcon?: LucideIcon;     // 备用图标
}
```

## 使用方法

### 1. 使用 AppIcon 组件

```typescript
import { AppIcon } from '@/components/ui/icon';

function MyComponent() {
  return (
    <div>
      <AppIcon id="message" />
      <AppIcon id="home" className="text-blue-500" />
      <AppIcon id="custom-icon" fallbackIcon={Star} />
      <AppIcon id="star" className="w-6 h-6 text-yellow-500" />
    </div>
  );
}
```

### 2. 使用 Icon Store

```typescript
import { useIconStore } from '@/stores/icon.store';
import { Star } from 'lucide-react';

function MyComponent() {
  const { icons, addIcon, removeIcon, reset } = useIconStore();
  
  const handleAddIcon = () => {
    addIcon('custom-star', Star);
  };
  
  return (
    <div>
      <p>图标总数: {Object.keys(icons).length}</p>
      <button onClick={handleAddIcon}>添加图标</button>
      <button onClick={() => removeIcon('custom-star')}>移除图标</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

### 3. 使用选择器 Hooks

```typescript
import { useIcons, useIcon, useIconIds } from '@/stores/icon.store';

function MyComponent() {
  const icons = useIcons();
  const messageIcon = useIcon('message');
  const iconIds = useIconIds();
  
  return (
    <div>
      <p>所有图标: {iconIds.join(', ')}</p>
    </div>
  );
}
```

## 默认图标

Store 初始化时包含以下默认图标：

### 基础图标
- `message`: 消息图标
- `users`: 用户图标
- `settings`: 设置图标
- `github`: GitHub图标
- `home`: 首页图标
- `search`: 搜索图标

### 文件图标
- `file`: 文件图标
- `folder`: 文件夹图标
- `calendar`: 日历图标
- `bookmark`: 书签图标

### 操作图标
- `download`, `upload`, `share`, `edit`
- `trash`, `plus`, `minus`, `check`, `x`

### 导航图标
- `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`
- `menu`, `more-horizontal`, `more-vertical`

### 主题图标
- `sun`, `moon`, `monitor`

### 用户相关图标
- `bell`, `user`, `log-out`, `cog`

### 状态图标
- `help-circle`, `info`, `alert-circle`
- `alert-triangle`, `check-circle`, `x-circle`

## 持久化

Store 使用 Zustand 的 `persist` 中间件进行本地存储，数据会保存在 `localStorage` 中，键名为 `icon-store`。

## 在 Activity Bar 中的使用

Activity Bar 组件使用通用的图标系统：

```typescript
// 在 activity-bar.tsx 中
const iconMap: Record<string, string> = {
  'chat': 'message',
  'agents': 'users',
  'settings': 'settings',
  'github': 'github',
};

<ActivityBar.Item
  id="chat"
  icon={<AppIcon id={iconMap['chat']} />}
  label="聊天"
/>
```

## 扩展

### 添加自定义图标

```typescript
import { useIconStore } from '@/stores/icon.store';
import { CustomIcon } from 'lucide-react';

const { addIcon } = useIconStore();
addIcon('custom-icon', CustomIcon);
```

### 使用自定义图标

```typescript
import { AppIcon } from '@/components/ui/icon';
import { CustomIcon } from 'lucide-react';

// 如果图标已注册
<AppIcon id="custom-icon" />

// 如果图标未注册，使用fallback
<AppIcon id="custom-icon" fallbackIcon={CustomIcon} />
```

### 不同尺寸和颜色

```typescript
// 不同尺寸
<AppIcon id="star" className="w-3 h-3" />
<AppIcon id="star" className="w-4 h-4" />
<AppIcon id="star" className="w-6 h-6" />
<AppIcon id="star" className="w-8 h-8" />

// 不同颜色
<AppIcon id="heart" className="text-red-500" />
<AppIcon id="star" className="text-yellow-500" />
<AppIcon id="check" className="text-green-500" />
```

## 优势

1. **通用性**: 不局限于特定功能，可在整个应用中使用
2. **简单**: 简单的键值对映射，易于理解和使用
3. **灵活**: 支持动态添加和移除图标
4. **类型安全**: 完整的TypeScript支持
5. **持久化**: 自动保存到localStorage
6. **性能**: 基于zustand的高性能状态管理
7. **可扩展**: 支持自定义图标和样式 