import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 短信验证码倒计时 hook（登录 / 绑手机复用）。
 * 发送成功或收到 91010 频控时 start(60)，期间禁用发送按钮。
 */
export function useSmsCountdown() {
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(
    (seconds = 60) => {
      stop()
      setRemaining(seconds)
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            stop()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  return { remaining, running: remaining > 0, start }
}
