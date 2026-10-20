"use client"

import { cn } from "cn"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { Panel, PanelHeader } from "@/features/portfolio/components/panel"

const PixelDev = dynamic(() => import("@/components/sidd-ui/pixel-dev").then((m) => m.PixelDev), {
  ssr: false,
})
const VoxelStage = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.VoxelStage),
  { ssr: false },
)
const FerrisScene = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.FerrisScene),
  { ssr: false },
)
const CrtScene = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.CrtScene),
  { ssr: false },
)
const ServerRoomScene = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.ServerRoomScene),
  { ssr: false },
)
const DeployScene = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.DeployScene),
  { ssr: false },
)
const MumbaiBusScene = dynamic(
  () => import("@/components/sidd-ui/voxel-dioramas").then((m) => m.MumbaiBusScene),
  { ssr: false },
)

type Frameloop = "always" | "never"

const PIECES: {
  id: string
  title: string
  caption: string
  render: (loop: Frameloop) => React.ReactNode
}[] = [
  {
    id: "desk",
    title: "Dev desk",
    caption: "me, a MacBook, and a coffee going cold",
    render: (loop) => <PixelDev frameloop={loop} className="size-full" />,
  },
  {
    id: "ferris",
    title: "Ferris",
    caption: "rust's crab, waving hello",
    render: (loop) => (
      <VoxelStage frameloop={loop} target={[0, 2, 0]} fit={12} className="size-full">
        <FerrisScene />
      </VoxelStage>
    ),
  },
  {
    id: "crt",
    title: "Retro CRT",
    caption: "where it all started",
    render: (loop) => (
      <VoxelStage frameloop={loop} target={[0, 3, 0]} fit={12} className="size-full">
        <CrtScene />
      </VoxelStage>
    ),
  },
  {
    id: "servers",
    title: "Server room",
    caption: "blinking, therefore up",
    render: (loop) => (
      <VoxelStage frameloop={loop} target={[0, 3.6, 0]} fit={13} className="size-full">
        <ServerRoomScene />
      </VoxelStage>
    ),
  },
  {
    id: "deploy",
    title: "Deploy",
    caption: "git push origin main",
    render: (loop) => (
      <VoxelStage frameloop={loop} target={[0, 5, 0]} fit={15} className="size-full">
        <DeployScene />
      </VoxelStage>
    ),
  },
  {
    id: "mumbai",
    title: "Mumbai",
    caption: "BEST double-decker, home",
    render: (loop) => (
      <VoxelStage frameloop={loop} target={[0, 3, 0]} fit={14} className="size-full">
        <MumbaiBusScene />
      </VoxelStage>
    ),
  },
]

function LazyTile({ children }: { children: (loop: Frameloop) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = !!entry?.isIntersecting
        setVisible(on)
        if (on) setMounted(true)
      },
      { rootMargin: "200px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="absolute inset-0">
      {mounted && children(visible ? "always" : "never")}
    </div>
  )
}

export function VoxelLab() {
  return (
    <Panel id="voxel-lab">
      <PanelHeader title="Voxel Lab" count={PIECES.length} />
      <p className="text-muted-foreground screen-line-bottom px-4 py-3 text-sm">
        Little worlds made of cubes, rendered at a third of the resolution so every pixel stays
        crunchy.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3">
        {PIECES.map((piece, i) => (
          <figure
            key={piece.id}
            className={cn(
              "group border-line relative border-b",
              i === 0 ? "col-span-2 row-span-2 aspect-square md:border-r" : "aspect-square",
              i > 0 && i % 2 === 0 && "max-md:border-l",
              i > 2 && "md:not-[:nth-child(3n)]:border-r",
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--foreground)_6%,transparent),transparent_70%)]" />
            <LazyTile>{piece.render}</LazyTile>
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
              <span>
                <span className="text-foreground block text-sm font-medium">{piece.title}</span>
                <span className="text-muted-foreground block font-mono text-[10px]">
                  {piece.caption}
                </span>
              </span>
              <span className="text-muted-foreground/60 font-mono text-[10px]">Fig. {i + 2}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Panel>
  )
}
