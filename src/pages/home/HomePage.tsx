import { Button, Tooltip } from 'antd'
import { ArrowRightOutlined, GithubOutlined, MailOutlined } from '@ant-design/icons'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GiteeOutlined } from '@/components/icons/GiteeOutlined'
import { useAuth } from '@/auth/AuthContext'
import authorMessage from '@/docs/author-message.md?raw'

type ProjectItem = {
  key: string
  title: string
  description: string
  href?: string
}

/* /struct-mind 等由其他项目提供，用普通 <a> 整页跳转（nginx 按路径分发） */
const PROJECTS: ProjectItem[] = [
  {
    key: 'struct-mind',
    title: '结构化思维导图',
    description: '以图组织思维，图中嵌图、层层深入，构建属于你的结构化知识网络。',
    href: '/struct-mind',
  },
  {
    key: 'coming-1',
    title: '敬请期待',
    description: '更多工具正在孵化中……',
  },
]

/** 外部跳转入口：站外链接新开标签页，邮箱调起邮件 App */
const SOCIAL_LINKS = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/huangkyle594-debug',
    icon: <GithubOutlined />,
    external: true,
  },
  {
    key: 'gitee',
    label: 'Gitee',
    href: 'https://gitee.com/huangkyle594',
    icon: <GiteeOutlined />,
    external: true,
  },
  {
    key: 'email',
    label: '发邮件给我',
    href: 'mailto:sd_hws@sjtu.alumni.edu.cn',
    icon: <MailOutlined />,
    external: false,
  },
]

export function HomePage() {
  const { status, openLogin } = useAuth()

  return (
    <div className="flex flex-col gap-14 py-8">
      {/* Hero：左侧站点介绍，右侧跳转图标 */}
      <section className="flex flex-col items-center justify-between gap-10 sm:flex-row">
        <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="飞天小鹭" className="h-16 w-16 rounded-2xl sm:h-20 sm:w-20" />
            <h1 className="text-4xl font-bold text-fg">飞天小鹭</h1>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-fg-mute">
            轻量高效的在线工具集。一个账号，畅用全部工具；
            数据掌握在自己手中，专注思考本身。
          </p>
          {status === 'anonymous' && (
            <Button type="primary" size="large" onClick={openLogin}>
              立即开始
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <Tooltip key={link.key} title={link.label}>
              <a
                href={link.href}
                aria-label={link.label}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex h-13 w-13 items-center justify-center rounded-full border border-line-strong bg-surface-2 !text-xl !text-fg-mute transition-colors hover:border-accent-deep hover:bg-surface-3 hover:!text-accent"
              >
                {link.icon}
              </a>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* 作者寄语：内容来自 src/docs/author-message.md，直接编辑该文件即可 */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-fg">作者寄语</h2>
        <div className="doc-prose rounded-xl border border-line-strong bg-surface-1 px-6 py-1 sm:px-8">
          <Markdown remarkPlugins={[remarkGfm]}>{authorMessage}</Markdown>
        </div>
      </section>

      {/* 主功能区：各项目介绍与跳转 */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-fg">产品与工具</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) =>
            p.href ? (
              <a
                key={p.key}
                href={p.href}
                className="group flex flex-col gap-2 rounded-xl border border-line-strong bg-surface-2 p-5 transition-colors hover:border-accent-deep hover:bg-surface-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-fg group-hover:text-accent">{p.title}</span>
                  <ArrowRightOutlined className="!text-fg-faint transition-transform group-hover:translate-x-1 group-hover:!text-accent" />
                </div>
                <p className="text-sm leading-relaxed text-fg-mute">{p.description}</p>
              </a>
            ) : (
              <div
                key={p.key}
                className="flex flex-col gap-2 rounded-xl border border-dashed border-line bg-surface-1 p-5"
              >
                <span className="text-base font-semibold text-fg-faint">{p.title}</span>
                <p className="text-sm leading-relaxed text-fg-faint">{p.description}</p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  )
}
