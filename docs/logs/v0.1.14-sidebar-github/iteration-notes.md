# v0.1.14-sidebar-github 迭代记录

## 改了什么

- 侧边栏新增 GitHub 入口，方便快速跳转项目仓库

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4185 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4185/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
