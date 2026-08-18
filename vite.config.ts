import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT_FILE = path.join(__dirname, '.dyverse-port.json')

/** 读取后端实际端口（后端启动时写入），未就绪时回退到默认端口 */
function backendTarget() {
  try {
    const data = JSON.parse(fs.readFileSync(PORT_FILE, 'utf8'))
    if (data && data.port) return `http://localhost:${data.port}`
  } catch {
    /* 后端尚未写入端口文件 */
  }
  return 'http://localhost:8787'
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: false, // 端口被占用时自动 +1
    host: true,
    proxy: {
      '/api': {
        target: backendTarget(),
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('tdesign-vue-next')) return 'tdesign'
          if (id.includes('node_modules/vue')) return 'vue'
        },
      },
    },
  },
})
