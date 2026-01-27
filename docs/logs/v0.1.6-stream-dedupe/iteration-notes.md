# v0.1.6-stream-dedupe 迭代记录

## 改了什么

- 流式回复接入“完整内容回传”兼容逻辑，避免重复片段被反复追加
- 连续重复的原始 delta 直接忽略，减少 UI 无意义刷屏

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4174 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4174/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
