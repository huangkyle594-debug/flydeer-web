/**
 * accessToken 唯一真源：localStorage + 内存 + 变更订阅。
 * axios 拦截器（非 React 世界）与 AuthContext（React 世界）经由此解耦：
 * 拦截器刷新成功 set / 刷新失败 clear，AuthContext 订阅变更同步 UI 态。
 */
const STORAGE_KEY = 'fd_access_token'

type Listener = (token: string | null) => void

let current: string | null = readStorage()
const listeners = new Set<Listener>()

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function notify() {
  for (const fn of listeners) fn(current)
}

export const tokenStore = {
  get(): string | null {
    return current
  },
  set(token: string) {
    current = token
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      /* 隐私模式等场景忽略，内存态仍可用 */
    }
    notify()
  },
  clear() {
    if (current === null) return
    current = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    notify()
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
