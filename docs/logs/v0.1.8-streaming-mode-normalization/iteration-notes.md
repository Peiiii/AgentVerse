# v0.1.8-streaming-mode-normalization 迭代记录

## 改了什么

- 流式输出增加“模式识别”：自动区分全量流与增量流，避免误判导致内容被吞
- delta 规范化更保守，确保增量流不会被错误去重而出现空回复

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4176 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4176/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
