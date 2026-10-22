import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite yapılandırması - React uygulamasını derlemek için
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Frontend'in çalışacağı port (5173 yerine 5174)
    proxy: {
      // API isteklerini backend'e yönlendir
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
