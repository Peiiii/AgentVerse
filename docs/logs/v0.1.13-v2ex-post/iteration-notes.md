# v0.1.13-v2ex-post 迭代记录

## 改了什么

- 新增 V2EX 发帖草稿，便于对外宣传与收集反馈
- 补充“不同思维方式碰撞”的项目亮点描述
- 补充内置角色与组合示例，突出多样化群聊场景

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4183 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4183/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
