"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { RiArrowDownLine } from "@remixicon/react"
import { cn } from "cn"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import {
  DroneModel,
  TRICK_KEYS,
  createDroneState,
  queueTrick,
  stepTrick,
  type DroneState,
  type TrickQueue,
} from "@/components/sidd-ui/drone-model"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

// Intro timeline in seconds: fly at the screen, hold, turn around into the left-hand park, then flicker the headlight on.
const APPROACH = 1.4
const HOLD = 0.25
const TURN = 1.5
const BEAM_AT = APPROACH + HOLD + TURN + 0.15
const READY_AT = BEAM_AT + 0.6
const LEAVE = 0.8
const NEAR_Z = 7
const BEAM = "#38bdf8"

type Control = {
  beamOn: boolean
  done: boolean
  lastTop: number
  leaveAt: number
  pulseAt: number
  ready: boolean
  scrollTop: number
  start: number
}

type Dom = {
  alt: HTMLSpanElement | null
  bat: HTMLSpanElement | null
  beam: SVGPolygonElement | null
  beamSvg: SVGSVGElement | null
  col: HTMLDivElement | null
  content: HTMLDivElement | null
  dust: HTMLCanvasElement | null
  glow: SVGCircleElement | null
  grad: SVGLinearGradientElement | null
  hdg: HTMLSpanElement | null
  progress: HTMLDivElement | null
  root: HTMLDivElement | null
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeIn = (k: number) => k * k * k
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
const lerp = THREE.MathUtils.lerp

const DroneModeContext = createContext<{ exit: () => void }>({ exit: () => {} })

function Scene({
  ctl,
  dom,
  onLeft,
  onReady,
  queue,
  state,
}: {
  ctl: React.RefObject<Control>
  dom: React.RefObject<Dom>
  onLeft: () => void
  onReady: () => void
  queue: React.RefObject<TrickQueue>
  state: React.RefObject<DroneState>
}) {
  const rig = useRef<THREE.Group>(null)
  const lamp = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const dust = useMemo(
    () =>
      Array.from({ length: 56 }, () => ({
        a: Math.random(),
        r: 0.6 + Math.random() * 1.6,
        s: 0.03 + Math.random() * 0.06,
        u: Math.random(),
        w: Math.random() * 2 - 1,
      })),
    [],
  )
  const frame = useRef(0)

  useFrame((_, delta) => {
    const c = ctl.current
    const d = dom.current
    const s = state.current
    const g = rig.current
    if (!g || !Number.isFinite(c.start)) return
    const now = performance.now() / 1000
    const t = Math.max(0, now - c.start)
    const cam = camera as THREE.PerspectiveCamera
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z
    const halfW = halfH * cam.aspect
    const W = size.width
    const H = size.height
    const wide = W >= 768
    const park = wide
      ? {
          pitch: 0.3,
          scale: THREE.MathUtils.clamp(halfW * 0.1, 0.5, 0.85),
          x: -halfW * 0.52,
          y: -halfH * 0.04,
          yaw: Math.PI * 2.5 - 0.55,
        }
      : { pitch: 0.45, scale: 0.5, x: -halfW * 0.25, y: halfH * 0.55, yaw: Math.PI * 2.5 - 0.3 }

    let x = 0
    let y = 0
    let z = -45
    let yaw = 0
    let pitch = 0
    let roll = 0
    let scale = 1
    let shake = 0
    if (t < APPROACH) {
      const a = t / APPROACH
      z = lerp(-45, NEAR_Z, easeIn(a))
      pitch = 0.35 * a
      roll = Math.sin(t * 5) * 0.08
    } else if (t < APPROACH + HOLD) {
      z = NEAR_Z
      pitch = 0.35
      shake = 1 - (t - APPROACH) / HOLD
    } else {
      const b = clamp01((t - APPROACH - HOLD) / TURN)
      const eb = easeInOut(b)
      x = lerp(0, park.x, eb)
      y = lerp(0, park.y, eb)
      z = lerp(NEAR_Z, 0, easeOut(b))
      yaw = park.yaw * eb + (b >= 1 ? Math.sin(now * 0.6) * 0.08 : 0)
      pitch = lerp(0.35, park.pitch, eb)
      roll = -Math.sin(Math.PI * b) * 0.5
      scale = lerp(1, park.scale, eb)
      const nod = (now - c.pulseAt) / 0.45
      if (nod >= 0 && nod < 1) pitch += Math.sin(Math.PI * nod) * 0.3
    }

    let leave = 0
    if (c.leaveAt > 0) {
      leave = clamp01((now - c.leaveAt) / LEAVE)
      const el = easeIn(leave)
      z += el * 10
      y += el * halfH * 0.8
      yaw += leave * 1.5
      if (leave >= 1 && !c.done) {
        c.done = true
        onLeft()
      }
    }

    g.position.set(x, y, z)
    g.rotation.set(pitch, yaw, roll, "YXZ")
    g.scale.setScalar(scale)
    cam.position.x = Math.sin(now * 90) * 0.06 * shake
    cam.position.y = Math.cos(now * 70) * 0.06 * shake

    const dy = c.scrollTop - c.lastTop
    c.lastTop = c.scrollTop
    s.vy = lerp(s.vy, THREE.MathUtils.clamp(dy * 0.5, -10, 10), 0.12)
    s.vx = 0
    stepTrick(queue.current, s, performance.now())

    let beam = 0
    if (t >= BEAM_AT) {
      const f = t - BEAM_AT
      beam = f < 0.08 ? 1 : f < 0.16 ? 0 : f < 0.26 ? 0.7 : f < 0.4 ? 0.1 : 1
    }
    if (!c.beamOn) beam = 0
    const dip = (now - c.pulseAt) / 0.35
    if (dip >= 0 && dip < 1) beam *= 0.3 + 0.7 * dip
    beam *= 1 - clamp01(leave * 3)
    s.lit = beam > 0.4

    if (!c.ready && t >= READY_AT) {
      c.ready = true
      onReady()
    }

    if (d.root) {
      const fadeIn = clamp01(t / 0.35)
      const fadeOut = c.leaveAt > 0 ? 1 - clamp01((leave - 0.55) / 0.45) : 1
      d.root.style.opacity = (fadeIn * fadeOut).toFixed(3)
    }
    if (d.content) {
      const show = t >= BEAM_AT ? Math.max(c.ready ? 0.12 : 0, beam) : 0
      d.content.style.opacity = show.toFixed(3)
    }

    if (!lamp.current || !d.beam || !d.beamSvg || !d.grad || !d.glow || !d.col) return
    lamp.current.getWorldPosition(v)
    v.project(camera)
    const hx = ((v.x + 1) / 2) * W
    const hy = ((1 - v.y) / 2) * H
    d.beamSvg.style.opacity = beam.toFixed(3)
    d.glow.setAttribute("cx", hx.toFixed(1))
    d.glow.setAttribute("cy", hy.toFixed(1))
    const colX = Math.max(hx + 40, d.col.offsetLeft - 24)
    const top1 = H * 0.16
    const bot1 = H * 0.84
    if (wide) {
      d.beam.setAttribute(
        "points",
        `${hx},${hy - 4} ${colX},${top1} ${W},${H * 0.04} ${W},${H * 0.96} ${colX},${bot1} ${hx},${hy + 4}`,
      )
      d.grad.setAttribute("x1", hx.toFixed(1))
      d.grad.setAttribute("y1", "0")
      d.grad.setAttribute("x2", W.toFixed(1))
      d.grad.setAttribute("y2", "0")
    } else {
      const colTop = H * 0.4
      d.beam.setAttribute(
        "points",
        `${hx - 4},${hy} ${hx + 4},${hy} ${W},${colTop} ${W},${H} 0,${H} 0,${colTop}`,
      )
      d.grad.setAttribute("x1", hx.toFixed(1))
      d.grad.setAttribute("y1", hy.toFixed(1))
      d.grad.setAttribute("x2", hx.toFixed(1))
      d.grad.setAttribute("y2", H.toFixed(1))
    }

    const canvas = d.dust
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W
        canvas.height = H
      }
      ctx.clearRect(0, 0, W, H)
      if (wide && beam > 0.05) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(hx, hy - 4)
        ctx.lineTo(colX, top1)
        ctx.lineTo(W, H * 0.04)
        ctx.lineTo(W, H * 0.96)
        ctx.lineTo(colX, bot1)
        ctx.lineTo(hx, hy + 4)
        ctx.closePath()
        ctx.clip()
        ctx.fillStyle = BEAM
        for (const p of dust) {
          p.u = (p.u + p.s * delta) % 1
          const px = hx + (W - hx) * p.u
          const spread = 4 + (H * 0.46 - 4) * p.u
          const py = hy + (H / 2 - hy) * p.u + p.w * spread + Math.sin(now * 0.8 + p.a * 9) * 6
          ctx.globalAlpha =
            beam * (0.2 + 0.5 * Math.abs(Math.sin(now * 1.3 + p.a * 6))) * (1 - p.u * 0.5)
          ctx.beginPath()
          ctx.arc(px, py, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    frame.current = (frame.current + 1) % 6
    if (frame.current === 0) {
      if (d.alt) d.alt.textContent = (120 + c.scrollTop / 12).toFixed(1).padStart(6, "0")
      if (d.hdg) {
        const deg = ((((yaw * 180) / Math.PI) % 360) + 360) % 360
        d.hdg.textContent = deg.toFixed(0).padStart(3, "0")
      }
      if (d.bat) d.bat.textContent = Math.max(12, 100 - t * 0.4).toFixed(0)
    }
  })

  return (
    <group ref={rig} position={[0, 0, -45]}>
      <DroneModel state={state} lampRef={lamp} lampColor={BEAM} />
    </group>
  )
}

// A full-screen scene: the drone flies out of the screen, turns, parks on the left and lights the content column with its headlight. Children are DroneSection blocks; each lights up as it scrolls into the beam.
export function DroneMode({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  const scroller = useRef<HTMLDivElement>(null)
  const dom = useRef<Dom>({
    alt: null,
    bat: null,
    beam: null,
    beamSvg: null,
    col: null,
    content: null,
    dust: null,
    glow: null,
    grad: null,
    hdg: null,
    progress: null,
    root: null,
  })
  const ctl = useRef<Control>({
    beamOn: true,
    done: false,
    lastTop: 0,
    leaveAt: -1,
    pulseAt: -10,
    ready: false,
    scrollTop: 0,
    start: Number.POSITIVE_INFINITY,
  })
  const state = useRef(createDroneState())
  const queue = useRef<TrickQueue>({ current: null, queue: [] })
  const exitRef = useRef(onExit)
  const [ready, setReady] = useState(false)
  const [sections, setSections] = useState<string[]>([])
  const [active, setActive] = useState(0)
  const [hazard, setHazard] = useState(false)
  const [beamOn, setBeamOn] = useState(true)

  useEffect(() => {
    exitRef.current = onExit
  }, [onExit])

  const leave = useCallback(() => {
    const c = ctl.current
    if (c.leaveAt < 0) c.leaveAt = performance.now() / 1000
  }, [])

  const skip = useCallback(() => {
    const c = ctl.current
    const now = performance.now() / 1000
    if (now - c.start < BEAM_AT) c.start = now - BEAM_AT
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ctl.current.start = performance.now() / 1000 - (reduced ? READY_AT : 0)
    const previous = document.activeElement as HTMLElement | null
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = "hidden"
    scroller.current?.focus({ preventScroll: true })
    return () => {
      html.style.overflow = overflow
      previous?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    state.current.hazard = hazard
  }, [hazard])

  useEffect(() => {
    ctl.current.beamOn = beamOn
  }, [beamOn])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const key = e.key.toUpperCase()
      if (key === "ESCAPE" || key === "M") {
        e.preventDefault()
        return leave()
      }
      if (!ctl.current.ready) {
        if (key === "ENTER" || key === " ") {
          e.preventDefault()
          skip()
        }
        return
      }
      const trick = TRICK_KEYS.find((c) => c.key === key)
      if (trick) queueTrick(queue.current, trick.trick)
      else if (key === "H") setHazard((h) => !h)
      else if (key === "L") setBeamOn((b) => !b)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [leave, skip])

  useEffect(() => {
    const root = scroller.current
    if (!ready || !root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-drone-section]"))
    setSections(els.map((el, i) => el.dataset.label ?? `Section ${i + 1}`))
    const light = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) (e.target as HTMLElement).dataset.lit = "true"
      },
      { root, rootMargin: "-18% 0px -18% 0px" },
    )
    let current = -1
    const center = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = els.indexOf(e.target as HTMLElement)
          if (i === current) continue
          if (current >= 0) ctl.current.pulseAt = performance.now() / 1000
          current = i
          setActive(i)
        }
      },
      { root, rootMargin: "-50% 0px -50% 0px" },
    )
    for (const el of els) {
      light.observe(el)
      center.observe(el)
    }
    return () => {
      light.disconnect()
      center.disconnect()
    }
  }, [ready])

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    ctl.current.scrollTop = el.scrollTop
    const max = el.scrollHeight - el.clientHeight
    if (dom.current.progress)
      dom.current.progress.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`
  }

  const goTo = (i: number) => {
    scroller.current
      ?.querySelectorAll<HTMLElement>("[data-drone-section]")
      [i]?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const context = useMemo(() => ({ exit: leave }), [leave])

  return (
    <DroneModeContext value={context}>
      <div
        ref={(el) => {
          dom.current.root = el
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Drone mode"
        onPointerDown={skip}
        className="bg-background text-foreground fixed inset-0 z-[100] overflow-hidden"
        style={{ opacity: 0 }}
      >
        <div
          aria-hidden
          className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="pointer-events-none absolute inset-0 [&_canvas]:[image-rendering:pixelated]">
          <Canvas
            dpr={0.6}
            gl={{ antialias: false, alpha: true }}
            camera={{ position: [0, 0, 12], fov: 40, near: 0.1, far: 100 }}
            style={{ pointerEvents: "none" }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 8, 6]} intensity={1.6} />
            <directionalLight position={[-6, -2, 4]} intensity={0.4} />
            <Scene
              ctl={ctl}
              dom={dom}
              queue={queue}
              state={state}
              onLeft={() => exitRef.current()}
              onReady={() => setReady(true)}
            />
          </Canvas>
        </div>
        <svg
          ref={(el) => {
            dom.current.beamSvg = el
          }}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
          style={{ opacity: 0 }}
        >
          <defs>
            <linearGradient
              id="drone-mode-beam"
              gradientUnits="userSpaceOnUse"
              ref={(el) => {
                dom.current.grad = el
              }}
            >
              <stop offset="0" stopColor={BEAM} stopOpacity="0.6" />
              <stop offset="0.45" stopColor={BEAM} stopOpacity="0.2" />
              <stop offset="1" stopColor={BEAM} stopOpacity="0.04" />
            </linearGradient>
            <radialGradient id="drone-mode-glow">
              <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.9" />
              <stop offset="0.3" stopColor={BEAM} stopOpacity="0.45" />
              <stop offset="1" stopColor={BEAM} stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon
            ref={(el) => {
              dom.current.beam = el
            }}
            fill="url(#drone-mode-beam)"
          />
          <circle
            ref={(el) => {
              dom.current.glow = el
            }}
            r="56"
            fill="url(#drone-mode-glow)"
          />
        </svg>
        <canvas
          ref={(el) => {
            dom.current.dust = el
          }}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        />
        <div
          ref={scroller}
          tabIndex={-1}
          onScroll={onScroll}
          className="absolute inset-0 [scrollbar-width:none] overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,transparent_36%,black_50%,black_92%,transparent)] outline-none md:[mask-image:linear-gradient(to_bottom,transparent_8%,black_24%,black_76%,transparent_92%)]"
        >
          <div
            ref={(el) => {
              dom.current.col = el
              dom.current.content = el
            }}
            className="ml-auto w-full px-6 pt-[30svh] md:w-1/2 md:pt-0 md:pr-40 md:pl-0"
            style={{ opacity: 0 }}
          >
            {children}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 font-mono text-xs">
          <p className="flex items-center gap-2">
            <span className="bg-destructive size-2 rounded-full motion-safe:animate-pulse" />
            <span className="tracking-widest uppercase">Drone mode</span>
            <span className="text-muted-foreground">SG-01</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={leave}
            className="pointer-events-auto font-mono text-xs"
          >
            Exit
            <Kbd>Esc</Kbd>
          </Button>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute bottom-6 left-4 space-y-1 font-mono text-xs transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="text-muted-foreground">
            ALT <span ref={(el) => void (dom.current.alt = el)} className="text-foreground" />m
          </p>
          <p className="text-muted-foreground">
            HDG <span ref={(el) => void (dom.current.hdg = el)} className="text-foreground" />°
          </p>
          <p className="text-muted-foreground">
            BAT <span ref={(el) => void (dom.current.bat = el)} className="text-foreground" />%
          </p>
          <p className="text-muted-foreground">
            BEAM <span className="text-foreground">{beamOn ? "ON" : "OFF"}</span>
            {hazard && <span className="ml-2 text-amber-500">HAZARD</span>}
          </p>
        </div>

        <nav
          aria-label="Drone mode sections"
          className={cn(
            "absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-end gap-1 font-mono text-xs transition-opacity duration-700 md:flex",
            ready ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {sections.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 py-1 transition-colors",
                i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn("transition-opacity", i === active ? "opacity-100" : "opacity-0")}
              >
                {label}
              </span>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span
                className={cn(
                  "h-px transition-all",
                  i === active ? "bg-foreground w-6" : "bg-border w-3",
                )}
              />
            </button>
          ))}
        </nav>

        <p
          className={cn(
            "text-muted-foreground pointer-events-none absolute right-4 bottom-6 hidden items-center gap-3 font-mono text-xs transition-opacity duration-700 lg:flex",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <span>
            <Kbd>Q</Kbd> <Kbd>E</Kbd> <Kbd>F</Kbd> <Kbd>B</Kbd> <Kbd>S</Kbd> tricks
          </span>
          <span>
            <Kbd>H</Kbd> hazard
          </span>
          <span>
            <Kbd>L</Kbd> beam
          </span>
        </p>
        {!ready && (
          <p className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-xs">
            Click or press <Kbd>Enter</Kbd> to skip
          </p>
        )}
        <div
          ref={(el) => {
            dom.current.progress = el
          }}
          className="bg-foreground absolute inset-x-0 bottom-0 h-px origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </DroneModeContext>
  )
}

// One screen of drone-mode content; it lights up (data-lit) once it scrolls into the beam.
export function DroneSection({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <section
      data-drone-section
      data-label={label}
      aria-label={label}
      className={cn("flex min-h-svh flex-col justify-center gap-6 py-24", className)}
    >
      {children}
    </section>
  )
}

// Fades and focuses its children in once the enclosing DroneSection is lit, staggered by `index`.
export function DroneReveal({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode
  className?: string
  index?: number
}) {
  return (
    <div
      className={cn(
        "translate-y-3 opacity-0 blur-xs transition-all duration-700 ease-out in-data-[lit=true]:translate-y-0 in-data-[lit=true]:opacity-100 in-data-[lit=true]:blur-none",
        className,
      )}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      {children}
    </div>
  )
}

const GLYPHS = "!<>-_/[]{}=+*^?#01"

// Text that decodes from random glyphs when its DroneSection lights up.
export function DroneScramble({
  as: Tag = "span",
  className,
  text,
}: {
  as?: "h2" | "h3" | "p" | "span"
  className?: string
  text: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    const section = el?.closest<HTMLElement>("[data-drone-section]")
    if (!el || !section) return
    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / 900)
        const n = Math.floor(k * text.length)
        let out = text.slice(0, n)
        for (let i = n; i < text.length; i++)
          out += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        el.textContent = out
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (section.dataset.lit === "true") return
    const mo = new MutationObserver(() => {
      if (section.dataset.lit !== "true") return
      mo.disconnect()
      run()
    })
    mo.observe(section, { attributes: true, attributeFilter: ["data-lit"] })
    return () => {
      mo.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = text
    }
  }, [text])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(
        "opacity-0 transition-opacity duration-300 in-data-[lit=true]:opacity-100",
        className,
      )}
    >
      {text}
    </Tag>
  )
}

// Flies the drone out and closes drone mode.
export function DroneExitButton({ children }: { children: React.ReactNode }) {
  const { exit } = useContext(DroneModeContext)
  return (
    <Button variant="outline" onClick={exit} className="font-mono">
      {children}
    </Button>
  )
}

export function DroneScrollHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
      <RiArrowDownLine className="size-4 motion-safe:animate-bounce" />
      {children}
    </p>
  )
}
