"use client"

import { useEffect, useRef, useState } from "react"

export function NumberTicker({
  value,
  duration = 1200,
  locale = "en-US",
  className,
}: {
  value: number
  duration?: number
  locale?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(Math.round(eased * value))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString(locale)}
    </span>
  )
}
