import { apiGet, apiPost } from '@/lib/http'
import type { JwtTokenVO, OauthProvider, OauthUrlVO } from '@/types/api'

/** 发送登录短信验证码（匿名，429=频控） */
export function sendLoginSms(phone: string): Promise<null> {
  return apiPost<null>('/api/v1/auth/sms/send', { phone })
}

/** 短信登录（注册一体）；refresh token 由服务端写 HttpOnly cookie */
export function loginBySms(phone: string, code: string): Promise<JwtTokenVO> {
  return apiPost<JwtTokenVO>('/api/v1/auth/sms/login', { phone, code }, { withCredentials: true })
}

/** 获取 OAuth 授权 URL，前端拿到后整页跳转 */
export function getOauthAuthorizeUrl(provider: OauthProvider): Promise<OauthUrlVO> {
  return apiGet<OauthUrlVO>(`/api/v1/auth/${provider}/authorize`)
}

/** 登出：服务端清 refresh cookie；前端另需清本地 accessToken */
export function logoutApi(): Promise<null> {
  return apiPost<null>('/api/v1/auth/logout', null, { withCredentials: true })
}
