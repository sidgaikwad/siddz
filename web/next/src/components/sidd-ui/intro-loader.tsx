"use client"

import { cn } from "cn"
import { useEffect, useState } from "react"

const STORAGE_KEY = "intro-seen"
const WORD_MS = 260
const FIRST_WORD_MS = 650
const FINAL_HOLD_MS = 700
const EXIT_MS = 900

export function IntroLoader({
  words = ["Hello", "नमस्ते", "こんにちは", "Bonjour", "Hola", "Ciao"],
  finale = "Siddharth Gaikwad",
  oncePerSession = true,
}: {
  words?: string[]
  finale?: string
  oncePerSession?: boolean
}) {
  const sequence = [...words, finale]
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = oncePerSession && sessionStorage.getItem(STORAGE_KEY) === "1"
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (seen || reduced) {
      setDone(true)
      return
    }

    document.documentElement.style.overflow = "hidden"
    const timers: ReturnType<typeof setTimeout>[] = []
    let t = FIRST_WORD_MS
    for (let i = 1; i < sequence.length; i++) {
      timers.push(setTimeout(() => setIndex(i), t))
      t += WORD_MS
    }
    const total = t + FINAL_HOLD_MS
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / total)
      setProgress(Math.round((1 - Math.pow(1 - p, 2)) * 100))
      if (p < 1) frame = requestAnimationFrame(tick)
    })
    timers.push(setTimeout(() => setExiting(true), total))
    timers.push(
      setTimeout(() => {
        setDone(true)
        document.documentElement.style.overflow = ""
        try {
          sessionStorage.setItem(STORAGE_KEY, "1")
        } catch {}
      }, total + EXIT_MS),
    )
    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
      document.documentElement.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  const isFinale = index === sequence.length - 1

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(${oncePerSession}&&sessionStorage.getItem("${STORAGE_KEY}")==="1")document.documentElement.dataset.introSeen="1"}catch(e){}`,
        }}
      />
      <div
        aria-hidden
        className={cn(
          "intro-loader fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-zinc-50 transition-transform ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:hidden",
          exiting && "-translate-y-full",
        )}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
      >
        <div
          className={cn(
            "flex flex-1 items-center justify-center transition-all duration-500",
            exiting && "-translate-y-24 opacity-0",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "size-2.5 rounded-full bg-zinc-50 transition-opacity",
                isFinale && "opacity-0",
              )}
            />
            <div className="h-[1.15em] overflow-hidden text-5xl font-medium tracking-tight sm:text-7xl">
              <span
                key={index}
                className={cn(
                  "block leading-[1.15]",
                  isFinale
                    ? "animate-[intro-in_700ms_cubic-bezier(0.22,1,0.36,1)_both]"
                    : index === 0
                      ? "animate-[intro-in_500ms_cubic-bezier(0.22,1,0.36,1)_both]"
                      : "animate-[intro-cycle_260ms_cubic-bezier(0.65,0,0.35,1)_both]",
                )}
              >
                {sequence[index]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between p-6 font-mono text-xs text-zinc-500 sm:p-10">
          <span className="tracking-widest uppercase">Full Stack Engineer · Mumbai</span>
          <span className="text-5xl font-light text-zinc-50 tabular-nums sm:text-7xl">
            {progress}
          </span>
        </div>
        <div className="h-px bg-zinc-800">
          <div
            className="h-full bg-zinc-50 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className={cn(
            "absolute inset-x-0 top-full h-[14vh] scale-y-0 rounded-b-[50%] bg-zinc-950 transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]",
            exiting && "scale-y-100",
          )}
          style={{ transitionDuration: `${EXIT_MS}ms`, transformOrigin: "top" }}
        />
      </div>
    </>
  )
}
