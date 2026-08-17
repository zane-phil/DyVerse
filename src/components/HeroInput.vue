<script setup lang="ts">
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { parseDouyin } from '../api/douyin'
import type { ParseResult } from '../types'

const emit = defineEmits<{
  (e: 'parsed', payload: ParseResult): void
  (e: 'error', message: string): void
}>()

const input = ref('')
const loading = ref(false)
const error = ref('')

const tips = ['支持分享口令', '支持短链接', '无水印原画', '免费 · 无需登录']

function isDouyinText(text: string) {
  return /douyin\.com|iesdouyin\.com|v\.douyin\.com|douyin/i.test(text)
}

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      input.value = text.trim()
      error.value = ''
      MessagePlugin.success('已读取剪贴板内容')
    } else {
      MessagePlugin.warning('剪贴板为空')
    }
  } catch {
    MessagePlugin.warning('浏览器未授权剪贴板，请手动粘贴')
  }
}

async function handleParse() {
  const raw = input.value.trim()
  if (!raw) {
    MessagePlugin.warning('请先粘贴抖音分享链接或口令')
    return
  }
  if (!isDouyinText(raw)) {
    MessagePlugin.error('未识别到抖音链接，请检查后重试')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const result = await parseDouyin(raw)
    emit('parsed', result)
    if (!result.item) {
      MessagePlugin.warning(result.message || '解析成功，但未提取到媒体信息')
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : '解析失败，请稍后重试'
    error.value = message
    emit('error', message)
    MessagePlugin.error(message)
  } finally {
    loading.value = false
  }
}

function fill(text: string, autoParse = true) {
  input.value = text
  error.value = ''
  if (autoParse) {
    setTimeout(() => handleParse(), 60)
  }
}

defineExpose({ fill })
</script>

<template>
  <section id="parser" class="hero">
    <div class="hero-inner">
      <span class="section-eyebrow"><i class="dot"></i> Douyin Media Extractor</span>

      <h1 class="hero-title">
        让抖音内容<br />
        <span class="gradient-text">一键收藏</span>到本地
      </h1>
      <p class="hero-sub">
        粘贴分享链接或口令，秒级解析无水印视频与高清图文。
        <br class="hide-mobile" />
        干净、免费、本地解析，不打扰你的创作。
      </p>

      <div class="parser-card glass">
        <div class="parser-head">
          <span class="parser-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8.5 11.5L12 8l3.5 3.5" />
            </svg>
          </span>
          <span>粘贴抖音链接 / 分享口令</span>
        </div>

        <div class="parser-body">
          <div class="parser-input">
            <t-textarea
              v-model="input"
              placeholder="例如：8.88 复制打开抖音，看看作品 https://v.douyin.com/xxxxx/ ..."
              :autosize="{ minRows: 2, maxRows: 4 }"
              size="large"
              :disabled="loading"
              @keydown.enter.exact.prevent="handleParse"
            />
          </div>
          <div class="parser-actions">
            <t-button variant="outline" size="large" shape="round" theme="primary" :disabled="loading" @click="handlePaste">
              <template #icon>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="11" height="11" rx="2.5" />
                  <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
                </svg>
              </template>
              粘贴
            </t-button>
            <t-button
              class="primary-cta"
              size="large"
              shape="round"
              theme="primary"
              :loading="loading"
              @click="handleParse"
            >
              <template #icon v-if="!loading">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
                </svg>
              </template>
              {{ loading ? '解析中…' : '立即解析' }}
            </t-button>
          </div>
        </div>

        <p v-if="error" class="parser-error">{{ error }}</p>

        <div class="parser-foot">
          <span v-for="tip in tips" :key="tip" class="tip-chip">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {{ tip }}
          </span>
          <span class="privacy-note">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            内容仅在本地解析
          </span>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat">
          <strong>&lt;3s</strong>
          <span>平均解析速度</span>
        </div>
        <div class="stat">
          <strong>1080P+</strong>
          <span>高清无水印</span>
        </div>
        <div class="stat">
          <strong>0</strong>
          <span>注册与费用</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 140px 24px 80px;
}
.hero-inner {
  width: 100%;
  max-width: 860px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: hero-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes hero-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-title {
  font-size: clamp(42px, 7vw, 74px);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.08;
  margin: 6px 0 0;
}
.hero-sub {
  color: var(--dy-text-secondary);
  font-size: clamp(15px, 2vw, 18px);
  line-height: 1.8;
  margin: 0;
}
.hide-mobile {
  display: inline;
}

/* ------- Parser Card ------- */
.parser-card {
  width: 100%;
  margin-top: 22px;
  padding: 26px;
  text-align: left;
  position: relative;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(160, 160, 170, 0.35), rgba(120, 120, 130, 0.5));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.55;
    pointer-events: none;
  }
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 60px rgba(255, 255, 255, 0.08);
  }
}
.parser-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--dy-text-secondary);
  margin-bottom: 16px;
}
.parser-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--dy-cyan);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.parser-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.parser-input {
  :deep(.t-textarea__inner) {
    background: rgba(0, 0, 0, 0.32);
    border: 1px solid var(--dy-border);
    border-radius: 14px;
    color: var(--dy-text);
    font-size: 15px;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    &::placeholder {
      color: var(--dy-text-muted);
    }
    &:focus {
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    }
  }
}
.parser-actions {
  display: flex;
  gap: 12px;
}
.primary-cta {
  flex: 1;
  background: linear-gradient(135deg, #f5f5f7 0%, #d6d6dc 55%, #9a9aa5 120%) !important;
  border: none !important;
  color: #0b0b0d !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  }
  :deep(.t-button__text) {
    font-weight: 700;
    letter-spacing: 0.04em;
  }
}
.parser-error {
  color: var(--dy-error);
  font-size: 13.5px;
  margin: 12px 2px 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(215, 106, 106, 0.12);
  border: 1px solid rgba(215, 106, 106, 0.35);
}
.parser-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}
.tip-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--dy-text-secondary);
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  svg {
    color: var(--dy-green);
  }
}
.privacy-note {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--dy-text-muted);
  svg {
    color: var(--dy-cyan);
  }
}

/* ------- Stats ------- */
.hero-stats {
  display: flex;
  gap: clamp(24px, 5vw, 60px);
  margin-top: 40px;
  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    strong {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(100deg, #ffffff, #9a9aa5);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    span {
      font-size: 12.5px;
      color: var(--dy-text-muted);
      letter-spacing: 0.08em;
    }
  }
}

@media (max-width: 720px) {
  .hero {
    padding: 120px 16px 60px;
  }
  .parser-card {
    padding: 18px;
  }
  .parser-actions {
    flex-direction: column;
  }
  .hide-mobile {
    display: none;
  }
  .privacy-note {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>
