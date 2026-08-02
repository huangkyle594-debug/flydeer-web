# 12-用户服务-api

> 面向前端 / 前端 AI 联调的接口说明。覆盖 `AuthController`、`UserController`、`DelegateController`。  
> **暂不包含错误码清单**（尚未定稿）。HTTP 状态与统一响应结构见本文「约定」一节。

**Base URL（本地默认）**：`http://localhost:8080`
**线上域名 **：`www.fly-deer.com`

---

## 1. 约定

### 1.1 统一响应信封

除 OAuth Callback（302 跳转）外，均返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | int | `0` 表示成功；非 0 为业务/错误码（细节后续补充） |
| `message` | string | 提示文案 |
| `data` | object / array / null | 成功时的载荷；无数据时可为 `null` |

### 1.2 认证方式

| 凭证 | 传递方式 | 用途 |
|---|---|---|
| Access Token | 请求头 `Authorization: Bearer <accessToken>` | 访问需登录接口 |
| Refresh Token | Cookie（默认名 `refresh_token`，Path=`/api/v1/auth`，HttpOnly，SameSite=Lax） | 仅刷新 / 登出相关；登录与 OAuth 回调由服务端 `Set-Cookie` |

Controller 通过参数注解 `@AuthCheck` 解析身份：

| 接口类型 | 典型要求 |
|---|---|
| 认证类（发码、登录、OAuth、刷新） | 匿名可访问（可不带 Token） |
| 用户 / 委托类 | 必须已登录（`AUTHENTICATED`） |

未登录访问受保护接口时，通常返回 **HTTP 401**。需要「已校验」而 Token 未 verified 时为 **HTTP 403**（`NEED_VERIFY`）。改昵称接口要求已实名（`verified=true`）。

### 1.3 通用枚举

**LoginChannelEnum**

| 值 | 说明 |
|---|---|
| `PHONE` | 手机号 |
| `GITEE` | Gitee |
| `GITHUB` | GitHub |

**DelegateRelationEnum**

| 值 | 含义 |
|---|---|
| `DELEGATOR` | 我代理的（我是代理人） |
| `DELEGATED` | 代理我的（我是被代理人） |

**DelegateStatusEnum**

| 值 | 含义 |
|---|---|
| `PENDING` | 待接受 |
| `ACCEPTED` | 已生效 |
| `REVOKE` | 已撤销 |

> SQL 注释写的是 `REVOKED`，运行时状态字符串以代码枚举 **`REVOKE`** 为准。

### 1.4 公共响应类型

**JwtTokenVO**（登录 / 刷新 / 绑手机成功）

| 字段 | 类型 | 说明 |
|---|---|---|
| `accessToken` | string | 访问令牌 |
| `refreshToken` | string \| null | HTTP 接口中会被置为 `null`（已写入 Cookie） |
| `expiresInSeconds` | long | Access Token 剩余有效秒数 |

**UserProfileVO**

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | long | 用户 ID |
| `channel` | string | `PHONE` / `GITEE` / `GITHUB` |
| `name` | string | 昵称 |
| `verified` | boolean | 是否已校验 |
| `phone` | string \| null | 脱敏手机号，如 `138****5678` |

**DelegateVO**

| 字段 | 类型 | 说明 |
|---|---|---|
| `delegatorId` | long | 代理人 ID |
| `delegatedId` | long | 被代理人 ID |
| `status` | string | 见委托状态枚举 |
| `updatedAt` | string (ISO-8601 Instant) | 最后更新时间 |

**OauthUrlVO**

| 字段 | 类型 | 说明 |
|---|---|---|
| `authorizeUrl` | string | 浏览器跳转的授权地址 |

---

## 2. Auth — `/api/v1/auth`

控制器：`AuthController`

### 2.1 发送登录短信验证码

- **路由**：`POST /api/v1/auth/sms/send`
- **鉴权**：匿名
- **逻辑**：校验手机号 → 按手机号 / IP 限流 → 发送（或 Mock）验证码
- **注意**：`ip` 由服务端注入，客户端不要也不必传；频控触发时 HTTP 多为 **429**

**Request Body**

```json
{
  "phone": "13800138000"
}
```

| 字段 | 必填 | 规则 |
|---|---|---|
| `phone` | 是 | `^1\d{10}$` |

**Response `data`**：`null`

**调用示例**

```bash
curl -X POST http://localhost:8080/api/v1/auth/sms/send \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800138000"}'
```

---

### 2.2 短信登录（注册一体）

- **路由**：`POST /api/v1/auth/sms/login`
- **鉴权**：匿名
- **逻辑**：登录频控 → 校验验证码 → 按手机号登录或注册 → 签发 Token → `Set-Cookie` Refresh → JSON 返回 Access
- **注意**：保存响应中的 `accessToken`；确保后续跨域请求 `credentials` 能带上 Cookie

