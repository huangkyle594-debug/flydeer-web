import { useState } from 'react'
import { App, Button, Popconfirm, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { acceptDelegate, createDelegate, revokeDelegate } from '@/api/delegate'
import { ErrorCode, errorText, isApiError } from '@/lib/apiError'
import type { DelegateRelation, DelegateStatus, DelegateVO } from '@/types/api'

const STATUS_META: Record<DelegateStatus, { label: string; color: string }> = {
  PENDING: { label: '待接受', color: 'gold' },
  ACCEPTED: { label: '已生效', color: 'cyan' },
  REVOKE: { label: '已撤销', color: 'default' },
}

type Props = {
  relation: DelegateRelation
  list: DelegateVO[]
  loading: boolean
  onChanged: () => void
}

/**
 * 代理关系列表。对方 ID 取决于视角：
 * - DELEGATOR：我是代理人（row.delegatorId），对方 = delegatedId（被代理人）
 * - DELEGATED：我是被代理人（row.delegatedId），对方 = delegatorId（代理人）
 */
export function DelegateTable({ relation, list, loading, onChanged }: Props) {
  const { message } = App.useApp()
  // 行级操作 loading："<delegatorId>-<delegatedId>-<action>"
  const [actingKey, setActingKey] = useState<string | null>(null)

  const counterpartId = (row: DelegateVO) => (relation === 'DELEGATOR' ? row.delegatedId : row.delegatorId)
  const rowKey = (row: DelegateVO) => `${row.delegatorId}-${row.delegatedId}`

  const runAction = async (row: DelegateVO, action: string, fn: () => Promise<unknown>, successText: string) => {
    setActingKey(`${rowKey(row)}-${action}`)
    try {
      await fn()
      message.success(successText)
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.DELEGATE_NOT_FOUND) {
        // 并发变更：对方已先操作，提示后重拉
        message.warning('该授权状态已变化，已为你刷新列表')
      } else {
        message.error(errorText(err, '操作失败'))
      }
    } finally {
      setActingKey(null)
      onChanged()
    }
  }

  const renderActions = (row: DelegateVO) => {
    const other = counterpartId(row)
    const acting = (action: string) => actingKey === `${rowKey(row)}-${action}`

    if (relation === 'DELEGATOR') {
      // 我是代理人视角
      if (row.status === 'PENDING' || row.status === 'ACCEPTED') {
        return (
          <Popconfirm
            title={row.status === 'PENDING' ? '撤销此授权申请？' : '撤销此代理授权？'}
            okText="撤销"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => runAction(row, 'revoke', () => revokeDelegate(other, 'DELEGATOR'), '已撤销')}
          >
            <Button size="small" danger loading={acting('revoke')}>
              撤销
            </Button>
          </Popconfirm>
        )
      }
      // REVOKE：重新发起（后端将 REVOKE 重置为 PENDING）
      return (
        <Button
          size="small"
          loading={acting('recreate')}
          onClick={() => runAction(row, 'recreate', () => createDelegate(other), '已重新发起，等待对方接受')}
        >
          重新发起
        </Button>
      )
    }

    // DELEGATED：我是被代理人视角
    if (row.status === 'PENDING') {
      return (
        <span className="flex gap-2">
          <Popconfirm
            title={`接受用户 ${other} 的代理授权？`}
            description="接受后对方可代理管理你的授权服务"
            okText="接受"
            cancelText="取消"
            onConfirm={() => runAction(row, 'accept', () => acceptDelegate(other), '已接受授权')}
          >
            <Button size="small" type="primary" loading={acting('accept')}>
              接受
            </Button>
          </Popconfirm>
          <Popconfirm
            title="拒绝此授权申请？"
            okText="拒绝"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => runAction(row, 'reject', () => revokeDelegate(other, 'DELEGATED'), '已拒绝')}
          >
            <Button size="small" danger loading={acting('reject')}>
              拒绝
            </Button>
          </Popconfirm>
        </span>
      )
    }
    if (row.status === 'ACCEPTED') {
      return (
        <Popconfirm
          title="撤销此代理授权？"
          description="撤销后对方将无法再代理你"
          okText="撤销"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => runAction(row, 'revoke', () => revokeDelegate(other, 'DELEGATED'), '已撤销')}
        >
          <Button size="small" danger loading={acting('revoke')}>
            撤销
          </Button>
        </Popconfirm>
      )
    }
    return null
  }

  const columns: ColumnsType<DelegateVO> = [
    {
      title: relation === 'DELEGATOR' ? '被代理人 ID' : '代理人 ID',
      key: 'counterpart',
      render: (_, row) => <Typography.Text copyable>{String(counterpartId(row))}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: DelegateStatus) => <Tag color={STATUS_META[status].color}>{STATUS_META[status].label}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, row) => renderActions(row),
    },
  ]

  return (
    <Table<DelegateVO>
      rowKey={rowKey}
      columns={columns}
      dataSource={list}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: 560 }}
      locale={{ emptyText: relation === 'DELEGATOR' ? '暂无代理关系，点击右上角发起' : '暂无代理关系' }}
    />
  )
}
