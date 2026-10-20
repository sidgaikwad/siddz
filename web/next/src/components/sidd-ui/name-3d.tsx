"use client"

import { ContactShadows } from "@react-three/drei"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { useTheme } from "next-themes"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js"

import { playClick } from "@/components/sidd-ui/click-sound"

const FONT_URL = "/fonts/helvetiker_bold.typeface.json"
const SIZE = 1
const TRACKING = 0.06

type LetterState = { y: number; vy: number; spin: number; hover: boolean }

function useLetters(font: Font, text: string) {
  return useMemo(() => {
    const resolution = font.data.resolution
    let x = 0
    const letters = [...text].map((char) => {
      const glyph = font.data.glyphs[char]
      const advance = ((glyph?.ha ?? resolution * 0.6) / resolution) * SIZE
      const geometry =
        char === " "
          ? null
          : new TextGeometry(char, {
              font,
              size: SIZE,
              depth: 0.5,
              curveSegments: 8,
              bevelEnabled: true,
              bevelThickness: 0.035,
              bevelSize: 0.025,
              bevelSegments: 3,
            })
      geometry?.computeBoundingBox()
      const box = geometry?.boundingBox
      if (geometry && box) geometry.translate(-(box.max.x + box.min.x) / 2, 0, -0.25)
      const letter = { char, geometry, x: x + advance / 2 }
      x += advance + TRACKING
      return letter
    })
    const width = x - TRACKING
    return letters.map((l) => ({ ...l, x: l.x - width / 2 }))
  }, [font, text])
}

function Letter({
  geometry,
  x,
  index,
  materials,
}: {
  geometry: THREE.BufferGeometry
  x: number
  index: number
  materials: THREE.Material[]
}) {
  const ref = useRef<THREE.Mesh>(null)
  const state = useRef<LetterState>({ y: 0, vy: 0, spin: 0, hover: false })

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const s = state.current
    const dt = Math.min(delta, 1 / 30)
    s.vy -= 30 * dt
    s.y += s.vy * dt
    if (s.y < 0) {
      s.y = 0
      s.vy = 0
    }
    if (s.spin > 0) {
      const step = Math.min(s.spin, dt * 11)
      mesh.rotation.x -= step
      s.spin -= step
      if (s.spin === 0) mesh.rotation.x = 0
    }
    const lift = s.hover ? 0.12 : 0
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, s.y + lift, 0.25)
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, s.hover ? 0.18 : 0, 0.2)
  })

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={materials}
      position={[x, 0, 0]}
      castShadow
      onPointerOver={(e) => {
        e.stopPropagation()
        state.current.hover = true
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        state.current.hover = false
        document.body.style.cursor = ""
      }}
      onClick={(e) => {
        e.stopPropagation()
        const s = state.current
        s.vy = 7.5
        s.spin += Math.PI * 2
        playClick(0.85 + index * 0.05)
      }}
    />
  )
}

function Word({ text, dark }: { text: string; dark: boolean }) {
  const font = useLoader(FontLoader, FONT_URL)
  const letters = useLetters(font, text)
  const group = useRef<THREE.Group>(null)

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        color: dark ? "#fafafa" : "#18181b",
        roughness: 0.35,
        metalness: 0.05,
      }),
      new THREE.MeshStandardMaterial({
        color: dark ? "#71717a" : "#a1a1aa",
        roughness: 0.55,
        metalness: 0.15,
      }),
    ],
    [dark],
  )

  useFrame((state) => {
    const g = group.current
    if (!g) return
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.16 + state.pointer.x * 0.22, 0.05)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.38 - state.pointer.y * 0.15, 0.05)
  })

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      {letters.map((l, i) =>
        l.geometry ? (
          <Letter key={i} index={i} geometry={l.geometry} x={l.x} materials={materials} />
        ) : null,
      )}
    </group>
  )
}

export function Name3D({ text = "SIDDHARTH", className }: { text?: string; className?: string }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme !== "light"

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 9.2], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={dark ? 0.55 : 0.8} />
        <directionalLight position={[3, 7, 5]} intensity={dark ? 2.4 : 1.6} />
        <directionalLight position={[-6, 2, 2]} intensity={0.6} />
        <Suspense fallback={null}>
          <Word text={text} dark={dark} />
        </Suspense>
        <ContactShadows
          position={[0, -1.1, 0]}
          opacity={dark ? 0.6 : 0.35}
          scale={14}
          blur={2.4}
          far={3}
          color={dark ? "#000000" : "#18181b"}
        />
      </Canvas>
    </div>
  )
}
