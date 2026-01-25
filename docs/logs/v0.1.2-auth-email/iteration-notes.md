# v0.1.2-auth-email 迭代记录

## 改了什么

- 新增邮箱注册/登录/验证/重置密码完整闭环
- 前端增加登录、验证、忘记密码、重置密码页面
- 全局 AuthGate：未登录时强制跳转登录页
- 新增 Cloudflare Pages Functions + D1 存储会话与令牌
- 接入 Resend 发送验证与重置邮件
- 邮件链接域名支持多域名白名单

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm tsc`
- `pnpm build`（CSS minify warning 与包体积提示）
- `pnpm deploy:pages`（包含 Functions 构建）
- 冒烟测试（非仓库目录）：`node -e "const https=require('https');https.get('https://agentverse.pages.dev',res=>{console.log(res.statusCode);console.log(res.headers['content-type']||'');res.resume();}).on('error',err=>{console.error(err.message);process.exit(1);});"`（返回 200）

## 发布/部署

- Cloudflare Pages：`pnpm deploy:pages`
- 访问地址：`https://agentverse.pages.dev`（生产域名），`https://344acf43.agentverse.pages.dev`（本次部署）
- D1：`agentverse-auth`（已创建并应用迁移）
- Resend：Pages Secret 已写入 `RESEND_API_KEY`（不落库）
- 发件域名：`bibo.bot`（需在 Resend 完成 DNS 验证）
- 邮件链接域名白名单：`https://agent.dimstack.com`、`https://bibo.bot`、`https://agentverse.pages.dev`
