import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/~s505996/web-storage-benchmark/',
  plugins: [react()],
})
