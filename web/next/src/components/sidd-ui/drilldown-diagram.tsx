"use client"

import { RiArrowLeftLine, RiArrowRightSLine } from "@remixicon/react"
import { cn } from "cn"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useId, useRef, useState } from "react"

export type DiagramDef = {
  id: string
  title: string
  description?: string
  code: string
  // Node id in this diagram -> id of the diagram it opens.
  drill?: Record<string, string>
}

function nodeIdOf(el: Element) {
  const direct = el.getAttribute("data-id")
  if (direct) return direct
  const match = el.id.match(/flowchart-(.+)-\d+$/)
  return match?.[1] ?? null
}

// Mermaid diagrams you can drill into: click a highlighted node to open its own diagram, Esc or the breadcrumbs to go back.
export function DrilldownDiagram({
  diagrams,
  rootId,
  className,
}: {
  diagrams: DiagramDef[]
  rootId: string
  className?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const { resolvedTheme } = useTheme()
  const [path, setPath] = useState<string[]>([rootId])
  const [error, setError] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const renderCount = useRef(0)
  const current = diagrams.find((d) => d.id === path[path.length - 1])!

  const open = useCallback((id: string) => setPath((p) => [...p, id]), [])
  const up = useCallback(() => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p)), [])

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return
    const dark = resolvedTheme !== "light"
    ;(async () => {
      const mermaid = (await import("mermaid")).default
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        themeVariables: {
          darkMode: dark,
          fontSize: "13px",
          background: "transparent",
          primaryColor: dark ? "#18181b" : "#fafafa",
          primaryTextColor: dark ? "#fafafa" : "#18181b",
          primaryBorderColor: dark ? "#52525b" : "#a1a1aa",
          lineColor: dark ? "#71717a" : "#a1a1aa",
          secondaryColor: dark ? "#27272a" : "#f4f4f5",
          tertiaryColor: dark ? "#0f0f12" : "#ffffff",
          clusterBkg: dark ? "#0f0f12" : "#fafafa",
          clusterBorder: dark ? "#3f3f46" : "#d4d4d8",
          actorBkg: dark ? "#18181b" : "#fafafa",
          actorBorder: dark ? "#52525b" : "#a1a1aa",
          actorTextColor: dark ? "#fafafa" : "#18181b",
          signalColor: dark ? "#a1a1aa" : "#52525b",
          signalTextColor: dark ? "#e4e4e7" : "#27272a",
          noteBkgColor: dark ? "#27272a" : "#f4f4f5",
          noteTextColor: dark ? "#e4e4e7" : "#27272a",
          noteBorderColor: dark ? "#52525b" : "#d4d4d8",
        },
        flowchart: { curve: "basis", padding: 12, htmlLabels: true },
      })
      try {
        const { svg } = await mermaid.render(`dd-${uid}-${renderCount.current++}`, current.code)
        if (cancelled) return
        host.innerHTML = svg
        setError(null)
        const svgEl = host.querySelector("svg")
        if (svgEl) {
          svgEl.style.maxWidth = "100%"
          svgEl.style.height = "auto"
        }
        host.querySelectorAll("g.node").forEach((node) => {
          const id = nodeIdOf(node)
          const target = id ? current.drill?.[id] : undefined
          if (!target) return
          node.classList.add("dd-drill")
          node.setAttribute("tabindex", "0")
          node.setAttribute("role", "button")
          const label = diagrams.find((d) => d.id === target)?.title ?? target
          node.setAttribute("aria-label", `Open ${label}`)
          const go = () => open(target)
          node.addEventListener("click", go)
          node.addEventListener("keydown", (e) => {
            const k = (e as KeyboardEvent).key
            if (k === "Enter" || k === " ") {
              e.preventDefault()
              go()
            }
          })
        })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not render diagram")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [current, diagrams, open, resolvedTheme, uid])

  return (
    <div
      className={cn("relative", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") up()
      }}
    >
      <div className="border-line flex flex-wrap items-center gap-1 border-b px-4 py-2 font-mono text-xs">
        <button
          type="button"
          onClick={up}
          disabled={path.length === 1}
          aria-label="Up one level"
          className="border-line text-muted-foreground hover:text-foreground mr-1 flex size-6 items-center justify-center rounded-md border transition-colors disabled:opacity-30"
        >
          <RiArrowLeftLine className="size-3.5" />
        </button>
        {path.map((id, i) => {
          const d = diagrams.find((x) => x.id === id)!
          const last = i === path.length - 1
          return (
            <span key={`${id}-${i}`} className="flex items-center gap-1">
              {i > 0 && <RiArrowRightSLine className="text-muted-foreground/60 size-3.5" />}
              <button
                type="button"
                disabled={last}
                onClick={() => setPath(path.slice(0, i + 1))}
                className={cn(
                  "rounded px-1 transition-colors",
                  last ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d.title}
              </button>
            </span>
          )
        })}
        <span className="text-muted-foreground/60 ml-auto hidden sm:inline">
          click a dashed node to drill in · esc to go up
        </span>
      </div>
      {current.description && (
        <p className="text-muted-foreground border-line border-b px-4 py-2 text-sm">
          {current.description}
        </p>
      )}
      <div
        key={current.id}
        className="dot-grid animate-[term-in_300ms_ease-out_both] overflow-x-auto p-4"
      >
        <div ref={hostRef} className="dd-host mx-auto flex min-h-56 items-center justify-center" />
        {error && <p className="text-destructive font-mono text-xs">{error}</p>}
      </div>
    </div>
  )
}
