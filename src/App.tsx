import { App as AntdApp, ConfigProvider } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter } from 'react-router'
import { antdTheme } from './theme/antdTheme'
import { AuthProvider } from './auth/AuthContext'
import { AppRoutes } from './router'
import { registerAppApis } from './lib/message'

/** 把 App.useApp() 的 message/modal 实例注册给非组件模块（http.ts 等） */
function AppApiRegister() {
  const apis = AntdApp.useApp()
  registerAppApis(apis)
  return null
}

export default function App() {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={antdTheme} locale={zhCN}>
        <AntdApp>
          <AppApiRegister />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  )
}
