<script setup lang="ts">
import { computed, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { mediaUrl, triggerDownload, downloadMany } from '../api/douyin'
import { formatCount, formatDuration, formatDate, safeFilename } from '../utils/format'
import type { ParseResult } from '../types'

const props = defineProps<{ result: ParseResult }>()

const item = computed(() => props.result.item)
const downloading = ref('')

const filename = computed(() => {
  const it = item.value
  if (!it) return 'douyin-media'
  return `${safeFilename(it.title || it.id)}-${it.id}`
})

const isImage = computed(() => item.value?.type === 'image' || (item.value?.images?.length ?? 0) > 0)

const proxyCover = computed(() => {
  const it = item.value
  return it?.cover ? mediaUrl(it.cover, { inline: true }) : ''
})

const previewVideo = computed(() => {
  const it = item.value
  return it?.videoUrl ? mediaUrl(it.videoUrl, { inline: true }) : ''
})

async function doDownload(key: string, fn: () => Promise<void> | void) {
  if (downloading.value) return
  downloading.value = key
  try {
    await fn()
  } catch (e) {
    MessagePlugin.error(e instanceof Error ? e.message : '下载失败，请重试')
  } finally {
    downloading.value = ''
  }
}

function downloadVideo(watermark = false) {
  const it = item.value
  if (!it?.videoUrl) {
    MessagePlugin.warning('未获取到视频地址')
    return
  }
  const url = watermark ? it.videoUrlWatermark || it.videoUrl : it.videoUrl
  triggerDownload(url, filename.value)
  MessagePlugin.success(watermark ? '已开始下载（带水印）' : '已开始下载无水印视频')
}

function downloadCover() {
  const it = item.value
  if (!it?.cover) {
    MessagePlugin.warning('未获取到封面')
    return
  }
  triggerDownload(it.cover, `${filename.value}-封面`)
  MessagePlugin.success('已开始下载封面')
}

function downloadAllImages() {
  const it = item.value
  if (!it?.images?.length) {
    MessagePlugin.warning('没有可下载的图片')
    return
  }
  downloadMany(it.images, filename.value)
  MessagePlugin.success(`正在依次下载 ${it.images.length} 张图片`)
}

async function copyLink() {
  const it = item.value
  const raw = it?.videoUrl || props.result.resolvedUrl
  try {
    await navigator.clipboard.writeText(raw)
    MessagePlugin.success('已复制直链到剪贴板')
  } catch {
    MessagePlugin.warning('复制失败，请手动复制')
  }
}
</script>

<template>
  <Transition name="result" appear>
    <section class="result-zone">
      <!-- 解析失败 / 无内容 -->
      <div v-if="!item" class="result-empty glass">
        <t-empty description="未提取到可下载的媒体内容">
          <template #image>
            <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dy-text-muted)">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.5" />
            </svg>
          </template>
        </t-empty>
        <p class="empty-msg">{{ result.message || '该链接可能已失效，或内容类型暂不支持' }}</p>
        <code class="empty-url">{{ result.resolvedUrl || result.sourceUrl }}</code>
      </div>

      <article v-else class="result-card glass">
        <!-- Header -->
        <div class="result-head">
          <div class="head-left">
            <span class="ok-badge">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span class="head-title">解析完成</span>
            <t-tag :theme="'primary'" variant="light" size="small">
              {{ isImage ? `${item.images.length} 张图文` : '视频' }}
            </t-tag>
            <t-tag v-if="item.videoUrl" theme="primary" variant="light" size="small">无水印</t-tag>
          </div>
          <div class="head-right">
            <code class="source-chip" :title="result.resolvedUrl">{{ result.resolvedUrl }}</code>
            <t-tooltip content="复制原始链接">
              <t-button variant="text" shape="circle" size="small" @click="copyLink">
                <template #icon>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="11" height="11" rx="2.5" />
                    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
                  </svg>
                </template>
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <div class="result-body">
          <!-- 媒体区 -->
          <div class="media-col">
            <div v-if="isImage" class="image-grid" :class="{ 'is-single': item.images.length === 1 }">
              <div v-for="(img, i) in item.images" :key="i" class="image-cell">
                <t-image :src="mediaUrl(img, { inline: true })" fit="cover" :style="{ aspectRatio: '3 / 4' }" loading="lazy">
                  <template #error>
                    <div class="img-fallback">图片加载失败</div>
                  </template>
                </t-image>
                <div class="image-overlay">
                  <span class="image-index">{{ i + 1 }} / {{ item.images.length }}</span>
                  <t-button
                    variant="outline"
                    shape="circle"
                    theme="default"
                    size="small"
                    :loading="downloading === `img-${i}`"
                    @click="doDownload(`img-${i}`, () => triggerDownload(img, `${filename}-${i + 1}`))"
                  >
                    <template #icon>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />
                      </svg>
                    </template>
                  </t-button>
                </div>
              </div>
            </div>

            <div v-else class="video-box">
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
              <div class="video-meta-row">
                <span v-if="item.duration"><i class="meta-dot dot-cyan"></i> 时长 {{ formatDuration(item.duration) }}</span>
                <span v-if="item.width && item.height"><i class="meta-dot dot-violet"></i> {{ item.width }} × {{ item.height }}</span>
                <span v-if="item.music"><i class="meta-dot dot-pink"></i> 原声：{{ item.music }}</span>
              </div>
            </div>
          </div>

          <!-- 信息区 -->
          <div class="info-col">
            <h2 class="media-title" :title="item.title">{{ item.title || '（无标题作品）' }}</h2>

            <div class="author-row">
              <t-avatar :image="mediaUrl(item.author.avatar, { inline: true })" :size="'46px'" shape="round" />
              <div class="author-meta">
                <strong>{{ item.author.nickname }}</strong>
                <span v-if="item.author.uniqueId">@{{ item.author.uniqueId }}</span>
              </div>
              <t-tag variant="outline" size="small" theme="primary">ID {{ item.id }}</t-tag>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                <strong>{{ formatCount(item.statistics.digg) }}</strong>
                <span>点赞</span>
              </div>
              <div class="stat-card">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
                <strong>{{ formatCount(item.statistics.comment) }}</strong>
                <span>评论</span>
              </div>
              <div class="stat-card">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                <strong>{{ formatCount(item.statistics.collect) }}</strong>
                <span>收藏</span>
              </div>
              <div class="stat-card">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                <strong>{{ formatCount(item.statistics.share) }}</strong>
                <span>分享</span>
              </div>
            </div>

            <div class="meta-list">
              <div class="meta-item"><span>发布时间</span><b>{{ item.createTime ? formatDate(item.createTime) : '未知' }}</b></div>
              <div class="meta-item"><span>内容类型</span><b>{{ isImage ? `图文（${item.images.length} 张）` : '视频' }}</b></div>
              <div v-if="!isImage" class="meta-item"><span>画质</span><b>{{ item.width >= 1920 || item.height >= 1920 ? '高清 2K+' : item.width >= 1280 || item.height >= 1280 ? '高清 1080P+' : '自动适配' }}</b></div>
            </div>

            <!-- 操作区 -->
            <div class="actions">
              <t-button
                v-if="!isImage"
                class="btn-primary"
                size="large"
                shape="round"
                theme="primary"
                :loading="downloading === 'video'"
                @click="doDownload('video', downloadVideo)"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M4 20h16" /></svg>
                </template>
                下载无水印视频
              </t-button>

              <t-button
                v-if="isImage"
                class="btn-primary"
                size="large"
                shape="round"
                theme="primary"
                :loading="downloading === 'all-img'"
                @click="doDownload('all-img', downloadAllImages)"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M4 20h16" /></svg>
                </template>
                下载全部图片 ({{ item.images.length }})
              </t-button>

              <t-button v-if="!isImage && item.videoUrlWatermark" variant="outline" shape="round" size="large" theme="primary" @click="downloadVideo(true)">
                <template #icon>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></svg>
                </template>
                带水印版
              </t-button>

              <t-button variant="outline" shape="round" size="large" theme="default" @click="downloadCover">
                <template #icon>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                </template>
                封面
              </t-button>
            </div>

            <p class="copyright-note">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0M9.5 14.5a2.5 2.5 0 0 0 5 0" /></svg>
              内容版权归原作者所有，请仅用于个人学习与收藏，勿商用或二次传播。
            </p>
          </div>
        </div>
      </article>
    </section>
  </Transition>
