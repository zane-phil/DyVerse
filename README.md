# DyVerse · 抖音视频 / 图文下载器

> 一个拥有高级质感界面的抖音内容下载 Web 项目：**Vue 3 + TypeScript + TDesign UI + Less + Node.js 代理服务**。
> 支持抖音 / 小红书 / 汽水音乐分享口令、短链接、视频页与图文笔记的一键解析，无水印视频下载、图片批量保存与音乐封面下载。

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
- 前端以极简卡片展示作品（标题、作者、封面预览）与 **无水印视频 / 图文全部图片** 下载；
- 视频与图片通过本地代理服务中转下载，规避跨域与防盗链限制。

整体采用**黑白灰极简**设计：单一核心流程（粘贴 → 解析 → 下载），克制的中性光晕背景、低饱和玻璃卡片与克制的动效。

---

## 2. 功能特性

| 类别 | 能力 | 说明 |
| --- | --- | --- |
| 🎬 视频下载 | 无水印原画 | `playwm` → `play` 地址转换，分辨率优先 1080P+（取决于源站提供） |
| 🖼️ 图文笔记 | 单张下载 / 一键全部 | 图片以原始清晰度链接逐个保存，悬停可单张下载 |
| 🎵 汽水音乐 | 音乐封面下载 | 解析 `qishui.douyin.com` 短链，展示歌曲 / 歌手 / 专辑信息，一键下载 1080px 高清封面 |
| 🔗 链接兼容 | 抖音 / 小红书 / 汽水音乐 | 抖音 `v.douyin.com`、`douyin.com/video|note`、`iesdouyin.com/share/...`；小红书 `xhslink.com|cn` 短链、`xiaohongshu.com/explore|discovery/item/...`；汽水音乐 `qishui.douyin.com/s/...` |
| ▶️ 在线预览 | 视频 / 图片预览 | 通过本地代理内联播放与展示，不受防盗链影响 |
| 📊 作品信息 | 关键信息 | 标题、作者、封面与预览，克制呈现 |
| 🛡️ 隐私安全 | 全程本地 | 解析与媒体中转均在本机完成，不经过任何第三方服务器 |
| 📱 响应式 | 多端适配 | 桌面 / 平板 / 手机自适应，无横向溢出 |
| 🎨 视觉设计 | 黑白灰极简 | 单色系设计令牌统一管理，只保留核心流程 |

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

> **端口占用自动 +1**：若 5173 / 8787 已被其他程序占用，Vite 与后端会分别自动切换到下一个可用端口（5174、8788…），并在终端提示实际地址。`dev:all` 会先等待后端就绪再启动前端，前端代理自动读取后端实际端口，无需手动改配置。

### 4.4 生产模式

```bash
npm run build   # 类型检查 + 构建前端产物到 dist/
npm start       # 启动后端，同时托管 dist 静态资源与 API
```

访问 **http://localhost:8787** 即可使用（单端口部署）。

### 4.5 Docker 部署（飞牛 NAS 等）

项目提供 `Dockerfile` + `docker-compose.yml`，并内置 GitHub Actions 工作流：每次推送 `main` 自动构建 **amd64 / arm64 双架构**镜像并发布到 **GHCR**（`ghcr.io/zane-phil/dyverse`），NAS 无需安装 Node 即可运行。

**方式一：直接拉取镜像（推荐，免构建）**

1. 首次使用前，将 GitHub 上的 GHCR 包设为公开：GitHub → 头像 → *Your packages* → `dyverse` → *Package settings* → *Change visibility* → Public（否则 NAS 拉取需要登录 token）；
2. 飞牛 NAS：Docker 应用 → 编排 / 项目 → 新建项目，粘贴下面的 `docker-compose.yml` 并启动；或 SSH 到 NAS 执行：

```bash
mkdir -p /vol1/docker/dyverse && cd /vol1/docker/dyverse
# 保存仓库中的 docker-compose.yml 到该目录
docker compose pull   # 拉取 ghcr.io/zane-phil/dyverse:latest
docker compose up -d  # 启动
```

```yaml
services:
  dyverse:
    build: .
    image: ghcr.io/zane-phil/dyverse:latest
    container_name: dyverse
    restart: unless-stopped
    ports:
      - '8787:8787'
    environment:
      - TZ=Asia/Shanghai
```

**方式二：NAS 本地构建**

```bash
git clone https://github.com/zane-phil/DyVerse.git && cd DyVerse
docker compose up -d --build
```

**访问与说明**

- 浏览器打开 `http://<NAS_IP>:8787` 即可使用；如需域名 / HTTPS 外网访问，用 NAS 自带的反向代理即可；
- 国内网络拉取 `ghcr.io` 可能缓慢或失败：可配置镜像加速 / 代理，或改用**方式二**本地构建（构建依赖 npm，同样建议配置 npm 镜像如 `https://registry.npmmirror.com`）；
- 本项目无数据库、无持久化数据（端口文件仅运行时临时写入），无需挂载卷；更新镜像 `docker compose pull && docker compose up -d` 即可。

