import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router'
import { SiteNoticeBanner } from './SiteNoticeBanner'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function PageLayout() {
  const { pathname } = useLocation()
  const showFooter = pathname === '/'

  return (
    <Layout className="min-h-screen">
      <div className="sticky top-0 z-10">
        <SiteHeader />
        <SiteNoticeBanner />
      </div>
      <Layout.Content
        className={`mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 ${pathname === '/' ? 'py-0' : 'py-8'}`}
      >
        <Outlet />
      </Layout.Content>
      {showFooter ? <SiteFooter /> : null}
    </Layout>
  )
}
