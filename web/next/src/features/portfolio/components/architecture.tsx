"use client"

import dynamic from "next/dynamic"

import { Panel, PanelHeader } from "@/features/portfolio/components/panel"
import { ARCHITECTURE } from "@/features/portfolio/data/architecture"

const DrilldownDiagram = dynamic(
  () => import("@/components/sidd-ui/drilldown-diagram").then((m) => m.DrilldownDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-72 items-center justify-center font-mono text-xs">
        Drawing diagrams...
      </div>
    ),
  },
)

export function Architecture() {
  return (
    <Panel id="architecture">
      <PanelHeader title="Architecture" />
      <DrilldownDiagram diagrams={ARCHITECTURE} rootId="system" />
    </Panel>
  )
}
