# YYYY-MM-DD <Title>

## 背景 / 问题

- 为什么要做（用户痛点/动机/现状问题）

## 规则（可选）

- 规划类文档不要写具体工期，只写里程碑顺序与验收标准
- 规划类文档文件名建议以 `.plan.md` 结尾，便于区分“规划”与“实现日志”

## 决策

- 做什么、不做什么（关键取舍）

## 变更内容

- 用户可见变化（CLI 行为/输出/默认值等）
- 关键实现点（指向 core/cli 的关键模块即可）

## 验证（怎么确认符合预期）

保持轻量：3～6 条命令 + 明确的“验收点”。

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm typecheck

# smoke-check（按需补充）
pnpm -s cli --help
```

验收点：

- 写清楚“看到什么输出/行为才算对”

## 发布 / 部署

如果这次变更会影响 npm 包或线上环境，需要写清楚如何发布。

```bash
# 1) 写 changeset（选择受影响的 packages）
pnpm changeset

# 2) 本地验证
pnpm release:check
pnpm release:dry

# 3) 版本号 & changelog
pnpm release:version

# 4) 发布到 npm（需要 NPM_TOKEN 或已登录）
pnpm release
```

备注：

- 需要更详细的发布说明时，引用 `docs/workflows/npm-release-process.md`，不要在每篇日志里重复一遍。

## 影响范围 / 风险

- Breaking change?（是/否）
- 回滚方式（如果需要）
