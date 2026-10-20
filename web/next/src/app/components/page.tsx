import type { Metadata } from "next"

import { ComponentList } from "@/features/components-showcase/component-list"
import { ComponentsHeader } from "@/features/components-showcase/components-header"
import { COMPONENTS } from "@/features/components-showcase/registry"
import { Footer } from "@/features/portfolio/components/footer"
import { Panel, Separator } from "@/features/portfolio/components/panel"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Custom React components I built for this site: 3D, voxels, animation and interaction.",
}

export default function ComponentsPage() {
  const items = [...COMPONENTS].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  )

  return (
    <main className="max-w-screen overflow-x-clip px-2 pt-14">
      <div className="mx-auto md:max-w-3xl">
        <Separator />
        <Panel>
          <ComponentsHeader count={items.length} view="list" />
          <ComponentList items={items} />
          <div className="h-4" />
        </Panel>
        <Separator />
        <Footer />
      </div>
    </main>
  )
}
