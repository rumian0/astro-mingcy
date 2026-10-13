---
title: '主题介绍'
date: 2024-01-21
summary: 'Astro Mingcy 主题介绍 — 特性、快速开始、配置项、评论系统、统计、随机壁纸、相册与实况照片、贡献与许可'
cover: './theme-cover.png'
category: '网站建站'
tags: ['Astro', 'Mingcy', '指南']
draft: false
comments: true
sticky: 2
---

这是一篇随主题附带的介绍文章，方便你预览主题效果，也方便替换或删除。

## 它是什么

基于 **Astro 4 + React 18 + Tailwind CSS 3** 的静态博客主题，以 [astro-gyoza](https://github.com/lxchapu/astro-gyoza) 为基线深度定制，聚焦三件事：**SPA 级导航体验**、**长文阅读质感**、**构建体积与运行时开销控制**。

## 特性速览

- **SPA 级导航**：Swup 驱动的路由切换，React island 只在水合时初始化，切页零重复挂载
- **液态玻璃导航栏**：参考主流设计语言实现的双浮起胶囊 + 弹簧滑动指示器，亮暗模式自动适配
- **丰富排版增强**：文字特效、荧光高亮、黑幕、标签块、KaTeX 公式、Shiki 代码块、表格增强、脚注、MDX 组件，详见「Astro Mingcy 内容标签使用指南」一文
- **双评论系统**：Twikoo 与 Waline 双引擎，胶囊切换器 + 记忆上次选择
- **图片灯箱**：Fancybox 全站统一图片预览，支持左右滑动、无限循环、键盘操作
- **相册与实况照片**：CSS column 瀑布流 + HeoLivePhoto 缩略图实况 + Fancybox 灯箱播放
- **随机壁纸**：全局背景 + 侧边栏卡片共用一张随机图，Service Worker 跨刷新缓存
- **AI 无关**：本主题不含任何 AI 摘要或 AI 对话功能，保持轻量
- **可访问性**：`prefers-reduced-motion` 全局降级、语义化标签、键盘可操作

## 快速开始

```bash
pnpm install
pnpm dev
pnpm build
```

要求 Node.js 18+，使用 pnpm 作为包管理器。

## 配置

站点配置集中在 `src/config.json`，包括：

| 字段               | 说明                                        |
| ------------------ | ------------------------------------------- |
| `site`             | 站点 URL、标题、描述、关键词、语言、favicon |
| `author`           | 作者名、Twitter ID、头像                    |
| `hero`             | 首页主视觉文案、社交链接、一言              |
| `color`            | 随机强调色数组、背景/文字/边框色            |
| `menus`            | 导航菜单（支持二级分组）                    |
| `posts.perPage`    | 首页每页文章数                              |
| `footer.startTime` | 站点启动时间（用于运行天数）                |
| `twikoo.envId`     | Twikoo 服务地址                             |
| `sponsor.wechat`   | 打赏码图片                                  |
| `analytics`        | 统计配置                                    |

## 评论系统

默认支持 Twikoo 与 Waline 双引擎。首次使用需要自己部署服务：

1. **Twikoo**：部署到 Vercel（社区版 `twikoo-vercel`），然后把地址填到 `config.json` 的 `twikoo.envId`，以及 `src/layouts/Layout.astro` 里的 `TWIKOO_ENV_ID` 常量
2. **Waline**：部署 Waline 服务，然后填到 `Layout.astro` 的 `WALINE_SERVER` 常量

两处常量保持同一地址即可。未部署前评论模块会静默失败，不影响其他功能。

## 统计与浏览量

- **Umami**：`Layout.astro` 里被注释的 Umami script 标签是接入点，取消注释并填自己的实例地址
- **全站访客数 / 单篇阅读量**：`src/components/footer/SiteVisitors.astro` 与 `src/components/post/ReadCount.astro` 走 Umami 分享 API，需填 `API` 与 `SHARE_ID` 两个常量；不填则显示 `--`

## 随机壁纸

`Layout.astro` 里有一个内联脚本负责拉取随机图并写入 CSS 变量，`public/sw.js` 负责跨刷新缓存。

默认使用 `picsum.photos`。换成自己的随机图接口时，**三处需要同步改**：

1. `Layout.astro` 里 `var url = ...` 的接口地址
2. `public/sw.js` 里的 `BG_HOST` 常量
3. `public/sw.js` 里的 `BG_KEY` 常量（仅作 cache 槽位标识，需与 `BG_HOST` 一致）

随机图接口若**不返回 CORS 头**也能工作 —— Service Worker 用 `no-cors` 拿 opaque response，浏览器可渲染但 JS 读不到字节，这正是本方案的关键。

## 相册与实况照片

在 `src/content/galleries/<相册名>/` 下放图片与 `index.md` 即可自动生成相册页。

- 普通相册：直接放图片
- **实况照片**：在文章或相册中使用 `.pvt`（封面 + 视频的打包格式），缩略图会内联播放，点击进灯箱循环播放
- **远端运动照片**：通过 `src/data/gallery-manifests/<slug>.json` 描述远端素材清单，可走 Motion Photo 或封面/视频分离两种模式

已附一个示例相册 `src/content/galleries/sample/`，可直接预览效果。

## 新增内容

```bash
pnpm new-post      # 新建文章
pnpm new-project   # 新建项目
pnpm new-friend    # 新建友链
```

## 贡献

欢迎 issue 与 PR。修改代码前请先跑 `pnpm build` 确认无报错。

## 许可

本项目基于 [MIT License](/LICENSE) 开源。它 fork 自 [astro-gyoza](https://github.com/lxchapu/astro-gyoza)（同样 MIT 许可），二次修改与再分发均允许，但请保留原始版权声明。
