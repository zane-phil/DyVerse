/**
 * DyVerse · 抖音解析 / 下载代理服务
 * - POST /api/parse   解析分享链接 -> 作品信息（无水印直链等）
 * - GET  /api/download 代理中转下载（解决跨域与防盗链）
 * - 生产模式下同时托管 dist 静态资源
 */
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

/* ---------------- constants ---------------- */
const UA_PC =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

let cookieJar = ''

function mergeCookies(res) {
  try {
    const setCookies = res.headers.getSetCookie?.() || []
    for (const c of setCookies) {
      const pair = c.split(';')[0]
      if (pair && pair.includes('=') && !cookieJar.includes(`${pair.split('=')[0]}=`)) {
        cookieJar = cookieJar ? `${cookieJar}; ${pair}` : pair
      }
    }
  } catch {
    /* noop */
  }
}

async function fetchPage(url, { ua = UA_PC, referer = 'https://www.douyin.com/' } = {}) {
  const headers = {
    'User-Agent': ua,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.5',
    Referer: referer,
  }
  if (cookieJar) headers.Cookie = cookieJar
  const res = await fetch(url, { headers, redirect: 'follow' })
  mergeCookies(res)
  return res
}

/* ---------------- url helpers ---------------- */
const DOUYIN_RE = /https?:\/\/(?:v\.douyin\.com|www\.douyin\.com|www\.iesdouyin\.com|iesdouyin\.com)[^\s"'<>，。；;）)]*/gi

function extractDouyinUrl(text) {
  const m = String(text || '').match(DOUYIN_RE)
  return m ? m[0].trim() : ''
}

function extractAwemeId(url) {
  const patterns = [
    /(?:video|note|slides|share\/(?:video|note))\/(\d{5,})/i,
    /modal_id=(\d{5,})/,
    /aweme_id=(\d{5,})/,
    /item_ids=(\d{5,})/,
    /(\d{15,})/,
  ]
  for (const re of patterns) {
    const m = String(url).match(re)
    if (m) return m[1]
  }
  return ''
}

async function resolveShortUrl(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': UA_MOBILE,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    mergeCookies(res)
    return res.url || url
  } catch {
    return url
  }
}

function normalizePlay(url) {
  if (!url) return ''
  return String(url)
    .replace(/\\u002F/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&')
}

function decodeHtml(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\n/g, ' ')
    .trim()
}

/* ---------------- page / json parsing ---------------- */
async function fetchDetailHtml(id) {
  const paths = [
    { url: `https://www.iesdouyin.com/share/video/${id}`, ua: UA_MOBILE },
    { url: `https://www.iesdouyin.com/share/note/${id}`, ua: UA_MOBILE },
    { url: `https://www.douyin.com/video/${id}`, ua: UA_PC },
    { url: `https://www.douyin.com/note/${id}`, ua: UA_PC },
  ]
  for (const p of paths) {
    try {
      const res = await fetchPage(p.url, { ua: p.ua })
      if (res.ok) {
        const html = await res.text()
        if (html && html.length > 1500) return html
      }
    } catch {
      /* try next */
    }
  }
  return ''
}

function extractJsonBlob(html) {
  const m1 = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/,
  )
  if (m1) {
    try {
      return JSON.parse(m1[1])
    } catch {
      /* continue */
    }
  }
  const m2 = html.match(/<script id="RENDER_DATA" type="application\/json">([\s\S]*?)<\/script>/)
  if (m2) {
    try {
      return JSON.parse(decodeURIComponent(m2[1]))
    } catch {
      /* continue */
    }
  }
  const m3 = html.match(/window\._ROUTER_DATA\s*=\s*(\{[\s\S]*\})\s*<\/script>/)
  if (m3) {
    try {
      return JSON.parse(m3[1])
    } catch {
      /* continue */
    }
  }
  return null
}

function findAweme(data) {
  let found = null
  const walk = (node) => {
    if (!node || typeof node !== 'object' || found) return
    if (Array.isArray(node)) {
      for (const x of node) walk(x)
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (!value || typeof value !== 'object') continue
      if (key === 'item_list' && Array.isArray(value)) {
        for (const it of value) {
          if (it && it.aweme_id) {
            found = it
            return
          }
        }
      } else if (
        (key === 'awemeDetail' || key === 'aweme_detail' || key === 'detail' || key === 'aweme') &&
        value.aweme_id
      ) {
        found = value
        return
      }
      walk(value)
    }
  }
  walk(data)
  return found
}

/* ---------------- aweme -> media ---------------- */
function firstUrl(urlList) {
  if (!Array.isArray(urlList)) return ''
  for (const u of urlList) {
    if (typeof u === 'string') return u
    if (u && typeof u === 'object') {
      const nested = firstUrl(u.url_list) || u.url || ''
      if (nested) return nested
    }
  }
  return ''
}

