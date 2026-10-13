/* astro-mingcy 背景图 Service Worker
 *
 * 目的：让随机壁纸跨刷新秒开，并后台静默预缓存下一张。
 *
 * 为什么用 SW 而不是 IndexedDB：
 *   随机图源不返回 CORS 头时，fetch()/canvas 拿不到图片字节（同源策略硬限制）。
 *   SW 用 no-cors fetch 拿 opaque response —— JS 读不到内容，但 new Image / CSS url() 能渲染，
 *   且 cache.put 能存 opaque response。这是唯一不需要服务端配合的跨域图片缓存方案。
 *
 * 为什么用固定 KEY 而不按 URL：
 *   随机图接口每次返回不同图，Layout 脚本用 ?v=timestamp 破缓存导致 URL 每次不同。
 *   Cache API 默认按 URL 精确匹配 → 跨刷新不命中。这里用固定字符串 KEY 忽略 URL 参数，
 *   把"最近一次下载的图"存进固定槽位，刷新时 SW 直接返回该槽位 → 秒开。
 *
 * Stale-While-Revalidate 流程：
 *   1. 首次访问：无缓存，SW 放行到网络（慢，必然），下载后存入固定 KEY
 *   2. 刷新：SW 命中缓存立即返回（秒开）+ 后台 fetch 新图覆盖固定 KEY
 *   3. 下次刷新：返回上次后台更新的图（即"第二张"）+ 再后台更新
 *
 * Scope：只拦截随机图源请求，其他请求一律不碰。
 * 默认图源 picsum.photos；换源时同步改 BG_HOST/BG_KEY 与 Layout.astro 的随机图 URL。
 */
const CACHE = 'mingcy-bg-v1'
// BG_KEY 是固定槽位标识（不是真实 URL），忽略随机图的 ?v=timestamp 参数，跨刷新复用同一份缓存
const BG_KEY = 'https://picsum.photos/__bg_cache__'
const BG_HOST = 'picsum.photos'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  try {
    const url = new URL(e.request.url)
    if (url.hostname !== BG_HOST) return // 只拦截壁纸域，其余放行
    e.respondWith(handleBg(e))
  } catch (_) {
    // 非法 URL，放行
  }
})

async function handleBg(e) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(BG_KEY)

  // 后台更新（无论是否有缓存都发起，用于填充/刷新下一张）
  const networkPromise = fetch(e.request, { mode: 'no-cors', cache: 'no-store' })
    .then((resp) => {
      // opaque response 可被 cache.put 存储、被 img/css 渲染
      cache.put(BG_KEY, resp.clone())
      return resp
    })
    .catch(() => null)

  if (cached) {
    // SWR：先返回缓存（秒开），后台更新由 waitUntil 保活
    e.waitUntil(networkPromise)
    return cached
  }

  // 首次访问无缓存：等网络
  const net = await networkPromise
  if (net) return net
  // 网络也失败：返回 504 让 img 触发 onerror → 脚本保持纯色占位
  return new Response('', { status: 504, statusText: 'Background unavailable' })
}
