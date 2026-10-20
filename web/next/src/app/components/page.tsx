import type { Metadata } from "next"
import Link from "next/link"

import { COMPONENTS } from "@/features/components-showcase/registry"
import { Panel, Separator } from "@/features/portfolio/components/panel"
import { Footer } from "@/features/portfolio/components/sections"
import { Tag } from "@/features/portfolio/components/tag"

export const metadata: Metadata = {
  title: "Components",
  description: "Custom React components I built for this site: 3D, animation and interaction.",
}

export default function ComponentsPage() {
  return (
    <main className="max-w-screen overflow-x-clip px-2 pt-14">
      <div className="mx-auto md:max-w-3xl">
        <Separator />
        <Panel>
          <div className="screen-line-bottom p-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Components
              <sup className="text-muted-foreground top-[-0.75em] ml-1 text-sm font-medium tracking-normal">
                ({COMPONENTS.length})
              </sup>
            </h1>
            <p className="text-muted-foreground mt-1">
              Custom React components built for this site. Copy the source and use them anywhere.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            {COMPONENTS.map(({ slug, name, description, tags, Demo }) => (
              <Link
                key={slug}
                href={`/components/${slug}`}
                className="group border-line hover:bg-muted/30 flex flex-col border-b transition-colors sm:odd:border-r"
              >
                <div className="dot-grid border-line pointer-events-none flex h-48 items-center justify-center overflow-hidden border-b p-4">
                  <Demo />
                </div>
                <div className="space-y-2 p-4">
                  <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                    {name}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Separator />
        <Footer />
      </div>
    </main>
  )
}
