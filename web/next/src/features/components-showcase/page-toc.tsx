"use client"

import { cn } from "cn"
import { useEffect, useState } from "react"

export function PageToc({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -65% 0px" },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className="fixed top-32 right-[max(1rem,calc(50%-24rem-15rem))] hidden w-44 min-[1320px]:block">
      <p className="text-muted-foreground mb-3 font-mono text-xs tracking-wide uppercase">
        On this page
      </p>
      <ul className="space-y-1">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "group flex items-center gap-3 py-1 text-sm transition-colors",
                active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "h-px shrink-0 transition-all",
                  active === s.id ? "bg-foreground w-6" : "bg-line w-3",
                )}
              />
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