function mapAweme(aweme) {
  const video = aweme.video || {}
  const author = aweme.author || {}
  const stats = aweme.statistics || {}
  const images = Array.isArray(aweme.images) ? aweme.images : []
  const imageInfos = Array.isArray(aweme.image_infos) ? aweme.image_infos : []
  const isImage = images.length > 0 || imageInfos.length > 0

  const playList = (video.play_addr && video.play_addr.url_list) || []
  const downloadList = (video.download_addr && video.download_addr.url_list) || []
  const playRaw = firstUrl(playList) || firstUrl(downloadList) || ''
  const playUrl = normalizePlay(playRaw)

  // 图片/图文作品的 play_addr 可能是无效地址（video_id 为完整 URL），直接置空
  const hasBadVideoId = /video_id=https?:\/\//i.test(playUrl)
  // 无水印：playwm -> play；带水印：play -> playwm
  const noWm = hasBadVideoId ? '' : playUrl.replace(/playwm/gi, 'play')
  const wm = hasBadVideoId ? '' : playUrl.includes('playwm') ? playUrl : playUrl.replace(/\/play(\/|\?)/, '/playwm$1')

  const videoUriRaw =
    (video.play_addr && video.play_addr.uri) ||
    (String(playUrl).match(/video_id=([^&]+)/) || [])[1] ||
    ''
  const videoUri = /^[A-Za-z0-9_-]+$/.test(videoUriRaw) ? videoUriRaw : ''
  const fallbackPlay = videoUri
    ? `https://www.douyin.com/aweme/v1/play/?video_id=${videoUri}&ratio=1080p&line=0`
    : aweme.aweme_id
      ? `https://www.douyin.com/aweme/v1/play/?video_id=${aweme.aweme_id}&ratio=1080p&line=0`
      : ''

  const sourceImages = images.length ? images : imageInfos
  const imageUrls = sourceImages
    .map((img) => normalizePlay(firstUrl(img.url_list) || firstUrl(img.download_url_list) || ''))
    .filter(Boolean)

  const coverSource =
    firstUrl(video.cover?.url_list) ||
    firstUrl(video.origin_cover?.url_list) ||
    (sourceImages[0] ? firstUrl(sourceImages[0].url_list) : '') ||
    ''

  return {
    type: isImage ? 'image' : 'video',
    id: String(aweme.aweme_id || ''),
    title: decodeHtml(aweme.desc || aweme.title || (aweme.seo_info && aweme.seo_info.desc) || ''),
    author: {
      nickname: decodeHtml(author.nickname || '未知作者'),
      avatar: normalizePlay(firstUrl(author.avatar_thumb?.url_list) || firstUrl(author.avatar_medium?.url_list) || ''),
      uniqueId: author.unique_id || author.short_id || '',
      signature: decodeHtml(author.signature || ''),
    },
    cover: normalizePlay(coverSource),
    videoUrl: isImage ? '' : noWm || fallbackPlay,
    videoUrlWatermark: isImage ? '' : wm || '',
    images: imageUrls,
    duration: video.duration ? Math.round(video.duration / 1000) : 0,
    createTime: aweme.create_time || 0,
    statistics: {
      digg: stats.digg_count || 0,
      comment: stats.comment_count || 0,
      share: stats.share_count || 0,
      collect: stats.collect_count || 0,
    },
    music: aweme.music
      ? `${decodeHtml(aweme.music.title || '')}${aweme.music.author ? ' - ' + decodeHtml(aweme.music.author) : ''}`.trim()
      : '',
    width: video.width || 0,
    height: video.height || 0,
  }
}

function metaFallback(html, id) {
  const title =
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)?.[1] ||
    html.match(/<meta[^>]+name="title"[^>]+content="([^"]*)"/i)?.[1] ||
    ''
  const cover = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i)?.[1] || ''
  const playRaw =
    html.match(
      /https:\\u002F\\u002F[^"\\]+(?:aweme\\u002Fv1\\u002Fplay[^"\\]*|douyinvod[^"\\]*\.mp4[^"\\]*)/,
    )?.[0] || ''
  const play = normalizePlay(playRaw)
  return {
    type: 'video',
    id: String(id),
    title: decodeHtml(title),
    author: { nickname: '未知作者', avatar: '', uniqueId: '', signature: '' },
    cover: normalizePlay(cover),
    videoUrl: play || `https://www.douyin.com/aweme/v1/play/?video_id=${id}&ratio=1080p&line=0`,
    videoUrlWatermark: (play || `https://www.douyin.com/aweme/v1/play/?video_id=${id}&ratio=1080p&line=0`).replace(
      '/aweme/v1/play/',
      '/aweme/v1/playwm/',
    ),
    images: [],
    duration: 0,
    createTime: 0,
    statistics: { digg: 0, comment: 0, share: 0, collect: 0 },
    music: '',
    width: 0,
    height: 0,
  }
}

