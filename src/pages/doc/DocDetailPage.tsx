import { Button, Result } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router'
import { findDoc } from './docs'

export function DocDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const doc = findDoc(slug)

  if (!doc) {
    return (
      <Result
        status="404"
        title="文档不存在"
        extra={
          <Link to="/doc">
            <Button type="primary">返回文档列表</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/doc" className="mb-4 inline-flex items-center gap-1 text-sm text-fg-mute hover:text-accent">
        <ArrowLeftOutlined /> 返回文档列表
      </Link>
      <article className="doc-prose">
        <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
      </article>
    </div>
  )
}
