# DyVerse · 抖音视频 / 图文下载器

> 一个拥有高级质感界面的抖音内容下载 Web 项目：**Vue 3 + TypeScript + TDesign UI + Less + Node.js 代理服务**。
> 支持抖音分享口令 / 短链接 / 视频页 / 图文笔记的一键解析，无水印视频下载与图文批量保存。

![Vue](https://img.shields.io/badge/Vue-3.5-42b883) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6) ![TDesign](https://img.shields.io/badge/TDesign-1.x-0052d9) ![Less](https://img.shields.io/badge/Less-4.x-1d365d) ![Express](https://img.shields.io/badge/Express-5.x-000000) ![Node](https://img.shields.io/badge/Node-20%2B-339933) ![License](https://img.shields.io/badge/License-Private-8b5cf6)

---

## 📑 目录

1. [项目简介](#1-项目简介)
2. [功能特性](#2-功能特性)
3. [技术栈](#3-技术栈)
4. [快速开始](#4-快速开始)
5. [目录结构](#5-目录结构)
6. [前端设计与实现](#6-前端设计与实现)
7. [后端解析原理](#7-后端解析原理)
8. [API 文档](#8-api-文档)
9. [配置说明](#9-配置说明)
10. [常见问题排查](#10-常见问题排查)
11. [免责声明](#11-免责声明)
12. [后续规划](#12-后续规划)

---

## 1. 项目简介

DyVerse 是一个「打开即用」的本地抖音下载工具：

- 把抖音 App 里的**分享口令 / 短链接 / 视频页 / 图文笔记链接**粘贴进来，点击「立即解析」；
- 后端在本机完成链接还原、作品信息抓取与媒体地址提取；
- 前端以卡片形式展示作品信息（标题、作者、封面、点赞/评论/收藏/分享、时长、分辨率、音乐等），并提供 **无水印视频 / 带水印视频 / 封面 / 图文全部图片** 等多种下载方式；
- 视频与图片通过本地代理服务中转下载，规避跨域与防盗链限制。

整体采用**黑白灰极简主题 + 玻璃拟态**设计，强调层次感与质感：中性光晕背景、毛玻璃卡片、渐变描边、悬浮动效、滚动渐显等。

---

## 2. 功能特性

| 类别 | 能力 | 说明 |
| --- | --- | --- |
| 🎬 视频下载 | 无水印原画 / 带水印 | `playwm` → `play` 地址转换，分辨率优先 1080P+（取决于源站提供） |
| 🖼️ 图文笔记 | 单张下载 / 一键全部 | 图片以原始清晰度链接逐个保存 |
| 🔗 链接兼容 | 分享口令 / 短链 / 页面链接 | `v.douyin.com`、`douyin.com/video|note`、`iesdouyin.com/share/...` |
| ▶️ 在线预览 | 视频 / 图片预览 | 通过本地代理内联播放与展示，不受防盗链影响 |
| 📊 作品信息 | 完整元数据 | 标题、作者（昵称/头像/ID/签名）、封面、四维数据、时长、分辨率、原声 |
| 📜 解析历史 | 本地记录 | 最多保留 12 条，一键重新解析，数据仅存浏览器 localStorage |
| 🛡️ 隐私安全 | 全程本地 | 解析与媒体中转均在本机完成，不经过任何第三方服务器 |
| 📱 响应式 | 多端适配 | 桌面 / 平板 / 手机自适应，无横向溢出 |
| 🎨 视觉设计 | 黑白灰 + 玻璃拟态 | 单色系设计令牌统一管理，动效克制动人 |

---

## 3. 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vue 3 | ^3.5 | 前端框架（Composition API + `<script setup>`） |
| TypeScript | ~6.0 | 类型安全（`vue-tsc` 严格检查） |
| Vite | ^8.2 | 构建工具与开发服务器 |
| TDesign Vue Next | ^1.20 | 企业级 UI 组件库（暗色主题） |
| Less | ^4.8 | 样式预处理（设计令牌 + 全局样式） |
| Express | ^5.2 | 后端代理服务 |
| Node.js | 20+ | 运行时（内置 `fetch`，无需额外请求库） |
| concurrently | ^9 | 开发模式并行启动前后端 |
| playwright-core | ^1.62 | 开发辅助：UI 自动化验证截图（非运行必需） |

---

## 4. 快速开始

### 4.1 环境要求

- **Node.js ≥ 20**（项目使用 Node 内置 `fetch`、`Headers.getSetCookie` 等 API）
- npm ≥ 10（或使用 pnpm / yarn 亦可）

```bash
node -v   # 建议 v20+
npm -v
```

### 4.2 安装依赖

```bash
npm install
```

### 4.3 开发模式（推荐）

一条命令并行启动后端与前端：

```bash
npm run dev:all
```

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| 前端（Vite） | http://localhost:5173 | 带 HMR 热更新 |
| 后端（Express） | http://localhost:8787 | 解析 / 下载代理 API |

前端开发服务器已配置代理：所有 `/api/*` 请求自动转发到 `http://localhost:8787`，无需额外配置跨域。

### 4.4 生产模式

```bash
npm run build   # 类型检查 + 构建前端产物到 dist/
npm start       # 启动后端，同时托管 dist 静态资源与 API
```

访问 **http://localhost:8787** 即可使用（单端口部署）。

### 4.5 脚本一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 仅启动前端（需要后端已在 8787 运行） |
| `npm run server` | 仅启动后端 |
| `npm run dev:all` | 前后端并行（开发推荐） |
| `npm run build` | `vue-tsc -b` 类型检查 + `vite build` 构建 |
| `npm start` | 生产启动（托管 dist + API） |
| `npm run preview` | 预览构建产物（仅前端） |

---

## 5. 目录结构

```
download_douyin/
├─ server/
│  └─ index.mjs              # Express 代理服务（解析 + 下载中转 + 静态托管）
├─ src/
│  ├─ main.ts                # 应用入口：注册 TDesign、导入主题样式
│  ├─ App.vue                # 页面骨架：状态编排、历史记录、滚动渐显
│  ├─ tdesign.d.ts           # TDesign 全局组件类型声明
│  ├─ api/
│  │  └─ douyin.ts           # 前端 API 客户端（解析 / 下载 / 批量下载）
│  ├─ components/
│  │  ├─ BackgroundFX.vue    # 背景特效（光晕 / 网格 / 噪点 / 暗角）
│  │  ├─ NavBar.vue          # 顶部导航（毛玻璃固定）
│  │  ├─ HeroInput.vue       # Hero 区 + 链接输入 / 粘贴 / 解析
│  │  ├─ ResultCard.vue      # 解析结果卡（预览 / 信息 / 下载操作）
│  │  ├─ FeatureGrid.vue     # 功能亮点区
│  │  ├─ HowTo.vue           # 三步使用教程
│  │  ├─ HistoryPanel.vue    # 本地解析历史
│  │  └─ AppFooter.vue       # 页脚（免责声明 / 技术栈 / 返回顶部）
│  ├─ styles/
│  │  ├─ variables.less      # 设计令牌（颜色 / 圆角 / 阴影 / 字体）
│  │  └─ global.less         # 全局样式与工具类
│  ├─ types/
│  │  └─ index.ts            # DouyinMedia / ParseResult / HistoryItem 类型
│  └─ utils/
│     └─ format.ts           # 格式化工具（计数 / 时长 / 日期 / 文件名）
├─ public/
│  └─ favicon.svg            # 站点图标
├─ index.html                # HTML 入口（含 SEO meta）
├─ vite.config.ts            # 构建与开发代理配置
├─ package.json
└─ README.md
```

---

## 6. 前端设计与实现

### 6.1 设计系统（Less 设计令牌）

所有颜色、圆角、阴影、字体统一收敛在 `src/styles/variables.less`：

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--dy-bg` | `#07070e` | 页面主背景 |
| `--dy-surface` | `rgba(255,255,255,.04)` | 毛玻璃卡片底色 |
| `--dy-border` | `rgba(255,255,255,.09)` | 卡片描边 |
| `--dy-primary` | `#f5f5f7` | 品牌白（主按钮 / 高对比） |
| `--dy-cyan` | `#cfd0d6` | 浅灰点缀 |
| `--dy-pink` | `#a9a9b2` | 中灰点缀 |
| `--dy-green` | `#8f8f99` | 中性灰（成功 / 隐私提示） |
| `--dy-radius-xl` | `24px` | 大卡片圆角 |
| `--dy-shadow-1/2` | 多层阴影 | 悬浮层次 |

**视觉层次**（从上到下）：

1. **背景层**：三团柔和中性光晕（白/浅灰）+ 网格 + 噪点 + 暗角，营造空间纵深；
2. **导航层**：毛玻璃固定顶栏，带悬浮下划线导航；
3. **Hero 层**：大标题（白→灰渐变流光文字）、副标题、玻璃解析卡片（渐变描边 + 内发光）、数据统计条；
4. **结果层**：媒体预览 + 信息区（标题 / 作者 / 四维数据 / 元信息 / 操作按钮），带入场动画；
5. **内容层**：功能亮点卡片（hover 抬升 + 角落光斑）、三步教程；
6. **历史层**：本地解析记录列表；
7. **页脚层**：免责声明 + 技术栈标签 + 返回顶部。

### 6.2 页面数据流

```
用户在 HeroInput 粘贴链接
        │
        ▼
HeroInput.handleParse()
  └─ 校验是否包含抖音域名
  └─ POST /api/parse ──────────────► 后端解析（见第 7 节）
        │                                │
        │ ◄────────── ParseResult ───────┘
        ▼
emit('parsed', result)
  └─ App.handleParsed()
       ├─ result.value = payload        → ResultCard 渲染
       ├─ addHistory(payload)           → localStorage（最多 12 条）
       └─ scrollIntoView(#result)       → 平滑滚动到结果区
```

- **下载**：`ResultCard` 通过 `triggerDownload()` 创建临时 `<a>` 指向 `/api/download?...`，由后端代理流式下载；
- **图文批量**：`downloadMany()` 按 650ms 间隔逐个触发下载，避免浏览器拦截；
- **历史重解析**：`HistoryPanel` 点击「重新解析」→ `HeroInput.fill(url, autoParse=true)` 自动填入并立即解析。

### 6.3 本地历史记录

存储键：`dyverse-history`，结构示例：

```json
[
  {
    "id": "7640701464617132402",
    "type": "image",
    "title": "5.17初中数学教资面试真题（包含题本）…",
    "cover": "https://p26-sign.douyinpic.com/...",
    "author": "李饭饭的饭",
    "videoUrl": "",
    "sourceUrl": "https://www.douyin.com/note/7640701464617132402",
    "time": 1778989440
  }
]
```

> 仅保存在浏览器本地，清空记录不会删除已下载文件。

---

## 7. 后端解析原理

### 7.1 总体流程

```
输入文本（分享口令 / 链接）
   │
   ├─ 1. 提取链接  正则匹配 douyin 域名 URL
   │
   ├─ 2. 还原短链   v.douyin.com / iesdouyin.com/share 跟随重定向（移动端 UA）
   │
   ├─ 3. 提取作品 ID   video|note|share/(video|note)/\d+ 等
   │
   ├─ 4. 抓详情页  多入口按顺序尝试：
   │    ① https://www.iesdouyin.com/share/video/{id}   （移动端 UA，SSR 直出数据）
   │    ② https://www.iesdouyin.com/share/note/{id}
   │    ③ https://www.douyin.com/video/{id}            （PC UA）
   │    ④ https://www.douyin.com/note/{id}
   │
   ├─ 5. 提取 JSON  按优先级解析页面内数据：
   │    ① __UNIVERSAL_DATA_FOR_REHYDRATION__
   │    ② RENDER_DATA（URL 编码）
   │    ③ window._ROUTER_DATA
   │
   ├─ 6. 定位作品   递归查找 item_list / awemeDetail / detail / aweme 节点
   │
   ├─ 7. 字段映射   title / author / cover / statistics / music / duration / width / height
   │                video.play_addr.url_list → 无水印（playwm → play）
   │                images[].url_list        → 高清图片列表
   │
   └─ 8. 兜底       若页面无法解析，读取 OG meta 提取标题/封面，并
                    以作品 ID 构造播放地址
```

### 7.2 为什么优先 `iesdouyin.com`

抖音主站 `www.douyin.com` 对非浏览器请求会返回 **JS 反爬验证页**（`byted_acrawler` 挑战），Node 端无法执行 JS 通过校验；而移动端分享页 `iesdouyin.com/share/...` 使用移动 UA 直接返回包含 `window._ROUTER_DATA` 的 SSR HTML，数据完整且无需额外签名，因此作为首选入口。

### 7.3 无水印处理

- 源站播放地址形如 `https://aweme.snssdk.com/aweme/v1/playwm/?video_id=...&ratio=720p&line=0`；
- 后端将 `playwm` 替换为 `play` 得到无水印地址，同时保留原地址作为「带水印版」；
- 对图文作品会做**坏地址防护**：若 `video_id` 参数本身是完整 URL（图文帖常见异常），视频字段直接置空，避免生成无效链接。

### 7.4 下载代理

`/api/download` 解决浏览器直接访问源站时的跨域与防盗链问题：

1. 依次尝试 **PC UA / 移动 UA** 两组请求头（携带 `Referer: https://www.douyin.com/` 与已收集的 Cookie）；
2. 按 `Content-Type` 推断扩展名：`webp / png / gif / avif / jpeg / mp4 / m4a`；
3. 流式转发（`for await...of`），支持 `inline`（预览）与 `attachment`（下载）两种响应头；
4. 请求过程中自动合并源站 `Set-Cookie`，后续请求复用 Cookie 提升成功率。

### 7.5 错误处理

- `express.json` 解析失败 → `400 { message }`
- 未识别链接 / 无作品 ID → `400 { message }`
- 上游资源获取失败 → `502 { message }`
- 未知路由 → `404 { message }`
- 其他异常 → `500 { message }`（控制台输出堆栈）

---

## 8. API 文档

### 8.1 `POST /api/parse` — 解析作品

**请求体**（JSON）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | string | ✅ | 抖音分享口令 / 短链 / 页面链接 |

**请求示例**

```bash
curl -X POST http://localhost:8787/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"8.88 复制打开抖音，看看作品 https://v.douyin.com/xxxxx/ ..."}'
```

**成功响应** `200 OK`

```json
{
  "sourceUrl": "https://v.douyin.com/xxxxx/",
  "resolvedUrl": "https://www.iesdouyin.com/share/video/7598109203374345512/?region=CN...",
  "item": {
    "type": "video",
    "id": "7598109203374345512",
    "title": "作品标题…",
    "author": {
      "nickname": "作者昵称",
      "avatar": "https://p3.douyinpic.com/...",
      "uniqueId": "xxx",
      "signature": "作者签名"
    },
    "cover": "https://p9-sign.douyinpic.com/...",
    "videoUrl": "https://aweme.snssdk.com/aweme/v1/play/?video_id=...",
    "videoUrlWatermark": "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=...",
    "images": [],
    "duration": 96,
    "createTime": 1769072677,
    "statistics": { "digg": 1064, "comment": 58, "share": 56, "collect": 114 },
    "music": "原声名称 - 作者",
    "width": 2160,
    "height": 3840
  }
}
```

> 图文作品：`type` 为 `image`，`images` 为图片 URL 数组，`videoUrl` / `videoUrlWatermark` 为空字符串。

**异常响应**

| 状态码 | 场景 |
| --- | --- |
| 400 | 未识别到抖音链接 / 无法提取作品 ID / 请求体非法 |
| 500 | 服务异常 |
| 200 + `item: null` | 链接可访问但未提取到媒体信息（如作品已删除、仅自己可见等） |

### 8.2 `GET /api/download` — 代理下载 / 预览

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | string | ✅ | 媒体直链（`videoUrl` / `images[]` / 封面等） |
| `filename` | string | ❌ | 下载文件名（自动按类型补扩展名） |
| `inline` | string | ❌ | 传 `1` 时为内联预览，否则为附件下载 |

**请求示例**

```bash
curl "http://localhost:8787/api/download?url=<encoded>&filename=我的视频&inline=1"
```

**响应头**（示例）

```
Content-Type: video/mp4
Content-Disposition: attachment; filename*=UTF-8''%E6%88%91%E7%9A%84%E8%A7%86%E9%A2%91.mp4
Content-Length: 15504346
```

**异常**：`400` 非法地址；`502` 上游获取失败（链接失效/被源站拒绝）。

---

## 9. 配置说明

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT`（环境变量） | `8787` | 后端服务端口 |
| Vite 开发端口 | `5173` | `vite.config.ts` 中 `server.port` |
| `/api` 代理 | `http://localhost:8787` | `vite.config.ts` 中 `server.proxy` |
| 历史记录键 | `dyverse-history` | 前端 localStorage |
| 历史保留条数 | `12` | `App.vue` 中 `history.slice(0, 12)` |

项目当前无需 `.env` 文件；如需要可自行引入 `dotenv` 读取环境变量。

---

## 10. 常见问题排查

### 10.1 解析成功但没有内容（`item: null`）
- 该作品可能已被删除、设为私密或仅粉丝可见（源站返回 `status_audit_self_see`）；
- 可尝试换一个作品验证是否为偶发。

### 10.2 解析一直失败 / 提示未识别链接
- 确认粘贴的是抖音分享口令或含 `douyin.com` 域名的链接；
- 抖音调整页面结构时可能导致提取失效，此时需更新 `server/index.mjs` 中的提取规则（`_ROUTER_DATA` / `RENDER_DATA` / 字段名）。

### 10.3 下载 502 / 文件 0 字节
- 媒体直链通常有时效（几小时到几天），重新解析一次获取新链接即可；
- 源站对异常 UA / 高频请求有限流，稍后重试。

### 10.4 视频预览黑屏
- 视频较大时首次加载较慢，等待缓冲即可；
- 预览走本地代理（`inline=1`），属正常中转开销。

### 10.5 端口被占用
- 开发：修改 `vite.config.ts` 中 `server.port`；
- 后端：启动前设置环境变量 `PORT`，例如 `$env:PORT=9000; npm run server`（Vite 代理目标需同步修改）。

### 10.6 历史记录不显示
- 检查浏览器 localStorage 是否被禁用；
- 清理记录后需重新解析才会写入新记录。

### 10.7 部署到服务器后无法解析
- 部分云服务器 IP 会被抖音风控拦截（验证页），本工具设计为**本机使用**；
- 若必须部署，建议使用家庭宽带 IP 并控制请求频率。

---

## 11. 免责声明

本工具**仅供个人学习、研究与本地收藏使用**。

- 所有内容版权归原作者及抖音平台所有；
- 请勿用于商业用途、批量抓取或未经授权的再传播；
- 使用者需自行承担因使用本工具产生的相关责任。

---

## 12. 后续规划

- [ ] 批量解析队列（一次粘贴多个链接）
- [ ] 图文一键打包 ZIP 下载
- [ ] 下载进度条与断点续传
- [ ] PWA 离线支持
- [ ] 多平台支持（快手 / B 站 / 小红书）
- [ ] 国际化（EN / 中文切换）

---

*Built with ❤️ & gradients — DyVerse v1.0.0*