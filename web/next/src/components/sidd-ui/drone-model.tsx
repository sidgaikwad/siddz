"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import { Box } from "@/components/sidd-ui/pixel-dev"

export type Trick = "flip-back" | "flip-front" | "roll-left" | "roll-right" | "spin"

export const TRICK_MS = 750

export const TRICKS: Record<Trick, { axis: "x" | "y" | "z"; dir: 1 | -1; hop: number }> = {
  "flip-back": { axis: "x", dir: -1, hop: 0.6 },
  "flip-front": { axis: "x", dir: 1, hop: 0.6 },
  "roll-left": { axis: "z", dir: 1, hop: 0.2 },
  "roll-right": { axis: "z", dir: -1, hop: 0.2 },
  spin: { axis: "y", dir: 1, hop: 0 },
}

export const TRICK_KEYS: { key: string; label: string; trick: Trick }[] = [
  { key: "Q", label: "Roll left", trick: "roll-left" },
  { key: "E", label: "Roll right", trick: "roll-right" },
  { key: "F", label: "Front flip", trick: "flip-front" },
  { key: "B", label: "Back flip", trick: "flip-back" },
  { key: "S", label: "Spin", trick: "spin" },
]

// Shared, mutable state between a DOM loop and the three.js scene.
export type DroneState = {
  asleep: boolean
  hazard: boolean
  lit: boolean
  locked: boolean
  trick: { angle: number; axis: "x" | "y" | "z"; hop: number } | null
  vx: number
  vy: number
}

export type TrickQueue = { current: { name: Trick; start: number } | null; queue: Trick[] }

export function createDroneState(): DroneState {
  return { asleep: false, hazard: false, lit: false, locked: false, trick: null, vx: 0, vy: 0 }
}

export function queueTrick(q: TrickQueue, trick: Trick) {
  if (q.queue.length < 3) q.queue.push(trick)
}

// Advances the running trick and writes its pose into state; returns whether one is in flight.
export function stepTrick(q: TrickQueue, s: DroneState, now: number) {
  if (!q.current && q.queue.length) q.current = { name: q.queue.shift()!, start: now }
  if (!q.current) return false
  const k = Math.min(1, (now - q.current.start) / TRICK_MS)
  const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
  const def = TRICKS[q.current.name]
  s.trick = {
    angle: ease * Math.PI * 2 * def.dir,
    axis: def.axis,
    hop: Math.sin(Math.PI * k) * def.hop,
  }
  if (k >= 1) {
    q.current = null
    s.trick = null
  }
  return true
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

// The voxel drone itself: hovers, banks on vx/vy, runs tricks, and lights its eye, lamp, status LED and hazards from state.
export function DroneModel({
  lampColor = "#fde68a",
  lampRef,
  state,
}: {
  lampColor?: string
  lampRef?: React.RefObject<THREE.Mesh | null>
  state: React.RefObject<DroneState>
}) {
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
      lamp.current.color.set(s.lit ? lampColor : "#3f3f46")
      lamp.current.emissive.set(s.lit ? lampColor : "#000000")
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
        <mesh ref={lampRef} position={[0, -0.45, 1.0]}>
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
