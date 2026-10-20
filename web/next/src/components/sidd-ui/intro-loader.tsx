"use client"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
import { useRef, useState } from "react"

gsap.registerPlugin(useGSAP, ScrambleTextPlugin)

// Set once the intro has finished, so client-side navigation back to the page does not replay it. A full reload resets it.
let playedThisLoad = false

const SHUTTERS = 7
const STATUSES = ["booting", "resolving deps", "compiling shaders", "hydrating", "ready"]
const EXTRUDE =
  "0 0.02em 0 #d4d4d8, 0 0.04em 0 #a1a1aa, 0 0.06em 0 #71717a, 0 0.08em 0 #52525b, 0 0.1em 0 #3f3f46, 0 0.12em 0 #27272a, 0 0.22em 0.3em rgba(0,0,0,0.75)"

const isLatin = (s: string) => /^[\p{Script=Latin}\s'.!-]+$/u.test(s)

function Chars({ text }: { text: string }) {
  // Non-Latin scripts animate as one unit so conjuncts and combining marks keep their shaping.
  const parts = isLatin(text) ? [...text.toUpperCase()] : [text]
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: "800px" }}
    >
      {parts.map((c, i) => (
        <span
          key={i}
          data-char
          className="inline-block [transform-origin:50%_50%_-0.45em] will-change-transform [transform-style:preserve-3d]"
          style={{ textShadow: EXTRUDE }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  )
}

export function IntroLoader({
  words = ["Hello", "नमस्ते", "こんにちは", "Bonjour", "Hola", "Ciao"],
  finale = "Siddharth",
  tagline = "Full Stack Engineer",
  oncePerLoad = true,
}: {
  words?: string[]
  finale?: string
  tagline?: string
  oncePerLoad?: boolean
}) {
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const exitAt = useRef(0)
  const [done, setDone] = useState(
    () => oncePerLoad && typeof window !== "undefined" && playedThisLoad,
  )

  useGSAP(
    () => {
      if (done || !root.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDone(true)
        return
      }
      const q = gsap.utils.selector(root)
      const counter = { v: 0 }
      const counterEl = q("[data-counter]")[0] as HTMLElement
      const finish = () => {
        document.documentElement.style.overflow = ""
        if (oncePerLoad) playedThisLoad = true
        setDone(true)
      }

      document.documentElement.style.overflow = "hidden"
      const t = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish })
      tl.current = t

      t.from(q("[data-frame-item]"), { opacity: 0, y: 6, duration: 0.4, stagger: 0.04 }, 0)
        .from(q("[data-guide-x]"), { scaleX: 0, duration: 0.7, ease: "expo.out" }, 0)
        .from(q("[data-guide-y]"), { scaleY: 0, duration: 0.7, ease: "expo.out" }, 0)
        .from(q("[data-ring]"), { scale: 0.6, opacity: 0, duration: 0.9, ease: "expo.out" }, 0)

      // Greetings: each letter rolls in on a 3D cube flip, then rolls out upward as the next word lands.
      let at = 0.2
      const words = q("[data-word]")
      words.forEach((word, i) => {
        const chars = word.querySelectorAll("[data-char]")
        const hold = i === 0 ? 0.5 : 0.3
        t.set(word, { opacity: 1 }, at)
          .fromTo(
            chars,
            { rotateX: -100, yPercent: 70, z: -120, opacity: 0, filter: "blur(8px)" },
            {
              rotateX: 0,
              yPercent: 0,
              z: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.34,
              stagger: 0.022,
            },
            at,
          )
          .to(
            chars,
            {
              rotateX: 100,
              yPercent: -70,
              z: -120,
              opacity: 0,
              filter: "blur(8px)",
              duration: 0.24,
              ease: "power3.in",
              stagger: 0.016,
            },
            at + hold,
          )
        at += hold + 0.08
      })

      // Finale: the name flies in from deep space letter by letter and settles extruded.
      const nameChars = q("[data-finale] [data-char]")
      t.set(q("[data-finale]"), { opacity: 1 }, at)
        .fromTo(
          nameChars,
          {
            z: -900,
            rotateY: () => gsap.utils.random(-75, 75),
            rotateX: () => gsap.utils.random(-40, 40),
            yPercent: () => gsap.utils.random(-60, 60),
            opacity: 0,
            filter: "blur(14px)",
          },
          {
            z: 0,
            rotateY: 0,
            rotateX: 0,
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "expo.out",
            stagger: { each: 0.045, from: "center" },
          },
          at,
        )
        .set(q("[data-tagline]"), { opacity: 1 }, at + 0.45)
        .to(
          q("[data-tagline]"),
          {
            duration: 0.6,
            scrambleText: { text: tagline.toUpperCase(), chars: "upperCase", speed: 0.6 },
            ease: "none",
          },
          at + 0.45,
        )
        .to(q("[data-finale]"), { scale: 1.04, duration: 0.55, ease: "power2.inOut" }, at + 0.85)

      const end = at + 1.4
      exitAt.current = end

      // Something always moving: progress, counter, a rotating ring and a decoding status line.
      t.to(q("[data-ring]"), { rotate: 140, duration: end + 0.8, ease: "none" }, 0)
        .to(
          counter,
          {
            v: 100,
            duration: end,
            ease: "power2.inOut",
            onUpdate: () => {
              counterEl.textContent = String(Math.round(counter.v)).padStart(3, "0")
            },
          },
          0,
        )
        .fromTo(
          q("[data-progress]"),
          { scaleX: 0 },
          { scaleX: 1, duration: end, ease: "power2.inOut" },
          0,
        )
      STATUSES.forEach((s, i) => {
        t.to(
          q("[data-status]"),
          { duration: 0.35, scrambleText: { text: s, chars: "lowerCase", speed: 1 }, ease: "none" },
          (end / STATUSES.length) * i,
        )
      })

      // Exit: content dissolves, the blade edges light up, then the shutters lift from the centre out while the page zooms into focus behind them.
      const page = document.querySelectorAll("[data-intro-page]")
      t.to(
        q("[data-content]"),
        { opacity: 0, scale: 0.92, filter: "blur(10px)", duration: 0.35, ease: "power2.in" },
        end,
      )
        .to(q("[data-frame]"), { opacity: 0, duration: 0.3 }, end)
        .to(q("[data-edge]"), { opacity: 1, duration: 0.2 }, end + 0.1)
        .to(
          q("[data-shutter]"),
          {
            yPercent: -100,
            duration: 1.05,
            ease: "expo.inOut",
            stagger: { each: 0.07, from: "center" },
          },
          end + 0.2,
        )
      if (page.length) {
        t.fromTo(
          page,
          { scale: 0.94, y: 60, opacity: 0, filter: "blur(8px)", transformOrigin: "50% 0%" },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.25,
            ease: "expo.out",
            clearProps: "transform,filter,opacity,transformOrigin",
          },
          end + 0.35,
        )
      }

      return () => {
        document.documentElement.style.overflow = ""
      }
    },
    { scope: root, dependencies: [done] },
  )

  if (done) return null

  // Skipping jumps to the reveal rather than cutting to the end, so the shutters still open onto the page.
  const skip = () => {
    const t = tl.current
    if (t && t.time() < exitAt.current) t.seek(exitAt.current)
  }

  return (
    <div
      ref={root}
      aria-hidden
      className="intro-loader fixed inset-0 z-[100] overflow-hidden text-zinc-50 motion-reduce:hidden"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: SHUTTERS }, (_, i) => (
          <div
            key={i}
            data-shutter
            className="relative -mr-px h-full flex-1 border-r border-white/[0.07] bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 last:border-r-0"
          >
            <span
              data-edge
              className="absolute inset-x-0 bottom-0 h-px bg-white/80 opacity-0 shadow-[0_0_14px_2px_rgba(255,255,255,0.45)]"
            />
          </div>
        ))}
      </div>

      <div data-content className="absolute inset-0">
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_0)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)] [background-size:12px_12px]" />
        <div
          data-guide-x
          className="absolute inset-x-0 top-1/2 h-px bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.2)_0_4px,transparent_4px_8px)]"
        />
        <div
          data-guide-y
          className="absolute inset-y-0 left-1/2 w-px bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.2)_0_4px,transparent_4px_8px)]"
        />
        <div className="absolute top-1/2 left-1/2 size-[115vmin] -translate-x-1/2 -translate-y-1/2">
          <svg data-ring className="size-full" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="49"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="0.15"
              strokeDasharray="0.8 1.2"
            />
            <circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.08)" strokeWidth="0.12" />
            {Array.from({ length: 4 }, (_, i) => (
              <rect
                key={i}
                x="49.6"
                y="0.2"
                width="0.8"
                height="3"
                fill="rgba(255,255,255,0.55)"
                transform={`rotate(${i * 90} 50 50)`}
              />
            ))}
          </svg>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[1.3em] w-full text-[clamp(3.5rem,14vw,11rem)] leading-none font-bold tracking-tight">
            {words.map((w) => (
              <div key={w} data-word className="absolute inset-0 opacity-0">
                <Chars text={w} />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <div
            data-finale
            className="relative h-[1.2em] w-full text-[clamp(4rem,17vw,15rem)] leading-none font-black tracking-tighter opacity-0"
          >
            <Chars text={finale} />
          </div>
          <p
            data-tagline
            className="h-4 font-mono text-xs tracking-[0.35em] text-zinc-400 opacity-0 sm:text-sm"
          >
            &nbsp;
          </p>
        </div>
      </div>

      <div
        data-frame
        className="pointer-events-none absolute inset-0 font-mono text-[11px] tracking-widest text-zinc-500 uppercase"
      >
        <span
          data-frame-item
          className="absolute top-5 left-5 size-4 border-t border-l border-zinc-500"
        />
        <span
          data-frame-item
          className="absolute top-5 right-5 size-4 border-t border-r border-zinc-500"
        />
        <span
          data-frame-item
          className="absolute bottom-5 left-5 size-4 border-b border-l border-zinc-500"
        />
        <span
          data-frame-item
          className="absolute right-5 bottom-5 size-4 border-r border-b border-zinc-500"
        />
        <div className="absolute inset-x-12 top-5 flex items-center justify-between">
          <span data-frame-item>Siddharth Gaikwad / Portfolio</span>
          <button
            data-frame-item
            type="button"
            onClick={skip}
            className="pointer-events-auto rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white"
          >
            Skip
          </button>
        </div>
        <div className="absolute inset-x-12 bottom-6 flex items-end justify-between gap-6">
          <div data-frame-item className="space-y-1.5">
            <p className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span data-status className="text-zinc-300 normal-case">
                booting
              </span>
            </p>
            <p>Mumbai · India</p>
          </div>
          <span
            data-frame-item
            data-counter
            className="text-6xl leading-none font-light tracking-tight text-zinc-50 tabular-nums sm:text-8xl"
          >
            000
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-800">
          <div data-progress className="h-full origin-left bg-zinc-50" />
        </div>
      </div>
    </div>
  )
}
