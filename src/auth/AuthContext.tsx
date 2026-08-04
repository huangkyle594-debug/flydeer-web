import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { JwtTokenVO, OauthProvider, UserProfileVO } from '@/types/api'
import { cancelMe, getMe } from '@/api/user'
import { getOauthAuthorizeUrl, loginBySms as loginBySmsApi, logoutApi } from '@/api/auth'
import { tokenStore } from '@/lib/tokenStore'
import { LoginModal } from './LoginModal'

export type AuthStatus = 'initializing' | 'anonymous' | 'authenticated'

const OAUTH_RETURN_KEY = 'fd_oauth_return'

interface AuthContextValue {
  status: AuthStatus
  user: UserProfileVO | null
  /** 打开登录弹窗（Header、/user 守卫卡片调用） */
  openLogin: () => void
  /** 短信登录：登录→存 token→拉资料 */
  loginBySms: (phone: string, code: string) => Promise<void>
  /** OAuth 登录：记录 returnTo→取授权 URL→整页跳转 */
  loginByOauth: (provider: OauthProvider) => Promise<void>
  /** OAuth 回调页调用：存 token→拉资料→返回 returnTo 路径 */
  completeOauth: (accessToken: string) => Promise<string>
  logout: () => Promise<void>
  /** 注销账号：物理删除 → 清本地 token（服务端已清 refresh cookie） */
  cancelAccount: () => Promise<void>
  /** 改名/绑手机后重拉资料 */
  refreshProfile: () => Promise<void>
  /** 绑手机成功后替换本地 token（新 token verified=true） */
  applyNewToken: (vo: JwtTokenVO) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [user, setUser] = useState<UserProfileVO | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const bootstrappedRef = useRef(false)

  // ---- bootstrap：有 token 则静默拉资料（access 过期由拦截器自动刷新重放） ----
  useEffect(() => {
    if (bootstrappedRef.current) return // StrictMode 幂等
    bootstrappedRef.current = true

    if (!tokenStore.get()) {
      setStatus('anonymous')
      return
    }
    getMe({ silent: true })
      .then((profile) => {
        setUser(profile)
        setStatus('authenticated')
      })
      .catch(() => {
        // 拦截器已在刷新失败时清 token；此处仅落 UI 态
        setStatus('anonymous')
      })
  }, [])

  // ---- 订阅 tokenStore：token 被拦截器清空 → UI 原地退化为匿名，不跳转 ----
  useEffect(() => {
    return tokenStore.subscribe((token) => {
      if (token === null) {
        setUser(null)
        setStatus('anonymous')
      }
    })
  }, [])

  const openLogin = useCallback(() => setLoginOpen(true), [])

  const loginBySms = useCallback(async (phone: string, code: string) => {
    const vo = await loginBySmsApi(phone, code)
    tokenStore.set(vo.accessToken)
    const profile = await getMe()
    setUser(profile)
    setStatus('authenticated')
  }, [])

  const loginByOauth = useCallback(async (provider: OauthProvider) => {
    try {
      sessionStorage.setItem(OAUTH_RETURN_KEY, window.location.pathname)
    } catch {
      /* ignore */
    }
    const { authorizeUrl } = await getOauthAuthorizeUrl(provider)
    window.location.href = authorizeUrl
  }, [])

  const completeOauth = useCallback(async (accessToken: string) => {
    tokenStore.set(accessToken)
    const profile = await getMe()
    setUser(profile)
    setStatus('authenticated')
    let returnTo = '/'
    try {
      returnTo = sessionStorage.getItem(OAUTH_RETURN_KEY) || '/'
      sessionStorage.removeItem(OAUTH_RETURN_KEY)
    } catch {
      /* ignore */
    }
    return returnTo
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi() // 服务端清 HttpOnly refresh cookie
    } finally {
      tokenStore.clear() // 订阅回调会同步 status/user
    }
  }, [])

  const cancelAccount = useCallback(async () => {
    try {
      await cancelMe() // 服务端删除账号并清 refresh cookie
    } finally {
      tokenStore.clear()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await getMe()
    setUser(profile)
  }, [])

  const applyNewToken = useCallback((vo: JwtTokenVO) => {
    tokenStore.set(vo.accessToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      openLogin,
      loginBySms,
      loginByOauth,
      completeOauth,
      logout,
      cancelAccount,
      refreshProfile,
      applyNewToken,
    }),
    [
      status,
      user,
      openLogin,
      loginBySms,
      loginByOauth,
      completeOauth,
      logout,
      cancelAccount,
      refreshProfile,
      applyNewToken,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
