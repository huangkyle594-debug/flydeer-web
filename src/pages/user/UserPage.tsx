import { Button, Card, Spin } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/auth/AuthContext'
import { ProfileCard } from './ProfileCard'
import { DelegatePanel } from './delegate/DelegatePanel'
import { CancelAccountCard } from './CancelAccountCard'

/**
 * 账户管理页。登录守卫：未登录仅显示提示卡片，不跳转；
 * 登录成功后（context 变化）原地切换为内容态。
 */
export function UserPage() {
  const { status, openLogin } = useAuth()

  if (status === 'initializing') {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    )
  }

  if (status === 'anonymous') {
    return (
      <div className="flex justify-center py-16">
        <Card className="w-full max-w-md !border-line-strong text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <LockOutlined className="text-4xl !text-fg-faint" />
            <div className="text-base font-medium text-fg">登录后可管理账户信息与代理授权</div>
            <Button type="primary" onClick={openLogin}>
              立即登录
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-fg">账户管理</h1>
      <ProfileCard />
      <DelegatePanel />
      <CancelAccountCard />
    </div>
  )
}
