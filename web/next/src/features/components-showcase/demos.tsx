"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

import { DotMatrixWordmark } from "@/components/sidd-ui/dot-matrix-wordmark"
import { Garden } from "@/components/sidd-ui/garden"
import type { SkylineDay } from "@/components/sidd-ui/github-skyline"
import { IntroLoader } from "@/components/sidd-ui/intro-loader"
import { IsometricMark } from "@/components/sidd-ui/isometric-mark"
import { Marquee } from "@/components/sidd-ui/marquee"
import { NumberTicker } from "@/components/sidd-ui/number-ticker"
import { SpotlightCard } from "@/components/sidd-ui/spotlight-card"
import { Terminal } from "@/components/sidd-ui/terminal"
import { TextFlip } from "@/components/sidd-ui/text-flip"

const Loading = () => (
  <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-xs">
    Loading 3D...
  </div>
)

const ParticleSphere = dynamic(
  () => import("@/components/sidd-ui/particle-sphere").then((m) => m.ParticleSphere),
  { ssr: false, loading: Loading },
)

const Name3D = dynamic(() => import("@/components/sidd-ui/name-3d").then((m) => m.Name3D), {
  ssr: false,
  loading: Loading,
})

const TechGlobe = dynamic(
  () => import("@/components/sidd-ui/tech-globe").then((m) => m.TechGlobe),
  {
    ssr: false,
    loading: Loading,
  },
)

export function Name3DDemo() {
  return <Name3D text="HELLO" className="h-56 w-full" />
}

export function TechGlobeDemo() {
  return (
    <TechGlobe
      className="h-72 w-full"
      skills={[
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "Rust",
        "Go",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Bun",
        "Hono",
        "Tailwind",
      ]}
    />
  )
}

const GitHubSkyline = dynamic(
  () => import("@/components/sidd-ui/github-skyline").then((m) => m.GitHubSkyline),
  { ssr: false, loading: Loading },
)

export function ParticleSphereDemo() {
  return <ParticleSphere className="h-64 w-full" count={4000} />
}

function demoWeeks(): SkylineDay[][] {
  return Array.from({ length: 30 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const wave = Math.sin(w / 3) + Math.cos((w + d) / 2)
      const count = Math.max(0, Math.round((wave + 1.5) * 4 + ((w * 7 + d) % 5)))
      const level = (count === 0 ? 0 : Math.min(4, Math.ceil(count / 4))) as SkylineDay["level"]
      return { date: `w${w}d${d}`, count, level }
    }),
  )
}

const WEEKS = demoWeeks()

export function GitHubSkylineDemo() {
  return <GitHubSkyline weeks={WEEKS} className="h-64 w-full" />
}

export function TerminalDemo() {
  return (
    <Terminal
      className="w-full max-w-md"
      title="~/portfolio"
      lines={[
        { command: "bunx zerostarter init", output: ["✔ scaffolded", "✔ database migrated"] },
        { command: "bun run dev", output: ["▲ Next.js ready on http://localhost:3000"] },
        { command: 'git commit -m "feat: ship it"', output: ["[main 1a2b3c4] feat: ship it"] },
      ]}
    />
  )
}

export function SpotlightCardDemo() {
  return (
    <SpotlightCard className="w-full max-w-sm">
      <div className="space-y-2 p-6">
        <p className="font-mono text-xs text-sky-500">01 / spotlight</p>
        <p className="text-lg font-semibold">Move your cursor here</p>
        <p className="text-muted-foreground text-sm">
          A border and glow follow your pointer, using CSS variables only.
        </p>
      </div>
    </SpotlightCard>
  )
}

export function TextFlipDemo() {
  return (
    <p className="text-2xl font-semibold tracking-tight">
      I build{" "}
      <TextFlip words={["web apps", "CLIs", "TUIs", "APIs", "starters"]} className="text-sky-500" />
    </p>
  )
}

export function NumberTickerDemo() {
  return (
    <div className="flex gap-10 text-center">
      {[
        { value: 1938, label: "contributions" },
        { value: 248, label: "repositories" },
        { value: 5, label: "companies" },
      ].map((s) => (
        <div key={s.label}>
          <NumberTicker value={s.value} className="text-3xl font-semibold" />
          <p className="text-muted-foreground text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export function MarqueeDemo() {
  return (
    <Marquee className="w-full" duration={20}>
      {[
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "Rust",
        "Go",
        "PostgreSQL",
        "Redis",
        "Docker",
      ].map((t) => (
        <span
          key={t}
          className="border-line bg-muted/50 rounded-md border px-3 py-1 font-mono text-sm"
        >
          {t}
        </span>
      ))}
    </Marquee>
  )
}

export function IntroLoaderDemo() {
  const [run, setRun] = useState(0)
  return (
    <>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Play intro
      </button>
      {run > 0 && <IntroLoader key={run} oncePerLoad={false} />}
    </>
  )
}

export function IsometricMarkDemo() {
  return <IsometricMark text="SIDDZ" className="max-w-sm" />
}

export function GardenDemo() {
  return <Garden height={140} className="self-end" />
}

export function DotMatrixWordmarkDemo() {
  return <DotMatrixWordmark text="SIDDZ" gap={6} className="w-full" />
}
