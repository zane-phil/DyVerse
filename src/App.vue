<script setup lang="ts">
import { ref } from 'vue'
import ParserInput from './components/ParserInput.vue'
import ResultCard from './components/ResultCard.vue'
import type { ParseResult } from './types'

const result = ref<ParseResult | null>(null)

function handleParsed(payload: ParseResult) {
  result.value = payload
}
</script>

<template>
  <div class="app">
    <!-- 顶部：仅品牌 + 状态 -->
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <span class="brand-mark">D</span>
          <span class="brand-name">DyVerse</span>
        </div>
        <div class="brand-note">抖音无水印解析</div>
      </div>
    </header>

    <main class="main">
      <ParserInput @parsed="handleParsed" />

      <Transition name="fade-up">
        <ResultCard v-if="result" :result="result" />
      </Transition>
    </main>

    <footer class="footer">
      <p>本工具仅用于个人学习与收藏，内容版权归原作者所有。</p>
    </footer>
  </div>
</template>

<style scoped lang="less">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 100;
  background: rgba(10, 10, 13, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--dy-border);
}
.topbar-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #0b0b0d;
  background: linear-gradient(135deg, #ffffff, #b9b9c2);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
}
.brand-name {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.brand-note {
  font-size: 12.5px;
  color: var(--dy-text-muted);
}

.main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 110px 24px 40px;
}

.footer {
  padding: 26px 24px 30px;
  text-align: center;
  p {
    margin: 0;
    font-size: 12px;
    color: var(--dy-text-muted);
    opacity: 0.7;
  }
}

.fade-up-enter-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
</style>
