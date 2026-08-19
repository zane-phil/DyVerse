/** 相对时间 */
export function timeAgo(ts: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts * 1000
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  if (diff < 86400_000 * 30) return `${Math.floor(diff / 86_400_000)} 天前`
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 时长 mm:ss（超过 1 小时显示 h:mm:ss） */
export function formatDuration(sec: number): string {
  if (!sec || sec <= 0) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 大数缩写：1.2万 / 3.4亿 */
export function formatCount(n: number): string {
  if (!n || n <= 0) return '0'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}亿`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}万`
  return String(n)
}

/** 文件名安全化 */
export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
}
