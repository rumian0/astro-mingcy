/* ══════════════════════════════════════════════════════════════
   友圈（Friend-Circle-Lite）自包含脚本 —— 提取自 https://your-site.example.com/links/fcircle
   ────────────────────────────────────────────────────────────────
   1. 随机强调色注入（移植 AccentColorInjector.astro，与 fcircle.css 段① 兜底值一致）
   2. data-theme 兜底（新站没有明暗切换时按 localStorage / 系统偏好补一个）
   3. window.UserConfig（fclite 插件配置，数据源 your-fcircle-api.example.com）
   4. fclite 插件本体（public/fclite/fclite.js 原样并入，去掉末尾自动执行）
   5. 友链状态区（status.json → #links-summary + #links-grid）

   用法：<script src="/fcircle/fcircle.js"></script> 即可，幂等，重复引入无副作用。
   ══════════════════════════════════════════════════════════════ */
;(function () {
  'use strict'

  if (window.__fcircleReady) return
  window.__fcircleReady = true

  /* ───────────────────────────────────────────
     1. 随机强调色注入
     数据来自 src/config.json 的 color 段
  ─────────────────────────────────────────── */
  var accentList = [
    { light: '#F55555', dark: '#325ea3' },
    { light: '#0396FF', dark: '#ABDCFF' },
    { light: '#fb7287', dark: '#99D8CF' },
    { light: '#F072B6', dark: '#3ac8f6' },
    { light: '#9F44D3', dark: '#E2B0FF' },
    { light: '#FF6666', dark: '#A1CCD1' },
    { light: '#F6416C', dark: '#838BC6' },
    { light: '#32CCBC', dark: '#90F7EC' },
    { light: '#33A6B8', dark: '#79F1A4' },
    { light: '#F55555', dark: '#297aa0' },
  ]
  var bgPrimary = { light: '#f2f5ec', dark: '#10131a' }
  var bgSecondary = { light: '#e9eddb', dark: '#1a2131' }
  var textPrimary = { light: '#33373a', dark: '#f6f7f8' }
  var textSecondary = { light: '#5f6b5a', dark: '#a9b4c9' }
  var borderPrimary = { light: '#d5dcc6', dark: '#2e3b59' }

  // 根背景混合基线（与旧 chroma.mix 输入一致）
  var ROOT_BASE_LIGHT = [242, 245, 236] // rgb(242,245,236) 浅绿底
  var ROOT_BASE_DARK = [0, 2, 18] // rgb(0,2,18) 深蓝黑底

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  function mixRgb(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ]
  }

  function rgbStr(c) {
    return c.join(' ')
  }

  function injectAccent() {
    var accent = accentList[(Math.random() * accentList.length) | 0]
    var al = hexToRgb(accent.light)
    var ad = hexToRgb(accent.dark)
    var rootLight = mixRgb(ROOT_BASE_LIGHT, al, 0.05)
    var rootDark = mixRgb(ROOT_BASE_DARK, ad, 0.12)

    var style = document.createElement('style')
    style.setAttribute('data-fcircle-accent', '1')
    style.textContent =
      'html{' +
      '--color-accent:' +
      rgbStr(al) +
      ';' +
      '--color-bg-root:' +
      rgbStr(rootLight) +
      ';' +
      '--color-bg-primary:' +
      rgbStr(hexToRgb(bgPrimary.light)) +
      ';' +
      '--color-bg-secondary:' +
      rgbStr(hexToRgb(bgSecondary.light)) +
      ';' +
      '--color-text-primary:' +
      rgbStr(hexToRgb(textPrimary.light)) +
      ';' +
      '--color-text-secondary:' +
      rgbStr(hexToRgb(textSecondary.light)) +
      ';' +
      '--color-border-primary:' +
      rgbStr(hexToRgb(borderPrimary.light)) +
      '}' +
      "[data-theme='dark']{" +
      '--color-accent:' +
      rgbStr(ad) +
      ';' +
      '--color-bg-root:' +
      rgbStr(rootDark) +
      ';' +
      '--color-bg-primary:' +
      rgbStr(hexToRgb(bgPrimary.dark)) +
      ';' +
      '--color-bg-secondary:' +
      rgbStr(hexToRgb(bgSecondary.dark)) +
      ';' +
      '--color-text-primary:' +
      rgbStr(hexToRgb(textPrimary.dark)) +
      ';' +
      '--color-text-secondary:' +
      rgbStr(hexToRgb(textSecondary.dark)) +
      ';' +
      '--color-border-primary:' +
      rgbStr(hexToRgb(borderPrimary.dark)) +
      '}'
    document.head.appendChild(style)
  }

  /* ───────────────────────────────────────────
     2. data-theme 兜底
     只在 html 完全没有 data-theme 属性时写入，
     新站若已有主题开关（自己会 setAttribute）则完全不碰
  ─────────────────────────────────────────── */
  function ensureTheme() {
    var el = document.documentElement
    if (el.hasAttribute('data-theme')) return
    var saved = null
    try {
      saved = localStorage.getItem('theme')
    } catch (e) {}
    if (saved === 'dark' || saved === 'light') {
      el.setAttribute('data-theme', saved)
      return
    }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    el.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }

  /* ───────────────────────────────────────────
     3. fclite 插件配置
  ─────────────────────────────────────────── */
  window.UserConfig = window.UserConfig || {
    private_api_url: 'https://fc.example.com/',
    page_turning_number: 24,
    error_img: '/fcircle/avatar-fallback.svg',
  }

  /* ───────────────────────────────────────────
     4. fclite 插件本体
     来源：public/fclite/fclite.js（jsDelivr minify 自
     https://github.com/willow-god/Friend-Circle-Lite main/fclite.js）
     改动：仅去掉文件末尾的自动执行 whenDOMReady()，
           改为下方在 DOM ready 后显式调用
  ─────────────────────────────────────────── */
  function initialize_fc_lite() {
    UserConfig = {
      private_api_url: UserConfig?.private_api_url || '',
      page_turning_number: UserConfig?.page_turning_number || 24,
      error_img:
        UserConfig?.error_img ||
        'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/static/favicon.ico',
    }
    const e = document.getElementById('friend-circle-lite-root')
    if (!e) return
    e.innerHTML = ''
    const n = document.createElement('div')
    ;((n.id = 'random-article'),
      (n.innerHTML =
        '\n        <div class="loading-placeholder">\n            <div class="loading-spinner"></div>\n            <div class="loading-text">加载中...</div>\n        </div>\n    '),
      e.appendChild(n))
    const t = document.createElement('div')
    ;((t.className = 'articles-container'), (t.id = 'articles-container'), e.appendChild(t))
    const i = document.createElement('button')
    ;((i.id = 'load-more-btn'), (i.innerText = '再来亿点'), e.appendChild(i))
    const a = document.createElement('div')
    ;((a.id = 'stats-container'), e.appendChild(a))
    let r = 0,
      d = []
    function o() {
      const e = 'friend-circle-lite-cache',
        n = 'friend-circle-lite-cache-time',
        t = localStorage.getItem(n),
        a = new Date().getTime()
      if (t && a - t < 6e5) {
        const n = JSON.parse(localStorage.getItem(e))
        if (n) return void c(n)
      }
      const r = setTimeout(() => {
        l('加载超时，请刷新页面重试')
      }, 1e4)
      fetch(`${UserConfig.private_api_url}all.json`)
        .then((e) => {
          if ((clearTimeout(r), !e.ok)) throw new Error('网络响应错误')
          return e.json()
        })
        .then((t) => {
          ;(localStorage.setItem(e, JSON.stringify(t)), localStorage.setItem(n, a.toString()), c(t))
        })
        .catch((e) => {
          ;(clearTimeout(r), console.error('加载失败:', e), l('加载失败，请检查网络连接'))
        })
        .finally(() => {
          i.innerText = '再来亿点'
        })
    }
    function l(e) {
      n.innerHTML = `\n            <div class="error-placeholder">\n                <div class="error-icon">⚠️</div>\n                <div class="error-text">${e}</div>\n                <button class="retry-button" onclick="location.reload()">重新加载</button>\n            </div>\n        `
    }
    function c(n) {
      d = n.article_data || []
      const o = n.statistical_data
      ;((a.innerHTML = `\n            <div>更新时间:${o.last_updated_time}</div>\n        `), s(o))
      ;(d.slice(r, r + UserConfig.page_turning_number).forEach((n, i) => {
        const a = document.createElement('div')
        ;((a.className = 'card'), (a.style.animationDelay = 0.05 * i + 's'))
        const r = document.createElement('div')
        ;((r.className = 'card-title'),
          (r.innerText = n.title),
          (r.title = n.title),
          a.appendChild(r),
          (r.onclick = () => window.open(n.link, '_blank')))
        const o = document.createElement('div')
        o.className = 'card-author'
        const l = document.createElement('img')
        ;((l.className = 'no-lightbox'),
          (l.src = n.avatar || UserConfig.error_img),
          (l.onerror = () => (l.src = UserConfig.error_img)),
          o.appendChild(l),
          o.appendChild(document.createTextNode(n.author)),
          a.appendChild(o),
          (o.onclick = () => {
            !(function (n, t, i) {
              if (!document.getElementById('fclite-modal')) {
                const n = document.createElement('div')
                ;((n.id = 'modal'),
                  (n.className = 'modal'),
                  (n.innerHTML =
                    '\n            <div class="modal-content">\n                <img id="modal-author-avatar" src="" alt="">\n                <a id="modal-author-name-link"></a>\n                <div id="modal-articles-container"></div>\n                <img id="modal-bg" src="" alt="">\n            </div>\n            '),
                  e.appendChild(n))
              }
              const a = document.getElementById('modal'),
                r = document.getElementById('modal-articles-container'),
                o = document.getElementById('modal-author-avatar'),
                l = document.getElementById('modal-author-name-link'),
                c = document.getElementById('modal-bg')
              ;((r.innerHTML = ''),
                (o.src = t || UserConfig.error_img),
                (o.onerror = () => (o.src = UserConfig.error_img)),
                (c.src = t || UserConfig.error_img),
                (c.onerror = () => (c.src = UserConfig.error_img)),
                (l.innerText = n),
                (l.href = new URL(i).origin))
              const s = d.filter((e) => e.author === n)
              ;(s.slice(0, 4).forEach((e) => {
                const n = document.createElement('div')
                n.className = 'modal-article'
                const t = document.createElement('a')
                ;((t.className = 'modal-article-title'),
                  (t.innerText = e.title),
                  (t.href = e.link),
                  (t.target = '_blank'),
                  n.appendChild(t))
                const i = document.createElement('div')
                ;((i.className = 'modal-article-date'),
                  (i.innerText = '📅' + e.created.substring(0, 10)),
                  n.appendChild(i),
                  r.appendChild(n))
              }),
                (a.style.display = 'block'),
                setTimeout(() => {
                  a.classList.add('modal-open')
                }, 10))
            })(n.author, n.avatar, n.link)
          }))
        const c = document.createElement('div')
        ;((c.className = 'card-date'),
          (c.innerText = '🗓️' + n.created.substring(0, 10)),
          a.appendChild(c))
        const s = document.createElement('img')
        ;((s.className = 'card-bg no-lightbox'),
          (s.src = n.avatar || UserConfig.error_img),
          (s.onerror = () => (s.src = UserConfig.error_img)),
          a.appendChild(s),
          t.appendChild(a))
      }),
        (r += UserConfig.page_turning_number),
        r >= d.length && (i.style.display = 'none'))
    }
    function s(e) {
      const t = d[Math.floor(Math.random() * d.length)]
      if (!t)
        return void (n.innerHTML =
          '\n                <div class="error-placeholder">\n                    <div class="error-text">暂无可展示文章</div>\n                </div>\n            ')
      n.innerHTML = `\n            <div class="random-top">\n                <div class="random-stats">\n                    <div class="stat-item">\n                        <div class="stat-num">${e.friends_num}</div>\n                        <div class="stat-text">订阅</div>\n                    </div>\n                    <div class="stat-item">\n                        <div class="stat-num">${e.active_num}</div>\n                        <div class="stat-text">活跃</div>\n                    </div>\n                    <div class="stat-item">\n                        <div class="stat-num">${e.article_num}</div>\n                        <div class="stat-text">文章</div>\n                    </div>\n                    <div class="stat-item">\n                        <div class="stat-num">${e.error_num}</div>\n                        <div class="stat-text">失败</div>\n                    </div>\n                </div>\n            </div>\n            <div class="random-content">\n                <div class="random-container">\n                    <div class="random-container-title">🎲 随便转转</div>\n                    <div class="random-title" title="${t.title}">${t.title}</div>\n                    <div class="random-meta">\n                        <span class="random-author">✍️ ${t.author}</span>\n                        <span class="random-date">📅 ${t.created.substring(0, 10)}</span>\n                    </div>\n                </div>\n                <div class="random-button-container">\n                    <a href="#" id="refresh-random-article">🔄 换一篇</a>\n                    <button class="random-link-button" onclick="window.open('${t.link}', '_blank')">阅读文章</button>\n                </div>\n            </div>\n        `
      document.getElementById('refresh-random-article').addEventListener('click', function (t) {
        ;(t.preventDefault(),
          (n.style.opacity = '0.5'),
          setTimeout(() => {
            ;(s(e), (n.style.opacity = '1'))
          }, 200))
      })
    }
    ;(o(),
      i.addEventListener('click', o),
      (window.onclick = function (n) {
        const t = document.getElementById('modal')
        n.target === t &&
          (function () {
            const n = document.getElementById('modal')
            ;(n.classList.remove('modal-open'),
              n.addEventListener(
                'transitionend',
                () => {
                  ;((n.style.display = 'none'), e.removeChild(n))
                },
                { once: !0 },
              ))
          })()
      }))
  }

  /* ───────────────────────────────────────────
     5. 友链状态区
     来源：src/layouts/Layout.astro 的 fcircle 常驻脚本
  ─────────────────────────────────────────── */
  function esc(t) {
    if (!t) return ''
    var d = document.createElement('div')
    d.textContent = t
    return d.innerHTML
  }

  function loadStatus() {
    var summary = document.getElementById('links-summary')
    var grid = document.getElementById('links-grid')
    if (!summary || summary.dataset.state === 'done') return
    summary.dataset.state = 'done'
    fetch('https://fc.example.com/status.json')
      .then(function (r) {
        return r.json()
      })
      .then(function (data) {
        var links = data.link_status || []
        var ok = 0
        links.forEach(function (it) {
          if (it.success) ok++
        })
        summary.innerHTML =
          '<span class="stat-ok">' +
          ok +
          ' 正常</span>' +
          '<span class="stat-sep">·</span>' +
          '<span class="stat-fail">' +
          (links.length - ok) +
          ' 异常</span>'
        if (!grid) return
        grid.innerHTML = links
          .map(function (item) {
            var cls = item.success ? 'ok' : 'fail'
            var label = item.success ? '正常' : '异常'
            return (
              '<a class="status-card ' +
              cls +
              '" href="' +
              item.link +
              '" target="_blank" rel="noopener" title="' +
              esc(item.name) +
              '">' +
              '<span class="sc-indicator"></span>' +
              '<span class="sc-name">' +
              esc(item.name) +
              '</span>' +
              '<span class="sc-label">' +
              label +
              '</span></a>'
            )
          })
          .join('')
      })
      .catch(function () {
        summary.textContent = '暂无数据'
      })
  }

  /* ───────────────────────────────────────────
     启动
  ─────────────────────────────────────────── */
  injectAccent()
  ensureTheme()

  function boot() {
    if (document.getElementById('friend-circle-lite-root')) initialize_fc_lite()
    loadStatus()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
