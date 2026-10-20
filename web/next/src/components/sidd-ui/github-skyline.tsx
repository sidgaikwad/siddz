"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { RiAddLine, RiFocus3Line, RiSubtractLine } from "@remixicon/react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

export type SkylineDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

const LEVEL_COLORS = ["#3f3f46", "#14532d", "#15803d", "#22c55e", "#4ade80"]

function Bars({ weeks }: { weeks: (SkylineDay | null)[][] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const days = useMemo(
    () => weeks.flatMap((week, x) => week.flatMap((day, z) => (day ? [{ day, x, z }] : []))),
    [weeks],
  )
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.day.count)), [days])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    const offsetX = weeks.length / 2
    days.forEach(({ day, x, z }, i) => {
      const h = 0.12 + Math.sqrt(day.count / max) * 7
      matrix.compose(
        new THREE.Vector3(x - offsetX, h / 2, z - 3.5),
        new THREE.Quaternion(),
        new THREE.Vector3(0.82, h, 0.82),
      )
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, color.set(LEVEL_COLORS[day.level]))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [days, max, weeks.length])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, days.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.5} />
    </instancedMesh>
  )
}

type ZoomApi = { zoom: (factor: number) => void; reset: () => void }

function ZoomRig({
  apiRef,
  home,
}: {
  apiRef: React.RefObject<ZoomApi | null>
  home: THREE.Vector3
}) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as {
    target: THREE.Vector3
    update: () => void
  } | null

  useEffect(() => {
    apiRef.current = {
      zoom: (factor) => {
        const target = controls?.target ?? new THREE.Vector3()
        const offset = camera.position.clone().sub(target).multiplyScalar(factor)
        const len = THREE.MathUtils.clamp(
          offset.length(),
          home.length() * 0.35,
          home.length() * 1.6,
        )
        camera.position.copy(target).add(offset.setLength(len))
        controls?.update()
      },
      reset: () => {
        camera.position.copy(home)
        controls?.target.set(0, 0, 0)
        controls?.update()
      },
    }
  }, [apiRef, camera, controls, home])

  return null
}

const BUTTON =
  "bg-background/80 border-line text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md border backdrop-blur transition-colors"

export function GitHubSkyline({
  weeks,
  className,
}: {
  weeks: (SkylineDay | null)[][]
  className?: string
}) {
  const home = useMemo(
    () => new THREE.Vector3(-weeks.length * 0.14, weeks.length * 0.36 + 4, weeks.length * 0.62 + 4),
    [weeks.length],
  )
  const apiRef = useRef<ZoomApi | null>(null)
  const [wheelZoom, setWheelZoom] = useState(false)

  return (
    <div
      className={`relative ${className ?? ""}`}
      onPointerDown={() => setWheelZoom(true)}
      onPointerLeave={() => setWheelZoom(false)}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: home.toArray(), fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.8} />
        <directionalLight position={[-10, 8, -6]} intensity={0.4} />
        <Bars weeks={weeks} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[weeks.length + 4, 11]} />
          <meshStandardMaterial color="#71717a" transparent opacity={0.15} />
        </mesh>
        <OrbitControls
          makeDefault
          enableRotate={false}
          enablePan={false}
          enableZoom={wheelZoom}
          minDistance={home.length() * 0.35}
          maxDistance={home.length() * 1.6}
        />
        <ZoomRig apiRef={apiRef} home={home} />
      </Canvas>
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          aria-label="Zoom in"
          className={BUTTON}
          onClick={() => apiRef.current?.zoom(0.8)}
        >
          <RiAddLine className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className={BUTTON}
          onClick={() => apiRef.current?.zoom(1.25)}
        >
          <RiSubtractLine className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          className={BUTTON}
          onClick={() => apiRef.current?.reset()}
        >
          <RiFocus3Line className="size-4" />
        </button>
      </div>
      <p className="text-muted-foreground/70 pointer-events-none absolute bottom-1 left-2 font-mono text-[10px] uppercase">
        {wheelZoom ? "scroll / pinch to zoom" : "click to enable scroll zoom"}
      </p>
    </div>
  )
}
