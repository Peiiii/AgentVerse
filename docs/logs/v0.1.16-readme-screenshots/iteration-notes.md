# v0.1.16-readme-screenshots 迭代记录

## 改了什么

- 在 README 增补多张产品截图（非 demo1/demo2），丰富展示内容

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm run build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4191 --directory /Users/peiwang/Projects/AgentVerse/dist > /tmp/agentverse-smoke-4191.log 2>&1 & server_pid=$!; sleep 1; curl -I http://127.0.0.1:4191/ | head -n 1; kill $server_pid`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
