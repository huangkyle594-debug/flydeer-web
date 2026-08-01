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
    <Layout.Footer className="border-t border-line !py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-xs text-fg-faint">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {DOC_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="text-fg-mute hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {/* 备案号为占位，上线前替换为真实备案信息 */}
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg-mute"
          >
            京ICP备XXXXXXXX号-X
          </a>
          <a
            href="https://beian.mps.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg-mute"
          >
            京公网安备XXXXXXXXXXXXX号
          </a>
        </div>
        <div>© {new Date().getFullYear()} fly-deer.com 版权所有</div>
      </div>
    </Layout.Footer>
  )
}
