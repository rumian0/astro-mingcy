import { useEffect } from 'react'

/** 切页清理事件名：Layout 在 Swup 替换 main 内容前派发到 document */
export const ISLAND_CLEANUP_EVENT = 'mcy:island-cleanup'

/**
 * Swup 路由切换时，main 容器内的 astro-island（React 组件）DOM 会被整体替换，
 * React 不会触发组件卸载（useEffect cleanup 不会执行），导致 setInterval /
 * rAF / IntersectionObserver / 事件监听器等资源持续泄漏，页面切换越用越卡。
 *
 * 本 hook 监听 Layout 注入的切页清理事件，在 DOM 被替换前主动释放资源，
 * 并在清理后自我解绑，避免重复触发。与 useEffect cleanup 是同一套清理函数，
 * 组件正常卸载（非 Swup 场景）时仍由 React 的 cleanup 兜底。
 *
 * 用法：
 *   const cleanupRef = useRef<() => void>(() => {})
 *   useEffect(() => { ...; cleanupRef.current = () => {...} }, [])
 *   useCleanupOnPageLeave(() => cleanupRef.current())
 */
export function useCleanupOnPageLeave(cleanup: () => void) {
  useEffect(() => {
    const handler = () => {
      cleanup()
      document.removeEventListener(ISLAND_CLEANUP_EVENT, handler)
    }
    document.addEventListener(ISLAND_CLEANUP_EVENT, handler)
    return () => document.removeEventListener(ISLAND_CLEANUP_EVENT, handler)
  }, [])
}
