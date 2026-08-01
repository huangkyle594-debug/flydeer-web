# 14-错误码

> 基于 `ErrorCodes` 与 `GlobalExceptionHandler` 整理，供前端联调与排错使用。  
> 成功响应 `code = 0`；失败时 HTTP 状态码与 body 中的业务 `code` **同时存在**，前端应以业务 `code` 做分支，HTTP 状态作辅助。

---

## 1. 响应形态

```json
{
  "code": 31010,
  "message": "需要登陆态",
  "data": null
}
```

| 字段 | 说明 |
|---|---|
| `code` | 业务错误码，定义见 `com.flydeer.structmind.common.exception.ErrorCodes` |
| `message` | 可读提示（异常构造时写入；校验失败时可能为框架原始信息） |
| `data` | 失败时一般为 `null` |

OAuth Callback（`GET /api/v1/auth/{provider}/callback`）成功为 **302**，失败时仍可能走本异常体系返回 JSON（取决于抛出点）。

---

## 2. HTTP 状态映射（GlobalExceptionHandler）

| 异常类型 | HTTP | 典型业务码区间 |
|---|---|---|
| `NeedLoginException` | **401** Unauthorized | `31010` |
| `NeedVerifyException` / `SmsVerifyException` | **403** Forbidden | `31020` / `30070` |
| 其他 `AuthorizedException` | **400** Bad Request | `30010`–`30060` 等 |
| `BadRequestException`（含 `DelegateSelfException`） | **400** | `40000` / `41010` |
| `MethodArgumentNotValidException` / `BindException` | **400** | `40000` |
| `FrequencyException`（短信/登录频控） | **429** Too Many Requests | `91010` / `91020` |
| `BusinessException` 及子类 | **500** Internal Server Error | `51010`–`61020` 等 |
| 未捕获 `Exception` | **500** | `999999` |

异常继承关系简图：

```
AuthorizedException
  ├── NeedLoginException          → 401
  ├── NeedVerifyException         → 403
  ├── SmsVerifyException          → 403
  ├── AccessTokenParseException   → 400
  ├── RefreshTokenParseException  → 400
  ├── Oauth* / SmsSendException   → 400

BadRequestException
  └── DelegateSelfException       → 400

FrequencyException
  ├── SmsFrequencyException       → 429
  └── LoginFrequencyException     → 429

BusinessException
  ├── UserNotFoundException       → 500
  ├── DelegateNotFoundException   → 500
  ├── UserInvalidException        → 500
  ├── BindPhoneExceedException    → 500
  ├── PhoneChannelOperateException→ 500
  └── UnBindPhoneOperateException → 500
```

> 说明：业务类异常当前统一映射为 HTTP 500。前端展示应优先读 `message` / `code`，勿仅凭 HTTP 500 当作「系统崩溃」。

---

## 3. 错误码分段

| 区间 | 常量前缀 / 含义 |
|---|---|
| `0` | 成功 |
| `30000`–`30999` | 认证过程失败（Token / OAuth / 短信收发校验） |
| `31000`–`31999` | 访问门槛（需登录 / 需实名） |
| `40000`–`41999` | 请求不合法 |
| `50000`–`53999` | 业务实体不存在 / 无效 / 限额（`BusinessException`） |
| `60000`–`61999` | 当前状态不允许该操作 |
| `90000`–`91999` | 频控 |
| `999999` | 未知系统异常 |

未单独抛出的「段首常量」（如 `AUTH=30000`、`BUSINESS=50000`、`FREQUENCY=90000`）用于分段预留，一般不会直接出现在响应里。

---

## 4. 完整错误码表

### 4.1 成功

| code | 常量 | 默认 message | HTTP | 触发场景 |
|---|---|---|---|---|
| `0` | `SUCCESS` | `ok` | 200 | 业务成功 |

### 4.2 认证过程（30xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `30010` | `AUTH_ACCESS_TOKEN` | 鉴权失败 | 400 | `AccessTokenParseException` | Access Token 解析/校验失败（Bearer 非法或损坏） |
| `30020` | `AUTH_REFRESH_TOKEN` | 登陆过期，请返回首页重新登陆 | 400 | `RefreshTokenParseException` | Refresh Token 无效或过期 |
| `30030` | `OAUTH_URL_BUILD` | 构建授权服务器请求失败 | 400 | `OauthUrlBuildException` | 生成 Gitee/GitHub 授权 URL 失败（配置缺失等） |
| `30040` | `OAUTH_VALIDATE` | 第三方登录失败 | 400 | `OauthValidateException` | OAuth `state` 校验失败 |
| `30050` | `OAUTH_EXCHANGE` | 第三方验证失败 | 400 | `OauthExchangeException` | 用 `code` 换取第三方用户信息失败 |
| `30060` | `SMS_SEND` | 发送短信验证码失败 | 400 | `SmsSendException` | 短信通道发送失败（非 Mock） |
| `30070` | `SMS_VERIFY` | 短信验证码验证失败 | 403 | `SmsVerifyException` | 登录/绑手机时验证码错误或失效 |

