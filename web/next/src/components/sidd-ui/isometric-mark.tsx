"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"

// 5-row block glyphs; "#" is a filled cell. Add letters here to spell other words.
export const GLYPHS: Record<string, string[]> = {
  S: ["####", "#...", "####", "...#", "####"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  D: ["###.", "#..#", "#..#", "#..#", "###."],
  G: ["####", "#...", "#.##", "#..#", "####"],
  Z: ["####", "..##", ".##.", "##..", "####"],
}

const COS = Math.cos(Math.PI / 6)
const SIN = 0.5
const CELL = 28
const HEIGHT = 26
const PRESSED = 10

type Cell = [number, number]

function layout(text: string) {
  const cells: Cell[] = []
  let col = 0
  for (const ch of text.toUpperCase()) {
    const glyph = GLYPHS[ch]
    if (!glyph) {
      col += 2
      continue
    }
    glyph.forEach((row, y) => [...row].forEach((c, x) => c === "#" && cells.push([col + x, y])))
    col += (glyph[0]?.length ?? 0) + 1
  }
  const cols = col - 1
  // Glyph rows run along grid x and columns along -y, so the word reads from south-west to north-east.
  const grid = cells.map(([c, r]): Cell => [r, cols - 1 - c])
  return { cells: grid, spanX: 5, spanY: cols }
}

const p = (x: number, y: number, z: number) =>
  [(x - y) * CELL * COS, (x + y) * CELL * SIN - z] as const
const pt = (x: number, y: number, z: number) =>
  p(x, y, z)
    .map((n) => n.toFixed(2))
    .join(" ")
const poly = (pts: [number, number, number][]) => `M${pts.map((q) => pt(...q)).join("L")}Z`
const seg = (a: [number, number, number], b: [number, number, number]) => `M${pt(...a)}L${pt(...b)}`

function buildCells(cells: Cell[], h: number) {
  const has = new Set(cells.map(([x, y]) => `${x},${y}`))
  const at = (x: number, y: number) => has.has(`${x},${y}`)
  const sorted = [...cells].sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0])

  return sorted.map(([x, y]) => {
    const wallX = !at(x + 1, y)
    const wallY = !at(x, y + 1)
    const walls: string[] = []
    const strokes: string[] = []

    if (wallX) {
      walls.push(
        poly([
          [x + 1, y, h],
          [x + 1, y + 1, h],
          [x + 1, y + 1, 0],
          [x + 1, y, 0],
        ]),
      )
      strokes.push(seg([x + 1, y, 0], [x + 1, y + 1, 0]))
      if (!(at(x, y - 1) && !at(x + 1, y - 1))) strokes.push(seg([x + 1, y, h], [x + 1, y, 0]))
      if (!(at(x, y + 1) && !at(x + 1, y + 1)))
        strokes.push(seg([x + 1, y + 1, h], [x + 1, y + 1, 0]))
    }
    if (wallY) {
      walls.push(
        poly([
          [x, y + 1, h],
          [x + 1, y + 1, h],
          [x + 1, y + 1, 0],
          [x, y + 1, 0],
        ]),
      )
      strokes.push(seg([x, y + 1, 0], [x + 1, y + 1, 0]))
      if (!(at(x - 1, y) && !at(x - 1, y + 1))) strokes.push(seg([x, y + 1, h], [x, y + 1, 0]))
      if (!(at(x + 1, y) && !at(x + 1, y + 1)))
        strokes.push(seg([x + 1, y + 1, h], [x + 1, y + 1, 0]))
    }
    if (!at(x, y - 1)) strokes.push(seg([x, y, h], [x + 1, y, h]))
    if (!at(x - 1, y)) strokes.push(seg([x, y, h], [x, y + 1, h]))
    if (wallX) strokes.push(seg([x + 1, y, h], [x + 1, y + 1, h]))
    if (wallY) strokes.push(seg([x, y + 1, h], [x + 1, y + 1, h]))

    return {
      key: `${x},${y}`,
      top: poly([
        [x, y, h],
        [x + 1, y, h],
        [x + 1, y + 1, h],
        [x, y + 1, h],
      ]),
      walls: walls.join(""),
      strokes: strokes.join(""),
    }
  })
}

let audio: HTMLAudioElement | null = null
function playMetalClick() {
  try {
    audio ??= new Audio("/sounds/metal-click.mp3")
    audio.currentTime = 0
    audio.volume = 0.6
    void audio.play()
  } catch {}
}

