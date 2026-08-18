<script setup lang="ts">
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { parseDouyin } from '../api/douyin'
import type { ParseResult } from '../types'

const emit = defineEmits<{
  (e: 'parsed', payload: ParseResult): void
}>()

const input = ref('')
const loading = ref(false)
const error = ref('')
const isFocused = ref(false)

function isDouyinText(text: string) {
  return /douyin\.com|iesdouyin\.com|v\.douyin\.com|douyin/i.test(text)
}

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    if (text.trim()) {
      input.value = text.trim()
      error.value = ''
      handleParse()
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
    MessagePlugin.warning('请先粘贴抖音分享链接')
    return
  }
  if (!isDouyinText(raw)) {
    error.value = '未识别到抖音链接，请检查后重试'
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
    error.value = e instanceof Error ? e.message : '解析失败，请稍后重试'
    MessagePlugin.error(error.value)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <section class="parser">
    <h1 class="title">粘贴抖音链接，<span>一键下载</span></h1>
    <p class="sub">无水印视频与高清图文，解析完成后直接保存。</p>

    <div class="panel" :class="{ focused: isFocused }">
      <div class="drop-zone">
        <div class="paste-icon">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
          </svg>
        </div>
        <t-textarea
          v-model="input"
          class="input"
          placeholder="在这里粘贴抖音分享链接或口令"
          :autosize="{ minRows: 1, maxRows: 3 }"
          :disabled="loading"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.enter.exact.prevent="handleParse"
        />
        <t-button
          class="paste-btn"
          size="large"
          shape="round"
          variant="outline"
          theme="primary"
          :disabled="loading"
          @click="handlePaste"
        >
          一键粘贴
        </t-button>
      </div>

      <div class="actions">
        <t-button
          class="cta"
          size="large"
          shape="round"
          theme="primary"
          :loading="loading"
          @click="handleParse"
        >
          {{ loading ? '解析中…' : '立即解析' }}
        </t-button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </section>
</template>

<style scoped lang="less">
.parser {
  padding: 16px 0 8px;
}
.title {
  margin: 0;
  font-size: clamp(30px, 6vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  span {
    background: linear-gradient(100deg, #ffffff 0%, #c9c9d2 60%, #a3a3ad 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}
.sub {
  margin: 12px 0 0;
  color: var(--dy-text-secondary);
  font-size: 15px;
  line-height: 1.7;
}

.panel {
  margin-top: 30px;
  padding: 24px;
  border-radius: var(--dy-radius-xl);
  background: var(--dy-surface);
  border: 1px solid var(--dy-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: var(--dy-shadow-1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &.focused {
    border-color: rgba(255, 255, 255, 0.28);
    box-shadow: var(--dy-shadow-1), 0 0 0 4px rgba(255, 255, 255, 0.06), 0 0 60px rgba(255, 255, 255, 0.08);
  }
}

.drop-zone {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 12px 12px 18px;
  border-radius: var(--dy-radius-lg);
  background: rgba(0, 0, 0, 0.35);
  border: 1.5px dashed rgba(255, 255, 255, 0.3);
  transition: border-color 0.3s ease, background 0.3s ease;
  &:hover {
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(0, 0, 0, 0.42);
  }
}
.paste-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 14px;
  color: var(--dy-text);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.actions {
  margin-top: 14px;
}
.input {
  flex: 1;
  :deep(.t-textarea__inner) {
    background: transparent;
    border: none;
    box-shadow: none;
    border-radius: 12px;
    color: var(--dy-text);
    font-size: 16px;
    font-weight: 500;
    padding: 10px 4px;
    &::placeholder {
      color: var(--dy-text-muted);
      font-weight: 400;
    }
    &:focus {
      box-shadow: none;
    }
  }
}
.paste-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.07) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: var(--dy-text) !important;
  font-weight: 600;
  &:hover {
    background: rgba(255, 255, 255, 0.14) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
  }
  :deep(.t-button__text) {
    font-size: 14.5px;
  }
}
.cta {
  width: 100%;
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
  :deep(.t-button__text) {
    letter-spacing: 0.04em;
  }
}
.error {
  margin: 14px 0 0;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  color: var(--dy-error);
  background: rgba(215, 106, 106, 0.1);
  border: 1px solid rgba(215, 106, 106, 0.3);
}

@media (max-width: 560px) {
  .drop-zone {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  .paste-icon {
    margin: 0 auto;
  }
  .paste-btn {
    width: 100%;
  }
}
</style>
