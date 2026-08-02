import { ArrowRightOutlined } from '@ant-design/icons'
import { HomeHero } from './HomeHero'

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

const SECTION_TITLE_CLASS = 'mb-6 text-xl font-semibold text-fg'

export function HomePage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <HomeHero />

      <section>
        <h2 className={SECTION_TITLE_CLASS}>产品与工具</h2>
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
