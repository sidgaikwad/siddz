"use client"

import dynamic from "next/dynamic"

const TechGlobe = dynamic(
  () => import("@/components/sidd-ui/tech-globe").then((m) => m.TechGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-xs">
        Spinning up the globe...
      </div>
    ),
  },
)

export function StackGlobe({ skills }: { skills: string[] }) {
  return <TechGlobe skills={skills} className="h-96 w-full" />
}
