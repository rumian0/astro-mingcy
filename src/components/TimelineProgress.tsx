import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { getDaysInYear, getDiffInDays, getStartOfDay, getStartOfYear } from '@/utils/date'
import { useCleanupOnPageLeave } from '@/hooks/useCleanupOnPageLeave'

export function TimelineProgress() {
  const [currentYear, setCurrentYear] = useState(0)
  const [dayOfYear, setDayOfYear] = useState(0)
  const [percentOfYear, setPercentOfYear] = useState(0)
  const [percentOfToday, setPercentOfToday] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const updateInfo = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())

    const pastDays = getDiffInDays(getStartOfYear(now), now)
    setDayOfYear(pastDays)
    setPercentOfYear((pastDays / getDaysInYear(now)) * 100)

    const pastTime = now.getTime() - getStartOfDay(now).getTime()
    setPercentOfToday((pastTime / 86400 / 1000) * 100)
  }

  useEffect(() => {
    updateInfo()
    intervalRef.current = window.setInterval(updateInfo, 1000)
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
    }
  }, [])

  // Swup 切页时 DOM 被替换、React 不触发卸载，主动释放每秒定时器防止泄漏
  useCleanupOnPageLeave(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
  })

  return (
    <>
      <p className="mt-4">
        今天是 {currentYear} 年的第 <CountUp to={dayOfYear} decimals={0} /> 天
      </p>
      <p className="mt-4">
        今年已过 <CountUp to={percentOfYear} decimals={5} />%
      </p>
      <p className="mt-4">
        今天已过 <CountUp to={percentOfToday} decimals={5} />%
      </p>
    </>
  )
}

function CountUp({
  to,
  decimals,
  duration = 1,
}: {
  to: number
  decimals: number
  duration?: number
}) {
  const node = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)

  useEffect(() => {
    if (!node.current) return

    const control = animate(prev.current, to, {
      duration,
      onUpdate: (value) => {
        node.current!.textContent = value.toFixed(decimals)
      },
    })
    prev.current = to

    return () => {
      control.stop()
    }
  }, [to, decimals, duration])

  return <span ref={node}></span>
}
