<script setup lang="ts">
const links = [
  { label: '功能亮点', href: '#features' },
  { label: '使用教程', href: '#howto' },
  { label: '解析记录', href: '#history' },
]

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header class="nav">
    <div class="nav-inner">
      <a class="brand" href="#top" @click.prevent="go('#parser')">
        <span class="brand-logo">
          <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
            <defs>
              <linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f5f5f7" />
                <stop offset="0.5" stop-color="#b6b6bf" />
                <stop offset="1" stop-color="#6f6f7a" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#nav-g)" />
            <path
              d="M40 18c1.2 3.4 3.8 6 7.4 7.2v6.4c-2.8 0-5.4-.7-7.6-2v14.1c0 5.8-4.7 10.5-10.5 10.5S19 49.5 19 43.7s4.7-10.5 10.5-10.5c.8 0 1.6.1 2.3.3v6.9a4.1 4.1 0 1 0 4.1 4.1V18h4.1z"
              fill="#0b0b0d"
            />
          </svg>
        </span>
        <span class="brand-text">
          <strong>DyVerse</strong>
          <em>抖音下载器</em>
        </span>
      </a>

      <nav class="nav-links">
        <a v-for="l in links" :key="l.href" href="#" @click.prevent="go(l.href)">{{ l.label }}</a>
      </nav>

      <div class="nav-actions">
        <t-tooltip content="回到顶部解析区" placement="bottom">
          <t-button variant="outline" shape="round" theme="primary" @click="go('#parser')">
            <template #icon>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </template>
            开始解析
          </t-button>
        </t-tooltip>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  background: rgba(8, 8, 10, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.brand-logo {
  display: grid;
  place-items: center;
  filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.65));
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  strong {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--dy-text);
  }
  em {
    font-style: normal;
    font-size: 11px;
    color: var(--dy-text-muted);
    letter-spacing: 0.18em;
  }
}
.nav-links {
  display: flex;
  gap: 30px;
  a {
    color: var(--dy-text-secondary);
    text-decoration: none;
    font-size: 14.5px;
    position: relative;
    transition: color 0.25s ease;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 0;
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--dy-primary), var(--dy-cyan));
      transition: width 0.3s ease;
    }
    &:hover {
      color: var(--dy-text);
      &::after {
        width: 100%;
      }
    }
  }
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (max-width: 720px) {
  .nav-links {
    display: none;
  }
}
</style>
