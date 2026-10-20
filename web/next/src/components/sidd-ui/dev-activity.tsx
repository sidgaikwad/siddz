"use client"

import { cn } from "cn"
import { useEffect, useMemo, useState } from "react"

type Tone = "dim" | "ok" | "info" | "warn" | "accent" | "plain"
type Out = { text: string; tone?: Tone }

const TONE: Record<Tone, string> = {
  plain: "text-zinc-300",
  dim: "text-zinc-500",
  ok: "text-emerald-400",
  info: "text-sky-400",
  warn: "text-amber-400",
  accent: "text-fuchsia-400",
}

const SCRIPTS: Record<string, { command: string; lines: Out[] }> = {
  git: {
    command: "git log --graph --oneline",
    lines: [
      { text: "* bfab755 fix(web): hydration-safe project wheel", tone: "warn" },
      { text: "* e45db5e feat(web): kinetic intro + terminal", tone: "plain" },
      { text: "| * 4c1d0e2 wip: pixel dev scene", tone: "dim" },
      { text: "|/", tone: "dim" },
      { text: "* bad8ed6 fix(web): intro on every fresh load", tone: "plain" },
      { text: "* 5703b28 feat(web): SIDDZ isometric mark", tone: "plain" },
      { text: "* fc08913 feat(web): portfolio + components", tone: "plain" },
      { text: "* d71ac49 ci(init): re-baseline as Portfolio", tone: "dim" },
    ],
  },
  install: {
    command: "bun install",
    lines: [
      { text: "bun install v1.3.14", tone: "dim" },
      { text: "+ next@16.4.2", tone: "ok" },
      { text: "+ react@19.3.0", tone: "ok" },
      { text: "+ three@0.186.1", tone: "ok" },
      { text: "+ gsap@3.15.0", tone: "ok" },
      { text: "+ @react-three/fiber@9.8.2", tone: "ok" },
      { text: "+ hono@4.13.13", tone: "ok" },
      { text: "1,284 packages installed [1.73s]", tone: "plain" },
    ],
  },
  build: {
    command: "next build",
    lines: [
      { text: "▲ Next.js 16.4.2 (Turbopack)", tone: "plain" },
      { text: "  Creating an optimized production build ...", tone: "dim" },
      { text: "✓ Compiled successfully in 6.4s", tone: "ok" },
      { text: "✓ Generating static pages (24/24)", tone: "ok" },
      { text: "Route (app)", tone: "dim" },
      { text: "┌ ○ /", tone: "plain" },
      { text: "├ ● /components/[slug]", tone: "plain" },
      { text: "└ ○ /blog", tone: "plain" },
    ],
  },
  test: {
    command: "bun test",
    lines: [
      { text: "bun test v1.3.14", tone: "dim" },
      { text: "✓ project-browser > wheel keys (3ms)", tone: "ok" },
      { text: "✓ github-stats > commit count (12ms)", tone: "ok" },
      { text: "✓ intro-loader > skip seeks exit (1ms)", tone: "ok" },
      { text: "✓ isometric-mark > glyph layout (2ms)", tone: "ok" },
      { text: "✓ dot-matrix > responsive gap (1ms)", tone: "ok" },
      { text: " 24 pass  0 fail", tone: "plain" },
      { text: "Ran 24 tests across 9 files. [412ms]", tone: "dim" },
    ],
  },
  deploy: {
    command: "vercel deploy --prod",
    lines: [
      { text: "Vercel CLI 58.1.0", tone: "dim" },
      { text: "🔍 Inspect: vercel.com/siddz", tone: "info" },
      { text: "  Uploading [====================] 100%", tone: "plain" },
      { text: "  Building ...", tone: "dim" },
      { text: "  Build Completed in /vercel/output [45s]", tone: "plain" },
      { text: "✓ Production: siddz-delta.vercel.app", tone: "ok" },
      { text: "  Aliased  [2s]", tone: "dim" },
    ],
  },
}

function useTicker(ms: number, enabled = true) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms, enabled])
  return tick
}

