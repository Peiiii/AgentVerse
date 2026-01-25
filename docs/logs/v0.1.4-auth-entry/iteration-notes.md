# v0.1.4-auth-entry 迭代记录

## 改了什么

- 活动栏左下角新增“登录 / 注册”入口（未登录时展示）
- 点击入口跳转登录页并携带当前页面回跳参数

## 测试/验证/验收

- `pnpm lint`（存在既有 warnings，未阻塞）
- `pnpm tsc`
- `pnpm build`
- `pnpm deploy:pages`
- 冒烟测试（非仓库目录）：`node -e "const https=require('https');https.get('https://agentverse.pages.dev',res=>{console.log(res.statusCode);console.log(res.headers['content-type']||'');res.resume();}).on('error',err=>{console.error(err.message);process.exit(1);});"`（返回 200）

## 发布/部署

- Cloudflare Pages：`pnpm deploy:pages`
