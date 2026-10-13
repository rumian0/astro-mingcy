import { useEffect, useRef } from 'react'
import { useCleanupOnPageLeave } from '@/hooks/useCleanupOnPageLeave'

interface Props {
  className?: string
  particleCount?: number
}

export default function ParticlesBg({ className = '', particleCount = 40 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    function getAccentRgb(): [number, number, number] {
      const style = getComputedStyle(document.documentElement)
      const accent = style.getPropertyValue('--color-accent').trim()
      if (!accent) return [245, 85, 85]
      const parts = accent.split(/\s+/).map(Number)
      return parts.length >= 3 ? [parts[0], parts[1], parts[2]] : [245, 85, 85]
    }

    const [r, g, b] = getAccentRgb()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w = 0
    let h = 0
    let animId = 0
    let isVisible = true

    interface P {
      x: number
      y: number
      s: number
      vx: number
      vy: number
      a: number
    }

    let ps: P[] = []

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      w = parent.clientWidth
      h = parent.clientHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(particleCount, Math.floor((w * h) / 20000))
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: 1 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        a: 0.1 + Math.random() * 0.3,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const observer = new IntersectionObserver(
      ([e]) => {
        isVisible = e.isIntersecting
      },
      { threshold: 0 },
    )
    observer.observe(canvas)

    let mx = -9999
    let my = -9999
    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
    }
    const onLeave = () => {
      mx = -9999
      my = -9999
    }
    canvas.addEventListener('mousemove', onMove, { passive: true })
    canvas.addEventListener('mouseleave', onLeave, { passive: true })

    function tick() {
      if (!isVisible) {
        animId = requestAnimationFrame(tick)
        return
      }
      ctx!.clearRect(0, 0, w, h)

      for (const p of ps) {
        p.x += p.vx
        p.y += p.vy
        p.a += (Math.random() - 0.5) * 0.003
        p.a = Math.max(0.05, Math.min(0.5, p.a))
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        if (mx > -1000) {
          const dx = mx - p.x
          const dy = my - p.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            p.x -= (dx / d) * (1 - d / 120) * 0.8
            p.y -= (dy / d) * (1 - d / 120) * 0.8
          }
        }

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.a})`
        ctx!.fill()
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i],
            b = ps[j]
          const dx = a.x - b.x,
            dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 100) * 0.1})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    cleanupRef.current = () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      observer.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }

    return () => {
      cleanupRef.current()
    }
  }, [particleCount])

  // Swup 切页时 DOM 被替换、React 不触发卸载，主动取消 rAF 并移除监听器防止泄漏
  useCleanupOnPageLeave(() => {
    cleanupRef.current()
  })

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
