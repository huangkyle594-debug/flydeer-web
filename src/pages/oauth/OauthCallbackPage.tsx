import { useEffect, useRef, useState } from 'react'
import { Button, Result, Spin } from 'antd'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { errorText } from '@/lib/apiError'

/**
 * OAuth 回调落地页：后端 302 到 /oauth/callback?accessToken=...
 * 取 token → 立即清 URL（防历史记录泄露）→ 拉资料 → 跳回原页面。
 */
export function OauthCallbackPage() {
  const { completeOauth } = useAuth()
  const navigate = useNavigate()
  const handledRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (handledRef.current) return // StrictMode 幂等
    handledRef.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')

    // 无论成败先清掉 URL 中的 token
    window.history.replaceState(null, '', window.location.pathname)

    if (!accessToken) {
      setError('登录回调缺少凭证，请重新登录')
      return
    }

    completeOauth(accessToken)
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch((err) => setError(errorText(err, '登录失败，请重试')))
  }, [completeOauth, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Result
          status="error"
          title="登录失败"
          subTitle={error}
          extra={
            <Link to="/">
              <Button type="primary">返回首页</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spin size="large" tip="登录中…">
        <div className="h-24 w-48" />
      </Spin>
    </div>
  )
}
