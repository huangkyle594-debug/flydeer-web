# flydeer-web 前端项目实现计划

## Context

仓库当前为空（仅有 doc/ 文档、README、LICENSE、.gitignore，无任何代码）。需从零搭建 www.fly-deer.com 的门户前端：首页 `/`、账户管理 `/user`、支持文档 `/doc`，对接已有后端用户服务（见 [doc/refer/flydeer-user-api.md](doc/refer/flydeer-user-api.md)）。支持手机验证码 + Gitee/GitHub OAuth 登录、JWT 双 token 自动刷新、代理授权管理。`/struct-mind` 等页面由其他项目开发，经 nginx 按路径分发。

**已确认的技术决策**（用户已选）：
- Vite + React + **TypeScript**
- UI：**Ant Design 5 + Tailwind CSS v4 混合** — AntD 提供表单/弹窗/消息等功能组件，Tailwind 负责布局，主题参考 struct-mind 的深色 + 鹭羽青 token（[doc/refer/struct-mind-ui-design.md](doc/refer/struct-mind-ui-design.md) 5.2 节）
- react-router v7、axios、react-markdown
- 认证态：React Context + localStorage 存 accessToken，不跟踪过期时间，依赖 401→刷新流程

## 目录结构

```
flydeer-web/
├── index.html                 # lang=zh-CN、favicon=/logo.png
├── vite.config.ts             # react + @tailwindcss/vite、@别名、/api 代理→8080（不 rewrite！）
├── public/logo.png            # 从 doc/assets/logo.png 复制
└── src/
    ├── main.tsx               # 首行 import '@ant-design/v5-patch-for-react-19'
    ├── App.tsx                # StyleProvider(layer) > ConfigProvider(dark,zhCN) > AntdApp > AuthProvider > Router
    ├── router.tsx
    ├── styles/global.css      # @layer 声明 + tailwind + @theme token
    ├── theme/antdTheme.ts     # darkAlgorithm + 鹭羽青 token 映射
    ├── types/api.ts           # ApiResult/JwtTokenVO/UserProfileVO/DelegateVO/枚举
    ├── lib/
    │   ├── tokenStore.ts      # accessToken 唯一真源（localStorage+内存+订阅）
    │   ├── apiError.ts        # ApiError 归一化、code→兜底文案、showError
    │   ├── message.ts         # 注册式 message/modal（供非组件模块用）
    │   └── http.ts            # axios 实例、拦截器、single-flight 刷新
    ├── api/                   # auth.ts / user.ts / delegate.ts（14 个端点）
    ├── auth/
    │   ├── AuthContext.tsx    # AuthProvider + useAuth，内挂 LoginModal
    │   ├── LoginModal.tsx     # 短信登录 + OAuth 按钮 + 协议勾选
    │   └── useSmsCountdown.ts # 60s 倒计时（登录/绑手机复用）
    ├── components/            # PageLayout / SiteHeader / SiteFooter
    ├── pages/
    │   ├── home/HomePage.tsx
    │   ├── user/              # UserPage(守卫) / ProfileCard / EditNameModal / BindPhoneModal
    │   │   └── delegate/      # DelegatePanel / DelegateTable / CreateDelegateModal
    │   ├── doc/               # docs.ts 注册表 / DocListPage / DocDetailPage
    │   └── oauth/OauthCallbackPage.tsx
    └── docs/                  # user-agreement.md / terms-of-service.md / contact.md / complaint.md
```

路由：`/`、`/user`、`/doc`、`/doc/:slug`、`/oauth/callback`（独立页不套布局）、`*` 404。

## 依赖

- 运行时：react@19、antd@^5（≥5.17，需 StyleProvider layer）、**@ant-design/v5-patch-for-react-19**、@ant-design/icons、react-router@^7、axios、react-markdown、remark-gfm、dayjs
- 开发：vite@^7（需 Node ≥20.19，动手前先 `node --version` 确认）、@vitejs/plugin-react、typescript、tailwindcss@^4 + @tailwindcss/vite
- 不引入状态库（Context 足够）

## 关键设计

### 1. 样式共存（坑点前置）
global.css 首行 `@layer theme, base, antd, components, utilities;` + `<StyleProvider layer>`，使 antd 样式进 `@layer antd`，Tailwind utilities 可覆盖 antd。@theme 定义 struct-mind 的 13 个色 token（surface-0~3 / line / fg / accent / danger 等）。antdTheme：darkAlgorithm + colorPrimary `#0891b2`、colorBgBase `#0b1014`、colorError `#f87171` 等映射。

### 2. http.ts — 拦截器与单飞刷新
- 请求拦截：有 token 则加 `Authorization: Bearer`
- 响应 2xx 但 `code!==0` → reject ApiError
- **401(31010) 或 30010** 且非 `_retry`、且 url 不以 `/api/v1/auth/` 开头 → `ensureRefreshed()` 单飞刷新（模块级 `refreshPromise ??=` 用裸 axios POST `/api/v1/auth/refresh`，并发 401 共享同一 promise）→ 成功重放原请求；失败 `tokenStore.clear()` + 节流弹一次"登录已过期"，**不跳转**
- 路径必须写全 `/api/v1/...`，vite 代理不 rewrite —— refresh cookie `Path=/api/v1/auth` 依赖路径原样

### 3. AuthContext
`status: initializing | anonymous | authenticated`；接口：`openLogin / loginBySms / loginByOauth / completeOauth / logout / refreshProfile / applyNewToken`。
- bootstrap：有 token → `getMe`(silent，过期由拦截器自动刷新) → 成功 authenticated / 失败 anonymous；无 token 直接 anonymous
- 订阅 tokenStore：token 被拦截器清空 → 自动退化 anonymous（UI 原地降级，不跳转）
- loginByOauth：先存 returnTo 到 sessionStorage → GET authorize → `location.href` 跳转