async function tryIesApi(id) {
  try {
    const res = await fetchPage(`https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${id}`, {
      ua: UA_MOBILE,
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const item = data && data.item_list && data.item_list[0]
    return item && item.aweme_id ? mapAweme(item) : null
  } catch {
    return null
  }
}

/* ---------------- routes ---------------- */
app.post('/api/parse', async (req, res) => {
  try {
    const source = extractDouyinUrl(req.body && req.body.url)
    if (!source) {
      return res.status(400).json({ message: '未识别到抖音链接，请粘贴完整的分享链接或口令' })
    }

    let resolvedUrl = source
    try {
      if (/v\.douyin\.com|iesdouyin\.com\/share/i.test(source)) {
        resolvedUrl = await resolveShortUrl(source)
      }
    } catch {
      /* keep source */
    }

    const id = extractAwemeId(resolvedUrl)
    if (!id) {
      return res.status(400).json({ message: '未能从链接中提取作品 ID，请确认链接完整' })
    }

    let item = null
    try {
      const html = await fetchDetailHtml(id)
      if (html) {
        const blob = extractJsonBlob(html)
        const aweme = blob ? findAweme(blob) : null
        if (aweme) item = mapAweme(aweme)
        if (!item) item = metaFallback(html, id)
      }
    } catch {
      /* fallthrough */
    }

    if (!item || (!item.videoUrl && !item.images.length)) {
      const apiItem = await tryIesApi(id)
      if (apiItem) item = apiItem
    }

    if (!item) {
      return res.json({
        sourceUrl: source,
        resolvedUrl,
        item: null,
        message: '已访问原链接，但未能提取到媒体信息（抖音页面结构可能已更新，可稍后再试）',
      })
    }

    res.json({ sourceUrl: source, resolvedUrl, item })
  } catch (e) {
    console.error('[parse error]', e)
    res.status(500).json({ message: '解析服务异常，请稍后重试' })
  }
})

app.get('/api/download', async (req, res) => {
  const url = String(req.query.url || '')
  const inline = req.query.inline === '1'
  const filename = String(req.query.filename || 'douyin-media').replace(/[\\/:*?"<>|]/g, '_')

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ message: '非法的资源地址' })
  }

  let upstream = null
  const attempts = [
    { 'User-Agent': UA_PC, Referer: 'https://www.douyin.com/', Accept: '*/*' },
    { 'User-Agent': UA_MOBILE, Referer: 'https://www.douyin.com/', Accept: '*/*' },
  ]
  for (const headers of attempts) {
    if (cookieJar) headers.Cookie = cookieJar
    try {
      upstream = await fetch(url, { headers, redirect: 'follow' })
      if (upstream.ok) break
    } catch {
      upstream = null
    }
  }

  if (!upstream || !upstream.ok) {
    const code = upstream ? upstream.status : 502
    return res.status(code >= 500 ? 502 : code).json({ message: `资源获取失败（HTTP ${code}），链接可能已失效` })
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
  let ext = ''
  if (/image\/webp/i.test(contentType)) ext = '.webp'
  else if (/image\/png/i.test(contentType)) ext = '.png'
  else if (/image\/gif/i.test(contentType)) ext = '.gif'
  else if (/image\/avif/i.test(contentType)) ext = '.avif'
  else if (/image\/(jpeg|jpg)/i.test(contentType)) ext = '.jpg'
  else if (/image/i.test(contentType)) ext = '.jpg'
  else if (/video|mp4/i.test(contentType)) ext = '.mp4'
  else if (/audio|m4a/i.test(contentType)) ext = '.m4a'
  const finalName = `${filename}${ext}`
  const disposition = inline ? 'inline' : 'attachment'

  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(finalName)}`)
  const len = upstream.headers.get('content-length')
  if (len) res.setHeader('Content-Length', len)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Dyverse', 'proxy')

  try {
    if (upstream.body) {
      for await (const chunk of upstream.body) res.write(chunk)
    }
    res.end()
  } catch {
    res.end()
  }
})

/* ---------------- static (production) ---------------- */
const dist = path.resolve(__dirname, '../dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')))
} else {
  app.get('/', (req, res) => {
    res.type('text/plain').send('DyVerse API 已运行。请先执行 npm run build 构建前端，或使用 npm run dev:all 启动开发模式。')
  })
}

app.use((req, res) => res.status(404).json({ message: 'Not Found' }))

// JSON 解析等错误的统一 JSON 响应
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: '请求体不是合法 JSON' })
  }
  console.error('[server error]', err)
  res.status(500).json({ message: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`[DyVerse] server listening on http://localhost:${PORT}`)
})