export function IsometricMark({ text = "SIDD", className }: { text?: string; className?: string }) {
  const uid = useId().replace(/:/g, "")
  const ids = { pattern: `iso-pattern-${uid}`, glow: `iso-glow-${uid}` }
  const { cells, spanX, spanY } = useMemo(() => layout(text), [text])
  const svgRef = useRef<SVGSVGElement>(null)
  const glowRef = useRef<SVGRadialGradientElement>(null)
  const [h, setH] = useState(HEIGHT)
  const target = useRef(HEIGHT)
  const motion = useRef({ h: HEIGHT, v: 0, raf: 0 })

  const viewBox = useMemo(() => {
    const minX = p(0, spanY, 0)[0] - 2
    const maxX = p(spanX, 0, 0)[0] + 2
    const minY = -HEIGHT - 2
    const maxY = p(spanX, spanY, 0)[1] + 2
    return { minX, minY, w: maxX - minX, h: maxY - minY }
  }, [spanX, spanY])

  const faces = useMemo(() => buildCells(cells, h), [cells, h])

  const animate = () => {
    const m = motion.current
    cancelAnimationFrame(m.raf)
    const step = () => {
      const force = (target.current - m.h) * 0.22
      m.v = (m.v + force) * 0.68
      m.h += m.v
      setH(m.h)
      if (Math.abs(m.v) > 0.01 || Math.abs(target.current - m.h) > 0.01)
        m.raf = requestAnimationFrame(step)
      else setH(target.current)
    }
    m.raf = requestAnimationFrame(step)
  }

  useEffect(() => {
    const svg = svgRef.current
    const glow = glowRef.current
    if (!svg || !glow) return
    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
    const pos = { x: viewBox.minX + viewBox.w / 2, y: viewBox.minY + viewBox.h / 2 }
    const goal = { ...pos }
    let raf = 0
    const tick = () => {
      pos.x += (goal.x - pos.x) * 0.15
      pos.y += (goal.y - pos.y) * 0.15
      glow.setAttribute("cx", pos.x.toFixed(1))
      glow.setAttribute("cy", pos.y.toFixed(1))
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect()
      goal.x = viewBox.minX + ((e.clientX - r.left) / r.width) * viewBox.w
      goal.y = viewBox.minY + ((e.clientY - r.top) / r.height) * viewBox.h
    }
    window.addEventListener("pointermove", onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [viewBox])

  useEffect(() => () => cancelAnimationFrame(motion.current.raf), [])

  const press = (down: boolean) => {
    target.current = down ? PRESSED : HEIGHT
    animate()
  }

  const span = 2000
  const guide = (x: number, y: number, dir: 1 | -1) => {
    const [ax, ay] = p(x, y, 0)
    return `M${ax - span * COS} ${ay - span * SIN * dir}L${ax + span * COS} ${ay + span * SIN * dir}`
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.w} ${viewBox.h}`}
      className={`h-auto w-full cursor-pointer touch-manipulation overflow-visible select-none [--iso-hatch:color-mix(in_oklab,var(--foreground)_20%,var(--background))] [--iso-stroke:color-mix(in_oklab,var(--foreground)_45%,var(--background))] ${className ?? ""}`}
      fill="none"
      aria-label={text}
      role="img"
      onPointerDown={() => {
        press(true)
        playMetalClick()
      }}
      onPointerUp={() => press(false)}
      onPointerLeave={() => press(false)}
    >
      <defs>
        <pattern id={ids.pattern} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2" stroke="var(--iso-hatch)" strokeWidth="1" />
        </pattern>
        <radialGradient
          ref={glowRef}
          id={ids.glow}
          cx="0"
          cy="0"
          r="170"
          gradientUnits="userSpaceOnUse"
        >
          <stop className="[stop-color:var(--color-zinc-800)] dark:[stop-color:#fff]" />
          <stop
            className="[stop-color:var(--color-zinc-400)] dark:[stop-color:var(--color-zinc-500)]"
            offset="1"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <g className="stroke-line" strokeWidth="1" strokeDasharray="4 2">
        <path d={guide(spanX, 0, -1)} />
        <path d={guide(0, 0, 1)} />
        <path d={guide(0, spanY, 1)} />
      </g>

      {faces.map((f) => (
        <g key={f.key} strokeLinecap="round" strokeLinejoin="round">
          <path d={f.walls} className="fill-background" />
          <path d={f.top} className="fill-background" />
          <path d={f.top} fill={`url(#${ids.pattern})`} />
          <path d={f.strokes} stroke="var(--iso-stroke)" strokeWidth="1" />
          <path d={f.strokes} stroke={`url(#${ids.glow})`} strokeWidth="1.25" />
        </g>
      ))}
    </svg>
  )
}
