"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { cn } from "cn"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { Box } from "@/components/sidd-ui/pixel-dev"

type V3 = [number, number, number]

function Rig({
  target = [0, 3, 0],
  fit = 13,
  animate,
}: {
  target?: V3
  fit?: number
  animate: boolean
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const t = useRef(0)
  useFrame((_, delta) => {
    if (animate) t.current += delta
    const yaw = 0.78 + Math.sin(t.current * 0.45) * 0.4
    camera.position.set(Math.sin(yaw) * 22, 14, Math.cos(yaw) * 22)
    camera.lookAt(...target)
    const cam = camera as THREE.OrthographicCamera
    cam.zoom = Math.min(size.width, size.height) / fit
    cam.updateProjectionMatrix()
  })
  return null
}

// Shared stage: orthographic camera that sways around the scene, rendered at low resolution with hard pixels.
export function VoxelStage({
  children,
  target,
  fit,
  pixelScale = 0.34,
  frameloop = "always",
  className,
}: {
  children: React.ReactNode
  target?: V3
  fit?: number
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
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 12, 8]} intensity={1.5} />
        <Rig target={target} fit={fit} animate={animate} />
        {children}
      </Canvas>
    </div>
  )
}

function Spin({
  children,
  speed = 1,
  axis = "z",
  amount = 0.3,
  phase = 0,
}: {
  children: React.ReactNode
  speed?: number
  axis?: "x" | "y" | "z"
  amount?: number
  phase?: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.rotation[axis] = Math.sin(clock.elapsedTime * speed + phase) * amount
  })
  return <group ref={ref}>{children}</group>
}

function Blink({ p, c, rate = 1, phase = 0 }: { p: V3; c: string; rate?: number; phase?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.emissiveIntensity = Math.sin(clock.elapsedTime * rate * 6 + phase) > 0 ? 1.6 : 0.1
  })
  return (
    <mesh position={p}>
      <boxGeometry args={[0.3, 0.3, 0.12]} />
      <meshStandardMaterial ref={mat} color={c} emissive={c} flatShading />
    </mesh>
  )
}

function useTerminalScreen(color = "#4ade80") {
  return useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 48
    canvas.height = 36
    const ctx = canvas.getContext("2d")!
    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    const rows = Array.from({ length: 10 }, () => 4 + Math.floor(Math.random() * 30))
    let tick = 0
    const step = () => {
      tick++
      if (tick % 2 === 0) {
        rows.shift()
        rows.push(4 + Math.floor(Math.random() * 34))
      }
      ctx.fillStyle = "#03140a"
      ctx.fillRect(0, 0, 48, 36)
      ctx.fillStyle = color
      rows.forEach((w, i) => ctx.fillRect(3, 2 + i * 3, w, 1))
      if (tick % 2) ctx.fillRect(3, 32, 2, 2)
      texture.needsUpdate = true
    }
    step()
    return { texture, step }
  }, [color])
}

function Ticker({ every, fn }: { every: number; fn: () => void }) {
  const acc = useRef(0)
  useFrame((_, delta) => {
    acc.current += delta
    if (acc.current > every) {
      acc.current = 0
      fn()
    }
  })
  return null
}

export function FerrisScene() {
  const ORANGE = "#f74c00"
  const DARK = "#b83400"
  return (
    <>
      <Box p={[0, -0.15, 0]} s={[12, 0.3, 9]} c="#e7c98a" />
      {[
        [-4.5, 3],
        [4, -3.2],
        [-3.8, -3],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x!, 0.05, z!]} s={[1.6, 0.1, 1.2]} c="#38bdf8" />
      ))}
      <Box p={[0, 1.6, 0]} s={[6, 2.2, 4]} c={ORANGE} />
      <Box p={[0, 2.85, 0]} s={[5, 0.4, 3.2]} c={DARK} />
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Box p={[sx * 1.1, 3.5, 1.2]} s={[0.35, 1.2, 0.35]} c={DARK} />
          <Box p={[sx * 1.1, 4.4, 1.25]} s={[0.9, 0.9, 0.9]} c="#fafafa" />
          <Box p={[sx * 1.1, 4.4, 1.72]} s={[0.4, 0.45, 0.06]} c="#111" />
          {[-1.2, 0, 1.2].map((z) => (
            <Box key={z} p={[sx * 3.4, 0.6, z]} s={[1, 0.4, 0.4]} c={DARK} />
          ))}
          <group position={[sx * 3.4, 2.2, 1]}>
            <Spin speed={3} amount={0.35} phase={sx > 0 ? Math.PI : 0}>
              <Box p={[sx * 0.6, 0, 0]} s={[1.4, 0.6, 0.6]} c={ORANGE} />
              <Box p={[sx * 1.6, 0.4, 0.4]} s={[1.1, 1.1, 1.4]} c={ORANGE} />
              <Box p={[sx * 1.6, 1.15, 0.6]} s={[0.9, 0.4, 0.8]} c={DARK} />
            </Spin>
          </group>
        </group>
      ))}
      <Box p={[0, 1.4, 2.03]} s={[1.6, 0.25, 0.06]} c="#111" />
    </>
  )
}

