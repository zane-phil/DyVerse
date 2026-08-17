<script setup lang="ts">
const features = [
  {
    title: '无水印 · 原画质',
    desc: '自动提取无水印视频地址，分辨率优先 1080P+，画质不被二次压缩。',
    icon: 'spark',
    accent: 'violet',
  },
  {
    title: '图文笔记也支持',
    desc: '视频与图文笔记都能解析，图片支持单张下载或一键全部保存。',
    icon: 'image',
    accent: 'cyan',
  },
  {
    title: '本地解析 · 隐私安全',
    desc: '链接仅在你的电脑上完成解析与中转，不上传任何服务器，不留存记录。',
    icon: 'shield',
    accent: 'green',
  },
  {
    title: '免费 · 无需登录',
    desc: '打开即用，不注册不登录不收费，也没有恼人的广告与次数限制。',
    icon: 'bolt',
    accent: 'pink',
  },
]
</script>

<template>
  <section id="features" class="features">
    <div class="section-head" data-reveal>
      <span class="section-eyebrow"><i class="dot"></i> Features</span>
      <h2 class="section-title">为「收藏」而生的 <span class="gradient-text">下载体验</span></h2>
      <p class="section-sub">不止是下载工具，而是一个干净、克制、有质感的媒体收藏工作台。</p>
    </div>

    <div class="feature-grid">
      <div v-for="(f, i) in features" :key="f.title" class="feature-card glass" data-reveal :style="{ transitionDelay: `${i * 90}ms` }">
        <span class="feature-icon" :class="f.accent">
          <svg v-if="f.icon === 'spark'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
          </svg>
          <svg v-else-if="f.icon === 'image'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <svg v-else-if="f.icon === 'shield'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </span>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
        <span class="feature-glow" :class="f.accent"></span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.features {
  max-width: 1180px;
  margin: 0 auto;
  padding: 110px 24px 40px;
  text-align: center;
}
.section-head {
  margin-bottom: 54px;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.feature-card {
  position: relative;
  padding: 30px 24px;
  text-align: left;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  &:hover {
    transform: translateY(-6px);
    border-color: var(--dy-border-strong);
    box-shadow: 0 26px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 255, 255, 0.05);
  }
  h3 {
    margin: 18px 0 10px;
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
.feature-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 1px solid;
  &.violet {
    color: var(--dy-primary-2);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
  }
  &.cyan {
    color: var(--dy-cyan);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
  }
  &.green {
    color: var(--dy-green);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
  }
  &.pink {
    color: var(--dy-pink);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
  }
}
.feature-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
  &.violet { background: rgba(255, 255, 255, 0.12); }
  &.cyan { background: rgba(255, 255, 255, 0.08); }
  &.green { background: rgba(255, 255, 255, 0.08); }
  &.pink { background: rgba(255, 255, 255, 0.09); }
}

@media (max-width: 980px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
