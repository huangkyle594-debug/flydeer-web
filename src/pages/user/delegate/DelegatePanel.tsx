import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Select, Tabs } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { queryDelegates } from '@/api/delegate'
import { showError } from '@/lib/apiError'
import type { DelegateRelation, DelegateStatus, DelegateVO } from '@/types/api'
import { DelegateTable } from './DelegateTable'
import { CreateDelegateModal } from './CreateDelegateModal'

const STATUS_OPTIONS: { value: DelegateStatus; label: string }[] = [
  { value: 'PENDING', label: '待接受' },
  { value: 'ACCEPTED', label: '已生效' },
  { value: 'REVOKE', label: '已撤销' },
]

/**
 * 代理授权管理：
 * - DELEGATOR 我代理的（我是代理人），可发起、撤销、重新发起
 * - DELEGATED 代理我的（我是被代理人），可接受、拒绝、撤销
 */
export function DelegatePanel() {
  const [relation, setRelation] = useState<DelegateRelation>('DELEGATOR')
  const [statusFilter, setStatusFilter] = useState<DelegateStatus[]>([])
  const [list, setList] = useState<DelegateVO[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await queryDelegates(relation, statusFilter)
      setList(data ?? [])
    } catch (err) {
      showError(err, '加载代理关系失败')
    } finally {
      setLoading(false)
    }
  }, [relation, statusFilter])

  useEffect(() => {
    void reload()
  }, [reload])

  return (
    <Card title="代理授权管理" className="!border-line-strong">
      <Tabs
        activeKey={relation}
        onChange={(key) => setRelation(key as DelegateRelation)}
        items={[
          { key: 'DELEGATOR', label: '我代理的' },
          { key: 'DELEGATED', label: '代理我的' },
        ]}
        tabBarExtraContent={
          <div className="flex items-center gap-2">
            <Select
              mode="multiple"
              allowClear
              placeholder="全部状态"
              className="min-w-40"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              maxTagCount="responsive"
            />
            <Button icon={<ReloadOutlined />} onClick={reload} aria-label="刷新" />
            {relation === 'DELEGATOR' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                发起代理
              </Button>
            )}
          </div>
        }
      />
      <DelegateTable relation={relation} list={list} loading={loading} onChanged={reload} />
      <CreateDelegateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void reload()
        }}
      />
    </Card>
  )
}
