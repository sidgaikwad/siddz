import { cn } from "cn"

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn("screen-line-top screen-line-bottom border-x border-line", className)}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  count,
  className,
}: {
  title: string
  count?: number
  className?: string
}) {
  return (
    <header className={cn("screen-line-bottom px-4", className)}>
      <h2 className="text-3xl font-semibold tracking-tight">
        {title}
        {count !== undefined && (
          <sup className="text-muted-foreground top-[-0.75em] ml-1 text-sm font-medium tracking-normal">
            ({count})
          </sup>
        )}
      </h2>
    </header>
  )
}

export function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />
}

export function Separator() {
  return <div className="stripe-divider border-line w-full border-x" aria-hidden />
}
