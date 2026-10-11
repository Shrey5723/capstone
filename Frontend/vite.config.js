import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: {
      origin: /^https?:\/\/(?:.+\.)?localhost(?::\d+)?$/
    },
    proxy: {
      '/api/sandbox': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
      '/api/ai': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
