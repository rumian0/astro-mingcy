// 获取两个日期的相对时间
export function getRelativeTime(startDate: Date, endDate = new Date()) {
  const diffSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  if (diffSeconds < 0) {
    return null
  }
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 10) {
    return '刚刚'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 10) {
    return `${diffDays} 天前`
  }
  return null
}

// 获取一个格式化的日期，格式为：2024 年 1 月 1 日 星期一
export function getFormattedDate(date: Date) {
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()]

  return `${year} 年 ${month} 月 ${day} 日 ${week}`
}

// 数字前补 0
function padZero(number: number, len = 2) {
  return number.toString().padStart(len, '0')
}

// 获取格式化后的日期时间，格式：2024 年 01 月 01 日 12:00
export function getFormattedDateTime(date: Date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())

  return `${year} 年 ${month} 月 ${day} 日 ${hours}:${minutes}`
}

// 判断日期是否显式填写了时间。
// 约定：frontmatter 只写日期时，content schema 会把时间归一到 UTC 正午（见 config.ts 的 noonDefault），
// 所以「UTC 12:00:00」即代表「未填写时间」，据此决定是否展示时分。用 UTC 而非本地时区，
// 保证哨兵与本机/CI/查看者时区无关。
export function hasTimeFilled(date: Date) {
  return !(date.getUTCHours() === 12 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0)
}

// 与 getFormattedDate 同款（2 位年份 + 星期），但填写了时间时追加「HH:MM」。
// 用于发布日期 / 修改日期的绝对展示。
export function getFormattedDateWithOptionalTime(date: Date) {
  const base = getFormattedDate(date)
  if (!hasTimeFilled(date)) return base
  return `${base} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

// 与 getFormattedDateTime 同款（4 位年份、无星期），但未填写时间时不追加时分。
// 用于文末版权块的「最后修改时间」。
export function getFormattedDateTimeWithOptionalTime(date: Date) {
  const base = `${date.getFullYear()} 年 ${padZero(date.getMonth() + 1)} 月 ${padZero(date.getDate())} 日`
  if (!hasTimeFilled(date)) return base
  return `${base} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

// 获取两个日期的相差的天数
export function getDiffInDays(startDate: Date, endDate = new Date()) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 86400))
}

// 获取一个短的日期，格式为：04-20
export function getShortDate(date: Date) {
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())

  return `${month}-${day}`
}

// 获取日期所在的年一共多少天
export function getDaysInYear(date: Date) {
  const year = date.getFullYear()
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 366
  }
  return 365
}

// 获取日期所在的年的开始日期
export function getStartOfYear(date: Date) {
  const year = date.getFullYear()
  return new Date(year, 0, 1)
}

// 获取日期所在的天的开始日期
export function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
