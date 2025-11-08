# Chat 和 Discussion Feature 组织架构

## 概述

`src/common/features/` 下的 `chat` 和 `discussion` 是两个核心功能模块，它们遵循功能优先的组织原则，按业务功能而非技术层次进行组织。

## 目录结构对比

### Chat Feature (`src/common/features/chat/`)

```
chat/
├── components/                    # 聊天相关组件
│   ├── agent-action-display/     # Agent 动作显示
│   │   ├── components/           # 子组件
│   │   │   ├── action-display.tsx
│   │   │   ├── action-user-select.tsx
│   │   │   ├── default-action.tsx
│   │   │   ├── select-display.tsx
│   │   │   ├── select-option.tsx
│   │   │   └── status-icon.tsx
│   │   ├── index.tsx
│   │   └── types.ts
│   ├── agent-chat/               # Agent 聊天核心组件
│   │   ├── agent-chat-container.tsx    # 容器组件
│   │   ├── agent-chat-header.tsx       # 头部
│   │   ├── agent-chat-header-with-info.tsx
│   │   ├── agent-chat-input.tsx        # 输入组件
│   │   ├── agent-chat-messages.tsx     # 消息列表
│   │   ├── agent-chat-provider-wrapper.tsx
│   │   ├── tool-call-renderer.tsx
│   │   ├── index.ts                    # 导出文件
│   │   └── README.md
│   ├── markdown/                 # Markdown 渲染
│   │   ├── plugins/              # 插件
│   │   │   ├── remark-action.ts
│   │   │   └── remark-mdast-to-hast.ts
│   │   ├── types/                # 类型定义
│   │   │   ├── action.ts
│   │   │   ├── index.ts
│   │   │   └── remark.ts
│   │   ├── index.tsx
│   │   └── types.ts
│   ├── message/                  # 消息相关组件
│   │   ├── message-capture.tsx
│   │   ├── message-item.tsx
│   │   ├── message-item-wechat.tsx
│   │   ├── message-list.tsx
│   │   ├── message-list-desktop.tsx
│   │   ├── message-list-mobile.tsx
│   │   ├── message-preview-dialog.tsx
│   │   └── index.tsx
│   ├── suggestions/              # 建议功能
│   │   ├── suggestions-provider.tsx
│   │   ├── suggestion.types.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── chat-area.tsx             # 聊天区域主组件
│   ├── chat-empty-guide.tsx      # 空状态引导
│   ├── chat-welcome-header.tsx  # 欢迎头部
│   ├── mention-suggestions.tsx   # @ 提及建议
│   ├── message-input.tsx         # 消息输入（通用）
│   ├── message-input-desktop.tsx # 桌面端输入
│   ├── message-input-mobile.tsx  # 移动端输入
│   ├── modern-chat-input.tsx    # 现代风格输入
│   └── index.ts                  # 统一导出
└── pages/
    └── chat-page.tsx             # 聊天页面
```

### Discussion Feature (`src/common/features/discussion/`)

```
discussion/
└── components/
    ├── control/                  # 讨论控制
    │   ├── discussion-controller.tsx    # 主控制器
    │   ├── clear-messages-button.tsx     # 清空消息按钮
    │   └── use-discussion-control.ts    # 控制逻辑 Hook
    ├── list/                     # 讨论列表
    │   ├── discussion-list.tsx          # 列表主组件
    │   ├── discussion-item.tsx          # 列表项
    │   ├── discussion-list-header.tsx   # 列表头部
    │   ├── discussion-avatar.tsx        # 讨论头像
    │   ├── index.ts                     # 导出文件
    │   └── types.ts                     # 类型定义
    ├── member/                   # 成员管理
    │   ├── member-list.tsx              # 成员列表
    │   ├── member-item.tsx              # 成员项
    │   ├── member-skeleton.tsx          # 骨架屏
    │   ├── member-toggle-button.tsx     # 切换按钮
    │   ├── add-member-dialog.tsx        # 添加成员对话框
    │   ├── quick-member-selector.tsx    # 快速选择器
    │   ├── mobile-member-drawer.tsx     # 移动端抽屉
    │   └── mobile-member-list.tsx       # 移动端列表
    ├── mobile/                   # 移动端组件
    │   ├── mobile-header.tsx            # 移动端头部
    │   └── mobile-action-sheet.tsx      # 操作面板
    └── settings/                 # 设置面板
        ├── discussion-settings-panel.tsx    # 设置面板主组件
        ├── discussion-settings-button.tsx   # 设置按钮
        ├── setting-item.tsx                # 设置项
        ├── setting-switch.tsx              # 开关组件
        ├── setting-slider.tsx              # 滑块组件
        └── setting-select.tsx              # 选择组件
```

