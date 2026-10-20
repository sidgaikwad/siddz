import {
  RiArrowLeftRightLine,
  RiBox3Line,
  RiBubbleChartLine,
  RiBuilding2Line,
  RiEyeLine,
  RiFlashlightLine,
  RiFontSize,
  RiGlobalLine,
  RiGridLine,
  RiLoader4Line,
  RiMacbookLine,
  RiNumbersLine,
  RiPlantLine,
  RiShapesLine,
  RiTerminalBoxLine,
  RiText,
} from "@remixicon/react"
import { cn } from "cn"
import Link from "next/link"

const ICONS: Record<string, typeof RiBox3Line> = {
  "ascii-eye": RiEyeLine,
  "dot-matrix-wordmark": RiGridLine,
  garden: RiPlantLine,
  "github-skyline": RiBuilding2Line,
  "intro-loader": RiLoader4Line,
  "isometric-mark": RiShapesLine,
  marquee: RiArrowLeftRightLine,
  "name-3d": RiFontSize,
  "number-ticker": RiNumbersLine,
  "particle-sphere": RiBubbleChartLine,
  "pixel-dev": RiMacbookLine,
  "spotlight-card": RiFlashlightLine,
  "tech-globe": RiGlobalLine,
  terminal: RiTerminalBoxLine,
  "text-flip": RiText,
}

export function IconTile({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-md select-none",
        "border-muted-foreground/15 bg-muted text-muted-foreground border",
        "ring-border/50 ring-offset-background dark:ring-line ring-1 ring-offset-1",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

export function ComponentList({
  items,
}: {
  items: { slug: string; name: string; isNew?: boolean }[]
}) {
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 max-sm:hidden sm:grid-cols-2 md:grid-cols-3">
        <div className="border-line border-r" />
        <div className="border-line border-r max-md:hidden" />
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {items.map((c) => {
          const Icon = ICONS[c.slug] ?? RiBox3Line
          return (
            <li key={c.slug} className="screen-line-bottom">
              <Link
                href={`/components/${c.slug}`}
                className="hover:bg-accent/50 flex items-center gap-4 p-4 pr-2 transition-[background-color] ease-out"
              >
                <IconTile>
                  <Icon aria-hidden />
                  {c.isNew && (
                    <span aria-label="New" className="absolute -top-1 -right-1 flex">
                      <span className="ring-background flex size-2 rounded-sm bg-sky-500 ring-1" />
                    </span>
                  )}
                </IconTile>
                <h3 className="line-clamp-1 leading-snug font-medium text-balance">{c.name}</h3>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