### 4. LoginModal
手机号(`^1\d{10}$`) + 验证码 + 60s 倒计时按钮 + 分割线 + Gitee/GitHub 按钮 + 协议 Checkbox（默认不勾，链接 `/doc/user-agreement`、`/doc/terms-of-service`）。三个登录入口共用协议校验，未勾选 → warning 不放行。错误处理：30070 字段错误、91010 触发倒计时、91020 登录按钮禁用 10s。

### 5. OauthCallbackPage
取 `?accessToken` → ref 防 StrictMode 双执行 → 存 token → **立即 replaceState 清 query** → 拉资料 → navigate(returnTo)。无 token / 拉资料失败 → Result 错误页 + 返回首页链接。

### 6. UserPage 守卫
不做路由守卫：initializing → Spin；anonymous → 提示卡片（"登录后可管理账户" + 登录按钮，**不跳转**）；authenticated → ProfileCard + DelegatePanel。

### 7. 账户功能
- ProfileCard：userId（copyable，供代理互换）、昵称+编辑、渠道 Tag、实名 Tag、脱敏手机号
- EditNameModal：maxLength 20，成功后更新 context
- BindPhoneModal：**仅 `channel!=='PHONE' && !verified` 显示入口**（PHONE 渠道前端关门，后端发码不拦）；成功返回 JwtTokenVO → **先 applyNewToken 替换 token**（新 token verified=true）→ 再 refreshProfile

### 8. 代理授权（业务最复杂处）
DelegatePanel 双 Tab + 状态多选筛选 + 发起按钮。操作矩阵：

| 视角 | 状态 | 操作 |
|---|---|---|
| DELEGATOR（我是代理人，对方=delegatedId） | PENDING/ACCEPTED | 撤销 revoke(relation:DELEGATOR) |
| DELEGATOR | REVOKE | 重新发起 create |
| DELEGATED（我是被代理人，对方=delegatorId） | PENDING | 接受 accept(operateId=**发起方** delegatorId) / 拒绝 revoke(relation:DELEGATED) |
| DELEGATED | ACCEPTED | 撤销 revoke(relation:DELEGATED) |

CreateDelegateModal：输入对方 userId，本地拦截 `operateId===自己`（41010 兜底）。`51020`（并发状态变化）→ 提示 + 自动重拉。注意枚举是 **`REVOKE`** 不是 REVOKED。

### 9. 文档模块
4 篇示例 md（用户协议/服务条款/联系方式/投诉渠道）经 Vite `?raw` 静态导入，docs.ts 注册表 slug→title→content。列表页卡片 + 详情页 react-markdown+remarkGfm，手写深色 prose 样式。页脚与登录弹窗协议链接指向这些路由。

### 10. 首页与布局
Header：logo + 导航(首页/文档) + 登录按钮 / 用户 Dropdown(账户管理、退出)。HomePage：hero 介绍 + 项目卡片区（struct-mind 用普通 `<a href="/struct-mind">` 整页跳转 + 敬请期待占位卡）。Footer：文档链接 + ICP/公安备案**占位**（链接 beian.miit.gov.cn / beian.gov.cn，文案 XXXX 占位由用户后改）+ 版权。

### 11. 错误码策略
拦截器统一归一为 `ApiError{code,message,httpStatus}`；业务 HTTP 500（51xxx/61xxx）优先展示 body.message 不当崩溃；拦截器仅负责"登录过期"单次提示；组件层分级：30070 字段错、91010/91020 频控禁用、40000 用兜底文案、999999/网络 → 通用文案；bootstrap 等 silent 请求抑制提示。

## 实现步骤

1. **脚手架**：确认 Node ≥20.19 → `npm create vite@latest .`（react-ts）→ 装依赖 → vite.config（插件/别名/代理）→ 复制 logo → index.html
2. **主题基座**：global.css layer+token、antdTheme、App.tsx 装配、lib/message.ts —— 验证 Tailwind 类能覆盖 antd
3. **HTTP 层**：types、tokenStore、apiError、http.ts、api/ 三模块
4. **认证**：AuthContext、useSmsCountdown、LoginModal、OauthCallbackPage、Header 登录区
5. **路由布局**：router、PageLayout、Footer、404
6. **首页**
7. **账户页**：守卫、ProfileCard、改名、绑手机
8. **代理管理**：Panel/Table/CreateModal 操作矩阵
9. **文档**：4 篇 md + 列表/详情页
10. **收尾**：`npx tsc -b && npm run build` 零错、窄屏适配走查、README 启动说明

## 验证方式

- `npm run dev` 起服务（代理 → localhost:8080 后端），浏览器走查：
  - 未登录浏览三页无报错、无跳转，仅 /user 显示提示卡片
  - 短信登录全流程（倒计时、错误码、协议未勾选拦截）、OAuth 跳转回调、刷新页面保持登录、登出
  - 改名、OAuth 账号绑手机（token 替换后 verified 翻转）、代理矩阵逐格操作
  - 手动删 refresh cookie 再调接口：观察单次"登录已过期"提示 + UI 原地退化
- `npm run build` 构建通过

## 关键坑点备忘

1. vite 代理**不 rewrite**、API 路径写全 —— refresh cookie Path=/api/v1/auth
2. 前端回调路由 `/oauth/callback` 须与后端 `AUTH_FRONTEND_REDIRECT` 配置逐字符一致（联调时提醒用户核对后端配置）
3. StrictMode 双执行：回调页/bootstrap 用 ref 幂等
4. refresh 接口自身 401 绝不再触发刷新（白名单 + _retry 双保险）
5. 登出必须调后端 `/logout` 清 HttpOnly cookie，仅删 localStorage 不干净