## 组织原则分析

### 1. 功能优先原则

两个 feature 都遵循**功能优先**的组织方式：

- **Chat**: 按功能模块组织（agent-chat、message、markdown、suggestions）
- **Discussion**: 按功能模块组织（control、list、member、settings、mobile）

### 2. 组件层级结构

#### Chat Feature
- **顶层组件**: `chat-area.tsx` - 聊天区域主组件
- **核心模块**: `agent-chat/` - Agent 聊天核心功能
- **功能模块**: 
  - `message/` - 消息显示
  - `markdown/` - Markdown 渲染
  - `suggestions/` - 建议功能
  - `agent-action-display/` - 动作显示

#### Discussion Feature
- **功能模块**:
  - `control/` - 讨论控制（开始/暂停/清空）
  - `list/` - 讨论列表（列表、项、头部）
  - `member/` - 成员管理（列表、添加、选择）
  - `settings/` - 设置面板
  - `mobile/` - 移动端适配

### 3. 导出策略

#### Chat Feature
- `components/index.ts`: 统一导出核心组件
  ```typescript
  export { AgentChatContainer, AgentChatHeader, AgentChatMessages, AgentChatInput } from "./agent-chat";
  ```
- `agent-chat/index.ts`: 模块内部导出
- `message/index.tsx`: 消息组件导出

#### Discussion Feature
- `list/index.ts`: 列表相关组件导出
  ```typescript
  export { DiscussionList } from "./discussion-list";
  export { DiscussionItem } from "./discussion-item";
  export { DiscussionListHeader } from "./discussion-list-header";
  export { DiscussionAvatar } from "./discussion-avatar";
  export type { DiscussionItemProps } from "./types";
  ```

### 4. 平台分离

- **Chat**: 通过文件名区分（`message-input-desktop.tsx` vs `message-input-mobile.tsx`）
- **Discussion**: 通过 `mobile/` 目录分离移动端组件

### 5. 类型定义

- **Chat**: 
  - 模块内类型：`agent-action-display/types.ts`、`markdown/types.ts`
  - 统一类型：`common/types/chat.ts`
- **Discussion**:
  - 模块内类型：`list/types.ts`
  - 统一类型：`common/types/discussion.ts`、`common/types/discussion-member.ts`

## 关键差异

### Chat Feature 特点
1. **更复杂的组件层级**: 有嵌套的子组件目录（如 `agent-action-display/components/`）
2. **更多功能模块**: 包含 markdown、suggestions、agent-action 等多个功能模块
3. **页面组件**: 有独立的 `pages/chat-page.tsx`
4. **插件系统**: `markdown/plugins/` 支持插件扩展

### Discussion Feature 特点
1. **更扁平的结构**: 组件目录相对扁平，没有深层嵌套
2. **功能明确**: 每个目录对应一个明确的功能（控制、列表、成员、设置）
3. **移动端分离**: 有专门的 `mobile/` 目录
4. **无页面组件**: 组件被其他页面使用，不包含页面组件

## 使用关系

### Chat 使用 Discussion
- `chat-page.tsx` 使用 `DiscussionController`、`DiscussionList`、`MemberList`
- Chat 功能依赖于 Discussion 的讨论管理功能

### Discussion 独立
- Discussion 组件是独立的，可以被多个页面使用
- 不依赖 Chat 组件

## 改进建议

### 1. 统一导出策略
- Discussion 可以添加 `components/index.ts` 统一导出
- 各子模块保持自己的 `index.ts` 导出

### 2. 类型定义位置
- 建议将模块内类型统一到 `common/types/` 或模块根目录的 `types.ts`
- 保持类型定义的一致性

### 3. 文档完善
- Chat 的 `agent-chat/README.md` 是好的实践
- Discussion 可以添加类似的 README 文档

### 4. 组件拆分
- 确保单个组件文件不超过 250 行
- 大组件及时拆分为子组件

## 总结

两个 feature 都遵循了**功能优先**的组织原则，按业务功能而非技术层次组织代码。Chat 更复杂，包含更多功能模块和嵌套结构；Discussion 更扁平，功能划分更清晰。两者都很好地实现了平台分离和模块化设计。

