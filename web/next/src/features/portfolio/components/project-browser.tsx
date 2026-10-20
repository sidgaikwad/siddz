"use client"

import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"
import { cn } from "cn"
import { useCallback, useEffect, useRef, useState } from "react"

import { AsciiEye, type EyeState } from "@/components/sidd-ui/ascii-eye"
import type { RepoStats } from "@/features/portfolio/data/github-stats"
import type { Project } from "@/features/portfolio/data/profile"

export type BrowserItem = Project & { slug: string; owner: string; stats: RepoStats | null }

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  Go: "#00add8",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
}

const STEP = 112
const BAR = 16
const TYPE_MS = 16

// Fixed precision so server and client serialise identical style strings (avoids hydration mismatches).
const round = (n: number) => Math.round(n * 100) / 100

function Line({
  i,
  children,
  className,
}: {
  i: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("animate-[term-in_220ms_ease-out_both] whitespace-pre", className)}
      style={{ animationDelay: `${i * 35}ms` }}
    >
      {children}
    </div>
  )
}

function Prompt({ slug, branch }: { slug: string; branch: string }) {
  return (
    <span>
      <span className="text-foreground">sidd</span>
      <span className="text-muted-foreground">@dev </span>
      <span className="text-sky-500 dark:text-sky-400">~/P/{slug}</span>
      <span className="text-muted-foreground"> ({branch})</span>
    </span>
  )
}

// Dashed strings from the eye's pupil to whatever it is connected to: the selected project and the terminal cursor.
function EyeStrings({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = root.current
      const svg = svgRef.current
      if (el && svg) {
        const box = el.getBoundingClientRect()
        const marker = el.querySelector("[data-eye-marker]")?.getBoundingClientRect()
        const targets = [...el.querySelectorAll("[data-eye-target]")].map((t) =>
          t.getBoundingClientRect(),
        )
        const lines = svg.querySelectorAll<SVGLineElement>("line")
        const ends = svg.querySelectorAll<SVGRectElement>("rect")
        lines.forEach((line, i) => {
          const t = targets[i]
          const visible = marker && t && t.width > 0 && marker.width > 0
          line.style.opacity = visible ? "1" : "0"
          ends[i]!.style.opacity = visible ? "1" : "0"
          if (!visible) return
          const x1 = marker.left + marker.width / 2 - box.left
          const y1 = marker.top + marker.height / 2 - box.top
          const x2 = t.left + t.width / 2 - box.left
          const y2 = t.top + t.height / 2 - box.top
          line.setAttribute("x1", x1.toFixed(1))
          line.setAttribute("y1", y1.toFixed(1))
          line.setAttribute("x2", x2.toFixed(1))
          line.setAttribute("y2", y2.toFixed(1))
          ends[i]!.setAttribute("x", (x2 - 3).toFixed(1))
          ends[i]!.setAttribute("y", (y2 - 3).toFixed(1))
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [root])

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="text-muted-foreground pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
    >
      {[0, 1].map((i) => (
        <g key={i} style={{ opacity: i === 0 ? 0.9 : 0.45 }}>
          <line
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ opacity: 0 }}
          />
          <rect width="6" height="6" fill="none" stroke="currentColor" style={{ opacity: 0 }} />
        </g>
      ))}
    </svg>
  )
}

