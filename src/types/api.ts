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

/** DELEGATOR=我代理的（我是代理人）；DELEGATED=代理我的（我是被代理人） */
export type DelegateRelation = 'DELEGATOR' | 'DELEGATED'

/** 注意：运行时枚举是 REVOKE（非 REVOKED） */
export type DelegateStatus = 'PENDING' | 'ACCEPTED' | 'REVOKE'

export type DelegateVO = {
  /** 代理人 ID */
  delegatorId: number
  /** 被代理人 ID */
  delegatedId: number
  status: DelegateStatus
  /** ISO-8601 Instant */
  updatedAt: string
}

export type OauthUrlVO = {
  authorizeUrl: string
}

export type OauthProvider = 'gitee' | 'github'
