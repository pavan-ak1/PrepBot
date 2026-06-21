import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => {
          if (path.startsWith('/api/v1/auth')) {
            return path.replace('/api', '/api')
          }
          if (path.startsWith('/api/v1/interview')) {
            return path.replace('/api', '/api')
          }
          if (path.startsWith('/api/v1/session')) {
            return path.replace('/api', '/api')
          }
          return path
        }
      }
    }
  }
})
