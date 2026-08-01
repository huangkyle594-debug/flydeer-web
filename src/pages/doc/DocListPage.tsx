import { FileTextOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import { DOCS } from './docs'

export function DocListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">支持文档</h1>
        <p className="mt-1 text-sm text-fg-mute">网站协议、条款及帮助信息</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <Link
            key={doc.slug}
            to={`/doc/${doc.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-line-strong bg-surface-2 p-5 transition-colors hover:border-accent-deep hover:bg-surface-3"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-fg group-hover:text-accent">
              <FileTextOutlined className="!text-fg-faint group-hover:!text-accent" />
              {doc.title}
            </span>
            <p className="text-sm leading-relaxed text-fg-mute">{doc.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
