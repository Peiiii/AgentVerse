# Activity Bar Store

基于 Zustand 的 Activity Bar 状态管理解决方案。

## 概述

Activity Bar Store 提供了一个集中式的状态管理方案来管理活动栏的状态，包括：

- 活动项列表管理
- 当前激活项状态
- 展开/收起状态
- 持久化存储

## 文件结构

```
src/
├── stores/
│   └── activity-bar.store.ts      # Zustand store 定义
├── services/
│   └── activity-bar.service.ts    # 业务逻辑服务
└── components/
    └── layout/
        └── activity-bar.tsx       # 使用 store 的组件
```

## 核心概念

### ActivityItem 接口

```typescript
interface ActivityItem {
  id: string;                    // 唯一标识符
  icon?: React.ReactNode;        // 图标
  label: string;                 // 显示标签
  title?: string;                // 工具提示
  group?: string;                // 分组
  isActive?: boolean;            // 是否激活
  isDisabled?: boolean;          // 是否禁用
  onClick?: () => void;          // 点击回调
}
```

### Store 状态

```typescript
interface ActivityBarState {
  items: ActivityItem[];         // 活动项列表
  activeId: string;              // 当前激活项ID
  expanded: boolean;             // 是否展开
  
  // 操作方法
  addItem: (item: ActivityItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ActivityItem>) => void;
  setActiveId: (id: string) => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  reset: () => void;
}
```

## 使用方法

### 1. 在组件中使用 Store

```typescript
import { useActivityBarStore } from '@/stores/activity-bar.store';

function MyComponent() {
  const { items, activeId, expanded, setActiveId, setExpanded } = useActivityBarStore();
  
  return (
    <div>
      <p>当前激活: {activeId}</p>
      <p>展开状态: {expanded ? '展开' : '收起'}</p>
      <button onClick={() => setActiveId('chat')}>激活聊天</button>
      <button onClick={() => setExpanded(!expanded)}>切换展开</button>
    </div>
  );
}
```

### 2. 使用 Service

```typescript
import { useActivityBarService } from '@/services/activity-bar.service';

function MyComponent() {
  const { handleItemClick, addItem, removeItem } = useActivityBarService();
  
  const handleAddCustomItem = () => {
    addItem({
      id: 'custom-item',
      label: '自定义项',
      group: '主要功能',
    });
  };
  
  return (
    <div>
      <button onClick={() => handleItemClick('agents')}>打开智能体</button>
      <button onClick={handleAddCustomItem}>添加自定义项</button>
    </div>
  );
}
```

### 3. 使用选择器 Hooks

```typescript
import { useActivityItems, useActiveId, useExpanded } from '@/stores/activity-bar.store';

function MyComponent() {
  const items = useActivityItems();
  const activeId = useActiveId();
  const expanded = useExpanded();
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id} className={item.isActive ? 'active' : ''}>
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

### 4. 按组获取活动项

```typescript
import { useMainGroupItems, useFooterItems } from '@/stores/activity-bar.store';

function MyComponent() {
  const mainItems = useMainGroupItems();
  const footerItems = useFooterItems();
  
  return (
    <div>
      <div>主要功能: {mainItems.length} 项</div>
      <div>底部: {footerItems.length} 项</div>
    </div>
  );
}
```

## 默认配置

Store 初始化时包含以下默认活动项：

### 主要功能组
- `chat`: 聊天
- `agents`: 智能体

### Footer 组
- `settings`: 设置
- `github`: GitHub

## 持久化

Store 使用 Zustand 的 `persist` 中间件进行本地存储，数据会保存在 `localStorage` 中，键名为 `activity-bar-storage`。

## 注意事项

1. **避免重复订阅**: 不要在同一个组件中同时使用多个 store hooks，这可能导致性能问题
2. **状态更新**: 在 `setActiveId` 中，我们同时更新 `activeId` 和 `items` 中的 `isActive` 状态
3. **函数缓存**: 在 service 中使用 `useCallback` 来避免不必要的重新渲染

## 测试

可以使用 `src/examples/activity-bar-store-test.tsx` 来测试 store 的功能。

## 扩展

### 添加新的活动项

```typescript
const { addItem } = useActivityBarStore();

addItem({
  id: 'new-feature',
  label: '新功能',
  group: '主要功能',
  icon: <NewIcon />,
  onClick: () => {
    // 处理点击事件
  }
});
```

### 自定义分组

```typescript
// 添加自定义分组
addItem({
  id: 'custom-item',
  label: '自定义项',
  group: '自定义分组',
});

// 获取自定义分组
const customItems = useActivityItemsByGroup('自定义分组');
``` 