"use client"

import { useEffect, useState } from "react"

export function LocalTime({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  if (!now) return <span className="text-muted-foreground">--:--</span>

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(now)

  return (
    <span className="tabular-nums">
      {time} <span className="text-muted-foreground">IST</span>
    </span>
  )
}
