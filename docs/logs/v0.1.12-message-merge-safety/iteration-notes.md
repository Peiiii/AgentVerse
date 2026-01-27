# v0.1.12-message-merge-safety 迭代记录

## 改了什么

- 修复消息合并时对 segments 的原地修改，避免渲染层重复叠加文本
- 合并逻辑改为深拷贝 segments，防止重复渲染造成“无限追加”错觉

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4180 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4180/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
