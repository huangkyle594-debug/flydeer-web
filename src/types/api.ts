/** 后端统一响应信封 */
export type ApiResult<T> = {
  code: number
  message: string
  data: T
}

/** 登录 / 刷新 / 绑手机成功返回 */
export type JwtTokenVO = {
  accessToken: string
  refreshToken: string | null
  expiresInSeconds: number
}

export type LoginChannel = 'PHONE' | 'GITEE' | 'GITHUB'

export type UserProfileVO = {
  userId: number
  channel: LoginChannel
  name: string
  verified: boolean
  phone: string | null
}

/** MANAGING=我代理的（我是代理人）；MANAGED=代理我的（我是被代理人） */
export type DelegateRelation = 'MANAGING' | 'MANAGED'

/** 注意：运行时枚举是 REVOKE（非 REVOKED） */
export type DelegateStatus = 'PENDING' | 'ACCEPTED' | 'REVOKE'

export type DelegateVO = {
  /** 代理人 ID */
  userId: number
  /** 被代理人 ID */
  grantedUserId: number
  status: DelegateStatus
  /** ISO-8601 Instant */
  updatedAt: string
}

export type OauthUrlVO = {
  authorizeUrl: string
}

export type OauthProvider = 'gitee' | 'github'
