import { useEffect, useState } from 'react'
import { getNotice } from '@/api/common'

/** 顶栏下方滚动通知条；仅在服务端返回非空文案时展示 */
export function SiteNoticeBanner() {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getNotice({ silent: true })
      .then((data) => {
        if (cancelled) return
        const text = typeof data === 'string' ? data.trim() : ''
        setNotice(text || null)
      })
      .catch(() => {
        /* 静默失败：不展示横幅 */
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!notice) return null

  // 复制多段以保证宽屏也能连续滚动
  const units = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="mx-8 shrink-0">
      {notice}
    </span>
  ))

  return (
    <div
      className="overflow-hidden border-b border-line bg-surface-2 py-1.5 text-xs text-accent"
      role="status"
      aria-label={notice}
    >
      <div className="site-marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{units}</div>
        <div className="flex" aria-hidden>
          {units}
        </div>
      </div>
    </div>
  )
}
