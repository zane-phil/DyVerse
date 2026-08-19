<script setup lang="ts">
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { parseDouyin } from '../api/douyin'
import type { ParseResult } from '../types'

const emit = defineEmits<{
  (e: 'parsed', payload: ParseResult): void
  (e: 'parsing'): void
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
  emit('parsing')
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
    <div class="panel" :class="{ focused: isFocused, 'has-error': !!error }">
      <!-- 输入区标题行 -->
      <div class="row-head">
        <span class="label">分享链接 / 口令</span>
        <span class="support">口令 · 短链接 · 视频页 · 图文笔记</span>
      </div>

      <!-- 输入区 -->
      <div class="drop-zone">
        <t-textarea
          v-model="input"
          class="input"
          placeholder="将抖音分享口令或链接粘贴到这里，例如：8.88 复制打开抖音… https://v.douyin.com/xxxx/"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :disabled="loading"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.enter.exact.prevent="handleParse"
        />
      </div>

      <!-- 操作行：左下角一键粘贴 ↔ 右下角立即解析 -->
      <div class="row-foot">
        <t-button
          class="paste-btn"
          size="large"
          variant="outline"
          theme="primary"
          :disabled="loading"
          @click="handlePaste"
        >
          一键粘贴
        </t-button>
        <t-button
          class="cta"
          size="large"
          theme="primary"
          :loading="loading"
          @click="handleParse"
        >
          <template #icon>
            <svg v-if="!loading" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </template>
          {{ loading ? '解析中…' : '立即解析' }}
        </t-button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </section>
</template>

<style scoped lang="less">
.parser {
  width: 100%;
}

.panel {
  padding: 20px 20px 18px;
  border-radius: var(--dy-radius-xl);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid var(--dy-border);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: var(--dy-shadow-1);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  &.focused {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: var(--dy-shadow-1), 0 0 0 4px rgba(255, 255, 255, 0.06), 0 0 70px rgba(255, 255, 255, 0.09);
  }
  &.has-error {
    border-color: rgba(215, 106, 106, 0.45);
  }
}

.row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  .label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--dy-text);
    text-transform: uppercase;
  }
  .support {
    font-size: 12px;
    color: var(--dy-text-muted);
  }
}

/* 输入区：醒目大输入框 */
.drop-zone {
  display: flex;
  padding: 10px 10px 10px 16px;
  border-radius: var(--dy-radius-lg);
  background: rgba(0, 0, 0, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.52);
  }
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.65);
    background: rgba(0, 0, 0, 0.55);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.07), 0 0 34px rgba(255, 255, 255, 0.1);
  }
}
.input {
  flex: 1;
  align-self: center;
  :deep(.t-textarea__inner) {
    background: transparent;
    border: none;
    box-shadow: none;
    border-radius: 12px;
    color: var(--dy-text);
    font-size: 16.5px;
    font-weight: 600;
    line-height: 1.6;
    padding: 10px 4px;
    &::placeholder {
      color: rgba(255, 255, 255, 0.38);
      font-weight: 400;
    }
    &:focus {
      box-shadow: none;
    }
  }
}

.row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}
.paste-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: var(--dy-text) !important;
  font-weight: 600;
  &:hover {
    background: rgba(255, 255, 255, 0.16) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
  }
  :deep(.t-button__text) {
    font-size: 14.5px;
  }
}
.cta {
  flex: 1;
  max-width: 260px;
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
    letter-spacing: 0.06em;
  }
}

.error {
  margin: 12px 0 0;
  padding: 9px 13px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--dy-error);
  background: rgba(215, 106, 106, 0.1);
  border: 1px solid rgba(215, 106, 106, 0.3);
}

@media (max-width: 560px) {
  .row-head {
    flex-direction: column;
    gap: 4px;
  }
  .row-foot {
    flex-direction: column;
    align-items: stretch;
  }
  .paste-btn,
  .cta {
    width: 100%;
  }
  .cta {
    max-width: none;
  }
}
</style>
