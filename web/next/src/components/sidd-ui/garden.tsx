"use client"

import { cn } from "cn"
import { useEffect, useRef } from "react"

type Blade = { x: number; h: number; w: number; lean: number; color: string; phase: number }
type Flower = { x: number; h: number; r: number; color: string; phase: number; petals: number }

const FLOWER_COLORS = ["#c4b5fd", "#a5b4fc", "#f5f5f4", "#e9d5ff", "#fde68a", "#f9a8d4"]

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function grow(width: number, height: number) {
  const back: Blade[] = []
  const front: Blade[] = []
  const flowers: Flower[] = []
  for (let x = -4; x < width + 4; x += rand(1.6, 3.2)) {
    back.push({
      x,
      h: rand(height * 0.35, height * 0.95),
      w: rand(1.6, 3.4),
      lean: rand(-0.25, 0.25),
      color: `hsl(${rand(95, 135)} ${rand(30, 50)}% ${rand(12, 22)}%)`,
      phase: rand(0, Math.PI * 2),
    })
  }
  for (let x = -4; x < width + 4; x += rand(2.2, 4.5)) {
    front.push({
      x,
      h: rand(height * 0.2, height * 0.7),
      w: rand(1.8, 3.8),
      lean: rand(-0.35, 0.35),
      color: `hsl(${rand(85, 125)} ${rand(40, 62)}% ${rand(24, 40)}%)`,
      phase: rand(0, Math.PI * 2),
    })
  }
  for (let x = rand(4, 20); x < width; x += rand(10, 34)) {
    const cluster = Math.random() < 0.35 ? 3 : 1
    for (let i = 0; i < cluster; i++) {
      flowers.push({
        x: x + rand(-6, 6),
        h: rand(height * 0.3, height * 0.85),
        r: rand(2.2, 4.6),
        color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]!,
        phase: rand(0, Math.PI * 2),
        petals: Math.random() < 0.5 ? 5 : 6,
      })
    }
  }
  return { back, front, flowers }
}

export function Garden({ height = 120, className }: { height?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let field = grow(0, height)
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      field = grow(width, height)
      if (reduced) draw(0)
    }

    const bendAt = (x: number, tipY: number, t: number, phase: number, lean: number) => {
      const wind =
        Math.sin(t * 1.3 + x * 0.012 + phase) * 0.12 + Math.sin(t * 0.4 + x * 0.003) * 0.08
      let push = 0
      const dx = x - pointer.x
      const dy = tipY - pointer.y
      const d = Math.hypot(dx, dy)
      if (d < 90) push = (dx >= 0 ? 1 : -1) * (1 - d / 90) * 0.9
      return lean + (reduced ? 0 : wind) + push
    }

    const blade = (b: Blade, t: number) => {
      const angle = bendAt(b.x, height - b.h, t, b.phase, b.lean)
      const tipX = b.x + Math.sin(angle) * b.h
      const tipY = height - Math.cos(angle) * b.h
      const cx = b.x + Math.sin(angle * 0.5) * b.h * 0.5
      const cy = height - b.h * 0.55
      ctx.beginPath()
      ctx.moveTo(b.x - b.w / 2, height)
      ctx.quadraticCurveTo(cx - b.w / 3, cy, tipX, tipY)
      ctx.quadraticCurveTo(cx + b.w / 3, cy, b.x + b.w / 2, height)
      ctx.fillStyle = b.color
      ctx.fill()
    }

    const flower = (f: Flower, t: number) => {
      const angle = bendAt(f.x, height - f.h, t, f.phase, 0) * 0.8
      const headX = f.x + Math.sin(angle) * f.h
      const headY = height - Math.cos(angle) * f.h
      ctx.beginPath()
      ctx.moveTo(f.x, height)
      ctx.quadraticCurveTo(
        f.x + Math.sin(angle * 0.5) * f.h * 0.5,
        height - f.h * 0.5,
        headX,
        headY,
      )
      ctx.strokeStyle = "hsl(110 35% 28%)"
      ctx.lineWidth = 1.1
      ctx.stroke()
      ctx.fillStyle = f.color
      for (let i = 0; i < f.petals; i++) {
        const a = (i / f.petals) * Math.PI * 2 + t * 0.2 + f.phase
        ctx.beginPath()
        ctx.arc(headX + Math.cos(a) * f.r, headY + Math.sin(a) * f.r, f.r * 0.62, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(headX, headY, f.r * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = "#facc15"
      ctx.fill()
    }

    const draw = (time: number) => {
      const t = time / 1000
      ctx.clearRect(0, 0, width, height)
      for (const b of field.back) blade(b, t)
      for (const f of field.flowers) flower(f, t)
      for (const b of field.front) blade(b, t)
    }

    const loop = (time: number) => {
      if (visible) draw(time)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
    })
    io.observe(canvas)
    window.addEventListener("pointermove", onMove)
    document.addEventListener("pointerleave", onLeave)
    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [height])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block w-full", className)}
      style={{ height }}
    />
  )
}