</template>

<style scoped lang="less">
.result-zone {
  max-width: 1180px;
  margin: 0 auto;
  padding: 30px 24px 20px;
}
.result-enter-active {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.result-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.985);
}

/* empty */
.result-empty {
  padding: 46px 30px;
  text-align: center;
  .empty-msg {
    color: var(--dy-text-secondary);
    margin: 10px 0 8px;
  }
  .empty-url {
    font-family: var(--dy-font-mono);
    font-size: 12.5px;
    color: var(--dy-text-muted);
    word-break: break-all;
  }
}

/* card */
.result-card {
  padding: 28px;
  overflow: hidden;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.06), transparent 32%, transparent 68%, rgba(140, 140, 150, 0.05));
    pointer-events: none;
  }
}
.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--dy-border);
  .head-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ok-badge {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    color: #0b0b16;
    background: linear-gradient(135deg, var(--dy-green), var(--dy-cyan));
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.25);
  }
  .head-title {
    font-weight: 700;
    font-size: 16px;
  }
  .head-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .source-chip {
    font-family: var(--dy-font-mono);
    font-size: 12px;
    color: var(--dy-text-muted);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--dy-border);
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }
}
.result-body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 30px;
  position: relative;
}

/* media */
.media-col {
  min-width: 0;
}
.video-box {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--dy-border);
  background: #000;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  video {
    width: 100%;
    display: block;
    max-height: 520px;
    background: #000;
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
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
    }
  }
}
.video-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid var(--dy-border);
  font-size: 13px;
  color: var(--dy-text-secondary);
  span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .meta-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot-cyan { background: var(--dy-cyan); box-shadow: 0 0 8px var(--dy-cyan); }
  .dot-violet { background: var(--dy-primary-2); box-shadow: 0 0 8px var(--dy-primary-2); }
  .dot-pink { background: var(--dy-pink); box-shadow: 0 0 8px var(--dy-pink); }
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  &.is-single {
    grid-template-columns: 1fr;
    max-width: 420px;
  }
  .image-cell {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--dy-border);
    transition: transform 0.3s ease;
    &:hover {
      transform: translateY(-3px);
      .image-overlay { opacity: 1; }
    }
    .img-fallback {
      display: grid;
      place-items: center;
      height: 100%;
      min-height: 140px;
      color: var(--dy-text-muted);
      font-size: 13px;
      background: rgba(255, 255, 255, 0.04);
    }
  }
  .image-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 10px;
    background: linear-gradient(transparent 45%, rgba(0, 0, 0, 0.7));
    opacity: 0;
    transition: opacity 0.25s ease;
    .image-index {
      font-size: 12px;
      color: #fff;
      background: rgba(0, 0, 0, 0.45);
      padding: 3px 9px;
      border-radius: 999px;
      backdrop-filter: blur(6px);
    }
  }
}

