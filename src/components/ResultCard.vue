<script setup lang="ts">
import { computed, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { mediaUrl, triggerDownload, downloadMany } from '../api/douyin'
import {
  buildLivePhotoZip,
  downloadBytes,
  canShareFiles,
  isIosDevice,
  prepareLivePhotoFiles,
  prepareVideoFile,
} from '../api/livePhoto'
import { safeFilename } from '../utils/format'
import type { ParseResult } from '../types'

const props = defineProps<{ result: ParseResult }>()

const item = computed(() => props.result.item)

const filename = computed(() => {
  const it = item.value
  if (!it) return 'douyin-media'
  return `${safeFilename(it.title || it.id)}-${it.id}`
})

const isImage = computed(() => item.value?.type === 'image' || (item.value?.images?.length ?? 0) > 0)
const isLivePhoto = computed(() => (item.value?.livePhotoUrls?.length ?? 0) > 0 || !!item.value?.isLivePhoto)

/** 一键直存相册：仅 iPhone / iPad 上的 Safari 支持（分享面板「存储图像」），其余设备一律回退 ZIP */
const isIos = computed(() => isIosDevice())
const canShare = computed(() => isIos.value && canShareFiles())
const isSecure = typeof window !== 'undefined' && window.isSecureContext

const zipBusy = ref(false)
const zipProgress = ref('')

const shareBusy = ref(false)
const shareProgress = ref('')

const proxyCover = computed(() => {
  const it = item.value
  return it?.cover ? mediaUrl(it.cover, { inline: true }) : ''
})

const previewVideo = computed(() => {
  const it = item.value
  return it?.videoUrl ? mediaUrl(it.videoUrl, { inline: true }) : ''
})

const previewLive = computed(() => {
  const it = item.value
  return it?.livePhotoUrls?.[0] ? mediaUrl(it.livePhotoUrls[0], { inline: true }) : ''
})

function downloadVideo() {
  const it = item.value
  if (!it?.videoUrl) {
    MessagePlugin.warning('未获取到视频地址')
    return
  }
  triggerDownload(it.videoUrl, filename.value)
  MessagePlugin.success('已开始下载无水印视频')
}

function downloadAllImages() {
  const it = item.value
  if (!it?.images?.length) return
  downloadMany(it.images, filename.value)
  MessagePlugin.success(`正在依次下载 ${it.images.length} 张图片`)
}

/** 主操作：直接存入 iPhone 相册（分享面板 →「存储图像」，iOS 自动合并为实况照片） */
async function saveLivePhotosToPhotos() {
  const it = item.value
  if (!it) return
  shareBusy.value = true
  shareProgress.value = '准备中…'
  try {
    const { files } = await prepareLivePhotoFiles(it, (msg) => (shareProgress.value = msg))
    // 注意：iOS 上 share() 只能传 { files } 一个属性！带 title/text/url 会导致
    // 分享面板不出现「存储图像」动作（见 w3c/web-share#278、mdn/content#32019）
    await navigator.share({ files })
    MessagePlugin.success('已打开分享面板，点击「存储图像」即直接存入相册')
  } catch (e) {
    const name = (e as DOMException)?.name
    if (name === 'AbortError') return // 用户主动取消，静默
    if (name === 'NotAllowedError') {
      // 准备耗时较长导致手势激活失效：文件已缓存，再点一次即可唤起
      MessagePlugin.info('照片已准备就绪，请再次点击按钮打开分享面板')
    } else {
      MessagePlugin.error(e instanceof Error ? e.message : '保存失败，请重试')
    }
  } finally {
    shareBusy.value = false
    shareProgress.value = ''
  }
}

/** 另存为动图：iPhone 上通过分享面板「存储视频」直存相册，其余环境回退为逐个下载 */
async function saveLivePhotoVideo() {
  const it = item.value
  const urls = it?.livePhotoUrls
  if (!urls?.length) {
    MessagePlugin.warning('未获取到实况动图地址')
    return
  }
  if (canShare.value && urls.length === 1) {
    shareBusy.value = true
    shareProgress.value = '准备动图…'
    try {
      const file = await prepareVideoFile(urls[0], `${filename.value}-动图`)
      await navigator.share({ files: [file] })
      MessagePlugin.success('已打开分享面板，点击「存储视频」即直接存入相册')
    } catch (e) {
      const name = (e as DOMException)?.name
      if (name === 'AbortError') return
      if (name === 'NotAllowedError') {
        MessagePlugin.info('动图已准备就绪，请再次点击按钮打开分享面板')
      } else {
        MessagePlugin.error(e instanceof Error ? e.message : '保存失败，请重试')
      }
    } finally {
      shareBusy.value = false
      shareProgress.value = ''
    }
    return
  }
  downloadMany(urls, filename.value)
  MessagePlugin.success(urls.length > 1 ? `正在依次下载 ${urls.length} 个实况动图` : '已开始下载实况动图')
}

/** 打包 iOS 可识别的实况照片（同名 JPG + MOV 配对 ZIP） */
async function downloadIosLivePhotos() {
  const it = item.value
  if (!it) return
  zipBusy.value = true
  zipProgress.value = '准备中…'
  try {
    const { data, pairs } = await buildLivePhotoZip(it, (msg) => (zipProgress.value = msg))
    downloadBytes(data, `${filename.value}-实况照片.zip`)
    MessagePlugin.success(`已生成 ${pairs} 张实况照片 ZIP，传到 iPhone 保存即可识别`)
  } catch (e) {
    MessagePlugin.error(e instanceof Error ? e.message : '生成实况照片失败，请重试')
  } finally {
    zipBusy.value = false
    zipProgress.value = ''
  }
}
</script>

<template>
  <section class="result">
    <!-- 解析失败 -->
    <div v-if="!item" class="empty">
      <p>{{ result.message || '该链接可能已失效，或内容类型暂不支持' }}</p>
      <code>{{ result.resolvedUrl || result.sourceUrl }}</code>
    </div>

    <!-- 解析成功 -->
    <article v-else class="card">
      <!-- 媒体预览 -->
      <div class="media">
        <div v-if="isLivePhoto" class="live">
          <video
            v-if="previewLive"
            :src="previewLive"
            :poster="proxyCover"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          ></video>
          <t-image v-else :src="proxyCover" fit="cover" :style="{ aspectRatio: '3 / 4' }" />
          <span class="live-badge" title="实况照片">
            <svg viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">
              <path d="M522.688 512.064A10.688 10.688 0 0 0 512 501.376a10.688 10.688 0 0 0-10.688 10.688 10.624 10.624 0 0 0 21.312 0z m64 0a74.624 74.624 0 1 1-149.248 0 74.624 74.624 0 0 1 149.248 0z" />
              <path d="M686.912 511.936A174.976 174.976 0 1 0 336.96 512 174.976 174.976 0 0 0 686.912 512z m76.8 0a251.712 251.712 0 1 1-503.424-0.064 251.712 251.712 0 0 1 503.424 0zM640 858.432v-0.448a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM774.016 751.808v-0.448a38.4 38.4 0 1 1 76.736 0v0.448a38.4 38.4 0 1 1-76.8 0zM847.808 597.76v-0.384a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM847.808 427.072v-0.448a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM774.016 273.088V272.64a38.4 38.4 0 1 1 76.736 0v0.448a38.4 38.4 0 1 1-76.8 0zM640 166.4v-0.384a38.4 38.4 0 1 1 76.8 0V166.4a38.4 38.4 0 1 1-76.8 0zM473.6 128.448V128a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM307.2 166.4v-0.384a38.4 38.4 0 1 1 76.8 0V166.4a38.4 38.4 0 1 1-76.8 0zM173.248 273.088V272.64a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM99.456 427.072v-0.448a38.4 38.4 0 1 1 76.736 0v0.448a38.4 38.4 0 1 1-76.8 0zM99.456 597.76v-0.384a38.4 38.4 0 1 1 76.736 0v0.448a38.4 38.4 0 1 1-76.8 0zM173.248 751.808v-0.448a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM307.2 858.432v-0.448a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0zM473.6 896.448V896a38.4 38.4 0 1 1 76.8 0v0.448a38.4 38.4 0 1 1-76.8 0z" />
            </svg>
          </span>
        </div>

        <div v-else-if="isImage" class="image-grid" :class="{ single: item.images.length === 1 }">
          <div v-for="(img, i) in item.images" :key="i" class="image-cell">
            <t-image :src="mediaUrl(img, { inline: true })" fit="cover" :style="{ aspectRatio: '3 / 4' }" loading="lazy" />
            <span v-if="item.images.length > 1" class="index">{{ i + 1 }}</span>
          </div>
        </div>

        <div v-else class="video">
          <video
            v-if="previewVideo"
            :src="previewVideo"
            :poster="proxyCover"
            controls
            preload="metadata"
            playsinline
          ></video>
          <div v-else class="video-fallback">
            <t-image :src="proxyCover" fit="cover" />
            <span>视频预览不可用，可直接下载</span>
          </div>
        </div>
      </div>

      <!-- 信息与操作 -->
      <div class="info">
        <h2 :title="item.title">{{ item.title || '（无标题作品）' }}</h2>

        <div class="author">
          <t-avatar :image="mediaUrl(item.author.avatar, { inline: true })" :size="'38px'" shape="round" />
          <span class="nickname">{{ item.author.nickname }}</span>
          <span class="type">{{ isLivePhoto ? '实况照片' : isImage ? `图文 · ${item.images.length} 张` : '视频 · 无水印' }}</span>
        </div>

        <div class="actions">
          <t-button
            v-if="isLivePhoto && canShare"
            class="cta"
            size="large"
            shape="round"
            theme="primary"
            :loading="shareBusy"
            @click="saveLivePhotosToPhotos"
          >
            {{ shareBusy ? shareProgress : '保存实况照片到相册' }}
          </t-button>
          <t-button
            v-else-if="isLivePhoto"
            class="cta"
            size="large"
            shape="round"
            theme="primary"
            :loading="zipBusy"
            @click="downloadIosLivePhotos"
          >
            {{ zipBusy ? zipProgress : '下载实况照片（iPhone 可用）' }}
          </t-button>
          <t-button
            v-else-if="!isImage"
            class="cta"
            size="large"
            shape="round"
            theme="primary"
            @click="downloadVideo"
          >
            下载无水印视频
          </t-button>
          <t-button
            v-else
            class="cta"
            size="large"
            shape="round"
            theme="primary"
            @click="downloadAllImages"
          >
            下载全部图片
          </t-button>
          <t-button v-if="isLivePhoto && canShare" class="sub" variant="text" @click="downloadIosLivePhotos">
            下载 ZIP（备用）
          </t-button>
          <t-button v-if="isLivePhoto" class="sub" variant="text" @click="saveLivePhotoVideo">
            {{ canShare ? '另存为动图到相册' : '另存为动图 MP4' }}
          </t-button>
        </div>

        <p v-if="isLivePhoto && !zipBusy && !shareBusy" class="ios-tip">
          <template v-if="canShare">
            点击「保存实况照片到相册」→ 在弹出的系统分享面板中点击「存储图像」，实况照片即
            <strong>直接存入 iPhone 相册</strong>，无需 ZIP 解压。若面板中没有「存储图像」（iOS 16.2+ 部分版本的已知问题），改选「存储到『文件』」，再在文件 App 中同时选中这一对同名文件 → 分享 →「存储图像」，同样得到实况照片。
          </template>
          <template v-else-if="isIos && !isSecure">
            iPhone 上的一键直存需要 HTTPS 环境（Web Share 仅在安全上下文可用），当前页面不是 HTTPS，已回退为 ZIP 下载。请按 README 4.6 配置 HTTPS 或 cloudflared 隧道后重试。
          </template>
          <template v-else>
            ZIP 内含同名 JPG + MOV 配对：传到 iPhone 在「文件」中解压，同时选中一对文件 → 分享 →「存储图像」，相册中即为可播放的实况照片。一键直存仅支持 iPhone / iPad 上的 Safari（本电脑端无法直接存入手机相册）。
          </template>
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped lang="less">
.result {
  margin-top: 18px;
}

.empty {
  padding: 40px 28px;
  text-align: center;
  border-radius: var(--dy-radius-xl);
  border: 1px solid var(--dy-border);
  background: var(--dy-surface);
  p {
    margin: 0 0 8px;
    color: var(--dy-text-secondary);
    font-size: 14.5px;
  }
  code {
    font-family: var(--dy-font-mono);
    font-size: 12px;
    color: var(--dy-text-muted);
    word-break: break-all;
  }
}

.card {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 26px;
  padding: 24px;
  border-radius: var(--dy-radius-xl);
  border: 1px solid var(--dy-border);
  background: var(--dy-surface);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: var(--dy-shadow-1);
}

.media {
  min-width: 0;
}
.video {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--dy-border);
  background: #000;
  video {
    display: block;
    width: 100%;
    max-height: 460px;
    background: #000;
  }
}
.live {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--dy-border);
  background: #000;
  video {
    display: block;
    width: 100%;
    max-height: 460px;
    background: #000;
  }
}
.live-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  svg {
    width: 18px;
    height: 18px;
  }
}
.video-fallback {
  position: relative;
  aspect-ratio: 3 / 4;
  span {
    position: absolute;
    inset: auto 0 0 0;
    padding: 12px;
    text-align: center;
    font-size: 13px;
    color: #fff;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  }
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  &.single {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
}
.image-cell {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--dy-border);
}
.index {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  min-width: 0;
  h2 {
    margin: 0;
    font-size: clamp(18px, 2.2vw, 23px);
    font-weight: 800;
    line-height: 1.45;
    letter-spacing: -0.01em;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
.author {
  display: flex;
  align-items: center;
  gap: 10px;
  .nickname {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .type {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--dy-text-muted);
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--dy-border);
  }
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .cta {
    flex: 1;
    min-width: 190px;
    background: linear-gradient(135deg, #ffffff 0%, #dcdce2 55%, #b0b0ba 120%) !important;
    border: none !important;
    color: #0b0b0d !important;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
    }
  }
  .sub {
    flex-shrink: 0;
    color: var(--dy-text-secondary);
  }
}
.ios-tip {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--dy-text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--dy-border);
  border-radius: 12px;
  padding: 10px 14px;
}

@media (max-width: 860px) {
  .card {
    grid-template-columns: 1fr;
  }
}
</style>
