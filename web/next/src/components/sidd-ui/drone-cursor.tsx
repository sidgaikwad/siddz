"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { RiArrowDownSLine, RiGamepadLine } from "@remixicon/react"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { Box } from "@/components/sidd-ui/pixel-dev"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

const SIZE = 96
const OFFSET = { x: 34, y: -42 }
const TRICK_MS = 750
const STORAGE_KEY = "drone-cursor"

type Trick = "flip-back" | "flip-front" | "roll-left" | "roll-right" | "spin"

const TRICKS: Record<Trick, { axis: "x" | "y" | "z"; dir: 1 | -1; hop: number }> = {
  "flip-back": { axis: "x", dir: -1, hop: 0.6 },
  "flip-front": { axis: "x", dir: 1, hop: 0.6 },
  "roll-left": { axis: "z", dir: 1, hop: 0.2 },
  "roll-right": { axis: "z", dir: -1, hop: 0.2 },
  spin: { axis: "y", dir: 1, hop: 0 },
}

const CONTROLS: { key: string; label: string; trick: Trick }[] = [
  { key: "Q", label: "Roll left", trick: "roll-left" },
  { key: "E", label: "Roll right", trick: "roll-right" },
  { key: "F", label: "Front flip", trick: "flip-front" },
  { key: "B", label: "Back flip", trick: "flip-back" },
  { key: "S", label: "Spin", trick: "spin" },
]

// Shared, mutable state between the DOM follower loop and the three.js scene.
type DroneState = {
  asleep: boolean
  hazard: boolean
  lit: boolean
  locked: boolean
  trick: { angle: number; axis: "x" | "y" | "z"; hop: number } | null
  vx: number
  vy: number
}

function Rotor({
  p,
  state,
  dir,
}: {
  p: [number, number, number]
  state: React.RefObject<DroneState>
  dir: 1 | -1
}) {
  const ref = useRef<THREE.Group>(null)
  const speed = useRef(1)
  useFrame((_, delta) => {
    const target = state.current.asleep ? 0.05 : state.current.trick ? 1.6 : 1
    speed.current += (target - speed.current) * 0.05
    if (ref.current) ref.current.rotation.y += dir * delta * 40 * speed.current
  })
  return (
    <group ref={ref} position={p}>
      <Box p={[0, 0, 0]} s={[1.9, 0.08, 0.28]} c="#a1a1aa" />
      <Box p={[0, 0, 0]} s={[0.28, 0.08, 1.9]} c="#a1a1aa" />
    </group>
  )
}

function Drone({ state }: { state: React.RefObject<DroneState> }) {
  const body = useRef<THREE.Group>(null)
  const stunt = useRef<THREE.Group>(null)
  const eye = useRef<THREE.MeshStandardMaterial>(null)
  const led = useRef<THREE.MeshStandardMaterial>(null)
  const lamp = useRef<THREE.MeshStandardMaterial>(null)
  const hazards = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const sink = useRef(0)

  useFrame(({ clock }) => {
    const s = state.current
    const g = body.current
    if (!g) return
    const t = clock.elapsedTime
    sink.current += ((s.asleep ? -1.2 : 0) - sink.current) * 0.04
    g.position.y = sink.current + (s.asleep ? 0 : Math.sin(t * 3) * 0.15)
    g.rotation.z = THREE.MathUtils.lerp(
      g.rotation.z,
      THREE.MathUtils.clamp(-s.vx * 0.05, -0.6, 0.6),
      0.2,
    )
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      THREE.MathUtils.clamp(s.vy * 0.04, -0.5, 0.5),
      0.2,
    )
    if (stunt.current) {
      stunt.current.rotation.set(0, 0, 0)
      stunt.current.position.y = 0
      if (s.trick) {
        stunt.current.rotation[s.trick.axis] = s.trick.angle
        stunt.current.position.y = s.trick.hop
      }
    }
    const blink = Math.sin(t * 9) > 0
    if (eye.current) eye.current.emissiveIntensity = s.asleep ? 0.15 : s.locked ? 3 : 1.2
    if (led.current) {
      const c = s.hazard ? "#f59e0b" : s.locked ? "#f59e0b" : "#22c55e"
      led.current.color.set(c)
      led.current.emissive.set(c)
      led.current.emissiveIntensity = Math.sin(t * 8) > 0 ? 2 : 0.2
    }
    if (lamp.current) {
      lamp.current.color.set(s.lit ? "#fef3c7" : "#3f3f46")
      lamp.current.emissive.set(s.lit ? "#fde68a" : "#000000")
      lamp.current.emissiveIntensity = s.lit ? 3 : 0
    }
    for (const m of hazards.current) {
      if (!m) continue
      const on = s.hazard && blink
      m.color.set(s.hazard ? "#f59e0b" : "#3f3f46")
      m.emissive.set(on ? "#f59e0b" : "#000000")
      m.emissiveIntensity = on ? 3 : 0
    }
  })

  return (
    <group ref={body}>
      <group ref={stunt}>
        <Box p={[0, 0, 0]} s={[2.2, 0.8, 2.2]} c="#27272a" />
        <Box p={[0, 0.5, 0]} s={[1.6, 0.25, 1.6]} c="#52525b" />
        <mesh position={[0, -0.05, 1.12]}>
          <boxGeometry args={[0.8, 0.5, 0.12]} />
          <meshStandardMaterial ref={eye} color="#22d3ee" emissive="#22d3ee" flatShading />
        </mesh>
        <mesh position={[0, -0.45, 1.0]}>
          <boxGeometry args={[0.6, 0.18, 0.25]} />
          <meshStandardMaterial ref={lamp} color="#3f3f46" flatShading />
        </mesh>
        <mesh position={[0, 0.7, -0.7]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial ref={led} color="#22c55e" emissive="#22c55e" flatShading />
        </mesh>
        {[
          [1.5, 1.5],
          [-1.5, 1.5],
          [1.5, -1.5],
          [-1.5, -1.5],
        ].map(([x, z], i) => (
          <group key={i}>
            <group rotation={[0, Math.atan2(x!, z!), 0]}>
              <Box p={[0, 0.1, 1.05]} s={[0.3, 0.22, 1.5]} c="#3f3f46" />
            </group>
            <Box p={[x!, 0.25, z!]} s={[0.55, 0.45, 0.55]} c="#18181b" />
            <mesh position={[x! * 1.22, 0.2, z! * 1.22]}>
              <boxGeometry args={[0.28, 0.22, 0.28]} />
              <meshStandardMaterial
                ref={(m) => {
                  hazards.current[i] = m
                }}
                color="#3f3f46"
                flatShading
              />
            </mesh>
            <Rotor p={[x!, 0.55, z!]} state={state} dir={i % 2 ? 1 : -1} />
          </group>
        ))}
        {[-0.7, 0.7].map((x) => (
          <Box key={x} p={[x, -0.65, 0]} s={[0.15, 0.5, 1.6]} c="#3f3f46" />
        ))}
        <Box p={[0.6, 0.95, -0.4]} s={[0.08, 0.6, 0.08]} c="#a1a1aa" />
      </group>
    </group>
  )
}

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

