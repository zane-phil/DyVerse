/** 大数格式化：12000 -> 1.2w */
export function formatCount(n: number): string {
  if (!n) return '0'
  if (n >= 100000000) return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}亿`
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}w`
  return String(n)
}

/** 时长秒 -> mm:ss */
export function formatDuration(sec: number): string {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 时间戳 -> YYYY-MM-DD */
export function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 相对时间 */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts * 1000
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  if (diff < 86400_000 * 30) return `${Math.floor(diff / 86_400_000)} 天前`
  return formatDate(ts)
}

/** 文件名安全化 */
export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
}
