export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-line bg-muted/50 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-xs">
      {children}
    </span>
  )
}