export function CrtScene() {
  const BEIGE = "#e7dcc0"
  const { texture, step } = useTerminalScreen()
  return (
    <>
      <Ticker every={0.18} fn={step} />
      <Box p={[0, 1, 0]} s={[11, 0.5, 7]} c="#7c4a1e" />
      {[
        [-5, -3],
        [5, -3],
        [-5, 3],
        [5, 3],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x!, 0.4, z!]} s={[0.5, 0.8, 0.5]} c="#5b3412" />
      ))}
      <Box p={[0, 1.55, -1.2]} s={[3, 0.6, 3]} c={BEIGE} />
      <Box p={[0, 4, -1.3]} s={[5, 4.2, 4.4]} c={BEIGE} />
      <Box p={[0, 4.1, 0.93]} s={[4.2, 3.4, 0.06]} c="#c9bd9e" />
      <mesh position={[0, 4.15, 0.97]}>
        <planeGeometry args={[3.6, 2.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 4, 2.5]} intensity={4} distance={5} color="#4ade80" />
      <Box p={[0, 1.45, 2.4]} s={[5, 0.4, 1.8]} c={BEIGE} />
      {[0, 1, 2].map((r) => (
        <Box key={r} p={[0, 1.7, 1.85 + r * 0.55]} s={[4.4, 0.12, 0.35]} c="#a8a08a" />
      ))}
      <Box p={[3.6, 1.4, 2.4]} s={[0.7, 0.3, 1]} c={BEIGE} />
      <Box p={[-3.8, 1.35, 0.6]} s={[1.3, 0.12, 1.3]} c="#2563eb" />
      <Box p={[-3.8, 1.43, 0.35]} s={[0.7, 0.05, 0.5]} c="#d4d4d8" />
    </>
  )
}

export function ServerRoomScene() {
  const LEDS = ["#34d399", "#38bdf8", "#fbbf24", "#34d399"]
  return (
    <>
      <Box p={[0, -0.15, 0]} s={[13, 0.3, 10]} c="#27272a" />
      {[-4, 0, 4].map((x, ri) => (
        <group key={x}>
          <Box p={[x, 3.5, 0]} s={[2.6, 7, 2.6]} c="#18181b" />
          {[0, 1, 2, 3, 4, 5].map((u) => (
            <group key={u}>
              <Box p={[x, 0.9 + u * 1.05, 1.32]} s={[2.2, 0.8, 0.06]} c="#3f3f46" />
              <Blink
                p={[x - 0.7, 0.9 + u * 1.05, 1.38]}
                c={LEDS[(u + ri) % LEDS.length]!}
                rate={0.6 + ((u * 3 + ri) % 5) * 0.3}
                phase={u + ri}
              />
              <Blink
                p={[x - 0.3, 0.9 + u * 1.05, 1.38]}
                c="#34d399"
                rate={1.4 + ((u + ri * 2) % 3) * 0.4}
                phase={u * 2}
              />
            </group>
          ))}
        </group>
      ))}
      <Box p={[0, 7.6, 0]} s={[11, 0.3, 1]} c="#52525b" />
      {[-4, 0, 4].map((x, i) => (
        <Box
          key={x}
          p={[x + 0.6, 7.2, 0.2]}
          s={[0.25, 0.6, 0.25]}
          c={["#ef4444", "#3b82f6", "#facc15"][i]!}
        />
      ))}
    </>
  )
}

