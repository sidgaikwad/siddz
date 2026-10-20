"use client"

import { useEffect, useState } from "react"

export function LocalTime({ timeZone, seconds = false }: { timeZone: string; seconds?: boolean }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), seconds ? 1000 : 30_000)
    return () => clearInterval(id)
  }, [seconds])

  if (!now) return <span className="text-muted-foreground">{seconds ? "--:--:--" : "--:--"}</span>

  const time = new Intl.DateTimeFormat("en-US", {
    hour: seconds ? "2-digit" : "numeric",
    minute: "2-digit",
    ...(seconds && { second: "2-digit", hourCycle: "h23" as const }),
    timeZone,
  }).format(now)

  return (
    <span className="tabular-nums">
      {time} <span className="text-muted-foreground">IST</span>
    </span>
  )
}
