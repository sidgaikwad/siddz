"use client"

import { cn } from "cn"
import { useState } from "react"

export function PreviewTabs({
  preview,
  code,
}: {
  preview: React.ReactNode
  code: React.ReactNode
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview")

  return (
    <div className="border-line bg-muted/20 overflow-hidden rounded-2xl border p-1">
      <div className="flex gap-1 px-2" role="tablist">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative px-3 py-2.5 text-sm capitalize transition-colors",
              tab === t
                ? "text-foreground after:bg-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="border-line bg-background overflow-hidden rounded-xl border">
        <div className={cn(tab !== "preview" && "hidden")}>
          <div className="dot-grid flex min-h-80 items-center justify-center p-6">{preview}</div>
        </div>
        <div className={cn(tab !== "code" && "hidden", "[&>div]:rounded-none [&>div]:border-0")}>
          {code}
        </div>
      </div>
    </div>
  )
}
