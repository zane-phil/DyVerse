// 一次性验证脚本：复制自 server/index.mjs 的 xhs 纯函数逻辑
function normalizeXhsUrl(u) {
  if (!u) return ''
  return String(u).replace(/\\u002F/gi, '/').replace(/^http:\/\//i, 'https://').trim()
}
function pickXhsImage(img) {
  if (!img) return ''
  const candidates = []
  if (img.urlDefault) candidates.push(img.urlDefault)
  const list = Array.isArray(img.infoList) ? img.infoList : []
  let best = null
  for (const it of list) {
    if (!it || !it.url) continue
    const area = (it.width || 0) * (it.height || 0)
    if (!best || area > (best.width || 0) * (best.height || 0)) best = it
  }
  if (best && best.url) candidates.push(best.url)
  if (img.url) candidates.push(img.url)
  for (const c of candidates) {
    const u = normalizeXhsUrl(c)
    if (u) return u
  }
  return ''
}
function mapXhsNote(note) {
  const user = note.user || {}
  const interact = note.interactInfo || {}
  const video = note.video || {}
  const h264 =
    (video.media && video.media.stream && Array.isArray(video.media.stream.h264) && video.media.stream.h264) || []
  const bestStream = h264[h264.length - 1] || {}
  const videoUrl = normalizeXhsUrl(
    bestStream.masterUrl || (bestStream.backupUrls && bestStream.backupUrls[0]) || '',
  )
  const images = (Array.isArray(note.imageList) ? note.imageList : []).map(pickXhsImage).filter(Boolean)
  const isImage = !videoUrl && images.length > 0
  const cover = normalizeXhsUrl((video.cover && video.cover.url) || '') || (images.length ? images[0] : '')
  return {
    platform: 'xiaohongshu',
    type: isImage ? 'image' : 'video',
    id: String(note.noteId || note.id || ''),
    title: (note.title || note.desc || '').replace(/&amp;/g, '&').trim(),
    author: {
      nickname: user.nickname || '未知作者',
      avatar: normalizeXhsUrl(user.avatar || ''),
      uniqueId: String(user.userId || ''),
      signature: user.desc || '',
    },
    cover,
    videoUrl,
    videoUrlWatermark: '',
    images,
    duration: video.media && video.media.duration ? Math.round(video.media.duration) : 0,
    createTime: note.time || 0,
    statistics: {
      digg: interact.likedCount || 0,
      comment: interact.commentCount || 0,
      share: interact.shareCount || 0,
      collect: interact.collectedCount || 0,
    },
    music: '',
    width: bestStream.width || 0,
    height: bestStream.height || 0,
  }
}
function extractXhsInitialState(html) {
  const m = String(html).match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\})\s*<\/script>/)
  if (!m) return null
  try {
    const json = m[1].replace(/([,:{]\s*)undefined(?=\s*[,}])/g, '$1null')
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ---------- 合成图文笔记 ----------
const imgNote = {
  noteId: '66f0a1b2c3d4e5f6a7b8c9d0',
  title: '',
  desc: '图文笔记测试 &amp; 标题',
  type: 'normal',
  time: 1720000000,
  user: { nickname: '测试作者', userId: 'user123', avatar: 'http://sns-avatar.xhscdn.com/a.jpg', desc: '签名' },
  imageList: [
    {
      urlDefault: 'https://sns-img-bd.xhscdn.com/full1.jpg',
      url: 'https://sns-img-bd.xhscdn.com/mid1.jpg',
      infoList: [
        { url: 'https://sns-img-bd.xhscdn.com/small1.jpg', width: 100, height: 100 },
        { url: 'https://sns-img-bd.xhscdn.com/big1.jpg', width: 1080, height: 1440 },
      ],
    },
    {
      url: 'https://sns-img-bd.xhscdn.com/mid2.jpg',
      infoList: [{ url: 'https://sns-img-bd.xhscdn.com/big2.jpg', width: 2160, height: 2880 }],
    },
  ],
  interactInfo: { likedCount: 12345, commentCount: 67, collectedCount: 890, shareCount: 12 },
  video: undefined,
}
const stateRaw = JSON.stringify({ note: { noteDetailMap: { [imgNote.noteId]: { note: imgNote } } } })
  .replace('"video":null', '"video":undefined')
  .replace('"commentCount":67', '"commentCount":67,"opPrompt":undefined')
const html1 = '<script>window.__INITIAL_STATE__=' + stateRaw + '</script>'
const state = extractXhsInitialState(html1)
if (!state) {
  console.log('FAIL: state parse with undefined literals')
  process.exit(1)
}
const item = mapXhsNote(state.note.noteDetailMap[imgNote.noteId].note)
console.log('== 图文 ==')
console.log('type:', item.type, '| title:', item.title, '| author:', item.author.nickname, '@' + item.author.uniqueId)
console.log('images:', JSON.stringify(item.images))
console.log('stats:', JSON.stringify(item.statistics), '| time:', item.createTime, '| cover:', item.cover.slice(0, 50))
const ok1 =
  item.type === 'image' &&
  item.images.length === 2 &&
  item.images[0] === 'https://sns-img-bd.xhscdn.com/full1.jpg' &&
  item.images[1].includes('big2.jpg') &&
  item.statistics.digg === 12345 &&
  item.statistics.collect === 890

// ---------- 合成视频笔记 ----------
const vidNote = {
  noteId: '67aabbccddeeff0011223344',
  title: '视频笔记',
  desc: '',
  type: 'video',
  time: 1721000000,
  user: { nickname: '视频作者', userId: 'u2', avatar: '', desc: '' },
  video: {
    cover: { url: 'https://sns-img.xhscdn.com/cover.jpg' },
    media: {
      duration: 32.5,
      stream: {
        h264: [
          { masterUrl: 'http://sns-video-bd.xhscdn.com/stream/480p.mp4?sign=a', width: 720, height: 1280 },
          { masterUrl: 'https://sns-video-bd.xhscdn.com/stream/1080p.mp4?sign=b', width: 1080, height: 1920 },
        ],
      },
    },
  },
  interactInfo: { likedCount: 5, commentCount: 0, collectedCount: 0, shareCount: 0 },
}
const html2 =
  '<script>window.__INITIAL_STATE__=' +
  JSON.stringify({ note: { noteDetailMap: { [vidNote.noteId]: { note: vidNote } } } }) +
  '</script>'
const item2 = mapXhsNote(extractXhsInitialState(html2).note.noteDetailMap[vidNote.noteId].note)
console.log('== 视频 ==')
console.log(
  'type:', item2.type,
  '| videoUrl:', item2.videoUrl,
  '| duration:', item2.duration,
  '| res:', item2.width + 'x' + item2.height,
  '| cover:', item2.cover,
)
const ok2 =
  item2.type === 'video' &&
  item2.videoUrl.includes('1080p.mp4') &&
  item2.videoUrl.startsWith('https://') &&
  item2.duration === 33 &&
  item2.width === 1080 &&
  item2.height === 1920

// ---------- 笔记 ID 提取 ----------
const idRe = /(?:explore|discovery\/item)\/([0-9a-zA-Z]{12,})/
const ok3 =
  idRe.exec('https://www.xiaohongshu.com/explore/66f0a1b2c3d4e5f6a7b8c9d0?xsec_token=abc')[1] ===
    '66f0a1b2c3d4e5f6a7b8c9d0' &&
  idRe.exec('https://www.xiaohongshu.com/discovery/item/67aabbccddeeff0011223344?source=webshare')[1] ===
    '67aabbccddeeff0011223344' &&
  !idRe.exec('http://xhslink.com/a/xyz')

console.log('== 结果 ==', ok1 && ok2 && ok3 ? 'ALL PASS' : 'SOME FAILED (img:' + ok1 + ' vid:' + ok2 + ' id:' + ok3 + ')')
