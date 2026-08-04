import { useState } from 'react'
import { App, Button, Card } from 'antd'
import { useAuth } from '@/auth/AuthContext'
import { showError } from '@/lib/apiError'

/** 危险操作：注销当前账号 */
export function CancelAccountCard() {
  const { modal, message } = App.useApp()
  const { cancelAccount } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    modal.confirm({
      title: '确认注销账号？',
      content:
        '注销将永久删除账号，同渠道身份可重新注册；相关代理关系会被清理。此操作不可撤销。',
      okText: '确认注销',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        setLoading(true)
        try {
          await cancelAccount()
          message.success('账号已注销')
        } catch (err) {
          showError(err, '注销失败，请稍后重试')
          throw err
        } finally {
          setLoading(false)
        }
      },
    })
  }

  return (
    <Card title="注销账号" className="!border-line-strong">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm text-fg-faint">
          注销后账号将被永久删除，本地登录状态同步清除。同渠道身份之后可重新注册。
        </p>
        <Button danger loading={loading} onClick={handleClick}>
          注销账号
        </Button>
      </div>
    </Card>
  )
}
