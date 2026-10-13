import type { MarkdownHeading } from 'astro'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useCleanupOnPageLeave } from '@/hooks/useCleanupOnPageLeave'

function useActiveItem(headingIds: string[]) {
  const [activeId, setActiveId] = useState('')
  const activeIdRef = useRef('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headingIds.length === 0) return

    const visible = new Map<string, boolean>()

    const observer = new IntersectionObserver(
      (entries) => {
        let anyIntersecting = false
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting)
          if (entry.isIntersecting) anyIntersecting = true
        }
        if (!anyIntersecting) return

        let foundId = ''
        for (const id of headingIds) {
          if (visible.get(id)) {
            foundId = id
            break
          }
        }

        if (foundId && foundId !== activeIdRef.current) {
          activeIdRef.current = foundId
          startTransition(() => setActiveId(foundId))
        }
      },
      { rootMargin: '-80px 0px -80px 0px' },
    )
    observerRef.current = observer

    for (const id of headingIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headingIds])

  // Swup 切页时 DOM 被替换、React 不触发卸载，主动断开 IntersectionObserver 防止泄漏
  useCleanupOnPageLeave(() => {
    observerRef.current?.disconnect()
  })

  return activeId
}

function smoothScrollTo(el: HTMLElement, offset = -80) {
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function PostToc({ headings }: { headings: MarkdownHeading[] }) {
  const headingIds = headings.map((h) => h.slug)
  const activeItem = useActiveItem(headingIds)
  const containerRef = useRef<HTMLUListElement>(null)

  const handleClick = useCallback((slug: string) => {
    const el = document.getElementById(slug)
    if (el) smoothScrollTo(el)
  }, [])

  if (headings.length === 0) return null

  return (
    <ul
      ref={containerRef}
      className="relative overflow-y-auto group text-sm"
      style={{
        maxHeight: 'min(380px, calc(100vh - 250px))',
        scrollbarWidth: 'none',
      }}
    >
      {headings.map((item) => (
        <TocItem
          key={item.slug}
          slug={item.slug}
          text={item.text}
          depth={item.depth}
          isActive={item.slug === activeItem}
          onClick={handleClick}
        />
      ))}
    </ul>
  )
}

function TocItem({
  slug,
  text,
  depth,
  isActive,
  onClick,
}: {
  slug: string
  text: string
  depth: number
  isActive: boolean
  onClick: (slug: string) => void
}) {
  const itemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!isActive) return
    const $item = itemRef.current
    if (!$item) return
    const $container = $item.parentElement
    if (!$container) return

    $item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isActive])

  return (
    <li className="relative" ref={itemRef}>
      <button
        className={clsx(
          'inline-block pl-5 text-left w-full transition-all duration-500',
          isActive
            ? 'opacity-100 text-zinc-900 dark:text-zinc-100'
            : 'opacity-0 group-hover:opacity-80 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
        )}
        onClick={() => onClick(slug)}
      >
        <span className="relative inline-flex items-center min-h-[1.5em]">
          <span className="absolute left-0 inset-y-[3px] w-[1.5px] rounded-xs bg-zinc-400/50 dark:bg-zinc-500/50 group-hover:bg-zinc-400/70 dark:group-hover:bg-zinc-400/70 transition-colors duration-300" />
          {isActive && (
            <motion.span
              layoutId="active-toc-indicator"
              layout
              className="absolute left-0 inset-y-0 w-[3px] rounded-sm bg-accent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'top' }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            />
          )}
          <span
            className={clsx('ml-[18px] transition-all duration-300', isActive && 'ml-[22px]')}
            style={{ paddingLeft: depth > 2 ? `${(depth - 2) * 0.6}rem` : undefined }}
          >
            {text}
          </span>
        </span>
      </button>
    </li>
  )
}
