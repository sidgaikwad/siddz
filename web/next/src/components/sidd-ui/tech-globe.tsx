"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTheme } from "next-themes"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { DotCloud, fibonacciSphere } from "@/components/sidd-ui/particle-sphere"

const RADIUS = 1.45
const SPIKE_START = 1.52
const SPIKE_END = 2.0
const LABEL_AT = 2.12

function directions(count: number) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - ((i + 0.5) / count) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r)
  })
}

function Spikes({ dirs, color }: { dirs: THREE.Vector3[]; color: string }) {
  const { lines, tips } = useMemo(() => {
    const lines = new Float32Array(dirs.length * 6)
    const tips = new Float32Array(dirs.length * 3)
    dirs.forEach((d, i) => {
      lines.set(
        [
          ...d.clone().multiplyScalar(SPIKE_START).toArray(),
          ...d.clone().multiplyScalar(SPIKE_END).toArray(),
        ],
        i * 6,
      )
      tips.set(d.clone().multiplyScalar(SPIKE_END).toArray(), i * 3)
    })
    return { lines, tips }
  }, [dirs])

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.75} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tips, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.09} sizeAttenuation />
      </points>
    </>
  )
}

function LabelProjector({
  dirs,
  labels,
}: {
  dirs: THREE.Vector3[]
  labels: React.RefObject<(HTMLDivElement | null)[]>
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const world = useMemo(() => dirs.map((d) => d.clone().multiplyScalar(LABEL_AT)), [dirs])
  const view = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const dist = camera.position.length()
    world.forEach((p, i) => {
      const el = labels.current[i]
      if (!el) return
      view.copy(p).applyMatrix4(camera.matrixWorldInverse)
      ndc.copy(p).project(camera)
      const x = (ndc.x * 0.5 + 0.5) * size.width
      const y = (-ndc.y * 0.5 + 0.5) * size.height
      const t = THREE.MathUtils.smoothstep(view.z, -dist - LABEL_AT, -dist + LABEL_AT)
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.8 + t * 0.25})`
      el.style.opacity = String(0.3 + t * 0.7)
      el.style.zIndex = String(Math.round(t * 100))
      el.style.pointerEvents = t > 0.55 ? "auto" : "none"
    })
  })

  return null
}

function Globe({
  dirs,
  labels,
  color,
  animate,
}: {
  dirs: THREE.Vector3[]
  labels: React.RefObject<(HTMLDivElement | null)[]>
  color: string
  animate: boolean
}) {
  const sphere = useMemo(() => fibonacciSphere(5200, RADIUS), [])

  return (
    <>
      <DotCloud data={sphere} color={color} size={17} amplitude={0.1} animate={animate} />
      <Spikes dirs={dirs} color={color} />
      <LabelProjector dirs={dirs} labels={labels} />
    </>
  )
}

export function TechGlobe({ skills, className }: { skills: string[]; className?: string }) {
  const { resolvedTheme } = useTheme()
  const color = resolvedTheme === "light" ? "#18181b" : "#fafafa"
  const animate = useMemo(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  const dirs = useMemo(() => directions(skills.length), [skills.length])
  const labels = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--foreground) 10%, transparent), transparent 45%)",
        }}
      />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 6.4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Globe dirs={dirs} labels={labels} color={color} animate={animate} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={animate}
          autoRotateSpeed={0.9}
          rotateSpeed={0.6}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0">
        {skills.map((skill, i) => (
          <div
            key={skill}
            ref={(el) => {
              labels.current[i] = el
            }}
            style={{ opacity: 0 }}
            className="border-foreground/25 bg-background/85 text-foreground hover:bg-foreground hover:text-background absolute top-0 left-0 rounded-md border px-1.5 py-0.5 font-mono text-xs whitespace-nowrap backdrop-blur-sm transition-colors select-none"
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  )
}
