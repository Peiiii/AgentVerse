# v0.1.11-mention-self-guard 迭代记录

## 改了什么

- @mention 选择逻辑增加“排除自身”规则，避免 AI 在回复中引用自己的 @ 导致自我触发循环
- 提升 mention 解析的稳定性：自提及不会再被当作下一发言人

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm exec tsc -b`
- `pnpm build`（CSS minify warning 与包体积提示）
- 冒烟测试（非仓库目录）：
  - `python3 -m http.server 4179 --directory /Users/peiwang/Projects/AgentVerse/dist & sleep 1; curl -I http://127.0.0.1:4179/ | head -n 1; kill $!`
  - 观察点：HTTP 200

## 发布/部署

- 无（不涉及线上发布/部署）
