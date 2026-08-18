# flydeer-web

飞天小鹭（fly-deer.com）门户前端：首页、账户管理、支持文档。

## 技术栈

- Vite + React 19 + TypeScript
- Ant Design 5（深色主题）+ Tailwind CSS v4
- react-router v8、axios、react-markdown

## 页面

| 路由 | 说明 |
|---|---|
| `/` | 首页：网站介绍、各项目入口 |
| `/user` | 账户管理：资料、改昵称、绑手机实名、代理授权管理（需登录，未登录仅提示） |
| `/doc` `/doc/:slug` | 支持文档：用户协议、服务条款、联系方式、投诉渠道 |
| `/oauth/callback` | OAuth 登录回调落地页（需与后端 `AUTH_FRONTEND_REDIRECT` 配置一致） |

`/struct-mind` 等页面由其他项目提供，生产环境经 nginx 按路径分发。

## 开发

要求 Node ≥ 20.19。

```bash
npm install
npm run dev     # 开发服务，/api 代理到 http://localhost:8080（后端用户服务）
npm run build   # 类型检查 + 生产构建（输出 dist/）
```

## 认证机制

- accessToken 存 localStorage，请求经 axios 拦截器自动附加 Bearer
- refreshToken 由后端写 HttpOnly Cookie（`Path=/api/v1/auth`），401 时拦截器单飞刷新并重放请求；刷新失败清登录态、仅提示不跳转
- 登录方式：手机验证码、Gitee / GitHub OAuth（登录前需勾选用户协议）

## 部署注意

- nginx 需将 `/`、`/user`、`/doc/*`、`/oauth/callback` 回落到本项目 `index.html`，`/api` 反代后端
- 代理配置勿改写 `/api` 路径（refresh cookie 的 Path 依赖原样路径）
- 页脚备案号在 `src/components/SiteFooter.tsx` 维护
