<script setup lang="ts">
const steps = [
  {
    no: '01',
    title: '复制分享链接',
    desc: '在抖音 App 内点击「分享」，选择复制链接，或直接复制整段分享口令。',
    icon: 'copy',
  },
  {
    no: '02',
    title: '粘贴并解析',
    desc: '回到本页面粘贴到输入框，点击「立即解析」，数秒内完成识别。',
    icon: 'magic',
  },
  {
    no: '03',
    title: '一键保存',
    desc: '视频支持无水印 / 带水印双版本下载，图文可单张或全部保存。',
    icon: 'download',
  },
]
</script>

<template>
  <section id="howto" class="howto">
    <div class="section-head" data-reveal>
      <span class="section-eyebrow"><i class="dot"></i> How it works</span>
      <h2 class="section-title">三步，完成一次 <span class="gradient-text">优雅收藏</span></h2>
      <p class="section-sub">没有复杂配置，像使用原生工具一样自然。</p>
    </div>

    <div class="steps">
      <div v-for="(s, i) in steps" :key="s.no" class="step" data-reveal :style="{ transitionDelay: `${i * 110}ms` }">
        <div class="step-top">
          <span class="step-no">{{ s.no }}</span>
          <span class="step-icon">
            <svg v-if="s.icon === 'copy'" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="11" height="11" rx="2.5" />
              <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
            </svg>
            <svg v-else-if="s.icon === 'magic'" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 4V2M15 10V8M11 6h2M19 6h2M12 20l-1.5-4.5L6 14l4.5-1.5L12 8l1.5 4.5L18 14l-4.5 1.5L12 20Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />
            </svg>
          </span>
        </div>
        <h3>{{ s.title }}</h3>
        <p>{{ s.desc }}</p>
        <span v-if="i < steps.length - 1" class="step-arrow">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.howto {
  max-width: 1100px;
  margin: 0 auto;
  padding: 100px 24px 40px;
  text-align: center;
}
.section-head {
  margin-bottom: 54px;
}
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
  position: relative;
}
.step {
  position: relative;
  text-align: left;
  padding: 30px 26px;
  border-radius: var(--dy-radius-lg);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--dy-border);
  backdrop-filter: blur(14px);
  transition: transform 0.35s ease, border-color 0.35s ease, background 0.35s ease;
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }
  h3 {
    margin: 18px 0 8px;
    font-size: 17px;
    font-weight: 700;
  }
  p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.75;
    color: var(--dy-text-secondary);
  }
}
.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.step-no {
  font-family: var(--dy-font-mono);
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(245, 245, 247, 0.95), rgba(138, 138, 148, 0.9));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.85;
}
.step-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: var(--dy-cyan);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.step-arrow {
  position: absolute;
  top: 44px;
  right: -30px;
  color: rgba(255, 255, 255, 0.18);
  z-index: 2;
}
@media (max-width: 860px) {
  .steps {
    grid-template-columns: 1fr;
  }
  .step-arrow {
    display: none;
  }
}
</style>