// A tiny voxel drone that follows the cursor, banks into turns, scans links and naps when idle. Tricks and lights run from the top-right panel or the keyboard; the headlight also switches on over [data-drone-light].
export function DroneCursor() {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [parked, setParked] = useState(false)
  const [hazard, setHazard] = useState(false)
  const [light, setLight] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const scan = useRef<SVGPolygonElement>(null)
  const scanSvg = useRef<SVGSVGElement>(null)
  const cone = useRef<SVGPolygonElement>(null)
  const spot = useRef<SVGEllipseElement>(null)
  const coneSvg = useRef<SVGSVGElement>(null)
  const state = useRef<DroneState>({
    asleep: false,
    hazard: false,
    lit: false,
    locked: false,
    trick: null,
    vx: 0,
    vy: 0,
  })
  const pilot = useRef({
    current: null as { name: Trick; start: number } | null,
    lastActive: 0,
    light: false,
    overLight: false,
    queue: [] as Trick[],
  })

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
    const p = pilot.current
    if (p.queue.length < 3) p.queue.push(trick)
    p.lastActive = performance.now()
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
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.defaultPrevented) return
      const el = e.target as HTMLElement | null
      if (el?.closest("input, textarea, select, [contenteditable]")) return
      const key = e.key.toUpperCase()
      if (key === "P") return setParked((v) => !v)
      if (parked) return
      const control = CONTROLS.find((c) => c.key === key)
      if (control) perform(control.trick)
      else if (key === "H") toggleHazard()
      else if (key === "L") toggleLight()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled, parked, perform, toggleHazard, toggleLight])

  useEffect(() => {
    if (!enabled || parked) return
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

      if (!p.current && p.queue.length) p.current = { name: p.queue.shift()!, start: now }
      if (p.current) {
        const k = Math.min(1, (now - p.current.start) / TRICK_MS)
        const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
        const def = TRICKS[p.current.name]
        s.trick = {
          angle: ease * Math.PI * 2 * def.dir,
          axis: def.axis,
          hop: Math.sin(Math.PI * k) * def.hop,
        }
        p.lastActive = now
        if (k >= 1) {
          p.current = null
          s.trick = null
        }
      }

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
  }, [enabled, parked])

  if (!enabled) return null

  return (
    <>
      <div className="bg-background/80 fixed top-16 right-4 z-[60] w-52 rounded-lg border backdrop-blur">
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
            {!parked && (
              <>
                {CONTROLS.map((c) => (
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
      {!parked && (
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
              <Drone state={state} />
            </Canvas>
          </div>
        </>
      )}
    </>
  )
}
