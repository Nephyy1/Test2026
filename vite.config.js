import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Penting untuk Vercel
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: true // Agar bisa dibuka di HP saat mode dev (npm run dev)
  }
})
