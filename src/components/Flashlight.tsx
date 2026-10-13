import { useLayoutEffect, useState } from 'react'
import { useCleanupOnPageLeave } from '@/hooks/useCleanupOnPageLeave'

export function Flashlight() {
  const [cursorX, setCursorX] = useState(0)
  const [cursorY, setCursorY] = useState(0)
  const isMobile = !window.matchMedia('(hover: hover)').matches

  // 注意：所有 hooks 必须位于条件 return 之前（遵守 React Hooks 规则）
  const handleMouseMove = (event: MouseEvent) => {
    setCursorX(event.clientX)
    setCursorY(event.clientY)
  }

  useLayoutEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Swup 切页时 DOM 被替换、React 不触发卸载，主动移除 mousemove 监听防止泄漏
  useCleanupOnPageLeave(() => {
    document.removeEventListener('mousemove', handleMouseMove)
  })

  if (isMobile) {
    return null
  }

  const backgroundImage = `radial-gradient(
    circle 16vmax at ${cursorX}px ${cursorY}px,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.5) 80%,
    rgba(0, 0, 0, 0.8) 100%
  )`

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        backgroundImage,
        display: isMobile ? 'none' : 'block',
      }}
    ></div>
  )
}