function Window({
  title,
  children,
  className,
  delay,
}: {
  title: string
  children: React.ReactNode
  className?: string
  delay: number
}) {
  return (
    <div
      className={cn(
        "absolute w-[min(300px,44vw)] animate-[term-in_500ms_ease-out_both] overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/80 font-mono text-[10.5px] leading-[1.55] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-sm",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1 border-b border-zinc-800/80 px-2.5 py-1.5">
        <span className="size-1.5 rounded-full bg-zinc-700" />
        <span className="size-1.5 rounded-full bg-zinc-700" />
        <span className="size-1.5 rounded-full bg-zinc-700" />
        <span className="ml-2 truncate text-[10px] text-zinc-500">{title}</span>
      </div>
      <div className="h-[132px] overflow-hidden px-2.5 py-2">{children}</div>
    </div>
  )
}

function Stream({
  script,
  speed,
  offset,
}: {
  script: keyof typeof SCRIPTS
  speed: number
  offset: number
}) {
  const { command, lines } = SCRIPTS[script]!
  const tick = useTicker(speed)
  const cycle = lines.length + 6
  const step = (tick + offset) % cycle
  const shown = lines.slice(0, Math.min(step, lines.length))
  return (
    <div className="flex h-full flex-col justify-end">
      <p className="truncate text-zinc-300">
        <span className="text-emerald-400">❯</span> {command}
      </p>
      {shown.slice(-7).map((l, i) => (
        <p key={`${step}-${i}`} className={cn("truncate whitespace-pre", TONE[l.tone ?? "plain"])}>
          {l.text}
        </p>
      ))}
      {step >= lines.length && (
        <p className="text-zinc-300">
          <span className="text-emerald-400">❯</span>{" "}
          <span className="inline-block h-2.5 w-1.5 translate-y-0.5 animate-pulse bg-zinc-300" />
        </p>
      )}
    </div>
  )
}

function Htop() {
  const tick = useTicker(380)
  const cpus = useMemo(
    () => [0, 1, 2, 3].map((i) => 18 + Math.round(Math.abs(Math.sin(tick * 0.7 + i * 1.9)) * 72)),
    [tick],
  )
  const mem = 1.1 + Math.abs(Math.sin(tick * 0.2)) * 0.6
  const bar = (pct: number, width = 20) => {
    const filled = Math.round((pct / 100) * width)
    return `${"|".repeat(filled)}${" ".repeat(width - filled)}`
  }
  return (
    <div className="space-y-0.5 text-zinc-300">
      {cpus.map((c, i) => (
        <p key={i} className="whitespace-pre">
          <span className="text-zinc-500">{i + 1} </span>[
          <span
            className={c > 70 ? "text-rose-400" : c > 45 ? "text-amber-400" : "text-emerald-400"}
          >
            {bar(c)}
          </span>
          <span className="text-zinc-500">{String(c).padStart(3)}%</span>]
        </p>
      ))}
      <p className="whitespace-pre">
        <span className="text-zinc-500">Mem</span>[
        <span className="text-sky-400">{bar((mem / 16) * 100 * 5, 18)}</span>
        <span className="text-zinc-500">{mem.toFixed(1)}G/16G</span>]
      </p>
      <p className="pt-1 text-zinc-500">Tasks: 214, 3 running</p>
      <p className="truncate">
        <span className="text-fuchsia-400">bun</span>{" "}
        <span className="text-zinc-500">next-server turbo tsdown</span>
      </p>
    </div>
  )
}

// A desktop of terminals streaming believable dev output: commits, installs, builds, tests, a deploy and htop.
export function DevActivity({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-75 select-none",
        className,
      )}
    >
      <Window title="~/portfolio · git" className="top-[7%] left-[3%]" delay={150}>
        <Stream script="git" speed={150} offset={0} />
      </Window>
      <Window title="~/portfolio · bun" className="top-[9%] right-[3%]" delay={250}>
        <Stream script="install" speed={110} offset={2} />
      </Window>
      <Window title="htop" className="top-[40%] left-[2%] hidden xl:block" delay={350}>
        <Htop />
      </Window>
      <Window
        title="~/portfolio/web/next · deploy"
        className="top-[41%] right-[2%] hidden xl:block"
        delay={450}
      >
        <Stream script="deploy" speed={180} offset={0} />
      </Window>
      <Window
        title="~/portfolio/web/next · build"
        className="bottom-[7%] left-[5%] hidden sm:block"
        delay={550}
      >
        <Stream script="build" speed={130} offset={1} />
      </Window>
      <Window
        title="~/portfolio · test"
        className="right-[5%] bottom-[8%] hidden sm:block"
        delay={650}
      >
        <Stream script="test" speed={120} offset={3} />
      </Window>
    </div>
  )
}
