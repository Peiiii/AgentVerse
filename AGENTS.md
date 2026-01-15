# AGENTS

## Workflows

- Feature-Based 架构规范: `.agent/workflows/feature-based-architecture.md`
- 代码库治理指导思想与战略: `.agent/workflows/governance-strategy.md`

后续我们要有统一的规范和不断完善的机制。我们会不断维护 Agents.md。

## 迭代制度（docs/logs）

- 每个迭代在 `docs/logs` 下新增一个目录
- 目录内按版本号建立子目录，命名为 `v0.0.1-版本的slug`（语义化）
- 每个版本目录至少包含：
  - 迭代完成说明（改了什么）
  - 测试/验证/验收方式
  - 发布/部署方式
- 可选文档：PRD、讨论记录等

## 指令/Command 机制

- 新增指令统一记录在 `commands/commands.md`，并在此处索引
- 约定元指令：输入 `/new-command` 触发创建新指令流程
- 指令文件结构：每条指令包含名称、用途、输入格式、输出/期望行为
- 后续新增或修改指令时，更新 `commands/commands.md` 并保持此处索引最新
- 已有指令：
  - `/new-command`：创建新指令
  - `/config-meta`：调整或更新本文件（AGENTS.md）的机制/元信息
  - `/commit`：进行提交操作（提交信息需使用英文）

## 规则/Rule 机制

- 规则直接维护在本文件末尾的 **Rulebook** 区域
- 约定元指令：输入 `/new-rule` 触发创建新规则流程
- 规则条目包含：名称（英文 kebab-case）、约束/适用范围、示例/反例、执行方式（工具/流程）、维护责任人
- 后续新增或修改规则时，直接在本文件的 **Rulebook** 区域追加/更新

## Rulebook

- **post-dev-stage-validation**：每个开发阶段结束必须做验证，至少运行 `build`、`lint`、`tsc`（如确认为无关可有理由地省略），如条件允许应做基础冒烟测试。
- **no-self-commit-without-request**：除非用户明确要求，否则禁止擅自提交/推送代码。
