import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()], // This is the magic line that tells Vite how to handle .vue files
  resolve: {
    alias: {
      // This matches the "@/" alias we set in tsconfig.json
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  }
})