import { getRelativeTime, getFormattedDateWithOptionalTime } from '@/utils/date'
import { useEffect, useState } from 'react'

export function RelativeDate({ date }: { date: Date }) {
  const [dateStr, setDateStr] = useState(getFormattedDateWithOptionalTime(date))

  useEffect(() => {
    const relative = getRelativeTime(date)
    if (relative) {
      setDateStr(relative)
    }
  }, [date])

  return <span>{dateStr}</span>
}
