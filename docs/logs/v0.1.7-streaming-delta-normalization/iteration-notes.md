# v0.1.7-streaming-delta-normalization 迭代记录

## 改了什么

- 统一流式文本事件语义：兼容“返回完整内容”的流，转换为真实 delta 再交给上层追加
- 让聊天流式渲染只处理增量片段，根因层面杜绝重复内容被反复拼接

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4175 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4175/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
