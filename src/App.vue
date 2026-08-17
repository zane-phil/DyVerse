<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import BackgroundFX from './components/BackgroundFX.vue'
import NavBar from './components/NavBar.vue'
import HeroInput from './components/HeroInput.vue'
import ResultCard from './components/ResultCard.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import HowTo from './components/HowTo.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import AppFooter from './components/AppFooter.vue'
import type { ParseResult, HistoryItem } from './types'

const HISTORY_KEY = 'dyverse-history'

const result = ref<ParseResult | null>(null)
const parseError = ref('')
const history = ref<HistoryItem[]>([])
const heroRef = ref<InstanceType<typeof HeroInput>>()
const resultRef = ref<HTMLElement>()

function loadHistory() {
  try {
    history.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    history.value = []
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value.slice(0, 12)))
}

function addHistory(payload: ParseResult) {
  const item = payload.item
  if (!item) return
  const entry: HistoryItem = {
    id: item.id,
    type: item.type,
    title: item.title,
    cover: item.cover,
    author: item.author.nickname,
    videoUrl: item.videoUrl,
    sourceUrl: payload.sourceUrl,
    time: Math.floor(Date.now() / 1000),
  }
  history.value = [entry, ...history.value.filter((h) => h.id !== entry.id)]
  saveHistory()
}

function handleParsed(payload: ParseResult) {
  result.value = payload
  parseError.value = ''
  addHistory(payload)
  nextTick(() => {
    resultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function handleError(message: string) {
  parseError.value = message
}

function handleReparse(item: HistoryItem) {
  result.value = null
  nextTick(() => {
    heroRef.value?.fill(item.sourceUrl || item.videoUrl, true)
    document.querySelector('#parser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function handleClearHistory() {
  history.value = []
  saveHistory()
  MessagePluginSuccess()
}

function MessagePluginSuccess() {
  import('tdesign-vue-next').then(({ MessagePlugin }) => MessagePlugin.success('已清空解析记录'))
}

onMounted(() => {
  loadHistory()
  // scroll reveal
  const els = document.querySelectorAll('[data-reveal]')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  els.forEach((el) => io.observe(el))
})
</script>

<template>
  <div id="top" class="app">
    <BackgroundFX />
    <NavBar />

    <main class="main">
      <HeroInput ref="heroRef" @parsed="handleParsed" @error="handleError" />

      <!-- 结果区 -->
      <div ref="resultRef" class="result-anchor">
        <ResultCard v-if="result" :result="result" />
      </div>

      <FeatureGrid />
      <HowTo />
      <HistoryPanel :items="history" @reparse="handleReparse" @clear="handleClearHistory" />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped lang="less">
.app {
  position: relative;
  z-index: 1;
}
.main {
  position: relative;
}
.result-anchor {
  scroll-margin-top: 80px;
}
</style>
