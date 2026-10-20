"use client"

import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

export type TerminalLine = { command: string; output?: string[] }

export function Terminal({
  lines,
  title = "zsh",
  typingSpeed = 45,
  loop = true,
  className,
}: {
  lines: TerminalLine[]
  title?: string
  typingSpeed?: number
  loop?: boolean
  className?: string
}) {
  const [lineIndex, setLineIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [showOutput, setShowOutput] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const current = lines[lineIndex]
  const done = lineIndex >= lines.length

  useEffect(() => {
    if (done) {
      if (!loop) return
      const id = setTimeout(() => {
        setLineIndex(0)
        setChars(0)
        setShowOutput(false)
      }, 2500)
      return () => clearTimeout(id)
    }
    if (!current) return
    if (chars < current.command.length) {
      const id = setTimeout(() => setChars((c) => c + 1), typingSpeed + Math.random() * 40)
      return () => clearTimeout(id)
    }
    if (!showOutput) {
      const id = setTimeout(() => setShowOutput(true), 300)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      setLineIndex((i) => i + 1)
      setChars(0)
      setShowOutput(false)
    }, 900)
    return () => clearTimeout(id)
  }, [chars, current, done, loop, showOutput, typingSpeed])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lineIndex, showOutput])

  const history = lines.slice(0, Math.min(lineIndex, lines.length))

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[13px] text-zinc-300 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-500/80" />
        <span className="size-2.5 rounded-full bg-yellow-500/80" />
        <span className="size-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-zinc-500">{title}</span>
      </div>
      <div ref={bodyRef} className="h-56 [scrollbar-width:none] space-y-1 overflow-y-auto p-3">
        {history.map((line, i) => (
          <div key={i}>
            <p>
              <span className="text-emerald-400">❯</span> {line.command}
            </p>
            {line.output?.map((o, j) => (
              <p key={j} className="text-zinc-500">
                {o}
              </p>
            ))}
          </div>
        ))}
        {!done && current && (
          <div>
            <p>
              <span className="text-emerald-400">❯</span> {current.command.slice(0, chars)}
              <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-zinc-300" />
            </p>
            {showOutput &&
              current.output?.map((o, j) => (
                <p key={j} className="text-zinc-500">
                  {o}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