### 4.6 脚本一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 仅启动前端（需要后端已在 8787 运行） |
| `npm run predev` | 等待后端写入端口文件并确认可访问（`npm run dev` 前自动执行） |
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
│  ├─ App.vue                # 单页骨架：解析状态与布局
│  ├─ tdesign.d.ts           # TDesign 全局组件类型声明
│  ├─ api/
│  │  └─ media.ts            # 前端 API 客户端（解析 / 下载 / 批量下载）
│  ├─ components/
│  │  ├─ ParserInput.vue     # 链接输入 / 一键粘贴 / 解析
│  │  └─ ResultCard.vue      # 解析结果（预览 / 作者 / 下载）
│  ├─ styles/
│  │  ├─ variables.less      # 设计令牌（颜色 / 圆角 / 阴影 / 字体）
│  │  └─ global.less         # 全局样式与工具类
│  ├─ types/
│  │  └─ index.ts            # MediaItem / ParseResult 类型
│  └─ utils/
│     └─ format.ts           # 格式化工具（相对时间 / 时长 / 文件名）
├─ public/
│  └─ favicon.svg            # 站点图标
├─ index.html                # HTML 入口（含 SEO meta）
├─ vite.config.ts            # 构建与开发代理配置
├─ Dockerfile                # 多阶段构建镜像（node:22-alpine）
├─ docker-compose.yml        # 一键编排（GHCR 镜像 / 本地构建）
├─ .github/workflows/        # docker-publish：推送 main 自动构建发布 GHCR
├─ package.json
└─ README.md
```

---

## 6. 前端设计与实现

### 6.1 设计系统（Less 设计令牌）

所有颜色、圆角、阴影、字体统一收敛在 `src/styles/variables.less`：

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--dy-bg` | `#0a0a0d` | 页面主背景 |
| `--dy-surface` | `rgba(255,255,255,.04)` | 毛玻璃卡片底色 |
| `--dy-border` | `rgba(255,255,255,.09)` | 卡片描边 |
| `--dy-primary` | `#ffffff` | 品牌白（主按钮 / 高对比） |
| `--dy-radius-xl` | `22px` | 大卡片圆角 |
| `--dy-shadow-1/2` | 多层阴影 | 悬浮层次 |

**视觉层次**（从上到下）：

1. **背景层**：柔和中性光晕 + 细网格纹理，营造工具质感与纵深；
2. **顶栏**：固定毛玻璃，品牌 + 本地运行状态；
3. **标题层**：工具式标题（等宽字体 eyebrow + 渐变主标题）；
4. **流程层**：三步指示（粘贴 → 解析 → 下载），状态驱动高亮；
5. **输入层**：醒目大输入框（聚焦光环 + 快捷键提示 + 立即解析）；
6. **结果层**：媒体预览（带信息徽标）+ 元数据 + 下载主操作，带入场动画；
7. **页脚层**：一行免责声明。

### 6.2 页面数据流

```
用户在 ParserInput 粘贴链接
        │
        ▼
ParserInput.handleParse()
  └─ 校验是否包含抖音域名
  └─ POST /api/parse ──────────────► 后端解析（见第 7 节）
        │                                │
        │ ◄────────── ParseResult ───────┘
        ▼
emit('parsed', result)
  └─ App.handleParsed()
       ├─ result.value = payload        → ResultCard 渲染
       └─ 结果卡紧随输入区出现，无需滚动
```

- **下载**：`ResultCard` 通过 `triggerDownload()` 创建临时 `<a>` 指向 `/api/download?...`，由后端代理流式下载；
- **图文批量**：`downloadMany()` 按 650ms 间隔逐个触发下载，避免浏览器拦截；
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
   ├─ 4. 注册设备指纹  调用 ttwid 注册接口获取匿名 Cookie（ttwid），
   │                    缓存并在过期时自动刷新
   │
   ├─ 5. 抓详情数据  优先请求 web 详情接口（携带 ttwid）：
   │    ① https://www.douyin.com/aweme/v1/web/aweme/detail/
   │       （完整数据，含图文 images[] 与视频流）
   │    ② 失败时回退分享页 SSR 数据：
   │       iesdouyin.com/share/video|note/{id}
   │       www.douyin.com/video|note/{id}
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

### 7.2 为什么用 web 详情接口

抖音主站 `www.douyin.com/aweme/v1/web/aweme/detail/` 返回最完整的作品数据：分享页 SSR 数据中的 `images[]` 仅有静态图，而详情接口的 `images[]` 附带完整图片列表（含实况图作品的静态帧），图文作品的每张图片都能拿到最高清地址。

匿名直接请求该接口会被抖音「反爬虫」策略拦截（返回空响应体）。服务端先调用 `ttwid.bytedance.com` 的 union/register 接口注册匿名设备指纹（`ttwid` Cookie），携带后即可稳定通过校验；ttwid 有有效期，接口返回空时自动刷新重试。无需实现 a_bogus 等复杂签名。

### 7.3 无水印处理

- 源站播放地址形如 `https://aweme.snssdk.com/aweme/v1/playwm/?video_id=...&ratio=720p&line=0`；
- 后端将 `playwm` 替换为 `play` 得到无水印地址；
- 对图文作品会做**坏地址防护**：若 `video_id` 参数本身是完整 URL（图文帖常见异常），视频字段直接置空，避免生成无效链接。

