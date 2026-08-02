import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: true,
    // 经 nginx 网关访问时，把 HMR websocket 指回网关端口
    ...(hmrClientPort
      ? {
          hmr: {
            host: process.env.VITE_HMR_HOST || 'localhost',
            clientPort: Number(hmrClientPort),
            protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
          },
        }
      : {}),
    proxy: {
      // 注意：不配置 rewrite —— refresh cookie 的 Path=/api/v1/auth 依赖路径原样透传
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
