<script setup lang="ts">
import { computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { mediaUrl, triggerDownload, downloadMany } from '../api/douyin'
import { safeFilename, timeAgo, formatDuration, formatCount } from '../utils/format'
import type { ParseResult } from '../types'

const props = defineProps<{ result: ParseResult }>()

const item = computed(() => props.result.item)

const isImage = computed(() => item.value?.type === 'image' || (item.value?.images?.length ?? 0) > 0)

const filename = computed(() => {
  const it = item.value
  if (!it) return 'douyin-media'
  return `${safeFilename(it.title || it.id)}-${it.id}`
})

const typeLabel = computed(() => {
  const it = item.value
  if (!it) return ''
  return isImage.value ? `图文 · ${it.images.length} 张` : '视频'
})

const proxyCover = computed(() => {
  const it = item.value
  return it?.cover ? mediaUrl(it.cover, { inline: true }) : ''
})

const previewVideo = computed(() => {
  const it = item.value
  return it?.videoUrl ? mediaUrl(it.videoUrl, { inline: true }) : ''
})

const durationText = computed(() => formatDuration(item.value?.duration || 0))
const resolutionText = computed(() => {
  const it = item.value
  return it?.width && it?.height ? `${it.width}×${it.height}` : ''
})
const dateText = computed(() => timeAgo(item.value?.createTime || 0))
const stats = computed(() => item.value?.statistics || { digg: 0, comment: 0, share: 0, collect: 0 })
const hasStats = computed(() => {
  const s = stats.value
  return s.digg > 0 || s.comment > 0 || s.share > 0
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
  if (!it?.images?.length) {
    MessagePlugin.warning('未获取到图片地址')
    return
  }
  downloadMany(it.images, filename.value)
  MessagePlugin.success(`正在依次下载 ${it.images.length} 张图片`)
}

function downloadImage(url: string, index: number) {
  triggerDownload(url, `${filename.value}-${String(index + 1).padStart(2, '0')}`)
  MessagePlugin.success(`已开始下载第 ${index + 1} 张图片`)
}
</script>

<template>
  <section class="result">
    <!-- 解析失败 / 无内容 -->
    <div v-if="!item" class="empty">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4.5" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
      </div>
      <p class="empty-msg">{{ result.message || '该链接可能已失效，或内容类型暂不支持' }}</p>
      <code class="empty-url">{{ result.resolvedUrl || result.sourceUrl }}</code>
    </div>

    <!-- 解析成功 -->
    <article v-else class="card">
      <!-- 媒体预览 -->
      <div class="media">
        <!-- 视频 -->
        <div v-if="!isImage" class="video">
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
          <div class="video-chips">
            <span class="chip chip-no-wm">无水印</span>
            <span v-if="durationText" class="chip">{{ durationText }}</span>
            <span v-if="resolutionText" class="chip">{{ resolutionText }}</span>
          </div>
        </div>

        <!-- 图文 -->
        <div v-else class="image-grid" :class="{ single: item.images.length === 1 }">
          <div v-for="(img, i) in item.images" :key="i" class="image-cell">
            <t-image :src="mediaUrl(img, { inline: true })" fit="cover" :style="{ aspectRatio: '3 / 4' }" loading="lazy" />
            <span v-if="item.images.length > 1" class="index">{{ i + 1 }}</span>
            <button class="cell-download" title="下载此图片" @click="downloadImage(img, i)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 4v11" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 信息与操作 -->
      <div class="info">
        <div class="meta-row">
          <span class="type-badge">{{ typeLabel }}</span>
          <span v-if="durationText" class="meta-item">{{ durationText }}</span>
          <span v-if="resolutionText" class="meta-item">{{ resolutionText }}</span>
          <span class="meta-item meta-id">ID {{ item.id }}</span>
        </div>

        <h2 :title="item.title">{{ item.title || '（无标题作品）' }}</h2>

        <div class="author">
          <t-avatar :image="mediaUrl(item.author.avatar, { inline: true })" :size="'36px'" shape="round" />
          <div class="author-text">
            <span class="nickname">{{ item.author.nickname }}</span>
            <span v-if="item.author.uniqueId" class="handle">@{{ item.author.uniqueId }}</span>
          </div>
          <span v-if="dateText" class="date">{{ dateText }}</span>
        </div>

        <div v-if="hasStats" class="stats">
          <span class="stat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9A5 5 0 0 1 12 6.4 5 5 0 0 1 21.3 11c-1.8 4.4-9.3 9-9.3 9z" /></svg>
            {{ formatCount(stats.digg) }}
          </span>
          <span class="stat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.6A8 8 0 1 1 21 12z" /></svg>
            {{ formatCount(stats.comment) }}
          </span>
          <span class="stat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7h16v-7" /><path d="m16 7-4-4-4 4" /><path d="M12 3v11" /></svg>
            {{ formatCount(stats.share) }}
          </span>
        </div>

        <div v-if="item.music" class="music" :title="item.music">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>
          <span>{{ item.music }}</span>
        </div>

        <div class="actions">
          <t-button
            v-if="!isImage"
            class="cta"
            size="large"
            theme="primary"
            @click="downloadVideo"
          >
            <template #icon>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>
            </template>
            下载无水印视频
          </t-button>
          <t-button
            v-else
            class="cta"
            size="large"
            theme="primary"
            @click="downloadAllImages"
          >
            <template #icon>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>
            </template>
            下载全部图片（{{ item.images.length }} 张）
          </t-button>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped lang="less">
.result {
  margin-top: 16px;
}

/* ---------- 空态 ---------- */
.empty {
  padding: 44px 28px;
  text-align: center;
  border-radius: var(--dy-radius-xl);
  border: 1px solid var(--dy-border);
  background: var(--dy-surface);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  .empty-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    margin: 0 auto 14px;
    border-radius: 14px;
    color: var(--dy-text-muted);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--dy-border);
  }
  .empty-msg {
    margin: 0 0 10px;
    color: var(--dy-text-secondary);
    font-size: 14.5px;
  }
  .empty-url {
    font-family: var(--dy-font-mono);
    font-size: 12px;
    color: var(--dy-text-muted);
    word-break: break-all;
  }
}

