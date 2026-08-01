import { getMessage } from './message'

/** 错误码常量（与后端 ErrorCodes 对齐，仅列前端需要分支的） */
export const ErrorCode = {
  /** Access Token 解析失败 */
  AUTH_ACCESS_TOKEN: 30010,
  /** Refresh Token 无效或过期 */
  AUTH_REFRESH_TOKEN: 30020,
  /** 短信验证码错误 */
  SMS_VERIFY: 30070,
  /** 需要登录态 */
  NEED_LOGIN: 31010,
  /** 需要实名 */
  NEED_VERIFY: 31020,
  /** 参数不合法 */
  BAD_REQUEST: 40000,
  /** 不能授权给自己 */
  DELEGATE_SELF: 41010,
  /** 无此用户 */
  USER_NOT_FOUND: 51010,
  /** 授权记录不存在或状态不允许 */
  DELEGATE_NOT_FOUND: 51020,
  /** 用户已被禁用 */
  USER_INVALID: 52010,
  /** 手机号绑定冲突 */
  PHONE_BIND_LIMIT: 53010,
  /** 手机号渠道不能绑手机 */
  PHONE_CHANNEL_OPERATE: 61010,
  /** 短信发送频控 */
  SMS_RATE_FREQUENCY: 91010,
  /** 登录频控 */
  LOGIN_RATE_FREQUENCY: 91020,
  /** 系统异常 */
  UNKNOWN: 999999,
  /** 前端自造：网络错误 */
  NETWORK: -1,
} as const

/** 归一化后的 API 错误：先看 code，再看 HTTP */
export class ApiError extends Error {
  readonly code: number
  readonly httpStatus: number

  constructor(code: number, message: string, httpStatus: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

/** 部分 code 的 message 可能是框架原始文案，用兜底文案替换 */
const FALLBACK_TEXT: Record<number, string> = {
  [ErrorCode.BAD_REQUEST]: '参数不合法，请检查输入',
  [ErrorCode.UNKNOWN]: '系统异常，请稍后重试',
  [ErrorCode.NETWORK]: '网络异常，请检查网络后重试',
}

export function errorText(err: unknown, fallback = '操作失败，请稍后重试'): string {
  if (isApiError(err)) {
    return FALLBACK_TEXT[err.code] ?? (err.message || fallback)
  }
  return fallback
}

/**
 * 通用错误提示。组件层无特殊分支时调用。
 * 注意：登录过期（刷新失败）的提示由拦截器统一负责，这里跳过避免重复弹窗。
 */
export function showError(err: unknown, fallback?: string) {
  if (isApiError(err) && err.code === ErrorCode.NEED_LOGIN) return
  getMessage()?.error(errorText(err, fallback))
}