**Request Body**

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

| 字段 | 必填 | 规则 |
|---|---|---|
| `phone` | 是 | `^1\d{10}$` |
| `code` | 是 | 非空 |

**Response `data`**：`JwtTokenVO`（`refreshToken` 为 `null`）

同时响应头：`Set-Cookie: refresh_token=...; Path=/api/v1/auth; HttpOnly; SameSite=Lax`

```bash
curl -X POST http://localhost:8080/api/v1/auth/sms/login \
  -H 'Content-Type: application/json' \
  -c cookies.txt \
  -d '{"phone":"13800138000","code":"123456"}'
```

---

### 2.3 获取 OAuth 授权 URL

- **路由**：`GET /api/v1/auth/{provider}/authorize`
- **鉴权**：匿名
- **路径参数**：`provider` = `gitee` \| `github`
- **逻辑**：生成带签名 state 的第三方授权链接
- **注意**：非法 provider 会在枚举转换时失败；需先在服务端配好对应 client-id / secret / redirect

**Response `data`**

```json
{
  "authorizeUrl": "https://gitee.com/oauth/authorize?..."
}
```

```bash
curl 'http://localhost:8080/api/v1/auth/gitee/authorize'
```

**前端用法**：拿到 `authorizeUrl` 后 `window.location.href = authorizeUrl`。

---

### 2.4 OAuth 回调（浏览器跳转，非 JSON API）

- **路由**：`GET /api/v1/auth/{provider}/callback`
- **鉴权**：匿名
- **Query**：`code`、`state`（由第三方带回）
- **逻辑**：校验 state → 换取用户信息 → 登录或注册 → 写 Refresh Cookie → **302** 到前端回调页，并附加 `accessToken`
- **注意**：
  - 此接口给浏览器用，不要当 XHR/JSON 接口调
  - 跳转形如：`{AUTH_FRONTEND_REDIRECT}?accessToken=...`（若 redirect 已有 `?` 则用 `&`）
  - 前端页应立即持久化 Token 并清理 query

---

### 2.5 刷新 Token

- **路由**：`POST /api/v1/auth/refresh`
- **鉴权**：匿名（依赖 Cookie，不依赖 Bearer）
- **逻辑**：读取 Refresh Cookie → 校验 → 用户仍可用 → 换发双 Token → 更新 Cookie
- **注意**：无 Cookie 或无效时按未登录处理；请求需带凭证（`credentials: 'include'`）

**Request Body**：无

**Response `data`**：`JwtTokenVO`

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh -b cookies.txt -c cookies.txt
```

---

### 2.6 登出

- **路由**：`POST /api/v1/auth/logout`
- **鉴权**：无强制登录
- **逻辑**：清除 Refresh Cookie
- **注意**：前端需同时删除本地 Access Token；已签发 Access 在过期前仍可能有效

**Response `data`**：`null`

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout -b cookies.txt -c cookies.txt
```

---

## 3. User — `/api/v1/user`

控制器：`UserController`  
除特别说明外，均需：

```http
Authorization: Bearer <accessToken>
```

### 3.1 当前用户资料

- **路由**：`GET /api/v1/user/me`
- **鉴权**：已登录
- **逻辑**：查询当前用户；手机号脱敏后返回
- **注意**：用户不存在或不可用会失败

**Response `data`**：`UserProfileVO`

```bash
curl http://localhost:8080/api/v1/user/me \
  -H 'Authorization: Bearer <accessToken>'
```

---

### 3.2 更新昵称

- **路由**：`POST /api/v1/user/me/update`
- **鉴权**：已登录且已实名（Token `verified=true`）
- **逻辑**：更新名称后返回最新资料
- **注意**：
  - 名称最长 **20** 个字符
  - 未实名返回 **HTTP 403**（`NEED_VERIFY`）；未实名用户应先完成绑手机

**Request Body**

```json
{
  "name": "飞鹿用户"
}
```

**Response `data`**：`UserProfileVO`

---

### 3.3 绑定手机号 — 发送验证码

- **路由**：`POST /api/v1/user/me/phone/send`
- **鉴权**：已登录
- **逻辑**：与登录发码相同（限流 + 短信），用于 OAuth 用户绑定流程
- **注意**：手机号渠道用户最终绑定时会被拒绝，发码阶段仍可能发出

**Request Body**

```json
{
  "phone": "13800138000"
}
```

**Response `data`**：`null`

---

### 3.4 绑定手机号 — 提交验证码

