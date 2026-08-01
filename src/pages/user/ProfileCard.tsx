import { useState } from 'react'
import { Button, Card, Descriptions, Tag, Tooltip, Typography } from 'antd'
import { EditOutlined, GithubOutlined, MobileOutlined } from '@ant-design/icons'
import { useAuth } from '@/auth/AuthContext'
import { GiteeOutlined } from '@/components/icons/GiteeOutlined'
import type { LoginChannel } from '@/types/api'
import { EditNameModal } from './EditNameModal'
import { BindPhoneModal } from './BindPhoneModal'

const CHANNEL_META: Record<LoginChannel, { label: string; icon?: React.ReactNode; color: string }> = {
  PHONE: { label: '手机号', icon: <MobileOutlined />, color: 'cyan' },
  GITEE: { label: 'Gitee', icon: <GiteeOutlined />, color: 'red' },
  GITHUB: { label: 'GitHub', icon: <GithubOutlined />, color: 'geekblue' },
}

export function ProfileCard() {
  const { user } = useAuth()
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [bindPhoneOpen, setBindPhoneOpen] = useState(false)

  if (!user) return null

  const channel = CHANNEL_META[user.channel]
  // 仅 OAuth 渠道且未实名的用户展示绑手机入口（PHONE 渠道后端会拒绝，前端直接关门）
  const canBindPhone = user.channel !== 'PHONE' && !user.verified

  return (
    <Card title="基本信息" className="!border-line-strong">
      <Descriptions column={{ xs: 1, sm: 2 }} colon={false} labelStyle={{ width: 96 }}>
        <Descriptions.Item label="用户 ID">
          <Tooltip title="将此 ID 提供给对方以建立代理授权">
            <Typography.Text copyable>{String(user.userId)}</Typography.Text>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="昵称">
          <span className="flex items-center gap-2">
            {user.name}
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditNameOpen(true)}
              aria-label="修改昵称"
            />
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="登录方式">
          <Tag icon={channel.icon} color={channel.color}>
            {channel.label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="实名状态">
          {user.verified ? (
            <Tag color="success">已实名</Tag>
          ) : (
            <span className="flex items-center gap-2">
              <Tag color="warning">未实名</Tag>
              {canBindPhone && (
                <Button type="link" size="small" onClick={() => setBindPhoneOpen(true)}>
                  绑定手机号完成实名
                </Button>
              )}
            </span>
          )}
        </Descriptions.Item>
        {user.phone && <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>}
      </Descriptions>

      <EditNameModal open={editNameOpen} onClose={() => setEditNameOpen(false)} />
      {canBindPhone && <BindPhoneModal open={bindPhoneOpen} onClose={() => setBindPhoneOpen(false)} />}
    </Card>
  )
}
