# v0.1.17-dashscope-models 迭代记录

## 改了什么

- DashScope 模型列表新增 `qwen3-max-thinking` 与 `glm-4.7`

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm run build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4193 --directory /Users/peiwang/Projects/AgentVerse/dist > /tmp/agentverse-smoke-4193.log 2>&1 & server_pid=$!; sleep 1; curl -I http://127.0.0.1:4193/ | head -n 1; kill $server_pid`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
