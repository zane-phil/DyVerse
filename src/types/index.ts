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
  /** 图文原始图片 */
  images: string[]
  /** 实况图（Live Photo）动图视频直链 */
  livePhotoUrls: string[]
  /** 是否为实况图 */
  isLivePhoto: boolean
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
