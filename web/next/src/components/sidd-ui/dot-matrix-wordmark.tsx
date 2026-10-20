"use client"

import { cn } from "cn"
import { useEffect, useRef } from "react"

type Dot = { x: number; y: number; delay: number }

const REVEAL_MS = 1100
const SPOT = 140

// Renders text as a field of dots sampled from real type. Dots sweep in on reveal and swell under the cursor.
export function DotMatrixWordmark({
  text = "SIDDHARTH",
  gap = 6,
  crop = 0.78,
  className,
}: {
  text?: string
  gap?: number
  crop?: number
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!wrap || !canvas || !ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let dots: Dot[] = []
    let width = 0
    let height = 0
    let raf = 0
    let revealedAt = -1
    let color = "#fafafa"
    let cell = gap
    const pointer = { x: -9999, y: -9999 }
    const glow = { x: -9999, y: -9999 }

    const sample = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = wrap.clientWidth
      cell = width < 640 ? Math.max(3, Math.round(gap / 2)) : gap
      const family = getComputedStyle(document.body).fontFamily
      const probe = document.createElement("canvas").getContext("2d")!
      probe.font = `900 100px ${family}`
      const m = probe.measureText(text)
      const fontSize = (width / m.width) * 100 * 0.98
      const textHeight = fontSize * 0.74
      height = Math.round(textHeight * crop + cell)

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const off = document.createElement("canvas")
      off.width = Math.ceil(width)
      off.height = Math.ceil(textHeight + cell)
      const o = off.getContext("2d")!
      o.font = `900 ${fontSize}px ${family}`
      o.textBaseline = "alphabetic"
      o.textAlign = "center"
      o.fillStyle = "#000"
      o.fillText(text, width / 2, textHeight + cell / 2)
      const data = o.getImageData(0, 0, off.width, off.height).data

      dots = []
      for (let y = cell / 2; y < height; y += cell) {
        for (let x = cell / 2; x < width; x += cell) {
          const a = data[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3]!
          if (a > 110) dots.push({ x, y, delay: (x / width) * 0.7 + Math.random() * 0.15 })
        }
      }
      color = getComputedStyle(wrap).color
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height)
      glow.x += (pointer.x - glow.x) * 0.18
      glow.y += (pointer.y - glow.y) * 0.18
      const t = revealedAt < 0 ? 0 : reduced ? 1 : (now - revealedAt) / REVEAL_MS
      ctx.fillStyle = color
      for (const d of dots) {
        const p = Math.min(1, Math.max(0, (t - d.delay) / 0.3))
        if (p <= 0) continue
        const dist = Math.hypot(d.x - glow.x, d.y - glow.y)
        const near = dist < SPOT ? 1 - dist / SPOT : 0
        const ease = 1 - Math.pow(1 - p, 3)
        const r = (cell * 0.3 + near * cell * 0.2) * ease
        ctx.globalAlpha = (0.6 + near * 0.4) * ease
        ctx.beginPath()
        ctx.arc(d.x, d.y + (1 - ease) * cell * 2, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      if (glow.x < -9000) {
        glow.x = pointer.x
        glow.y = pointer.y
      }
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
      glow.x = -9999
      glow.y = -9999
    }

    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        if (revealedAt < 0) revealedAt = performance.now()
        if (!running) {
          running = true
          raf = requestAnimationFrame(loop)
        }
      } else if (running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })

    const theme = new MutationObserver(() => {
      color = getComputedStyle(wrap).color
    })

    void document.fonts.ready.then(() => {
      sample()
      io.observe(canvas)
    })
    const ro = new ResizeObserver(() => {
      if (Math.abs(wrap.clientWidth - width) > 1) sample()
    })
    ro.observe(wrap)
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      theme.disconnect()
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
    }
  }, [text, gap, crop])

  return (
    <div ref={wrapRef} className={cn("text-foreground", className)} role="img" aria-label={text}>
      <canvas
        ref={canvasRef}
        className="block w-full [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      />
    </div>
  )
}
