import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api requests to backend — eliminates CORS in dev
      '/api': {
        target: 'https://task-flow-seven-taupe.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