export function ProjectBrowser({
  items,
  totalStars,
  username,
}: {
  items: BrowserItem[]
  totalStars: number | null
  username: string
}) {
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [typed, setTyped] = useState(0)
  const [eye, setEye] = useState<EyeState>("idle")
  const rootRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number } | null>(null)
  const item = items[index]!
  const command = `fetch ${item.slug}`
  const showOutput = typed >= command.length

  const move = useCallback(
    (delta: number) => setIndex((i) => Math.min(items.length - 1, Math.max(0, i + delta))),
    [items.length],
  )

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(command.length)
      return
    }
    setTyped(0)
    const id = setInterval(() => {
      setTyped((t) => {
        if (t >= command.length) clearInterval(id)
        return t + 1
      })
    }, TYPE_MS)
    return () => clearInterval(id)
  }, [command])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest("input, textarea, a, button, [contenteditable]")) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault()
        move(1)
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault()
        move(-1)
      } else if (e.key === "Enter") {
        window.open(item.repo, "_blank", "noopener,noreferrer")
      } else if (e.key === "o" && item.url) {
        window.open(item.url, "_blank", "noopener,noreferrer")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, item, move])

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return
    let acc = 0
    let last = 0
    const onWheel = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY)
      const atEdge = (dir < 0 && index === 0) || (dir > 0 && index === items.length - 1)
      if (atEdge) return
      e.preventDefault()
      acc += e.deltaY
      const now = performance.now()
      if (Math.abs(acc) > 50 && now - last > 90) {
        move(Math.sign(acc))
        acc = 0
        last = now
      }
    }
    wheel.addEventListener("wheel", onWheel, { passive: false })
    return () => wheel.removeEventListener("wheel", onWheel)
  }, [index, items.length, move])

  const s = item.stats
  const share = s && totalStars ? s.stars / totalStars : 0
  const filled = s?.stars ? Math.max(1, Math.round(share * BAR)) : 0
  const row = (label: string, value: React.ReactNode) => (
    <>
      <span className="text-muted-foreground">{label.padEnd(9)}</span>
      {value}
    </>
  )
  const num = (n: number | null | undefined) => (
    <span className="text-foreground">{String(n ?? "-").padStart(5)}</span>
  )

  let line = 0
  const repoHost = `github.com/${item.owner}/${item.slug}`

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(false)
      }}
      aria-label="Project browser. Use arrow keys to change project, Enter to open the repository."
      className="focus-visible:ring-foreground/30 relative outline-none focus-visible:ring-1"
    >
      <EyeStrings root={rootRef} />
      <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="text-muted-foreground font-mono text-[11px] leading-relaxed">
          <p className="text-foreground">fish · ~ · {username}</p>
          <p>
            {items.length} projects · {totalStars ?? "-"} stars
          </p>
          <p>{items.filter((p) => p.url).length} live</p>
        </div>
        <AsciiEye onStateChange={setEye} className="max-sm:[&_pre]:hidden" />
      </div>
      <div className="grid md:grid-cols-[14rem_1fr]">
        <div
          ref={wheelRef}
          className="border-line relative hidden h-[30rem] touch-none overflow-hidden border-r select-none md:block"
          onPointerDown={(e) => {
            drag.current = { y: e.clientY }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!drag.current) return
            const dy = drag.current.y - e.clientY
            if (Math.abs(dy) > 44) {
              move(Math.sign(dy))
              drag.current.y = e.clientY
            }
          }}
          onPointerUp={() => {
            drag.current = null
          }}
        >
          <svg
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-16"
            viewBox="0 0 64 480"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M40 0 C 6 160, 6 320, 40 480"
              className="stroke-line"
              strokeDasharray="4 3"
              fill="none"
            />
          </svg>
          {items.map((p, i) => {
            const d = i - index
            const ad = Math.abs(d)
            const hidden = ad > 3
            return (
              <button
                key={p.slug}
                type="button"
                tabIndex={-1}
                onClick={() => setIndex(i)}
                className="absolute top-1/2 left-6 w-40 origin-left text-left transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translate(${round(-Math.pow(ad, 1.6) * 9)}px, calc(-50% + ${d * STEP}px)) rotate(${d * -4}deg) scale(${round(1 - Math.min(ad, 3) * 0.1)})`,
                  opacity: hidden ? 0 : round(1 - ad * 0.24),
                  zIndex: 10 - ad,
                  pointerEvents: hidden ? "none" : "auto",
                }}
              >
                <div
                  className={cn(
                    "bg-background overflow-hidden rounded-sm border transition-colors",
                    d === 0 ? "border-foreground" : "border-line",
                  )}
                >
                  <div
                    className={cn(
                      "dot-grid relative flex aspect-[2/1] w-full flex-col justify-between p-2 transition-[filter,opacity] duration-500",
                      d === 0 ? "opacity-100" : "opacity-60 grayscale",
                    )}
                  >
                    <div className="text-muted-foreground flex items-center gap-1 font-mono text-[9px]">
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          background: LANG_COLORS[p.stats?.language ?? ""] ?? "currentColor",
                        }}
                      />
                      {p.stats?.language ?? p.stack[0]}
                      <span className="ml-auto">{p.year}</span>
                    </div>
                    <p className="text-foreground truncate text-sm leading-tight font-semibold tracking-tight">
                      {p.name}
                    </p>
                    <div className="text-muted-foreground flex items-center justify-between font-mono text-[9px]">
                      <span>★ {p.stats?.stars ?? "-"}</span>
                      {p.url && <span className="text-emerald-500">● live</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px]">
                  <span
                    className={cn(
                      "truncate",
                      d === 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {p.slug}
                  </span>
                  {d === 0 && (
                    <span data-eye-target className="text-foreground ml-auto">
                      ▸
                    </span>
                  )}
                </div>
              </button>
            )
          })}
          <p className="text-muted-foreground/70 pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] uppercase">
            scroll · drag the wheel
          </p>
        </div>

        <div className="flex min-h-[30rem] flex-col">
          <div className="border-line text-muted-foreground flex items-center justify-between border-b px-4 py-2 font-mono text-xs">
            <span>fish · ~/Projects/{item.slug}</span>
            <span className="flex gap-1 md:hidden">
              <button
                type="button"
                aria-label="Previous project"
                onClick={() => move(-1)}
                className="hover:text-foreground border-line rounded border p-0.5"
              >
                <RiArrowUpSLine className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next project"
                onClick={() => move(1)}
                className="hover:text-foreground border-line rounded border p-0.5"
              >
                <RiArrowDownSLine className="size-4" />
              </button>
            </span>
          </div>

          <div
            key={item.slug}
            className="flex-1 [scrollbar-width:none] overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed"
          >
            <Line i={line++}>
              <Prompt slug={item.slug} branch={s?.branch ?? "main"} />
            </Line>
            <Line i={line++}>
              <span className="text-muted-foreground">› </span>
              <span className="text-foreground">{command.slice(0, typed)}</span>
              {!showOutput && (
                <span className="bg-foreground ml-px inline-block h-3.5 w-2 translate-y-0.5 animate-pulse" />
              )}
            </Line>

            {showOutput && (
              <>
                <Line i={line++} className="text-foreground mt-1 text-sm font-semibold">
                  {item.name}
                </Line>
                <Line i={line++} className="text-muted-foreground whitespace-normal">
                  {item.description}
                </Line>
                <div className="h-3" />
                {s ? (
                  <>
                    <Line i={line++}>
                      {row("stars", num(s.stars))}
                      {"  "}
                      <span className="text-rose-500 dark:text-rose-400">{"█".repeat(filled)}</span>
                      <span className="text-muted-foreground/40">{"░".repeat(BAR - filled)}</span>
                      <span className="text-muted-foreground">
                        {"  "}
                        {Math.round(share * 100)}% of all stars
                      </span>
                    </Line>
                    <Line i={line++}>{row("forks", num(s.forks))}</Line>
                    <Line i={line++}>{row("watch", num(s.watchers))}</Line>
                    <Line i={line++}>{row("commits", num(s.commits))}</Line>
                    <Line i={line++}>
                      {row("size", num(s.sizeKb))}
                      <span className="text-muted-foreground"> KB</span>
                    </Line>
                    <Line i={line++}>
                      {row("lang", "")}
                      {s.language && (
                        <span
                          className="mr-1.5 inline-block size-2 rounded-full"
                          style={{ background: LANG_COLORS[s.language] ?? "currentColor" }}
                        />
                      )}
                      <span className="text-foreground">{s.language ?? "-"}</span>
                      {s.license && (
                        <span className="text-muted-foreground">
                          {"   "}
                          {s.license}
                        </span>
                      )}
                    </Line>
                    <Line i={line++}>
                      {row("since", <span className="text-foreground">{s.createdAt}</span>)}
                      <span className="text-muted-foreground">{"  pushed "}</span>
                      <span className="text-foreground">{s.pushedAt}</span>
                    </Line>
                  </>
                ) : (
                  <Line i={line++} className="text-muted-foreground">
                    {row("stats", <span>offline (GitHub rate limit), try again later</span>)}
                  </Line>
                )}

                <div className="h-3" />
                <Line i={line++}>
                  <Prompt slug={item.slug} branch={s?.branch ?? "main"} />
                </Line>
                <Line i={line++}>
                  <span className="text-muted-foreground">› </span>
                  <span className="text-foreground">ls stack/</span>
                </Line>
                <Line i={line++} className="whitespace-normal">
                  {item.stack.map((t) => (
                    <span key={t} className="mr-4 text-sky-600 dark:text-sky-400">
                      {t}/
                    </span>
                  ))}
                </Line>

                <div className="h-3" />
                <Line i={line++}>
                  <Prompt slug={item.slug} branch={s?.branch ?? "main"} />
                </Line>
                <Line i={line++}>
                  <span className="text-muted-foreground">› </span>
                  <span className="text-foreground">open </span>
                  <a
                    href={item.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-current/30 underline-offset-3 hover:decoration-current"
                  >
                    {repoHost}
                  </a>
                </Line>
                {item.url && (
                  <Line i={line++}>
                    <span className="text-muted-foreground">› </span>
                    <span className="text-foreground">open </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-current/30 underline-offset-3 hover:decoration-current"
                    >
                      {new URL(item.url).host}
                    </a>
                  </Line>
                )}
                <Line i={line++}>
                  <span className="text-muted-foreground">› </span>
                  <span
                    data-eye-target
                    className="bg-foreground inline-block h-3.5 w-2 translate-y-0.5 animate-pulse"
                  />
                </Line>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-line text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-2 border-t px-4 py-2.5 font-mono text-[11px] uppercase sm:flex sm:items-end sm:justify-between">
        <div className="col-span-2">
          <p className="text-foreground tracking-wider">{username}</p>
          <p className="normal-case">
            {active
              ? "↑↓ project · ↩ open repo · o live site"
              : "hover or focus to use the keyboard"}
          </p>
        </div>
        {[
          ["project", `${index + 1}/${items.length}`],
          ["stars", totalStars ?? "-"],
          ["shipped", items.filter((p) => p.url).length],
          ["eye", eye],
        ].map(([label, value]) => (
          <div key={label as string}>
            <p className="text-[10px]">{label}</p>
            <p className="text-foreground text-sm">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