### 4.3 访问门槛（31xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `31010` | `NEED_LOGIN` | 需要登陆态 | 401 | `NeedLoginException` | 需登录接口无有效 Access；或刷新时无 Refresh Cookie |
| `31020` | `NEED_VERIFY` | 仅对实名用户开放 | 403 | `NeedVerifyException` | 接口要求 `VERIFIED`，当前 Token 未实名 |

### 4.4 请求错误（40xxx / 41xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `40000` | `BAD_REQUEST` | （构造入参或校验信息） | 400 | `BadRequestException`；参数校验 | 参数非法，如委托撤销未传 `relation`；`@Valid` / `@RequestBody` 校验失败 |
| `41010` | `DELEGATE_SELF` | 不能授权给自己 | 400 | `DelegateSelfException` | 创建代理时 `operateId` 为自己 |

### 4.5 业务实体 / 限额（51xxx–53xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `51010` | `USER_NOT_FOUND` | 无此用户 | 500 | `UserNotFoundException` | 用户 ID 不存在 |
| `51020` | `DELEGATE_NOT_FOUND` | 授权记录不存在 | 500 | `DelegateNotFoundException` | 接受/撤销时代理关系不存在或状态不允许 |
| `52010` | `USER_INVALID` | 用户已被禁用 | 500 | `UserInvalidException` | 用户 `status` 非 ACTIVE |
| `53010` | `PHONE_BIND_LIMIT` | 手机号每种类型账号最多绑定一个 | 500 | `BindPhoneExceedException` | 同登录渠道下手机号已被其他账号绑定 |

段首预留（当前无直接抛出）：`ENTITY_NOT_FOUND=51000`、`ENTITY_INVALID=52000`、`BUSINESS_LIMIT=53000`、`BUSINESS=50000`。

### 4.6 操作不允许（61xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `61010` | `PHONE_CHANNEL_OPERATE` | 手机号登录无法完成此操作 | 500 | `PhoneChannelOperateException` | 手机号渠道账号再执行「绑手机」等不适用操作 |
| `61020` | `UN_BIND_PHONE_OPERATE` | 未绑定手机号实名不能完成此操作 | 500 | `UnBindPhoneOperateException` | 未实名用户执行需绑手机的操作（预留，随业务启用） |

段首预留：`BAD_OPERATE=60000`。

### 4.7 频控（91xxx）

| code | 常量 | 默认 message | HTTP | 异常类 | 触发场景 |
|---|---|---|---|---|---|
| `91010` | `SMS_RATE_FREQUENCY` | 短信验证码发送频繁，请稍后再试 | 429 | `SmsFrequencyException` | 短信发送触发间隔 / 日限（手机号或 IP） |
| `91020` | `LOGIN_RATE_FREQUENCY` | 登陆频繁，请稍后再试 | 429 | `LoginFrequencyException` | 短信登录过频 |

段首预留：`FREQUENCY=90000`。

### 4.8 未知

| code | 常量 | 默认 message | HTTP | 触发场景 |
|---|---|---|---|---|
| `999999` | `UNKNOWN` | 系统异常 | 500 | 未被上述类型捕获的异常（message 固定为「系统异常」，细节仅在服务端日志） |

---

## 5. 按接口场景速查

### Auth

| 场景 | 可能 code |
|---|---|
| 发送短信过频 | `91010` |
| 发送短信通道失败 | `30060` |
| 短信登录验证码错误 | `30070` |
| 短信登录过频 | `91020` |
| 短信登录用户不可用 | `52010` |
| OAuth 构建授权 URL 失败 | `30030` |
| OAuth state / 换票失败 | `30040` / `30050` |
| 刷新无 Cookie | `31010` |
| Refresh 无效 | `30020` |
| 刷新时用户不存在 / 禁用 | `51010` / `52010` |

### User

| 场景 | 可能 code |
|---|---|
| 未登录访问资料/更新/绑手机 | `31010` |
| Access 损坏 | `30010` |
| 用户不存在 / 禁用 | `51010` / `52010` |
| 绑手机验证码错误 | `30070` |
| 手机号渠道再绑手机 | `61010` |
| 手机号绑定冲突 | `53010` |
| 发绑手机短信过频 | `91010` |
| 昵称等参数校验失败 | `40000` |

### Delegate

| 场景 | 可能 code |
|---|---|
| 未登录 | `31010` |
| 代理自己 | `41010` |
| 对方用户不存在 / 禁用 | `51010` / `52010` |
| 关系不存在或状态不对 | `51020` |
| 撤销未传 `relation` | `40000` |

---

## 6. 前端处理建议

1. 不强制要求用户登陆，未登录时tip报错原因即可，不跳转登录引导
2. **先看 `code`，再看 HTTP**：
3. **`31010` / `30020`**：；Refresh 场景优先调刷新，失败不回登录页。
4. **`91010` / `91020`**：展示 `message`，并按配置间隔禁用按钮（短信默认约 60s）。

---