/* ---------- 结果卡片 ---------- */
.card {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 26px;
  padding: 24px;
  border-radius: var(--dy-radius-xl);
  border: 1px solid var(--dy-border);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.028));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: var(--dy-shadow-1);
}

.media {
  min-width: 0;
}

/* 视频预览 */
.video {
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
.video-chips {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  pointer-events: none;
}
.chip {
  padding: 3px 9px;
  border-radius: 6px;
  font-family: var(--dy-font-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: #fff;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  &.chip-no-wm {
    color: #0b0b0d;
    background: rgba(255, 255, 255, 0.92);
    border-color: transparent;
    font-weight: 700;
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

/* 图文网格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  &.single {
    grid-template-columns: 1fr;
    max-width: 340px;
  }
}
.image-cell {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--dy-border);
  background: rgba(0, 0, 0, 0.3);
  .cell-download {
    position: absolute;
    inset: auto 8px 8px auto;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      color: #0b0b0d;
    }
  }
  &:hover .cell-download {
    opacity: 1;
    transform: translateY(0);
  }
}
.index {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: var(--dy-font-mono);
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

/* ---------- 信息区 ---------- */
.info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.type-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #0b0b0d;
  background: linear-gradient(135deg, #ffffff, #c9c9d2);
}
.meta-item {
  padding: 3px 8px;
  border-radius: 6px;
  font-family: var(--dy-font-mono);
  font-size: 11.5px;
  color: var(--dy-text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--dy-border);
}
.meta-id {
  color: var(--dy-text-muted);
}

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

.author {
  display: flex;
  align-items: center;
  gap: 10px;
  .author-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .nickname {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .handle {
    font-family: var(--dy-font-mono);
    font-size: 11.5px;
    color: var(--dy-text-muted);
  }
  .date {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--dy-text-muted);
  }
}

.stats {
  display: flex;
  gap: 14px;
  .stat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--dy-font-mono);
    font-size: 12.5px;
    color: var(--dy-text-secondary);
    svg {
      color: var(--dy-text-muted);
    }
  }
}

.music {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  color: var(--dy-text-muted);
  svg {
    flex-shrink: 0;
  }
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.actions {
  margin-top: auto;
  padding-top: 4px;
  .cta {
    width: 100%;
    min-width: 200px;
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