/* info */
.info-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.media-title {
  font-size: clamp(18px, 2.4vw, 24px);
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: -0.01em;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  .author-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    strong { font-size: 15px; }
    span { font-size: 12.5px; color: var(--dy-text-muted); }
  }
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 14px 6px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--dy-border);
    transition: transform 0.25s ease, border-color 0.25s ease;
    svg { color: var(--dy-primary-2); }
    &:hover {
      transform: translateY(-2px);
      border-color: var(--dy-border-strong);
    }
    strong { font-size: 16px; font-weight: 800; }
    span { font-size: 11.5px; color: var(--dy-text-muted); }
  }
}
.meta-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 22px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--dy-border);
  .meta-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
    span { color: var(--dy-text-muted); }
    b { font-weight: 600; text-align: right; }
  }
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  .btn-primary {
    background: linear-gradient(135deg, #f5f5f7 0%, #d6d6dc 55%, #9a9aa5 120%) !important;
    border: none !important;
    color: #0b0b0d !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
  }
}
.copyright-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12.5px;
  color: var(--dy-text-muted);
  line-height: 1.6;
  margin: 2px 0 0;
  svg { flex-shrink: 0; margin-top: 2px; color: var(--dy-amber); }
}

@media (max-width: 900px) {
  .result-body {
    grid-template-columns: 1fr;
  }
  .result-card { padding: 18px; }
  .source-chip { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

