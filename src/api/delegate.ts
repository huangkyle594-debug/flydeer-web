import { apiPost } from '@/lib/http'
import type { DelegateRelation, DelegateStatus, DelegateVO } from '@/types/api'

/**
 * 查询代理关系。
 * relation 必填；status 省略或空数组 = 不过滤状态。
 */
export function queryDelegates(relation: DelegateRelation, status?: DelegateStatus[]): Promise<DelegateVO[]> {
  return apiPost<DelegateVO[]>('/api/v1/user/delegate/query', {
    relation,
    ...(status && status.length > 0 ? { status } : {}),
  })
}

/**
 * 发起代理：当前用户（代理人）向 delegatedId（被代理人）发起。
 * 已存在 PENDING/ACCEPTED 幂等；REVOKE 会重置为 PENDING。
 */
export function createDelegate(delegatedId: number): Promise<null> {
  return apiPost<null>('/api/v1/user/delegate/create', { operateId: delegatedId })
}

/**
 * 接受代理：当前用户作为被代理人，接受 delegatorId（发起方/代理人）的 PENDING 关系。
 * 注意 operateId 是发起方 ID，不是自己。
 */
export function acceptDelegate(delegatorId: number): Promise<null> {
  return apiPost<null>('/api/v1/user/delegate/accept', { operateId: delegatorId })
}

/**
 * 撤销代理（PENDING/ACCEPTED → REVOKE）。
 * relation 解释 counterpartUserId 是谁：
 * - DELEGATOR：我是代理人撤销，operateId=被代理人 ID
 * - DELEGATED：我是被代理人撤销/拒绝，operateId=代理人 ID
 */
export function revokeDelegate(counterpartUserId: number, relation: DelegateRelation): Promise<null> {
  return apiPost<null>('/api/v1/user/delegate/revoke', { operateId: counterpartUserId, relation })
}
