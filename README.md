# astro-mingcy

基于 **Astro 4 + React 18** 的静态博客主题。以 [astro-gyoza](https://github.com/lxchapu/astro-gyoza) 为基线深度定制，聚焦三件事：**SPA 级导航体验**、**长文阅读质感**、**构建体积与运行时开销控制**。

[![astro](https://img.shields.io/badge/astro-4.6-ff5a03)](https://astro.build/)
[![react](https://img.shields.io/badge/react-18.2-61dafb)](https://reactjs.org/)
[![tailwind](https://img.shields.io/badge/tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![node](https://img.shields.io/badge/node-18%20%2B-43853d)](https://nodejs.org/)

> **演示站点：** 请替换成你自己的站点地址，或部署本仓库后填入构建后的预览链接。

---

## ✨ 特色

### 🎨 视觉与交互

- **双胶囊悬浮导航** — Logo 与菜单各自独立浮起，默认完全透明无边框，滚动时玻璃材质（`backdrop-filter`）、边框与投影各自浮现并整体下移
- **弹簧物理滑动药丸** — `requestAnimationFrame` 逐帧驱动（stiffness `7000` / damping `96` / 位置容差 `0.1px`），带过冲、余震与速度拖尾，非 CSS transition
- **胶囊玻璃二级下拉** — `border-radius: 999px` + `12px` 模糊 + 顶部悬浮间隙，内部内嵌独立滑动药丸，当前页用波浪下划线标识
- **移动端折叠抽屉** — 原生 `<details>/<summary>` 零 JS 折叠，当前页所在分组自动展开，chevron 弹性旋转
- **每页随机强调色** — `10` 组 light/dark 双色板，`is:inline` 内联脚本构建期序列化，`Math.random()` 每页随机，零运行时依赖
- **全局随机壁纸** — 一次请求两处复用：`Image.decode()` 预解码后写入 `:root` 的 `--random-bg-url`，全局背景层与侧边栏卡片同步淡入
- **Apple Liquid Glass 卡片** — 毛玻璃 + 双层阴影 + 鼠标跟随径向高光 + 点击弹簧弹出
- **浅深主题** — 全站 CSS 变量驱动（`--color-accent` / `--color-text-primary` …），零硬编码颜色，一键切换

### ⚡ 性能

- **SPA 页面切换** — `@swup/astro`（`containers: ['main']` + `morph: Provider`），切页无白屏闪烁
- **React island 资源不泄漏** — `useCleanupOnPageLeave` 在切页前统一释放定时器 / rAF / `IntersectionObserver` / 事件监听（Swup 替换 DOM 时 React 不会自动 unmount）
- **滚动降级** — 滚动期间毛玻璃退化为半透明纯色（`backdrop-filter: none`），避开每帧背景重采样
- **Pagefind 静态搜索** — 构建期生成索引，纯前端全文检索，无后端依赖
- **边缘缓存** — Vercel `Cache-Control`：`/_astro/*` 一年 immutable，页面级 `s-maxage`
- **第三方资源本地化** — Fancybox / Waline / friend-circle-lite / HeoLivePhoto 全部部署到 `/public`，不依赖外部 CDN，规避跟踪防护拦截导致的功能失效

### 📖 阅读体验

- **KaTeX 数学公式**、**Shiki 代码高亮**（语言标签 + 一键复制按钮）
- 阅读时长 / 字数统计 / 阅读进度条 / 返回顶部 / 评论悬浮按钮
- **浮动 TOC 目录** — `IntersectionObserver` 滚动高亮 + Framer Motion `layoutId` 波浪滑动指示器
- **Markdown 增强** — 删除线 `~~`、上下标、彩色文字、彩虹渐变、霓虹 / 故障 / 打字机 / 扫描线特效、内联标签、黑幕、CodePen 嵌入、脚注（中文「参考 / 返回正文」）
- **图片灯箱** — Fancybox 全站统一图片预览，支持左右滑动、无限循环、键盘操作与实况照片
- **过时提示** — 依据更新时间自动提示文章可能过时

### 📝 博客能力

- **文章子文件夹结构** — 图片与 Markdown 同目录，单文件自包含
- **双评论系统** — Twikoo + Waline 胶囊切换器，`localStorage` 记忆上次选择，双端本地化懒加载
- **相册与实况照片** — CSS `column` 瀑布流（原生比例不裁切）+ Fancybox 分组轮播；实况支持 `.pvt` / 封面+视频分离 / Motion Photo 三形态，`IntersectionObserver` 并发池按需解包
- **内容页齐全** — 归档 / 标签 / 分类总览 / 项目 / 工具 / 友链（分类展示 + 一键导入模板 + 友圈动态）
- **浏览量** — Umami 分享 API（归一化尾斜杠、当天缓存、零自增副作用）
- **站点基建** — RSS、自定义 `sitemap.xml`、`robots.txt`、运行天数、曝光次数统计

### 🛠 工程化

- **脚手架脚本** — `new-post` / `new-project` / `new-friend` 交互式生成
- **提交规范** — `simple-git-hooks` + `commitlint`（Conventional Commits）+ `lint-staged` + Prettier
- **类型检查** — `astro check` 零 error / warning / hint

---

## 🧰 技术栈

| 层   | 技术                                                                                                                 |
| :--- | :------------------------------------------------------------------------------------------------------------------- |
| 框架 | [Astro 4](https://astro.build/) · [React 18](https://reactjs.org/) · [TypeScript 5](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS 3](https://tailwindcss.com/) + CSS 变量主题体系                                                        |
| 动画 | [Framer Motion 11](https://www.framer.com/motion/)                                                                   |
| 状态 | [Jotai](https://jotai.org/)                                                                                          |
| 导航 | [@swup/astro](https://swup.js.org/) SPA 切换                                                                         |
| 搜索 | [Pagefind](https://pagefind.app/)                                                                                    |
| 公式 | [KaTeX](https://katex.org/)                                                                                          |
| 高亮 | [@shikijs/rehype](https://shiki.style/)                                                                              |
| 评论 | [Twikoo](https://twikoo.js.org/) · [Waline](https://waline.js.org/)                                                  |
| 灯箱 | [Fancybox 6](https://fancyapps.com/fancybox/)（本地化）                                                              |
| 分析 | Umami · Vercel Analytics                                                                                             |

---

## 🚀 快速开始

```bash
pnpm install        # 安装依赖
pnpm dev            # 启动开发服务器 localhost:4321
pnpm build          # 类型检查 → 构建 → Pagefind 搜索索引
pnpm preview        # 预览生产构建
pnpm lint           # Prettier 格式化
```

### 常用命令

| 命令               | 说明                                         |
| :----------------- | :------------------------------------------- |
| `pnpm dev`         | 启动开发服务器（`localhost:4321`）           |
| `pnpm build`       | 完整生产构建（类型检查 + Pagefind 搜索索引） |
| `pnpm preview`     | 预览构建产物                                 |
| `pnpm lint`        | Prettier 格式化全部文件                      |
| `pnpm new-post`    | 交互式新建文章（含子文件夹与图片）           |
| `pnpm new-project` | 新增项目卡片                                 |
| `pnpm new-friend`  | 新增友链                                     |
| `pnpm deploy`      | 部署到静态托管                               |

> `pnpm build` 会先跑 `astro check` 类型检查，再构建并生成 Pagefind 搜索索引。

---

## 🗂 项目结构

```text
├── public/               # 静态资源
│   ├── fancybox/         #   灯箱（本地化）
│   ├── fclite/           #   友圈插件（本地化）
│   ├── fonts/            #   字体
│   ├── image/            #   图片
│   ├── livephoto/        #   实况照片组件（本地化）
│   ├── (pagefind/)       #   搜索索引（`pnpm build` 自动生成）
│   └── waline/           #   Waline 客户端（本地化）
├── src/
│   ├── components/       # 组件
│   │   ├── background/   #   背景效果
│   │   ├── comment/      #   评论系统
│   │   ├── footer/       #   页脚
│   │   ├── head/         #   头部注入（主题/强调色/分析）
│   │   ├── header/       #   导航栏
│   │   ├── hero/         #   首页 hero
│   │   ├── post/         #   文章相关
│   │   ├── provider/     #   React 全局 Provider
│   │   └── sidebar/      #   侧边栏
│   ├── content/          # 内容（posts / galleries）
│   ├── data/             # 结构化数据（友链 / 项目 / 相册清单）
│   ├── hooks/            # 自定义 Hooks（含切页清理）
│   ├── layouts/          # 布局（Layout / Markdown / Page）
│   ├── pages/            # 路由
│   ├── plugins/          # remark / rehype 插件
│   ├── store/            # Jotai 状态
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   └── config.json       # 站点配置
├── scripts/              # 构建与同步脚本
├── astro.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json           # 边缘缓存头
```

---

## ⚙️ 配置

站点配置集中在 `src/config.json`：

| 键                                         | 说明                                                        |
| :----------------------------------------- | :---------------------------------------------------------- |
| `site`                                     | URL、标题、描述、关键词、语言、图标                         |
| `author`                                   | 作者名、Twitter、头像                                       |
| `hero`                                     | 首页文案、社交链接（含自定义颜色）                          |
| `color.accent`                             | `10` 组强调色，每组含 `light` / `dark` 双值，构建期随机选取 |
| `color.bg` / `color.text` / `color.border` | 明暗模式配色                                                |
| `menus`                                    | 首页菜单快捷项                                              |
| `posts.perPage`                            | 首页每页文章数                                              |
| `footer.startTime`                         | 站点起始时间（用于运行天数与版权年份）                      |
| `twikoo.envId`                             | Twikoo 云函数地址                                           |
| `analytics`                                | Umami / Google / Clarity 开关与配置                         |

> 修改 `config.json`、`astro.config.js`、`package.json` 属于高风险变更，提交前请确认。

---

## 📦 内容组织

**文章**：`src/content/posts/<slug>/index.md`，图片放同目录并在 Markdown 内用相对路径引用。

```markdown
---
title: 文章标题
date: 2026-10-05
summary: 一句话简介
tags: [Astro]
category: 技术分享
cover: ./cover.webp
---

正文内容，配图 `![](./cover.webp)`
```

**相册**：`src/content/galleries/<slug>/index.md` + 图片文件；CDN 相册在 `src/data/gallery-manifests/<slug>.json` 声明清单（支持实况照片三形态）。

**示例内容**：仓库自带两篇示例文章（`src/content/posts/intro/` 主题介绍、`src/content/posts/features/` 排版功能指南）与一个示例相册（`src/content/galleries/sample/`），可直接预览效果，也可全部删除后换成自己的内容。

---

## ☁️ 部署

**Vercel**（推荐）：推送到 `main` 后自动构建，`vercel.json` 已配置边缘缓存头。

**GitHub Actions**：仓库内置两个工作流 —— 构建缓存命中检查、长期不活跃的 Issue 自动关闭。

---

## 🙏 致谢

- [astro-gyoza](https://github.com/lxchapu/astro-gyoza) — 主题基线
- [Shiro](https://github.com/innei/Shiro) — 目录交互参考
- [friend-circle-lite](https://github.com/willow-god/Friend-Circle-Lite) — 友圈动态
- [HeoLivePhoto](https://github.com/he1ga/heolivephoto) — 实况照片
- [Fancybox](https://fancyapps.com/fancybox/) · [Pagefind](https://pagefind.app/) · [Twikoo](https://twikoo.js.org/) · [Waline](https://waline.js.org/) · [KaTeX](https://katex.org/) · [Shiki](https://shiki.style/)

---

## 📄 License

[MIT](./LICENSE) © 茗辰原
