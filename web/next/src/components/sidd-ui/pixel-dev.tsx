"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { cn } from "cn"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

type V3 = [number, number, number]

const SKIN = "#c68642"
const HOODIE = "#4b5563"
const HOODIE_LIGHT = "#6b7280"
const JEANS = "#1e3a8a"
const HAIR = "#111827"
const SILVER = "#d4d4d8"
const WOOD = "#a16207"

export function Box({ p, s, c, emissive }: { p: V3; s: V3; c: string; emissive?: string }) {
  return (
    <mesh position={p}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} flatShading roughness={0.8} emissive={emissive ?? "#000"} />
    </mesh>
  )
}

function useCodeScreen() {
  return useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 40
    const ctx = canvas.getContext("2d")!
    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    const palette = ["#22c55e", "#38bdf8", "#f472b6", "#e5e5e5", "#facc15", "#a78bfa"]
    const lines = Array.from({ length: 12 }, () => makeLine())
    function makeLine() {
      const indent = Math.floor(Math.random() * 4) * 3
      const parts: { w: number; c: string }[] = []
      let x = indent
      while (x < 56 && parts.length < 5) {
        const w = 3 + Math.floor(Math.random() * 10)
        parts.push({ w, c: palette[Math.floor(Math.random() * palette.length)]! })
        x += w + 2
      }
      return { indent, parts }
    }
    let tick = 0
    const draw = () => {
      ctx.fillStyle = "#0b1020"
      ctx.fillRect(0, 0, 64, 40)
      lines.forEach((l, row) => {
        let x = 3 + l.indent
        for (const part of l.parts) {
          ctx.fillStyle = part.c
          ctx.fillRect(x, 2 + row * 3, part.w, 2)
          x += part.w + 2
        }
      })
      if (tick % 2 === 0) {
        ctx.fillStyle = "#e5e5e5"
        ctx.fillRect(4, 2 + 11 * 3, 2, 2)
      }
      texture.needsUpdate = true
    }
    const step = () => {
      tick++
      if (tick % 3 === 0) {
        lines.shift()
        lines.push(makeLine())
      }
      draw()
    }
    draw()
    return { texture, step }
  }, [])
}

function Developer() {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (left.current) left.current.position.y = Math.max(0, Math.sin(t * 22)) * 0.14
    if (right.current) right.current.position.y = Math.max(0, Math.sin(t * 22 + Math.PI)) * 0.14
    if (head.current) head.current.rotation.x = Math.sin(t * 2.2) * 0.04
  })
  return (
    <group>
      {[-0.55, 0.55].map((x) => (
        <group key={x}>
          <Box p={[x, 3.9, 1.4]} s={[0.9, 0.9, 2.2]} c={JEANS} />
          <Box p={[x, 2.05, 0.35]} s={[0.9, 2.8, 0.9]} c={JEANS} />
          <Box p={[x, 0.45, 0.15]} s={[0.95, 0.5, 1.4]} c="#e5e5e5" />
        </group>
      ))}
      <Box p={[0, 5.8, 2.2]} s={[2.4, 3, 1.4]} c={HOODIE} />
      <Box p={[0, 7.05, 2.85]} s={[2, 0.8, 0.5]} c={HOODIE_LIGHT} />
      <Box p={[0, 5.2, 1.48]} s={[1.2, 0.5, 0.06]} c={HOODIE_LIGHT} />
      {[-1.55, 1.55].map((x) => (
        <Box key={x} p={[x, 6.2, 2.1]} s={[0.7, 2, 0.8]} c={HOODIE} />
      ))}
      {[-0.95, 0.95].map((x, i) => (
        <group key={x} ref={i === 0 ? left : right}>
          <Box p={[x, 5.85, 0.65]} s={[0.6, 0.6, 2.4]} c={HOODIE} />
          <Box p={[x * 0.8, 5.8, -0.75]} s={[0.55, 0.4, 0.6]} c={SKIN} />
        </group>
      ))}
      <group ref={head} position={[0, 8.3, 2]}>
        <Box p={[0, 0, 0]} s={[1.8, 1.8, 1.8]} c={SKIN} />
        <Box p={[0, 1, 0.05]} s={[1.9, 0.6, 1.9]} c={HAIR} />
        <Box p={[0, 0.3, 0.95]} s={[1.9, 1.3, 0.4]} c={HAIR} />
        <Box p={[0, 1.38, 0]} s={[2.1, 0.25, 0.4]} c="#e5e5e5" />
        {[-1, 1].map((x) => (
          <Box key={x} p={[x, 0.1, 0]} s={[0.35, 0.85, 0.85]} c="#e5e5e5" />
        ))}
      </group>
    </group>
  )
}

