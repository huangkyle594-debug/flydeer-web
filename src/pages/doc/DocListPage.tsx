import { FileTextOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import { DOC_CATEGORIES } from './docs'

export function DocListPage() {
  return (
    <div className="flex flex-col gap-8">
      {DOC_CATEGORIES.map((category) => (
        <section key={category.id} className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-fg">{category.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {category.docs.map((doc) => (
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
        </section>
      ))}
    </div>
  )
}
