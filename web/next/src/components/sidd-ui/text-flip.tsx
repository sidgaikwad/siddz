"use client"

import { cn } from "cn"
import { useEffect, useState } from "react"

export function TextFlip({
  words,
  interval = 3000,
  className,
}: {
  words: string[]
  interval?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])

  return (
    <span className={cn("relative inline-block", className)} aria-live="polite">
      <span key={index} className="inline-block animate-[flip-in_450ms_ease-out]">
        {words[index]}
      </span>
    </span>
  )
}
