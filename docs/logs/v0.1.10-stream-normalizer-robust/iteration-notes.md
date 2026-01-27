# v0.1.10-stream-normalizer-robust 迭代记录

## 改了什么

- 流式增量归一化支持“模式切换 + 重叠片段”处理，避免中途语义变化造成无限重复
- 统一在 adapter 层处理增量输出，让上层消息渲染保持纯追加语义

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4178 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4178/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
