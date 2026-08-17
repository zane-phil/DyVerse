<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next'
import type { HistoryItem } from '../types'
import { timeAgo } from '../utils/format'

defineProps<{ items: HistoryItem[] }>()

const emit = defineEmits<{
  (e: 'reparse', item: HistoryItem): void
  (e: 'clear'): void
}>()

function reparse(item: HistoryItem) {
  if (!item.videoUrl && !item.sourceUrl) {
    MessagePlugin.warning('该记录缺少可用的链接')
    return
  }
  emit('reparse', item)
}

function clearAll() {
  emit('clear')
}
</script>

<template>
  <section id="history" class="history">
    <div class="section-head" data-reveal>
      <span class="section-eyebrow"><i class="dot"></i> History</span>
      <h2 class="section-title">最近的 <span class="gradient-text">解析记录</span></h2>
      <p class="section-sub">记录保存在浏览器本地，可随时一键重新解析。清除记录不会删除已下载文件。</p>
    </div>

    <div v-if="items.length" class="history-list" data-reveal>
      <div v-for="item in items" :key="item.id" class="history-item glass">
        <div class="thumb">
          <img v-if="item.cover" :src="item.cover" :alt="item.title" loading="lazy" />
          <div v-else class="thumb-fallback">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          </div>
          <t-tag :theme="item.type === 'video' ? 'primary' : 'default'" variant="dark" size="small" class="type-tag">
            {{ item.type === 'video' ? '视频' : '图文' }}
          </t-tag>
        </div>
        <div class="info">
          <h4 :title="item.title">{{ item.title || '（无标题作品）' }}</h4>
          <p>
            <span>{{ item.author || '未知作者' }}</span>
            <i></i>
            <span>{{ timeAgo(item.time) }}</span>
          </p>
        </div>
        <div class="ops">
          <t-button variant="outline" theme="primary" shape="round" size="small" @click="reparse(item)">
            <template #icon>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
            </template>
            重新解析
          </t-button>
        </div>
      </div>

      <div class="history-foot">
        <t-button variant="text" theme="default" @click="clearAll">
          <template #icon>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
          </template>
          清空记录
        </t-button>
      </div>
    </div>

    <div v-else class="history-empty glass" data-reveal>
      <t-empty description="暂无解析记录，快去粘贴第一条链接吧">
        <template #image>
          <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dy-text-muted)">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          </svg>
        </template>
      </t-empty>
    </div>
  </section>
</template>

<style scoped lang="less">
.history {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 24px 60px;
  text-align: center;
}
.section-head {
  margin-bottom: 46px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px;
  border-radius: var(--dy-radius-lg);
  transition: transform 0.3s ease, border-color 0.3s ease;
  &:hover {
    transform: translateX(4px);
    border-color: var(--dy-border-strong);
  }
}
.thumb {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--dy-border);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .thumb-fallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--dy-text-muted);
  }
  .type-tag {
    position: absolute;
    left: 6px;
    bottom: 6px;
  }
}
.info {
  flex: 1;
  min-width: 0;
  h4 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--dy-text-muted);
    i {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--dy-text-muted);
    }
  }
}
.ops {
  flex-shrink: 0;
}
.history-foot {
  text-align: center;
  margin-top: 16px;
}
.history-empty {
  padding: 40px 20px;
}
@media (max-width: 560px) {
  .history-item {
    flex-wrap: wrap;
  }
  .ops {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
