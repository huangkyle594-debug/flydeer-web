import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'

/**
 * 注册式 message/modal 引用。
 * App.useApp() 拿到的实例由 AppApiRegister 组件注册到这里，
 * 供 http.ts 等非组件模块弹提示（保持主题一致 + React 19 兼容）。
 */
type AppApis = {
  message: MessageInstance
  modal: Omit<ModalStaticFunctions, 'warn'>
  notification: NotificationInstance
}

let apis: AppApis | null = null

export function registerAppApis(next: AppApis) {
  apis = next
}

export function getMessage(): MessageInstance | null {
  return apis?.message ?? null
}

export function getModal() {
  return apis?.modal ?? null
}
