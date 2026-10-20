"use client"

import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

export type EyeState = "tracking" | "idle" | "blinking"

const CELL_W = 5
const CELL_H = 8
const DEFAULT_TEXT =
  "full stack engineer from mumbai building developer tools in typescript react node rust and go console.log debugger unashamed "

// An almond eye drawn from scrolling text. The iris and pupil follow the cursor; it blinks now and then.
export function AsciiEye({
  width = 150,
  height = 76,
  text = DEFAULT_TEXT,
  showReadout = true,
  onStateChange,
  className,
}: {
  width?: number
  height?: number
  text?: string
  showReadout?: boolean
  onStateChange?: (state: EyeState) => void
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)
  const [readout, setReadout] = useState({ u: 0.5, v: 0.5, d: 0, state: "idle" as EyeState })
  const stateRef = useRef<EyeState>("idle")
  const onStateRef = useRef(onStateChange)
  onStateRef.current = onStateChange

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cols = Math.floor(width / CELL_W)
    const rows = Math.floor(height / CELL_H)
    const look = { x: 0, y: 0 }
    const goal = { x: 0, y: 0 }
    let lastMove = 0
    let blinkStart = -1
    let nextBlink = performance.now() + 2500
    let raf = 0
    let frame = 0
    let color = getComputedStyle(canvas).color

    const setState = (s: EyeState) => {
      if (stateRef.current === s) return
      stateRef.current = s
      onStateRef.current?.(s)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy) || 1
      const reach = Math.min(1, dist / 400)
      goal.x = (dx / dist) * reach
      goal.y = (dy / dist) * reach
      lastMove = performance.now()
    }

    const draw = (now: number) => {
      frame++
      if (frame % 60 === 0) color = getComputedStyle(canvas).color
      look.x += (goal.x - look.x) * 0.12
      look.y += (goal.y - look.y) * 0.12
      const tracking = now - lastMove < 1500
      if (!tracking) {
        goal.x *= 0.98
        goal.y *= 0.98
      }

      let lid = 1
      if (!reduced && now > nextBlink && blinkStart < 0) blinkStart = now
      if (blinkStart >= 0) {
        const t = (now - blinkStart) / 220
        lid = t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2
        if (t >= 1) {
          blinkStart = -1
          lid = 1
          nextBlink = now + 2200 + Math.random() * 3500
        }
      }
      setState(blinkStart >= 0 ? "blinking" : tracking ? "tracking" : "idle")

      const irisR = 0.36
      const pupilR = 0.16 + Math.sin(now / 900) * 0.015
      const px = look.x * 0.42
      const py = look.y * 0.3
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${CELL_H}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = "top"
      ctx.fillStyle = color
      const offset = Math.floor(now / 90)
      for (let r = 0; r < rows; r++) {
        const ny = ((r + 0.5) / rows) * 2 - 1
        for (let c = 0; c < cols; c++) {
          const nx = ((c + 0.5) / cols) * 2 - 1
          const almond = (1 - nx * nx) * 0.92 * lid
          if (Math.abs(ny) > almond) continue
          const dx = (nx - px) * 1.9
          const dy = (ny - py) * 1.05
          const d = Math.hypot(dx, dy)
          let ch: string
          let alpha: number
          if (d < pupilR) {
            ch = "@"
            alpha = 1
          } else if (d < irisR) {
            ch = "#%*+"[Math.floor((d / irisR) * 4) % 4]!
            alpha = 0.85
          } else {
            ch = text[(r * cols + c + offset) % text.length]!
            alpha = Math.abs(ny) > almond - 0.12 ? 0.7 : 0.32
          }
          ctx.globalAlpha = alpha
          ctx.fillText(ch, c * CELL_W, r * CELL_H)
        }
      }
      ctx.globalAlpha = 1

      if (markerRef.current) {
        markerRef.current.style.transform = `translate(${((px + 1) / 2) * width - 6}px, ${((py + 1) / 2) * height - 6}px)`
      }
      if (frame % 6 === 0) {
        setReadout({ u: (px + 1) / 2, v: (py + 1) / 2, d: pupilR, state: stateRef.current })
      }
    }

    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener("pointermove", onMove)
    if (reduced) draw(performance.now())
    else raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
    }
  }, [width, height, text])

  return (
    <div className={cn("text-foreground relative inline-flex items-start gap-3", className)}>
      <div className="relative" style={{ width, height }}>
        <canvas ref={canvasRef} aria-hidden className="block" style={{ width, height }} />
        <span
          ref={markerRef}
          data-eye-marker
          aria-hidden
          className="border-foreground/60 pointer-events-none absolute top-0 left-0 size-3 border"
        />
      </div>
      {showReadout && (
        <pre className="text-muted-foreground font-mono text-[10px] leading-tight tabular-nums">
          {`['pupil:u'] ${readout.u.toFixed(7)}\n${readout.v.toFixed(7)}\n${readout.d.toFixed(7)}\n${readout.state === "blinking" ? "Blink" : "None"}`}
        </pre>
      )}
    </div>
  )
}
