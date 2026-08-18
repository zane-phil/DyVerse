import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT_FILE = path.join(__dirname, '.dyverse-port.json')

/**
 * 局域网 HTTPS（iPhone 一键直存相册需要安全上下文）：
 * 若 server/certs/lan.pem 与 lan-key.pem 存在（生成方式见 README 4.6），
 * 开发服务器自动以 https://<局域网IP>:5173 启动；不存在时维持纯 http。
 */
function httpsOptions() {
  const cert = path.join(__dirname, 'server/certs/lan.pem')
  const key = path.join(__dirname, 'server/certs/lan-key.pem')
  if (fs.existsSync(cert) && fs.existsSync(key)) {
    return { cert: fs.readFileSync(cert), key: fs.readFileSync(key) }
  }
  return undefined
}

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
    https: httpsOptions(), // server/certs 存在证书时以 HTTPS 启动（iPhone 直存相册需要）
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
