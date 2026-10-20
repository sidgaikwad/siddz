"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTheme } from "next-themes"
import { useMemo, useRef } from "react"
import * as THREE from "three"

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAmplitude;
attribute float aRandom;
varying float vAlpha;
${NOISE}
void main() {
  vec3 dir = normalize(position);
  float n = snoise(position * 1.1 + vec3(0.0, uTime * 0.18, uTime * 0.12));
  vec3 p = position + dir * n * uAmplitude;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.6 + aRandom * 0.8) * (1.0 / -mv.z);
  float depth = smoothstep(-6.2, -3.0, mv.z);
  vAlpha = mix(0.22, 1.0, depth) * (0.55 + 0.45 * smoothstep(-0.4, 0.6, n));
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, vAlpha * uOpacity * smoothstep(0.5, 0.15, d));
}
`

export function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const randoms = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions.set([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius], i * 3)
    randoms[i] = Math.random()
  }
  return { positions, randoms }
}

function ring(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const randoms = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    positions.set([Math.cos(a) * radius, 0, Math.sin(a) * radius], i * 3)
    randoms[i] = Math.random() * 0.3
  }
  return { positions, randoms }
}

export function DotCloud({
  data,
  color,
  size,
  amplitude,
  opacity = 1,
  animate,
}: {
  data: { positions: Float32Array; randoms: Float32Array }
  color: string
  size: number
  amplitude: number
  opacity?: number
  animate: boolean
}) {
  const dpr = useThree((s) => s.viewport.dpr)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: dpr },
      uAmplitude: { value: amplitude },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  uniforms.uColor.value.set(color)
  uniforms.uPixelRatio.value = dpr

  useFrame((_, delta) => {
    if (animate) uniforms.uTime.value += delta
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[data.randoms, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  )
}

function Scene({ color, count, animate }: { color: string; count: number; animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const orbitA = useRef<THREE.Group>(null)
  const orbitB = useRef<THREE.Group>(null)
  const sphere = useMemo(() => fibonacciSphere(count, 1.45), [count])
  const ringA = useMemo(() => ring(360, 2.05), [])
  const ringB = useMemo(() => ring(260, 2.35), [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    if (animate) g.rotation.y += delta * 0.08
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.25 + 0.15, 0.04)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * 0.12, 0.04)
    if (animate && orbitA.current) orbitA.current.rotation.y -= delta * 0.12
    if (animate && orbitB.current) orbitB.current.rotation.y += delta * 0.07
  })

  return (
    <group ref={group}>
      <DotCloud data={sphere} color={color} size={11} amplitude={0.22} animate={animate} />
      <group rotation={[1.2, 0, 0.35]}>
        <group ref={orbitA}>
          <DotCloud
            data={ringA}
            color={color}
            size={8}
            amplitude={0.03}
            opacity={0.55}
            animate={animate}
          />
        </group>
      </group>
      <group rotation={[1.75, 0.4, -0.5]}>
        <group ref={orbitB}>
          <DotCloud
            data={ringB}
            color={color}
            size={7}
            amplitude={0.03}
            opacity={0.3}
            animate={animate}
          />
        </group>
      </group>
    </group>
  )
}

export function ParticleSphere({
  count = 6000,
  color,
  className,
}: {
  count?: number
  color?: string
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  const dotColor = color ?? (resolvedTheme === "light" ? "#18181b" : "#fafafa")
  const animate = useMemo(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene color={dotColor} count={count} animate={animate} />
      </Canvas>
    </div>
  )
}
