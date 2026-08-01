import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResult, JwtTokenVO } from '@/types/api'
import { tokenStore } from './tokenStore'
import { ApiError, ErrorCode } from './apiError'
import { getMessage } from './message'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 内部标记：该请求已因刷新重放过一次，避免死循环 */
    _retry?: boolean
    /** 静默请求：错误不弹全局提示（如 bootstrap 拉资料） */
    silent?: boolean
  }
}

/**
 * 统一 axios 实例。
 * 路径必须写全 /api/v1/...（vite 代理不 rewrite），
 * refresh cookie 的 Path=/api/v1/auth 依赖路径原样。
 */
export const http = axios.create({
  baseURL: '/',
  timeout: 15000,
})

// ---- 请求拦截：附加 Bearer ----
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- 单飞刷新：并发 401 共享同一个刷新 promise ----
let refreshPromise: Promise<string> | null = null

function ensureRefreshed(): Promise<string> {
  refreshPromise ??= axios
    // 用裸 axios（不走 http 实例）避免拦截器递归
    .post<ApiResult<JwtTokenVO>>('/api/v1/auth/refresh', null, { withCredentials: true })
    .then((res) => {
      const body = res.data
      if (body.code !== 0 || !body.data?.accessToken) {
        throw new ApiError(body.code || ErrorCode.AUTH_REFRESH_TOKEN, body.message || '刷新登录态失败', res.status)
      }
      tokenStore.set(body.data.accessToken)
      return body.data.accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// 刷新失败提示节流：并发失败只弹一次
let lastExpireTipAt = 0
function tipLoginExpired() {
  const now = Date.now()
  if (now - lastExpireTipAt < 3000) return
  lastExpireTipAt = now
  getMessage()?.warning('登录已过期，请重新登录')
}

function isAuthPath(url: string | undefined): boolean {
  return !!url && url.startsWith('/api/v1/auth/')
}

/** 判定是否应尝试刷新：401（31010 缺登录态）或 400+30010（access 损坏） */
function shouldRefresh(status: number, code: number | undefined): boolean {
  return status === 401 || code === ErrorCode.AUTH_ACCESS_TOKEN
}

// ---- 响应拦截 ----
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResult<unknown>
    // HTTP 2xx 但业务失败
    if (body && typeof body.code === 'number' && body.code !== 0) {
      return Promise.reject(new ApiError(body.code, body.message, response.status))
    }
    return response
  },
  async (error: AxiosError<ApiResult<unknown>>) => {
    const config = error.config as (AxiosRequestConfig & InternalAxiosRequestConfig) | undefined

    // 网络层错误（无响应）
    if (!error.response || !config) {
      return Promise.reject(new ApiError(ErrorCode.NETWORK, '网络异常，请检查网络后重试', 0))
    }

    const { status, data: body } = error.response
    const code = body?.code

    // 需要刷新：非 auth 接口自身、且未重放过
    if (shouldRefresh(status, code) && !config._retry && !isAuthPath(config.url)) {
      config._retry = true
      try {
        const token = await ensureRefreshed()
        config.headers.Authorization = `Bearer ${token}`
        return http(config)
      } catch {
        // 刷新失败：清登录态 + 节流提示，不跳转
        tokenStore.clear()
        if (!config.silent) tipLoginExpired()
        return Promise.reject(new ApiError(ErrorCode.NEED_LOGIN, '登录已过期', 401))
      }
    }

    // 其余错误统一归一化
    if (body && typeof body.code === 'number') {
      return Promise.reject(new ApiError(body.code, body.message, status))
    }
    return Promise.reject(new ApiError(ErrorCode.UNKNOWN, '系统异常，请稍后重试', status))
  },
)

/** 便捷方法：直接取 data 载荷 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get<ApiResult<T>>(url, config)
  return res.data.data
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.post<ApiResult<T>>(url, data, config)
  return res.data.data
}
