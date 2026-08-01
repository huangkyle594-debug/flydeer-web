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

/** 静态文档注册表：md 经 Vite ?raw 打进 bundle，新增文档在此登记 */
export const DOCS: DocEntry[] = [
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
]

export function findDoc(slug: string | undefined): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug)
}
