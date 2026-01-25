# v0.1.3-auth-optional 迭代记录

## 改了什么

- 登录改为可选：未登录也可直接使用核心功能
- AuthGate 不再拦截主流程，仅负责渲染认证相关页面

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm tsc`
- `pnpm build`
- `pnpm deploy:pages`
- 冒烟测试（非仓库目录）：`node -e "const https=require('https');https.get('https://agentverse.pages.dev',res=>{console.log(res.statusCode);console.log(res.headers['content-type']||'');res.resume();}).on('error',err=>{console.error(err.message);process.exit(1);});"`（返回 200）

## 发布/部署

- Cloudflare Pages：`pnpm deploy:pages`
