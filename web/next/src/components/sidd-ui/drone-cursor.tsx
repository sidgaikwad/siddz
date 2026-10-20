"use client"

import { Canvas } from "@react-three/fiber"
import { RiArrowDownSLine, RiGamepadLine } from "@remixicon/react"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"

import { DroneMode } from "@/components/sidd-ui/drone-mode"
import {
  DroneModel,
  TRICK_KEYS,
  createDroneState,
  queueTrick,
  stepTrick,
  type Trick,
  type TrickQueue,
} from "@/components/sidd-ui/drone-model"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

const SIZE = 96
const OFFSET = { x: 34, y: -42 }
const STORAGE_KEY = "drone-cursor"

function readSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as { open?: boolean; parked?: boolean }
  } catch {}
  return {}
}

function writeSettings(settings: { open: boolean; parked: boolean }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

function ControlRow({
  hotkey,
  label,
  onClick,
  pressed,
}: {
  hotkey: string
  label: string
  onClick: () => void
  pressed?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={pressed}
      aria-keyshortcuts={hotkey}
      onClick={onClick}
      className="text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground w-full justify-between font-mono text-xs"
    >
      <span className="flex items-center gap-2">
        {pressed !== undefined && (
          <span
            className={cn(
              "size-1.5 rounded-full",
              pressed ? "bg-foreground motion-safe:animate-pulse" : "bg-border",
            )}
          />
        )}
        {label}
      </span>
      <Kbd>{hotkey}</Kbd>
    </Button>
  )
}

// A tiny voxel drone that follows the cursor, banks into turns, scans links and naps when idle. Tricks and lights run from the top-right panel or the keyboard; the headlight also switches on over [data-drone-light], and drone mode plays `modeContent` full screen.
export function DroneCursor({ modeContent }: { modeContent?: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [parked, setParked] = useState(false)
  const [hazard, setHazard] = useState(false)
  const [light, setLight] = useState(false)
  const [mode, setMode] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const scan = useRef<SVGPolygonElement>(null)
  const scanSvg = useRef<SVGSVGElement>(null)
  const cone = useRef<SVGPolygonElement>(null)
  const spot = useRef<SVGEllipseElement>(null)
  const coneSvg = useRef<SVGSVGElement>(null)
  const state = useRef(createDroneState())
  const pilot = useRef<TrickQueue & { lastActive: number; light: boolean; overLight: boolean }>({
    current: null,
    lastActive: 0,
    light: false,
    overLight: false,
    queue: [],
  })
  const flying = !parked && !mode

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saved = readSettings()
    setOpen(saved.open ?? window.innerWidth >= 1280)
    setParked(saved.parked ?? false)
    setEnabled(fine && !reduced)
  }, [])

  useEffect(() => {
    if (enabled) writeSettings({ open, parked })
  }, [enabled, open, parked])

  useEffect(() => {
    state.current.hazard = hazard
  }, [hazard])

  useEffect(() => {
    pilot.current.light = light
  }, [light])

  const perform = useCallback((trick: Trick) => {
    queueTrick(pilot.current, trick)
    pilot.current.lastActive = performance.now()
  }, [])

  const toggleHazard = useCallback(() => {
    setHazard((v) => !v)
    pilot.current.lastActive = performance.now()
  }, [])

  const toggleLight = useCallback(() => {
    setLight((v) => !v)
    pilot.current.lastActive = performance.now()
  }, [])

  useEffect(() => {
    if (!enabled || mode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.defaultPrevented) return
      const el = e.target as HTMLElement | null
      if (el?.closest("input, textarea, select, [contenteditable]")) return
      const key = e.key.toUpperCase()
      if (key === "M" && modeContent) return setMode(true)
      if (key === "P") return setParked((v) => !v)
      if (parked) return
      const control = TRICK_KEYS.find((c) => c.key === key)
      if (control) perform(control.trick)
      else if (key === "H") toggleHazard()
      else if (key === "L") toggleLight()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled, mode, modeContent, parked, perform, toggleHazard, toggleLight])

  useEffect(() => {
    if (!enabled || !flying) return
    const p = pilot.current
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, seen: false }
    const pos = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 }
    p.lastActive = performance.now()
    let opacity = 0
    let raf = 0

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (!pointer.seen) {
        pointer.seen = true
        pos.x = e.clientX + OFFSET.x
        pos.y = e.clientY + OFFSET.y
      }
      p.lastActive = performance.now()
      const el = e.target as Element | null
      state.current.locked = !!el?.closest(
        "a, button, [role='button'], input, textarea, select, summary",
      )
      p.overLight = !!el?.closest("[data-drone-light]")
    }
    const onLeave = () => {
      pointer.seen = false
    }

    const tick = (now: number) => {
      const tx = pointer.x + OFFSET.x
      const ty = pointer.y + OFFSET.y
      pos.vx = (pos.vx + (tx - pos.x) * 0.06) * 0.82
      pos.vy = (pos.vy + (ty - pos.y) * 0.06) * 0.82
      pos.x += pos.vx
      pos.y += pos.vy
      const s = state.current
      s.vx = pos.vx
      s.vy = pos.vy
      s.asleep = now - p.lastActive > 4500
      s.lit = p.light || p.overLight

      if (stepTrick(p, s, now)) p.lastActive = now

      opacity += ((pointer.seen ? 1 : 0) - opacity) * 0.08
      if (wrap.current) {
        wrap.current.style.transform = `translate3d(${(pos.x - SIZE / 2).toFixed(1)}px, ${(pos.y - SIZE / 2).toFixed(1)}px, 0)`
        wrap.current.style.opacity = opacity.toFixed(3)
      }
      const awake = !s.asleep && pointer.seen
      if (scan.current && scanSvg.current) {
        const on = s.locked && awake
        scanSvg.current.style.opacity = on ? "1" : "0"
        if (on) {
          const bx = pos.x
          const by = pos.y + 6
          scan.current.setAttribute(
            "points",
            `${bx - 4},${by} ${bx + 4},${by} ${pointer.x + 16},${pointer.y + 4} ${pointer.x - 16},${pointer.y + 4}`,
          )
        }
      }
      if (cone.current && spot.current && coneSvg.current) {
        const on = s.lit && !s.locked && pointer.seen
        coneSvg.current.style.opacity = on ? "1" : "0"
        if (on) {
          const bx = pos.x
          const by = pos.y + 10
          cone.current.setAttribute(
            "points",
            `${bx - 6},${by} ${bx + 6},${by} ${pointer.x + 56},${pointer.y + 24} ${pointer.x - 56},${pointer.y + 24}`,
          )
          spot.current.setAttribute("cx", pointer.x.toFixed(1))
          spot.current.setAttribute("cy", (pointer.y + 24).toFixed(1))
        }
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove)
    document.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
      p.current = null
      p.queue = []
      state.current.trick = null
    }
  }, [enabled, flying])

  if (!enabled) return null

  return (
    <>
      {mode && <DroneMode onExit={() => setMode(false)}>{modeContent}</DroneMode>}
      <div
        hidden={mode}
        className="bg-background/80 fixed top-16 right-4 z-[60] w-52 rounded-lg border backdrop-blur"
      >
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={open}
          aria-controls="drone-controls"
          onClick={() => setOpen((v) => !v)}
          className="w-full justify-between font-mono text-xs"
        >
          <span className="flex items-center gap-2">
            <RiGamepadLine />
            Drone controls
          </span>
          <RiArrowDownSLine className={cn("transition-transform", open && "rotate-180")} />
        </Button>
        {open && (
          <div id="drone-controls" className="space-y-1 border-t p-1">
            {modeContent && (
              <div className="border-b pb-1">
                <ControlRow hotkey="M" label="Drone mode" onClick={() => setMode(true)} />
              </div>
            )}
            {!parked && (
              <>
                {TRICK_KEYS.map((c) => (
                  <ControlRow
                    key={c.key}
                    hotkey={c.key}
                    label={c.label}
                    onClick={() => perform(c.trick)}
                  />
                ))}
                <div className="border-t pt-1">
                  <ControlRow
                    hotkey="H"
                    label="Hazard lights"
                    onClick={toggleHazard}
                    pressed={hazard}
                  />
                  <ControlRow hotkey="L" label="Headlight" onClick={toggleLight} pressed={light} />
                </div>
              </>
            )}
            <div className={cn(!parked && "border-t pt-1")}>
              <ControlRow
                hotkey="P"
                label={parked ? "Launch drone" : "Park drone"}
                onClick={() => setParked((v) => !v)}
              />
            </div>
            {!parked && (
              <p className="text-muted-foreground px-2.5 pt-1 pb-1.5 text-xs">
                The headlight also switches on over the footer wordmark.
              </p>
            )}
          </div>
        )}
      </div>
      {flying && (
        <>
          <svg
            ref={coneSvg}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[108] size-full transition-opacity duration-300"
            style={{ opacity: 0 }}
          >
            <defs>
              <linearGradient id="drone-cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbbf24" stopOpacity="0.6" />
                <stop offset="1" stopColor="#fbbf24" stopOpacity="0.15" />
              </linearGradient>
              <radialGradient id="drone-spot">
                <stop offset="0" stopColor="#fbbf24" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>
            <polygon ref={cone} fill="url(#drone-cone)" />
            <ellipse ref={spot} rx="72" ry="22" fill="url(#drone-spot)" />
          </svg>
          <svg
            ref={scanSvg}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[109] size-full transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <defs>
              <linearGradient id="drone-beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="1" stopColor="#22d3ee" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polygon ref={scan} fill="url(#drone-beam)" />
          </svg>
          <div
            ref={wrap}
            aria-hidden
            className="pointer-events-none fixed top-0 left-0 z-[110] [&_canvas]:[image-rendering:pixelated]"
            style={{ width: SIZE, height: SIZE, opacity: 0 }}
          >
            <Canvas
              orthographic
              dpr={0.5}
              gl={{ antialias: false, alpha: true }}
              camera={{ position: [6, 7, 9], zoom: 13, near: 0.1, far: 50 }}
              onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
              style={{ pointerEvents: "none" }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[4, 8, 6]} intensity={1.6} />
              <DroneModel state={state} />
            </Canvas>
          </div>
        </>
      )}
    </>
  )
}
