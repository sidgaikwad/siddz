import { cn } from "cn"

export function Marquee({
  children,
  duration = 30,
  reverse = false,
  pauseOnHover = true,
  className,
}: {
  children: React.ReactNode
  duration?: number
  reverse?: boolean
  pauseOnHover?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className={cn(
            "flex shrink-0 items-center gap-3 pr-3 motion-safe:animate-[marquee_var(--duration)_linear_infinite]",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{ "--duration": `${duration}s` } as React.CSSProperties}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
