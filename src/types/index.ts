/** 内容平台 */
export type MediaPlatform = 'douyin' | 'xiaohongshu'

/** 作品信息 */
export interface MediaItem {
  platform: MediaPlatform
  type: 'video' | 'image'
  id: string
  title: string
  author: {
    nickname: string
    avatar: string
    uniqueId: string
    signature: string
  }
  cover: string
  /** 无水印视频直链 */
  videoUrl: string
  /** 带水印视频直链（抖音可用） */
  videoUrlWatermark: string
  /** 图文原始图片 */
  images: string[]
  duration: number
  createTime: number
  statistics: {
    digg: number
    comment: number
    share: number
    collect: number
  }
  music: string
  width: number
  height: number
}

export interface ParseResult {
  sourceUrl: string
  resolvedUrl: string
  item: MediaItem | null
  message?: string
}
