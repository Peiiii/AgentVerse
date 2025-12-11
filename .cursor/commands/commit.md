# Git提交规则

## 核心原则

- **禁止擅自提交**: 只有用户明确要求才能commit
- **英文message**: 使用英文commit message
- **默认git add .**: 自动添加所有更改

## 前端项目要求

- **构建验证**:如果commit 后跟build，则commit前必须先运行 `pnpm build` 验证构建成功

## 提交流程

1. 用户明确要求commit
2. 如果commit 后跟build，则运行 `pnpm build` 验证构建
3. 执行 `git add .`
4. 生成英文commit message
5. 执行 `git commit -m "message"`
