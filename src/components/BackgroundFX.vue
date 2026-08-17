<template>
  <div class="bg-fx" aria-hidden="true">
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>
    <div class="grid"></div>
    <div class="noise"></div>
    <div class="vignette"></div>
  </div>
</template>

<style scoped lang="less">
.bg-fx {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  will-change: transform;
}
.orb-a {
  width: 560px;
  height: 560px;
  top: -190px;
  right: -90px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 65%);
  animation: float-a 18s ease-in-out infinite;
}
.orb-b {
  width: 470px;
  height: 470px;
  top: 32%;
  left: -170px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06), transparent 65%);
  animation: float-b 22s ease-in-out infinite;
}
.orb-c {
  width: 640px;
  height: 640px;
  bottom: -240px;
  left: 32%;
  background: radial-gradient(circle, rgba(140, 140, 150, 0.09), transparent 65%);
  animation: float-c 26s ease-in-out infinite;
}

.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.032) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.032) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse 95% 72% at 50% 0%, #000 8%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 95% 72% at 50% 0%, #000 8%, transparent 78%);
}

.noise {
  position: absolute;
  inset: 0;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 52%, rgba(0, 0, 0, 0.55) 100%);
}

@keyframes float-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-60px, 50px) scale(1.08); }
}
@keyframes float-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, -40px) scale(1.05); }
}
@keyframes float-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, -60px) scale(1.1); }
}
</style>