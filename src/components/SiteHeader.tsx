import { App, Avatar, Button, Dropdown, Layout } from 'antd'
import { CaretDownFilled, CheckOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { showError } from '@/lib/apiError'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/doc', label: '文档' },
]

export function SiteHeader() {
  const { status, user, openLogin, logout } = useAuth()
  const { message } = App.useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      message.success('已退出登录')
    } catch (err) {
      showError(err, '退出登录失败')
    }
  }

  return (
    <Layout.Header className="sticky top-0 z-10 flex items-center justify-between border-b border-line !px-4 sm:!px-6">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="飞天小鹭" className="h-8 w-8 rounded" />
          <span className="text-lg font-semibold text-fg">飞天小鹭</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive ? 'bg-surface-3 text-accent' : 'text-fg-mute hover:bg-surface-2 hover:text-fg'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center">
        {status === 'authenticated' && user ? (
          <Dropdown
            menu={{
              items: [
                {
                  type: 'group',
                  label: user.name,
                  children: [
                    {
                      key: 'account',
                      icon: <UserOutlined />,
                      label: '账户管理',
                      onClick: () => navigate('/user'),
                    },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: handleLogout,
                    },
                  ],
                },
              ],
            }}
          >
            {/* 头像：蓝底白字首字符；右下角标提示可展开菜单，左下角绿色对号表示已实名 */}
            <button
              type="button"
              aria-label={`${user.name} 的账户菜单`}
              className="relative inline-flex cursor-pointer rounded-full border-0 bg-transparent p-0"
            >
              <Avatar size={36} className="!bg-accent-deep !text-white select-none">
                {(Array.from(user.name.trim())[0] ?? '?').toUpperCase()}
              </Avatar>
              {user.verified && (
                <span
                  title="已实名"
                  className="absolute -bottom-px -left-px z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-surface-1"
                >
                  <CheckOutlined className="!text-[8px] !text-white" />
                </span>
              )}
              <span className="absolute -bottom-px -right-px z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-surface-3 ring-2 ring-surface-1">
                <CaretDownFilled className="!text-[8px] !text-fg-mute" />
              </span>
            </button>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={openLogin} disabled={status === 'initializing'}>
            登录
          </Button>
        )}
      </div>
    </Layout.Header>
  )
}
