import { useState } from 'react'
import { App, Button, Result } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, CopyOutlined } from '@ant-design/icons'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router'
import { findDoc } from './docs'

export function DocDetailPage() {
  const { message } = App.useApp()
  const { slug } = useParams<{ slug: string }>()
  const doc = findDoc(slug)
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc.content)
      setCopied(true)
      message.success('已复制 Markdown 源文本')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      message.error('复制失败，请手动选择文本')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/doc" className="inline-flex items-center gap-1 text-sm text-fg-mute hover:text-accent">
          <ArrowLeftOutlined /> 返回文档列表
        </Link>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          aria-label="复制 Markdown 源文本"
        >
          {copied ? '已复制' : '复制 MD'}
        </Button>
      </div>
      <article className="doc-prose">
        <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
      </article>
    </div>
  )
}