- **路由**：`POST /api/v1/user/me/phone/bind`
- **鉴权**：已登录
- **逻辑**：校验验证码 → 绑定手机并标记已校验 → 重新签发 Token（verified=true）→ 更新 Refresh Cookie
- **注意**：
  - 仅 OAuth 渠道可绑定；`PHONE` 渠道会失败
  - 同渠道下手机号已被其他账号占用会失败
  - 成功后务必替换本地 Access Token

**Request Body**

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**Response `data`**：`JwtTokenVO`

---

## 4. Delegate — `/api/v1/user/delegate`

控制器：`DelegateController`  
全部需要已登录 Bearer。

### 4.1 查询代理关系

- **路由**：`POST /api/v1/user/delegate/query`
- **逻辑**：按身份（我代理的 / 代理我的）列出关系；`status` 为空则不过滤状态
- **注意**：`relation` 必填

**Request Body**

```json
{
  "relation": "DELEGATOR",
  "status": ["PENDING", "ACCEPTED"]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `relation` | 是 | `DELEGATOR` \| `DELEGATED` |
| `status` | 否 | 状态数组；省略或空 = 全部 |

**Response `data`**：`DelegateVO[]`

---

### 4.2 发起代理

- **路由**：`POST /api/v1/user/delegate/create`
- **逻辑**：当前用户（代理人）向 `operateId`（被代理人）发起代理；已存在 PENDING/ACCEPTED 则幂等；若为 REVOKE 则重新置为 PENDING
- **注意**：不能对自己发起；对方须存在且可用

**Request Body**

```json
{
  "operateId": 10000001
}
```

**Response `data`**：`null`

---

### 4.3 接受代理

- **路由**：`POST /api/v1/user/delegate/accept`
- **逻辑**：当前用户作为被代理人，接受 `operateId`（代理人）发起的 PENDING 关系
- **注意**：`operateId` 是**发起方** userId，不是自己

**Request Body**

```json
{
  "operateId": 10000000
}
```

**Response `data`**：`null`

---

### 4.4 撤销代理

- **路由**：`POST /api/v1/user/delegate/revoke`
- **逻辑**：按身份撤销指定对方的关系（PENDING 或 ACCEPTED → REVOKE）
- **注意**：`relation` **必填**，用于解释 `operateId` 是代理人还是被代理人

**Request Body**

```json
{
  "operateId": 10000001,
  "relation": "DELEGATOR"
}
```

| 当前用户身份 | relation | operateId 含义 |
|---|---|---|
| 代理人撤销 | `DELEGATOR` | 被代理人 ID |
| 被代理人撤销 | `DELEGATED` | 代理人 ID |

**Response `data`**：`null`

---

## 5. 前端调用清单（速查）

| 场景 | 方法 | 路径 | Token | Cookie |
|---|---|---|---|---|
| 发登录短信 | POST | `/api/v1/auth/sms/send` | 否 | 否 |
| 短信登录 | POST | `/api/v1/auth/sms/login` | 否 | 写 |
| OAuth 授权 URL | GET | `/api/v1/auth/{gitee\|github}/authorize` | 否 | 否 |
| OAuth 回调 | GET | `/api/v1/auth/{provider}/callback` | 否（浏览器） | 写 |
| 刷新 | POST | `/api/v1/auth/refresh` | 否 | 读/写 |
| 登出 | POST | `/api/v1/auth/logout` | 否 | 清 |
| 我的资料 | GET | `/api/v1/user/me` | 是 | 否 |
| 改昵称 | POST | `/api/v1/user/me/update` | 是（需实名） | 否 |
| 绑手机发码 | POST | `/api/v1/user/me/phone/send` | 是 | 否 |
| 绑手机提交 | POST | `/api/v1/user/me/phone/bind` | 是 | 写 |
| 查委托 | POST | `/api/v1/user/delegate/query` | 是 | 否 |
| 发起委托 | POST | `/api/v1/user/delegate/create` | 是 | 否 |
| 接受委托 | POST | `/api/v1/user/delegate/accept` | 是 | 否 |
| 撤销委托 | POST | `/api/v1/user/delegate/revoke` | 是 | 否 |

### TypeScript 类型草稿（便于前端 AI 生成客户端）

```ts
type ApiResult<T> = { code: number; message: string; data: T };

type JwtTokenVO = {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number;
};

type UserProfileVO = {
  userId: number;
  channel: 'PHONE' | 'GITEE' | 'GITHUB';
  name: string;
  verified: boolean;
  phone: string | null;
};

type DelegateVO = {
  delegatorId: number;
  delegatedId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKE';
  updatedAt: string;
};

type DelegateRelation = 'DELEGATOR' | 'DELEGATED';
```
