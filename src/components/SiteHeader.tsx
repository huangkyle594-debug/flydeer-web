import { App, Avatar, Button, Dropdown, Layout, Tooltip } from 'antd'
import {
  CheckOutlined,
  GithubOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { GiteeOutlined } from '@/components/icons/GiteeOutlined'
import { showError } from '@/lib/apiError'

const NAV_ITEMS = [
  { to: '/', label: '首页' },
  { to: '/doc', label: '文档' },
]

/** 外部跳转：站外链接新开标签页，邮箱调起邮件 App */
const SOCIAL_LINKS = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/huangkyle594-debug',
    icon: <GithubOutlined />,
    external: true,
  },
  {
    key: 'gitee',
    label: 'Gitee',
    href: 'https://gitee.com/huangkyle594',
    icon: <GiteeOutlined />,
    external: true,
  },
  {
    key: 'email',
    label: '发邮件给我',
    href: 'mailto:sd_hws@sjtu.alumni.edu.cn',
    icon: <MailOutlined />,
    external: false,
  },
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
          <div className="ml-6 flex items-center gap-1.5">
            {SOCIAL_LINKS.map((link) => (
              <Tooltip key={link.key} title={link.label}>
                <a
                  href={link.href}
                  aria-label={link.label}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface-2 !text-sm !text-fg-mute transition-colors hover:border-accent-deep hover:bg-surface-3 hover:!text-accent"
                >
                  {link.icon}
                </a>
              </Tooltip>
            ))}
          </div>
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
            {/* 头像：蓝底白字首字符；右下绿色对号表示已实名（hover 显示「已实名」） */}
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
                  className="absolute -bottom-px -right-px z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-surface-1"
                >
                  <CheckOutlined className="!text-[8px] !text-white" />
                </span>
              )}
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
