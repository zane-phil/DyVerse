<script setup lang="ts">
import { computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { mediaUrl, triggerDownload, downloadMany } from '../api/douyin'
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

function downloadLivePhotos() {
  const it = item.value
  const urls = it?.livePhotoUrls
  if (!urls?.length) {
    MessagePlugin.warning('未获取到实况动图地址')
    return
  }
  downloadMany(urls, filename.value)
  MessagePlugin.success(urls.length > 1 ? `正在依次下载 ${urls.length} 个实况动图` : '已开始下载实况动图')
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.4" />
              <circle cx="14.8" cy="14.8" r="4" />
              <circle cx="9.8" cy="9.8" r="1.1" fill="currentColor" stroke="none" />
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
          <span class="type">{{ isLivePhoto ? '实况动图' : isImage ? `图文 · ${item.images.length} 张` : '视频 · 无水印' }}</span>
        </div>

        <div class="actions">
          <t-button
            v-if="isLivePhoto"
            class="cta"
            size="large"
            shape="round"
            theme="primary"
            @click="downloadLivePhotos"
          >
            下载实况动图
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
        </div>
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
}

@media (max-width: 860px) {
  .card {
    grid-template-columns: 1fr;
  }
}
</style>
