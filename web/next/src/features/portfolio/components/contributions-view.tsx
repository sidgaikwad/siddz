"use client"

import { cn } from "cn"
import dynamic from "next/dynamic"
import { useState } from "react"

import type { SkylineDay } from "@/components/sidd-ui/github-skyline"
import { NumberTicker } from "@/components/sidd-ui/number-ticker"

const LEVEL_CLASS = [
  "bg-muted",
  "bg-emerald-500/30",
  "bg-emerald-500/55",
  "bg-emerald-500/80",
  "bg-emerald-500",
]

const GitHubSkyline = dynamic(
  () => import("@/components/sidd-ui/github-skyline").then((m) => m.GitHubSkyline),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-64 items-center justify-center font-mono text-xs">
        Building skyline...
      </div>
    ),
  },
)

export function ContributionsView({
  weeks,
  total,
  username,
}: {
  weeks: (SkylineDay | null)[][]
  total: number
  username: string
}) {
  const [mode, setMode] = useState<"2d" | "3d">("2d")

  return (
    <div className="space-y-3">
      {mode === "2d" ? (
        <div className="[scrollbar-width:none] overflow-x-auto" dir="rtl">
          <div className="flex w-max gap-[3px]" dir="ltr">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((day, j) =>
                  day ? (
                    <div
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                      className={`size-2.5 rounded-[2px] ${LEVEL_CLASS[day.level]}`}
                    />
                  ) : (
                    <div key={`pad-${j}`} className="size-2.5" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <GitHubSkyline weeks={weeks} className="h-64 w-full" />
      )}

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          <NumberTicker value={total} /> contributions in the last year
        </a>
        <div className="border-line flex rounded-md border p-0.5 font-mono" role="tablist">
          {(["2d", "3d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2 py-0.5 uppercase transition-colors",
                mode === m ? "bg-foreground text-background" : "hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
