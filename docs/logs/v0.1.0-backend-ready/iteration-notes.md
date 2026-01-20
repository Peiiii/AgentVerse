# v0.1.0-backend-ready 迭代记录

## 改了什么

- 收口存储入口：新增 StorageHub，在 `src/core/services/data-providers.ts` 统一创建 data providers 与 settings store
- Settings 存储改为依赖 settings store，便于后续后端适配
- 维持 Mock 作为默认后端，HTTP adapter 仍为 stub
- 移除 `core/resources` 层：新增各域 store（agents/discussions/messages/members/settings），改由 manager 读写 store
- hooks/组件改为读取 store，讨论能力与设置应用逻辑迁到服务/manager，避免资源层依赖

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm tsc --noEmit`
- `pnpm build`（CSS minify warning 与包体积提示）

## 发布/部署

- 本迭代无需发布/部署（架构收口与准备）
