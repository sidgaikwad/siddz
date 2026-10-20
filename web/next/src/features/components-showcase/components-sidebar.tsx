"use client"

import { cn } from "cn"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function ComponentsSidebar({
  items,
}: {
  items: { slug: string; name: string; is3D: boolean }[]
}) {
  const pathname = usePathname()

  return (
    <aside className="fixed top-24 left-[max(1rem,calc(50%-24rem-17rem))] hidden w-60 min-[1320px]:block">
      <div className="border-line bg-background/60 max-h-[calc(100svh-8rem)] [scrollbar-width:thin] overflow-y-auto rounded-xl border py-3 backdrop-blur">
        <Link
          href="/components"
          className="text-muted-foreground hover:text-foreground mb-2 block px-4 font-mono text-xs tracking-wide uppercase"
        >
          All components
        </Link>
        <ul>
          {items.map((item) => {
            const active = pathname === `/components/${item.slug}`
            return (
              <li key={item.slug}>
                <Link
                  href={`/components/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 py-1.5 pr-4 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-px shrink-0 transition-all",
                      active ? "bg-foreground w-8" : "bg-line group-hover:bg-muted-foreground w-4",
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                  {item.is3D && (
                    <span className="text-muted-foreground/70 ml-auto font-mono text-[10px]">
                      3D
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export function ComponentsMobileNav({ items }: { items: { slug: string; name: string }[] }) {
  const pathname = usePathname()
  return (
    <nav className="border-line flex [scrollbar-width:none] gap-2 overflow-x-auto border-b p-3 min-[1320px]:hidden">
      {items.map((item) => {
        const active = pathname === `/components/${item.slug}`
        return (
          <Link
            key={item.slug}
            href={`/components/${item.slug}`}
            className={cn(
              "border-line shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
