import { useEffect, useRef, useState } from 'react'
import { useCleanupOnPageLeave } from '@/hooks/useCleanupOnPageLeave'

function getGreeting(h: number): string {
  if (h >= 5 && h < 9) return '早上好，清晨煮杯茶'
  if (h >= 9 && h < 12) return '上午好，开工顺利'
  if (h >= 12 && h < 14) return '中午好，记得午休'
  if (h >= 14 && h < 18) return '下午好，来杯茶提神'
  if (h >= 18 && h < 23) return '晚上好，不要熬夜'
  return '夜深了，早点休息'
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date): string {
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 星期${week}`
}

// 注意：初始 state 必须为 null，SSR 与客户端 hydration 首帧渲染相同占位文本，
// 时间只在 mount 后（useEffect）才读取 new Date()，避免两端时间不一致导致
// React hydration mismatch（Minified React error #418/#423/#425）。
export default function GreetingClock() {
  const [now, setNow] = useState<Date | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setNow(new Date())
    timerRef.current = window.setInterval(() => setNow(new Date()), 1000)
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    }
  }, [])

  // Swup 切页时 DOM 被替换、React 不触发卸载，主动释放每秒定时器防止泄漏
  useCleanupOnPageLeave(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
  })

  return (
    <div className="sidebar-card p-5 text-center">
      <div className="clock-time" data-testid="clock">
        {now
          ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
          : '--:--:--'}
      </div>
      <p className="mt-2 text-xs text-secondary">
        {now ? formatDate(now) : '----年-月-日 · 星期-'}
      </p>
      <p className="mt-1 text-sm text-accent">{now ? getGreeting(now.getHours()) : '…'}</p>
    </div>
  )
}
