import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import './styles/variables.less'
import './styles/global.less'
import App from './App.vue'

// 启用 TDesign 暗色主题
document.documentElement.setAttribute('theme-mode', 'dark')

createApp(App).use(TDesign).mount('#app')
