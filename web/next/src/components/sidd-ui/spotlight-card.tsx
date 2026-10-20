"use client"

import { cn } from "cn"
import { useRef } from "react"

export function SpotlightCard({
  children,
  color = "rgba(56, 189, 248, 0.35)",
  size = 280,
  className,
}: {
  children: React.ReactNode
  color?: string
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        el.style.setProperty("--x", `${e.clientX - rect.left}px`)
        el.style.setProperty("--y", `${e.clientY - rect.top}px`)
      }}
      className={cn("group bg-border relative overflow-hidden rounded-xl p-px", className)}
      style={{ "--spot": color, "--size": `${size}px` } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(var(--size) circle at var(--x, 50%) var(--y, 50%), var(--spot), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="bg-background relative h-full rounded-[11px]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-40"
          style={{
            background:
              "radial-gradient(calc(var(--size) * 0.8) circle at var(--x, 50%) var(--y, 50%), var(--spot), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}
