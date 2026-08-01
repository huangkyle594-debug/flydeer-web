import { Button, Result } from 'antd'
import { Route, Routes, Link } from 'react-router'
import { PageLayout } from '@/components/PageLayout'
import { HomePage } from '@/pages/home/HomePage'
import { UserPage } from '@/pages/user/UserPage'
import { DocListPage } from '@/pages/doc/DocListPage'
import { DocDetailPage } from '@/pages/doc/DocDetailPage'
import { OauthCallbackPage } from '@/pages/oauth/OauthCallbackPage'

function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={
        <Link to="/">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* OAuth 回调独立页，不套布局 */}
      <Route path="/oauth/callback" element={<OauthCallbackPage />} />
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/doc" element={<DocListPage />} />
        <Route path="/doc/:slug" element={<DocDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
