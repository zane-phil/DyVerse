<script setup lang="ts">
function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand-line">
          <span class="brand-mark">D</span>
          <strong>DyVerse</strong>
        </div>
        <p>简洁、美观、免费的抖音视频 / 图文下载工具。</p>
      </div>

      <div class="footer-tech">
        <t-tag variant="outline" size="small">Vue 3</t-tag>
        <t-tag variant="outline" size="small">TDesign UI</t-tag>
        <t-tag variant="outline" size="small">Less</t-tag>
        <t-tag variant="outline" size="small">Node.js</t-tag>
      </div>

      <div class="footer-legal">
        <p>免责声明：本工具仅用于个人学习与收藏。所有内容版权归原作者及抖音平台所有，请勿用于商业用途或未经授权的传播。</p>
        <p class="copy">© {{ new Date().getFullYear() }} DyVerse · Built with care &amp; gradient</p>
      </div>

      <t-button variant="text" shape="circle" class="to-top" @click="toTop">
        <template #icon>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </template>
      </t-button>
    </div>
  </footer>
</template>

<style scoped lang="less">
.footer {
  margin-top: 60px;
  border-top: 1px solid var(--dy-border);
  background: rgba(7, 7, 14, 0.6);
  backdrop-filter: blur(18px);
  position: relative;
}
.footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 44px 24px 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}
.brand-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  strong {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-weight: 800;
  color: #0b0b0d;
  background: linear-gradient(135deg, #f5f5f7, #8a8a94);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
}
.footer-brand p {
  margin: 10px 0 0;
  font-size: 13.5px;
  color: var(--dy-text-muted);
}
.footer-tech {
  display: flex;
  gap: 8px;
}
.footer-legal {
  max-width: 640px;
  p {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.7;
    color: var(--dy-text-muted);
  }
  .copy {
    margin-top: 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.28);
  }
}
.to-top {
  position: absolute;
  right: 26px;
  bottom: 26px;
  color: var(--dy-text-secondary);
  &:hover {
    color: var(--dy-cyan);
  }
}
</style>
