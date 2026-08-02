import accessPermissions from '@/docs/access-permissions.md?raw'
import llmCopy from '@/docs/llm-copy.md?raw'
import userAgreement from '@/docs/user-agreement.md?raw'
import termsOfService from '@/docs/terms-of-service.md?raw'
import contact from '@/docs/contact.md?raw'
import complaint from '@/docs/complaint.md?raw'

export type DocEntry = {
  slug: string
  title: string
  summary: string
  content: string
}

export type DocCategory = {
  id: string
  title: string
  docs: DocEntry[]
}

/** 静态文档注册表：md 经 Vite ?raw 打进 bundle，新增文档在此登记 */
export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: 'overview',
    title: '网站概要',
    docs: [
      {
        slug: 'access-permissions',
        title: '用户登录态、实名状态对应的读写权限说明',
        summary: '匿名、已登录未实名、已实名三类状态可访问的读写能力对照。',
        content: accessPermissions,
      },
    ],
  },
  {
    id: 'struct-mind',
    title: '结构导图',
    docs: [
      {
        slug: 'llm-copy',
        title: '为 LLM 复制',
        summary: '供大模型复制使用的说明文档。',
        content: llmCopy,
      },
    ],
  },
  {
    id: 'legal-help',
    title: '协议、条款及帮助',
    docs: [
      {
        slug: 'user-agreement',
        title: '用户协议',
        summary: '注册与使用本网站服务前须知的权利义务约定。',
        content: userAgreement,
      },
      {
        slug: 'terms-of-service',
        title: '服务条款',
        summary: '服务内容、数据隐私、知识产权等条款说明。',
        content: termsOfService,
      },
      {
        slug: 'contact',
        title: '联系方式',
        summary: '问题反馈、建议与合作的联系渠道。',
        content: contact,
      },
      {
        slug: 'complaint',
        title: '投诉渠道',
        summary: '投诉方式、所需材料与处理流程。',
        content: complaint,
      },
    ],
  },
]

export const DOCS: DocEntry[] = DOC_CATEGORIES.flatMap((category) => category.docs)

export function findDoc(slug: string | undefined): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug)
}
