import { apiGet } from '@/lib/http'
import type { AxiosRequestConfig } from 'axios'

/** 网站通知文案；未配置时可能为 null 或空串。无需登录。 */
export function getNotice(config?: AxiosRequestConfig): Promise<string | null> {
  return apiGet<string | null>('/api/v1/common/notice', config)
}
