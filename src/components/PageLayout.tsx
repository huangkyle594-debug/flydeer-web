import { Layout } from 'antd'
import { Outlet } from 'react-router'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function PageLayout() {
  return (
    <Layout className="min-h-screen">
      <SiteHeader />
      <Layout.Content className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </Layout.Content>
      <SiteFooter />
    </Layout>
  )
}
