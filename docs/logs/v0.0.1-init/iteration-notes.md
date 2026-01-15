# v0.0.1-init 迭代记录

## 改了什么

- 无功能变化
- 新增治理战略文档：`.agent/workflows/governance-strategy.md`
- 新增并维护 `AGENTS.md` 索引（含迭代制度说明）
- 新增特征结构度量脚本：`scripts/metrics/feature-structure.cjs`
- 增加运行命令：`package.json` 的 `metrics:features`
- 改进特征结构输出为更紧凑的纯文本表格
- 新增代码行数 Top N 工具：`scripts/metrics/top-loc.cjs` 与命令 `metrics:loc`
- 特征结构报告增加 Tree 视图（common / desktop / mobile 分支）
- 删除冗余功能模块：`src/common/features/mcp`、`src/common/features/examples`、`src/common/features/github`、`src/desktop/features/mcp`
- 删除冗余功能模块：`src/desktop/features/portal-demo`
- 简化设置模块：固定 schema（`settings-schema.ts`），去掉动态注册/删除，设置读写收口到本地存储并直接驱动 AI 配置与语言切换
- 默认设置读取 `.env` 中的 AI 提供商配置（包括 API Key），避免空 Key 导致 401

## 测试/验证/验收

- `pnpm metrics:features` 能输出结构化报告
- `pnpm metrics:loc` 能输出代码行数 Top N
- 人工检查文档路径与索引可读性

## 发布/部署

- 无需发布/部署
