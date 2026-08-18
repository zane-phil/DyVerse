/** 实况图（Live Photo）条目：静态图 + 配套动图视频，与 images 一一对应 */
export interface LivePhotoItem {
  /** 静态图片直链（与 images[] 对应） */
  image: string
  /** 动图视频直链（mp4，iOS 配对时保存为同名 .MOV） */
  video: string
}

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
  /** 实况图（Live Photo）配对（静态图 + 动图视频），与 images 一一对应 */
  livePhotos: LivePhotoItem[]
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
