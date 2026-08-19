<script setup lang="ts">
import { ref } from 'vue'
import ParserInput from './components/ParserInput.vue'
import ResultCard from './components/ResultCard.vue'
import type { ParseResult } from './types'

const result = ref<ParseResult | null>(null)
/** 流程步骤：1 粘贴 → 2 解析 → 3 下载 */
const step = ref(1)

function handleParsing() {
  step.value = 2
}

function handleParsed(payload: ParseResult) {
  result.value = payload
  step.value = payload.item ? 3 : 1
}

const steps = [
  { no: '01', label: '粘贴链接', done: false },
  { no: '02', label: '解析', done: false },
  { no: '03', label: '下载', done: false },
]
</script>

<template>
  <div class="app">
    <!-- 顶部：品牌 + 状态 -->
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <span class="brand-mark">D</span>
          <span class="brand-name">DyVerse</span>
        </div>
        <div class="brand-status">
          <span class="status-dot"></span>
          <span>本地解析 · 无水印</span>
        </div>
      </div>
    </header>

    <main class="main">
      <!-- 工具标题 -->
      <div class="hero">
        <div class="eyebrow">SOCIAL MEDIA PARSER</div>
        <h1>抖音 / 小红书 / 汽水音乐解析下载</h1>
        <p class="sub">粘贴分享口令或链接，无水印视频、高清图片与音乐封面一键保存。</p>
      </div>

      <!-- 流程步骤 -->
      <div class="steps">
        <template v-for="(s, i) in steps" :key="s.no">
          <div
            class="step"
            :class="{
              active: step === i + 1,
              done: step > i + 1,
            }"
          >
            <span class="step-no">
              <svg v-if="step > i + 1" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12 5 5 9-10" />
              </svg>
              <template v-else>{{ s.no }}</template>
            </span>
            <span class="step-label">{{ s.label }}</span>
          </div>
          <div v-if="i < steps.length - 1" class="step-line" :class="{ filled: step > i + 1 }"></div>
        </template>
      </div>

      <ParserInput @parsing="handleParsing" @parsed="handleParsed" />

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

/* ---------- 顶栏 ---------- */
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
  max-width: 760px;
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
.brand-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--dy-text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--dy-border);
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #7bd88f;
    box-shadow: 0 0 8px rgba(123, 216, 143, 0.8);
  }
}

/* ---------- 主体 ---------- */
.main {
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 104px 24px 40px;
}

.hero {
  text-align: center;
  margin-bottom: 26px;
  .eyebrow {
    font-family: var(--dy-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.34em;
    color: var(--dy-text-muted);
    margin-bottom: 12px;
  }
  h1 {
    margin: 0;
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
    background: linear-gradient(100deg, #ffffff 0%, #c9c9d2 60%, #a3a3ad 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .sub {
    margin: 14px auto 0;
    max-width: 460px;
    color: var(--dy-text-secondary);
    font-size: 14.5px;
    line-height: 1.7;
  }
}

/* ---------- 流程步骤 ---------- */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 10px 18px;
  border-radius: var(--dy-radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--dy-border);
}
.step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  .step-no {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 7px;
    font-family: var(--dy-font-mono);
    font-size: 11px;
    font-weight: 700;
    color: var(--dy-text-muted);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--dy-border);
    transition: all 0.25s ease;
  }
  .step-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--dy-text-muted);
    transition: color 0.25s ease;
  }
  &.active {
    .step-no {
      color: #0b0b0d;
      background: linear-gradient(135deg, #ffffff, #c9c9d2);
      border-color: transparent;
      box-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    }
    .step-label {
      color: var(--dy-text);
    }
  }
  &.done {
    .step-no {
      color: #0b0b0d;
      background: rgba(255, 255, 255, 0.9);
      border-color: transparent;
    }
    .step-label {
      color: var(--dy-text-secondary);
    }
  }
}
.step-line {
  width: 34px;
  height: 1.5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.12);
  transition: background 0.3s ease;
  &.filled {
    background: rgba(255, 255, 255, 0.55);
  }
}

/* ---------- 页脚 ---------- */
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

@media (max-width: 560px) {
  .step-line {
    width: 16px;
  }
}
</style>
