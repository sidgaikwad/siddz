"use client"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

import { DevActivity } from "@/components/sidd-ui/dev-activity"

gsap.registerPlugin(useGSAP)

const PixelDev = dynamic(() => import("@/components/sidd-ui/pixel-dev").then((m) => m.PixelDev), {
  ssr: false,
})

// Set once the intro has finished, so client-side navigation back to the page does not replay it. A full reload resets it.
let playedThisLoad = false

const STATUSES = ["booting", "compiling", "linking", "hydrating", "ready"]

export function IntroLoader({
  words = ["Hello", "नमस्ते", "こんにちは", "Bonjour", "Hola", "Ciao", "Hallo", "Olá"],
  finale = "Siddharth Gaikwad",
  oncePerLoad = true,
}: {
  words?: string[]
  finale?: string
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
      const statusEl = q("[data-status]")[0] as HTMLElement
      const page = document.querySelectorAll("[data-intro-page]")

      document.documentElement.style.overflow = "hidden"
      const t = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          document.documentElement.style.overflow = ""
          if (oncePerLoad) playedThisLoad = true
          setDone(true)
        },
      })
      tl.current = t

      t.from(
        q("[data-card]"),
        { y: 24, scale: 0.96, opacity: 0, duration: 0.5, ease: "expo.out" },
        0,
      )

      // Words wipe in from the left and wipe out to the right, back to back.
      let at = 0.35
      q("[data-word]").forEach((word) => {
        t.fromTo(
          word,
          { clipPath: "inset(0 100% 0 0)", x: -10, opacity: 1 },
          { clipPath: "inset(0 0% 0 0)", x: 0, duration: 0.13, ease: "power2.out" },
          at,
        ).to(
          word,
          { clipPath: "inset(0 0 0 100%)", x: 10, duration: 0.11, ease: "power2.in" },
          at + 0.2,
        )
        at += 0.26
      })
      t.fromTo(
        q("[data-finale]"),
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "power3.out" },
        at,
      )

      const end = at + 0.9
      exitAt.current = end

      t.to(
        counter,
        {
          v: 100,
          duration: end,
          ease: "power1.inOut",
          onUpdate: () => {
            const v = Math.round(counter.v)
            counterEl.textContent = `${String(v).padStart(3, "0")}%`
            statusEl.textContent =
              STATUSES[Math.min(STATUSES.length - 1, Math.floor((v / 100) * STATUSES.length))]!
          },
        },
        0,
      ).fromTo(
        q("[data-progress]"),
        { scaleX: 0 },
        { scaleX: 1, duration: end, ease: "power1.inOut" },
        0,
      )

      // Exit as one piece: the card drops away, then the whole screen lifts while the page zooms into focus.
      t.to(
        q("[data-card]"),
        { y: 16, scale: 0.94, opacity: 0, duration: 0.35, ease: "power2.in" },
        end,
      ).to(root.current, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, end + 0.2)
      if (page.length) {
        t.fromTo(
          page,
          { scale: 0.95, y: 50, opacity: 0, filter: "blur(6px)", transformOrigin: "50% 0%" },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
            clearProps: "transform,filter,opacity,transformOrigin",
          },
          end + 0.4,
        )
      }

      return () => {
        document.documentElement.style.overflow = ""
      }
    },
    { scope: root, dependencies: [done] },
  )

  if (done) return null

  // Skipping jumps to the exit rather than cutting to the end, so the page still opens.
  const skip = () => {
    const t = tl.current
    if (t && t.time() < exitAt.current) t.seek(exitAt.current)
  }

  return (
    <div
      ref={root}
      aria-hidden
      className="intro-loader fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 text-zinc-50 motion-reduce:hidden"
    >
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] [background-size:12px_12px]" />
      <DevActivity />

      <div
        data-card
        className="relative w-[min(88vw,360px)] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur"
      >
        <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="ml-2 font-mono text-[10px] tracking-wider text-zinc-500">
            sidd@dev ~ boot
          </span>
          <button
            type="button"
            onClick={skip}
            className="ml-auto rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400 uppercase transition-colors hover:border-zinc-400 hover:text-white"
          >
            Skip
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-[radial-gradient(circle_at_50%_40%,#1c1c22,#09090b_70%)]">
          <PixelDev className="absolute inset-0" />
          <span className="absolute bottom-2 left-2 font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
            pixel · 3d
          </span>
        </div>

        <div className="relative mt-3 h-9 overflow-hidden px-2 text-2xl font-semibold tracking-tight">
          {words.map((w) => (
            <span key={w} data-word className="absolute inset-x-2 top-0 opacity-0">
              {w}
            </span>
          ))}
          <span data-finale className="absolute inset-x-2 top-0 opacity-0">
            {finale}
          </span>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 pb-1 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span data-status>booting</span>
          </span>
          <span data-counter className="text-zinc-300 tabular-nums">
            000%
          </span>
        </div>
        <div className="mx-2 mb-1 h-px overflow-hidden bg-zinc-800">
          <div data-progress className="h-full origin-left bg-zinc-100" />
        </div>
      </div>
    </div>
  )
}