function Steam() {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const t = (clock.elapsedTime * 0.6 + i / 3) % 1
      m.position.set(3 + Math.sin(t * 6 + i) * 0.15, 6.2 + t * 1.6, -1)
      m.scale.setScalar(1 - t * 0.6)
      ;(m.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t)
    })
  })
  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshBasicMaterial color="#f5f5f5" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  )
}

function Scene({ animate }: { animate: boolean }) {
  const { texture, step } = useCodeScreen()
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const elapsed = useRef(0)

  useEffect(() => {
    if (!animate) return
    const id = setInterval(step, 140)
    return () => clearInterval(id)
  }, [animate, step])

  useFrame((_, delta) => {
    if (animate) elapsed.current += delta
    const yaw = 0.75 + Math.sin(elapsed.current * 0.5) * 0.45
    const target = new THREE.Vector3(0, 4.6, 0)
    camera.position.set(Math.sin(yaw) * 20, 13, Math.cos(yaw) * 20)
    camera.lookAt(target)
    const cam = camera as THREE.OrthographicCamera
    cam.zoom = Math.min(size.width, size.height) / 11
    cam.updateProjectionMatrix()
  })

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 8]} intensity={1.5} />
      <pointLight position={[0, 6.6, -1.5]} intensity={6} distance={6} color="#38bdf8" />

      <Box p={[0, -0.15, 0]} s={[13, 0.3, 11]} c="#27272a" />

      <Box p={[0, 5, -1.5]} s={[9, 0.6, 4.5]} c={WOOD} />
      {[
        [-4, -3.4],
        [4, -3.4],
        [-4, 0.4],
        [4, 0.4],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x!, 2.35, z!]} s={[0.6, 4.7, 0.6]} c="#78350f" />
      ))}

      <Box p={[0, 5.42, -1.4]} s={[3.4, 0.25, 2.2]} c={SILVER} />
      <Box p={[0, 5.57, -1.05]} s={[2.8, 0.06, 1]} c="#3f3f46" />
      <group position={[0, 5.55, -2.45]} rotation={[-0.22, 0, 0]}>
        <Box p={[0, 1.15, 0]} s={[3.4, 2.3, 0.15]} c={SILVER} />
        <mesh position={[0, 1.2, 0.08]}>
          <planeGeometry args={[3.05, 1.95]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <Box p={[0, 1.2, -0.09]} s={[0.35, 0.35, 0.02]} c="#fafafa" />
      </group>

      <Box p={[3, 5.65, -1]} s={[0.6, 0.7, 0.6]} c="#f5f5f5" />
      <Box p={[3.4, 5.65, -1]} s={[0.2, 0.4, 0.15]} c="#f5f5f5" />
      {animate && <Steam />}

      <Box p={[-3.6, 5.65, -2.6]} s={[0.8, 0.7, 0.8]} c="#9a3412" />
      <Box p={[-3.6, 6.4, -2.6]} s={[0.5, 0.9, 0.5]} c="#16a34a" />
      <Box p={[-3.9, 6.9, -2.6]} s={[0.5, 0.5, 0.5]} c="#22c55e" />
      <Box p={[-3.3, 7.1, -2.5]} s={[0.45, 0.45, 0.45]} c="#15803d" />

      <Box p={[0, 3.2, 2.2]} s={[3, 0.5, 3]} c="#18181b" />
      <Box p={[0, 5.3, 3.6]} s={[3, 3.6, 0.5]} c="#18181b" />
      <Box p={[0, 1.9, 2.2]} s={[0.4, 2.4, 0.4]} c="#3f3f46" />
      <Box p={[0, 0.45, 2.2]} s={[2.4, 0.3, 2.4]} c="#3f3f46" />

      <Developer />
    </>
  )
}

// A voxel developer typing at a MacBook, rendered at low resolution and scaled up with hard pixels.
export function PixelDev({
  pixelScale = 0.34,
  frameloop = "always",
  className,
}: {
  pixelScale?: number
  frameloop?: "always" | "never"
  className?: string
}) {
  const animate = useMemo(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  return (
    <div className={cn("[&_canvas]:[image-rendering:pixelated]", className)}>
      <Canvas
        orthographic
        frameloop={frameloop}
        dpr={pixelScale}
        gl={{ antialias: false, alpha: true }}
        camera={{ near: 0.1, far: 100 }}
      >
        <Scene animate={animate} />
      </Canvas>
    </div>
  )
}
