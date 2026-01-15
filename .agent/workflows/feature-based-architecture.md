---
description: Feature-Based 架构规范，用于 AI 开发时复用
---

# Feature-Based 架构规范

## 核心原则

按**业务功能**而非技术类型组织代码。每个 feature 目录包含该功能所需的全部代码。

## 目录结构

```
src/
├── common/                    # 跨平台共享代码
│   └── features/
│       └── [feature-name]/    # 功能模块
│           ├── components/    # UI 组件
│           ├── hooks/         # React Hooks
│           ├── stores/        # 状态管理
│           ├── services/      # 业务逻辑/API
│           ├── types/         # TypeScript 类型
│           ├── utils/         # 工具函数
│           ├── managers/      # 管理器类
│           ├── extensions/    # 扩展/插件
│           └── index.ts       # 公开导出
│
├── desktop/                   # 桌面端特有代码
│   └── features/
│       └── [feature-name]/
│           ├── pages/         # 页面组件
│           └── ...            # 同上子目录
│
├── mobile/                    # 移动端特有代码
│   └── features/
│       └── ...
│
└── core/                      # 核心基础设施（非 feature）
```

## 规则

1. **Feature 内高内聚** - 一个功能的所有代码放在同一目录下
2. **Feature 间低耦合** - 通过 `index.ts` 暴露公共 API，禁止直接引用内部文件
3. **平台代码分离** - `common` 放共享代码，`desktop`/`mobile` 放平台特有代码
4. **子目录按需创建** - 不强制所有子目录都存在，按实际需要添加
5. **命名规范** - feature 名使用 kebab-case（如 `file-manager`）

## 示例

```
src/common/features/
├── chat/
│   ├── components/
│   │   ├── chat-input.tsx
│   │   ├── message-list.tsx
│   │   └── message-item.tsx
│   ├── stores/
│   │   └── chat-store.ts
│   └── index.ts
│
├── agents/
│   ├── components/
│   └── extensions/
│
└── settings/
    └── components/
```
