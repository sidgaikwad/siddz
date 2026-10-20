import { RiDashboardLine, RiListUnordered } from "@remixicon/react"
import { cn } from "cn"
import Link from "next/link"

const TOGGLE = "flex size-7 items-center justify-center rounded-md transition-colors [&_svg]:size-4"

export function ComponentsHeader({ count, view }: { count: number; view: "list" | "showcase" }) {
  return (
    <>
      <div className="screen-line-bottom space-y-1 px-4 py-6">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Components
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Hand-built, from voxels to terminals.
        </h1>
      </div>
      <div className="stripe-divider" />
      <div className="screen-line-top screen-line-bottom flex items-center gap-1.5 p-1.5 pl-4">
        <h2 className="text-muted-foreground flex-1 text-sm font-medium tracking-wider">
          {count} components
        </h2>
        <Link
          href="/components"
          aria-label="List"
          title="List"
          className={cn(
            TOGGLE,
            view === "list"
              ? "border-line bg-background border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <RiListUnordered />
        </Link>
        <Link
          href="/components/showcase"
          aria-label="Showcase"
          title="Showcase"
          className={cn(
            TOGGLE,
            view === "showcase"
              ? "border-line bg-background border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <RiDashboardLine />
        </Link>
      </div>
    </>
  )
}
