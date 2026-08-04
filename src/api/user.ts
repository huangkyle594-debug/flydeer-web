import { apiGet, apiPost } from '@/lib/http'
import type { JwtTokenVO, UserProfileVO } from '@/types/api'
import type { AxiosRequestConfig } from 'axios'

/** 当前用户资料（手机号已脱敏） */
export function getMe(config?: AxiosRequestConfig): Promise<UserProfileVO> {
  return apiGet<UserProfileVO>('/api/v1/user/me', config)
}

/**
 * 更新昵称（≤20 字符），返回最新资料。
 * 需已实名（Token verified=true），否则 403 NEED_VERIFY。
 */
export function updateName(name: string): Promise<UserProfileVO> {
  return apiPost<UserProfileVO>('/api/v1/user/me/update', { name })
}

/** 绑定手机号——发送验证码（仅 OAuth 渠道用户应调用） */
export function sendBindPhoneSms(phone: string): Promise<null> {
  return apiPost<null>('/api/v1/user/me/phone/send', { phone })
}

/**
 * 绑定手机号——提交验证码。
 * 成功返回新 JwtTokenVO（verified=true），调用方必须替换本地 accessToken。
 */
export function bindPhone(phone: string, code: string): Promise<JwtTokenVO> {
  return apiPost<JwtTokenVO>('/api/v1/user/me/phone/bind', { phone, code }, { withCredentials: true })
}

/**
 * 注销当前账号（物理删除）。
 * 服务端清除 refresh cookie；前端另需清本地 accessToken。
 */
export function cancelMe(): Promise<null> {
  return apiPost<null>('/api/v1/user/me/cancel', null, { withCredentials: true })
}
