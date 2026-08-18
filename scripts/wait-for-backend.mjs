import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT_FILE = path.join(root, '.dyverse-port.json')
const TIMEOUT_MS = 30_000

const startedAt = Date.now()
const deadline = Date.now() + TIMEOUT_MS
while (Date.now() < deadline) {
  try {
    const stat = fs.statSync(PORT_FILE)
    // 只接受本次启动后端新写入的端口文件，避免读到旧记录
    const fresh = stat.mtimeMs >= startedAt - 1000
    if (fresh) {
      const { port } = JSON.parse(fs.readFileSync(PORT_FILE, 'utf8'))
      if (!port) continue
      try {
        const res = await fetch(`http://localhost:${port}/`, {
          signal: AbortSignal.timeout(800),
        })
        if (res.status) {
          console.log(`[wait] backend ready at http://localhost:${port}`)
          process.exit(0)
        }
      } catch {
        /* 端口文件已写入但服务尚未就绪，继续等待 */
      }
    }
  } catch {
    /* 端口文件尚未写入 */
  }
  await new Promise((resolve) => setTimeout(resolve, 200))
}

console.error('[wait] 等待后端启动超时（30s）。请先运行 npm run server，或直接使用 npm run dev:all 同时启动前后端。')
process.exit(1)
