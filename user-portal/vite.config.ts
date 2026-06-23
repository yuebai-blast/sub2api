import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 开发时把 /api/v1 反向代理到后端；后端地址可用 VITE_BACKEND_ORIGIN 覆盖
const BACKEND_ORIGIN = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true
      }
    }
  }
})
