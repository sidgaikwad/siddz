import { ComponentsSidebar } from "@/features/components-showcase/components-sidebar"
import { COMPONENTS } from "@/features/components-showcase/registry"

export default function ComponentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ComponentsSidebar
        items={COMPONENTS.map((c) => ({ slug: c.slug, name: c.name, is3D: c.tags.includes("3D") }))}
      />
      {children}
    </>
  )
}
