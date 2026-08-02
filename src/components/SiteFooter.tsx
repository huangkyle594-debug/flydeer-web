import { Layout } from 'antd'
import { Link } from 'react-router'

const DOC_LINKS = [
  { to: '/doc/user-agreement', label: '用户协议' },
  { to: '/doc/terms-of-service', label: '服务条款' },
  { to: '/doc/contact', label: '联系方式' },
  { to: '/doc/complaint', label: '投诉渠道' },
]

export function SiteFooter() {
  return (
    <Layout.Footer className="border-t border-line !py-3">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-y-2 text-xs text-fg-faint sm:grid-cols-[1fr_auto_1fr] sm:gap-x-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
          {DOC_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="text-fg-mute hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg-mute"
          >
            沪ICP备2026035340号-1
          </a>
          {/* 公安备案号为占位，拿到后替换 */}
          <a
            href="https://beian.mps.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg-mute"
          >
            沪公网安备XXXXXXXXXXXXX号
          </a>
        </div>
        <div className="text-center sm:justify-self-end sm:text-right">
          © {new Date().getFullYear()} fly-deer.com 版权所有
        </div>
      </div>
    </Layout.Footer>
  )
}