function Rocket() {
  const ref = useRef<THREE.Group>(null)
  const flame = useRef<THREE.Group>(null)
  const smoke = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 6
    const lift = t < 1.5 ? 0 : Math.pow(t - 1.5, 2) * 0.9
    if (ref.current) ref.current.position.y = Math.min(lift, 14)
    if (flame.current) flame.current.scale.y = 0.8 + Math.random() * 0.6
    smoke.current.forEach((m, i) => {
      if (!m) return
      const k = (clock.elapsedTime * 0.8 + i / 6) % 1
      m.position.set(Math.cos(i * 1.7) * k * 3, 0.6 + k * 1.2, Math.sin(i * 1.7) * k * 3)
      m.scale.setScalar(0.4 + k * 1.2)
      ;(m.material as THREE.MeshStandardMaterial).opacity = (1 - k) * (t > 1 ? 0.8 : 0.2)
    })
  })
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={(m) => void (smoke.current[i] = m)}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#d4d4d8" transparent flatShading />
        </mesh>
      ))}
      <group ref={ref}>
        <Box p={[0, 3.6, 0]} s={[1.8, 5, 1.8]} c="#f5f5f5" />
        <Box p={[0, 6.6, 0]} s={[1.3, 1, 1.3]} c="#ef4444" />
        <Box p={[0, 7.4, 0]} s={[0.7, 0.7, 0.7]} c="#ef4444" />
        <Box p={[0, 4.6, 0.92]} s={[0.7, 0.7, 0.06]} c="#38bdf8" />
        {[
          [1.2, 0],
          [-1.2, 0],
          [0, 1.2],
          [0, -1.2],
        ].map(([x, z]) => (
          <Box
            key={`${x}${z}`}
            p={[x!, 1.6, z!]}
            s={[x ? 0.6 : 0.3, 1.6, z ? 0.6 : 0.3]}
            c="#ef4444"
          />
        ))}
        <group ref={flame} position={[0, 0.9, 0]}>
          <Box p={[0, -0.5, 0]} s={[1.2, 1, 1.2]} c="#f97316" emissive="#f97316" />
          <Box p={[0, -1.2, 0]} s={[0.7, 0.8, 0.7]} c="#facc15" emissive="#facc15" />
        </group>
      </group>
    </>
  )
}

export function DeployScene() {
  return (
    <>
      <Box p={[0, 0.2, 0]} s={[8, 0.6, 8]} c="#52525b" />
      {[-3.5, -1.5, 0.5, 2.5].map((x) => (
        <Box key={x} p={[x, 0.52, 3.6]} s={[1, 0.06, 0.6]} c="#facc15" />
      ))}
      <Box p={[-3, 4.8, -2.5]} s={[1, 9, 1]} c="#b91c1c" />
      {[2, 4, 6, 8].map((y) => (
        <Box key={y} p={[-2, y, -2.5]} s={[1.6, 0.25, 0.4]} c="#b91c1c" />
      ))}
      <Rocket />
    </>
  )
}

export function MumbaiBusScene() {
  const RED = "#c81e1e"
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.06
  })
  return (
    <>
      <Box p={[0, -0.15, 0]} s={[14, 0.3, 8]} c="#3f3f46" />
      {[-5, -2, 1, 4].map((x) => (
        <Box key={x} p={[x, 0.02, 2.6]} s={[1.6, 0.04, 0.3]} c="#fafafa" />
      ))}
      <Box p={[0, 0.1, -3.4]} s={[14, 0.5, 1.2]} c="#71717a" />
      <group ref={ref}>
        <Box p={[0, 2.1, 0]} s={[10, 2.6, 3.4]} c={RED} />
        <Box p={[0, 3.55, 0]} s={[10.05, 0.3, 3.45]} c="#f5e6c8" />
        <Box p={[0, 4.9, 0]} s={[10, 2.4, 3.4]} c={RED} />
        <Box p={[0, 6.15, 0]} s={[9.6, 0.2, 3.2]} c="#a31616" />
        {[1, 2].map((deck) =>
          [-3.6, -1.8, 0, 1.8, 3.6].map((x) => (
            <Box
              key={`${deck}${x}`}
              p={[x, deck === 1 ? 2.5 : 5, 1.72]}
              s={[1.4, 1, 0.06]}
              c="#1e293b"
            />
          )),
        )}
        <Box p={[5.02, 2.4, 0]} s={[0.06, 1.8, 2.8]} c="#1e293b" />
        <Box p={[5.02, 5, 0]} s={[0.06, 1, 2.8]} c="#1e293b" />
        <Box p={[5.03, 1.2, -1.2]} s={[0.06, 0.4, 0.5]} c="#fde68a" emissive="#fde68a" />
        <Box p={[5.03, 1.2, 1.2]} s={[0.06, 0.4, 0.5]} c="#fde68a" emissive="#fde68a" />
      </group>
      {[-3.4, 3.4].flatMap((x) =>
        [-1.75, 1.75].map((z) => (
          <Box key={`${x}${z}`} p={[x, 0.7, z]} s={[1.4, 1.4, 0.5]} c="#111" />
        )),
      )}
    </>
  )
}
