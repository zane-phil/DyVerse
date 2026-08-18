import { zipSync, strToU8 } from 'fflate'
import { mediaUrl } from './douyin'
import type { DouyinMedia } from '../types'

/**
 * iOS 实况照片（Live Photo）打包
 *
 * iPhone 识别实况照片的方式：一张静态图（.JPG/.HEIC）+ 一段同名 .MOV 视频配对。
 * 两个同名文件同时被保存进相册（如「文件」中全选 → 分享 → 存储图像）时，
 * iOS 会自动合并为一个可播放的实况照片。
 *
 * 这里把每张实况图转换为「同名 JPG + MOV」配对并打包成 ZIP：
 * - 静态图：webp/png 等任意格式经 canvas 统一转码为 JPEG（iOS 配对要求）；
 * - 动图视频：源站 mp4（H.264/AAC）直接以 .MOV 扩展名交付，QuickTime/iOS 可识别。
 */

/** 通过本地代理获取媒体 Blob（同源请求，canvas 不会被污染） */
export async function fetchProxyBlob(url: string): Promise<Blob> {
  const res = await fetch(mediaUrl(url, { inline: true }))
  if (!res.ok) throw new Error(`获取媒体失败（HTTP ${res.status}）`)
  return res.blob()
}

/** 任意图片 Blob（webp/png/jpeg…）转 JPEG，供 iOS 实况照片配对使用 */
export async function blobToJpeg(blob: Blob): Promise<Uint8Array> {
  const objectUrl = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片解码失败'))
      img.src = objectUrl
    })
    // 超过 4096px 时等比缩小，避免超大原图占用过多内存
    const scale = Math.min(1, 4096 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    )
    if (!jpegBlob) throw new Error('JPEG 编码失败')
    return new Uint8Array(await jpegBlob.arrayBuffer())
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export interface LivePhotoZipResult {
  /** ZIP 字节 */
  data: Uint8Array
  /** 配对数量 */
  pairs: number
}

/**
 * 下载实况照片的所有配对（静态图 + 动图视频），打包为 iOS 可识别的 ZIP。
 * 每对文件命名为 IMG_xxx.JPG + IMG_xxx.MOV（同名配对）；纯静态图只保留 JPG。
 */
export async function buildLivePhotoZip(
  item: DouyinMedia,
  onProgress?: (msg: string) => void,
): Promise<LivePhotoZipResult> {
  const pairs =
    item.livePhotos && item.livePhotos.length
      ? item.livePhotos
      : item.images.map((image) => ({ image, video: '' }))

  const files: Record<string, Uint8Array> = {}
  const pad = (n: number) => String(n).padStart(3, '0')

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i]
    const base = `IMG_${pad(i + 1)}`
    onProgress?.(`正在下载第 ${i + 1}/${pairs.length} 张…`)
    if (p.image) {
      const blob = await fetchProxyBlob(p.image)
      let jpeg: Uint8Array
      try {
        jpeg = await blobToJpeg(blob)
      } catch {
        // 转码失败时保留原始字节（尽力而为）
        jpeg = new Uint8Array(await blob.arrayBuffer())
      }
      files[`${base}.JPG`] = jpeg
    }
    if (p.video) {
      onProgress?.(`正在下载第 ${i + 1}/${pairs.length} 张的动图视频…`)
      const blob = await fetchProxyBlob(p.video)
      // 源站为 H.264/AAC 的 mp4，重命名 .MOV 后 iOS 可正常配对识别
      files[`${base}.MOV`] = new Uint8Array(await blob.arrayBuffer())
    }
  }

  files['如何保存到iPhone.txt'] = strToU8(
    '将本 ZIP 传到 iPhone 后，在「文件」App 中解压。\n' +
      '同时选中同名的一对文件（如 IMG_001.JPG 与 IMG_001.MOV），\n' +
      '点左下角分享 →「存储图像」，相册中即为可播放的实况照片。\n' +
      '多张时请逐对选中保存。\n',
  )

  // level 0（仅存储不压缩）：图片/视频本身已压缩，速度最快且内存占用小
  const data = zipSync(files, { level: 0 })
  return { data, pairs: pairs.length }
}

/** 触发浏览器保存 Uint8Array 文件 */
export function downloadBytes(data: Uint8Array, filename: string, mime = 'application/zip') {
  // 复制到独立 ArrayBuffer，规避 Uint8Array<ArrayBufferLike> 与 BlobPart 的类型不兼容
  const copy = new Uint8Array(data.byteLength)
  copy.set(data)
  const blob = new Blob([copy], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