### 7.4 下载代理

`/api/download` 解决浏览器直接访问源站时的跨域与防盗链问题：

1. 依次尝试 **PC UA / 移动 UA** 两组请求头（携带 `Referer: https://www.douyin.com/` 与已收集的 Cookie）；
2. 按 `Content-Type` 推断扩展名：`webp / png / gif / avif / jpeg / mp4 / m4a`；
3. 流式转发（`for await...of`），支持 `inline`（预览）与 `attachment`（下载）两种响应头；
4. 请求过程中自动合并源站 `Set-Cookie`，后续请求复用 Cookie 提升成功率。

### 7.5 小红书解析

`/api/parse` 自动识别小红书链接（`xhslink.com` 短链 / `xiaohongshu.com/explore` / `discovery/item` 页面）：

1. **还原短链**：`xhslink.com` 跟随重定向（PC UA），还原后的链接通常带 `xsec_token`——小红书对不带 token 的直链会返回安全页，因此**分享短链成功率最高**；
2. **抓取 SSR**：先访问一次 `xiaohongshu.com/explore` 收集匿名 Cookie（`a1` / `webId`），再用 **PC UA** 抓取笔记页（移动 UA 会被返回无数据的安全页），解析 `window.__INITIAL_STATE__` 中的 `note.noteDetailMap[id].note`；
3. **容错解析**：SSR 状态中常见字面量 `undefined`（非法 JSON），解析前统一替换为 `null`；
4. **字段映射**：`imageList` 逐张取最高清地址（优先 `urlDefault` 原图，其次 `infoList` 中面积最大条目）；视频取 `video.media.stream.h264` 最后一档 `masterUrl`（1080P 优先）；`interactInfo` 映射点赞/评论/收藏/分享数，毫秒时间戳统一转秒；
5. **下载代理**：`xhscdn.com` 媒体自动携带 `Referer: https://www.xiaohongshu.com/` 中转。

> 小红书笔记页对未登录访问有一定风控，作品被删除、仅自己可见或请求过于频繁时会解析失败；短链过期（还原后落在首页）会提示重新复制最新分享链接。

### 7.6 汽水音乐解析

`/api/parse` 自动识别汽水音乐链接（`qishui.douyin.com/s/...` 短链）：

1. **还原短链**：PC UA 跟随重定向到 `music.douyin.com/qishui/share/track?track_id=...`，提取 `track_id`；
2. **抓取 SSR**：分享页内联 `_ROUTER_DATA` 脚本（括号配对截取），数据位于 `loaderData.track_page.audioWithLyricsOption`——含 `trackName`（歌名）、`trackInfo.album`（专辑名 / 封面 uri / 发行时间）、`trackInfo.artists`（歌手）；
3. **封面直链**：由 CDN 前缀 + 图片 uri 构造 `~c5_1080x1080.jpg` 高清封面（douyinpic 无签名直链，可经下载代理中转）；`_ROUTER_DATA` 缺失时回退 JSON-LD（`application/ld+json`，含标题与 375px 封面）；
4. **字段映射**：`type` 为 `music`，`cover` / `images[0]` 为封面直链，`author.nickname` 为歌手名，`createTime` 为专辑发行时间。

### 7.7 错误处理

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
    "platform": "douyin",
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

> `platform` 标识来源（`douyin` / `xiaohongshu` / `qishui`）；图文作品：`type` 为 `image`，`images` 为图片 URL 数组，`videoUrl` / `videoUrlWatermark` 为空字符串；实况图作品统一按静态图片输出；汽水音乐作品：`type` 为 `music`，`cover` / `images[0]` 为封面直链。

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

**端口冲突策略**：后端监听失败（`EADDRINUSE`）时自动在 `8787~8806` 范围内逐个 +1 尝试，并把实际端口写入 `.dyverse-port.json`（已加入 `.gitignore`）；Vite 在 `5173` 被占用时自动使用下一个可用端口；前端 `/api` 代理启动时读取 `.dyverse-port.json` 定位后端实际端口。

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

### 10.6 部署到服务器后无法解析
- 部分云服务器 IP 会被抖音 / 小红书风控拦截（验证页），本工具设计为**本机使用**；
- 若必须部署，建议使用家庭宽带 IP 并控制请求频率。

### 10.7 小红书解析失败 / 提示链接已失效
- 小红书分享短链（`xhslink.com` / `xhslink.cn`）会过期：过期后还原会落在首页，此时请在小红书 App 重新复制最新分享链接；
- 直链（`xiaohongshu.com/explore/{id}`）不带 `xsec_token` 时会被安全页拦截，请使用带 token 的分享链接（App 分享出去的链接自带）；
- 作品被删除、仅自己可见或请求过于频繁时同样会失败，可稍后重试。

### 10.8 汽水音乐解析失败
- `qishui.douyin.com` 短链会过期，过期后请重新复制最新分享链接；
- 歌曲下架或地区限制时无法获取，属平台版权策略，非工具问题。

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
