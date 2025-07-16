# 世界级聊天界面与 HTML 预览能力分步实现计划

## 目标
- 聊天消息代码块支持拓展自定义按钮/能力（如 HTML 预览）
- 聊天主容器支持“HTML 预览”模式，点击后界面左右分栏，左为对话，右为预览，带丝滑动画
- 架构极简、可插拔、可维护

## 步骤

1. **重构 CodeBlockHeader/Container**  
   - 增加 `actions` 或 `renderExtra` props，允许插入自定义按钮。
   - 默认复制按钮也通过 actions 实现，未来可插拔更多能力。

2. **定义预览能力的 context/props**  
   - 设计 PreviewContext 或通过 props 传递 onPreviewHtml 回调。
   - CodeBlockHeader 检测到 language 为 html 时，显示“预览”按钮，点击后调用回调。

3. **主容器支持分栏与动画**  
   - 增加 previewHtml state。
   - 分栏布局，左为原聊天，右为 HTML 预览，支持关闭预览。
   - 用 CSS transition 或动画库实现丝滑切换。

4. **all-in-one-agent-page.tsx 注入预览能力**  
   - 通过 props/context，将 onPreviewHtml 传递到 Markdown/CodeBlockHeader。

5. **只在 html 代码块显示“预览”按钮，点击后右侧显示预览，支持关闭。**

6. **丝滑动画切换，体验极致。**

---

如有特殊动画风格或交互细节偏好，请补充说明，否则采用现代极简风格（如 fade/slide + flex 动画）。 