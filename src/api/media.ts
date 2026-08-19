import type { ParseResult } from '../types'

const BASE = '/api'

/** 解析抖音 / 小红书分享链接 */
export async function parseMedia(url: string): Promise<ParseResult> {
  const res = await fetch(`${BASE}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) {
    throw new Error(data?.message || `解析失败（HTTP ${res.status}），请稍后重试`)
  }
  return data as ParseResult
}

/** 生成带代理的下载/预览链接 */
export function mediaUrl(url: string, opts: { inline?: boolean; filename?: string } = {}): string {
  const q = new URLSearchParams({ url })
  if (opts.inline) q.set('inline', '1')
  if (opts.filename) q.set('filename', opts.filename)
  return `${BASE}/download?${q.toString()}`
}

/** 触发浏览器下载 */
export function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = mediaUrl(url, { filename })
  a.rel = 'noopener'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** 连续下载多张图片 */
export async function downloadMany(urls: string[], title: string, delay = 650) {
  for (let i = 0; i < urls.length; i++) {
    triggerDownload(urls[i], `${title}-${String(i + 1).padStart(2, '0')}`)
    await new Promise((r) => setTimeout(r, delay))
  }
}
