/** 抖音作品信息 */
export interface DouyinMedia {
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
  /** 带水印视频直链 */
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
  item: DouyinMedia | null
  message?: string
}

export interface HistoryItem {
  id: string
  type: 'video' | 'image'
  title: string
  cover: string
  author: string
  videoUrl: string
  sourceUrl: string
  time: number
}
