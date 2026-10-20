"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { Box } from "@/components/sidd-ui/pixel-dev"

const SIZE = 96
const OFFSET = { x: 34, y: -42 }

// Shared, mutable state between the DOM follower loop and the three.js scene.
type DroneState = { vx: number; vy: number; locked: boolean; asleep: boolean; roll: number }

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
    const target = state.current.asleep ? 0.05 : 1
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
  const eye = useRef<THREE.MeshStandardMaterial>(null)
  const led = useRef<THREE.MeshStandardMaterial>(null)
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
      THREE.MathUtils.clamp(-s.vx * 0.05, -0.6, 0.6) + s.roll,
      0.2,
    )
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      THREE.MathUtils.clamp(s.vy * 0.04, -0.5, 0.5),
      0.2,
    )
    if (eye.current) eye.current.emissiveIntensity = s.asleep ? 0.15 : s.locked ? 3 : 1.2
    if (led.current) {
      led.current.color.set(s.locked ? "#f59e0b" : "#22c55e")
      led.current.emissive.set(s.locked ? "#f59e0b" : "#22c55e")
      led.current.emissiveIntensity = Math.sin(t * 8) > 0 ? 2 : 0.2
    }
  })

  return (
    <group ref={body}>
      <Box p={[0, 0, 0]} s={[2.2, 0.8, 2.2]} c="#27272a" />
      <Box p={[0, 0.5, 0]} s={[1.6, 0.25, 1.6]} c="#52525b" />
      <mesh position={[0, -0.05, 1.12]}>
        <boxGeometry args={[0.8, 0.5, 0.12]} />
        <meshStandardMaterial ref={eye} color="#22d3ee" emissive="#22d3ee" flatShading />
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
          <Rotor p={[x!, 0.55, z!]} state={state} dir={i % 2 ? 1 : -1} />
        </group>
      ))}
      {[-0.7, 0.7].map((x) => (
        <Box key={x} p={[x, -0.65, 0]} s={[0.15, 0.5, 1.6]} c="#3f3f46" />
      ))}
      <Box p={[0.6, 0.95, -0.4]} s={[0.08, 0.6, 0.08]} c="#a1a1aa" />
    </group>
  )
}

// A tiny voxel drone that follows the cursor, banks into turns, scans links, barrel-rolls on click and naps when idle.
export function DroneCursor() {
  const [enabled, setEnabled] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const beam = useRef<SVGPolygonElement>(null)
  const beamSvg = useRef<SVGSVGElement>(null)
  const state = useRef<DroneState>({ vx: 0, vy: 0, locked: false, asleep: false, roll: 0 })

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setEnabled(fine && !reduced)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, seen: false }
    const pos = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 }
    let lastMove = performance.now()
    let opacity = 0
    let rollStart = -1
    let raf = 0

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (!pointer.seen) {
        pointer.seen = true
        pos.x = e.clientX + OFFSET.x
        pos.y = e.clientY + OFFSET.y
      }
      lastMove = performance.now()
      const el = e.target as Element | null
      state.current.locked = !!el?.closest(
        "a, button, [role='button'], input, textarea, select, summary",
      )
    }
    const onLeave = () => {
      pointer.seen = false
    }
    const onDown = () => {
      if (rollStart < 0) rollStart = performance.now()
      lastMove = performance.now()
    }

    const tick = (now: number) => {
      const tx = pointer.x + OFFSET.x
      const ty = pointer.y + OFFSET.y
      pos.vx = (pos.vx + (tx - pos.x) * 0.06) * 0.82
      pos.vy = (pos.vy + (ty - pos.y) * 0.06) * 0.82
      pos.x += pos.vx
      pos.y += pos.vy
      state.current.vx = pos.vx
      state.current.vy = pos.vy
      state.current.asleep = now - lastMove > 4500
      if (rollStart >= 0) {
        const k = Math.min(1, (now - rollStart) / 650)
        state.current.roll = (1 - Math.pow(1 - k, 3)) * Math.PI * 2
        if (k >= 1) {
          rollStart = -1
          state.current.roll = 0
        }
      }
      opacity += ((pointer.seen ? 1 : 0) - opacity) * 0.08
      if (wrap.current) {
        wrap.current.style.transform = `translate3d(${(pos.x - SIZE / 2).toFixed(1)}px, ${(pos.y - SIZE / 2).toFixed(1)}px, 0)`
        wrap.current.style.opacity = opacity.toFixed(3)
      }
      if (beam.current && beamSvg.current) {
        const on = state.current.locked && !state.current.asleep && pointer.seen
        beamSvg.current.style.opacity = on ? "1" : "0"
        if (on) {
          const bx = pos.x
          const by = pos.y + 6
          beam.current.setAttribute(
            "points",
            `${bx - 4},${by} ${bx + 4},${by} ${pointer.x + 16},${pointer.y + 4} ${pointer.x - 16},${pointer.y + 4}`,
          )
        }
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerdown", onDown)
    document.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <svg
        ref={beamSvg}
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
        <polygon ref={beam} fill="url(#drone-beam)" />
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
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 8, 6]} intensity={1.6} />
          <Drone state={state} />
        </Canvas>
      </div>
    </>
  )
}
