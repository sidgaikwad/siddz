import type { Metadata } from "next"
import Link from "next/link"

import { ComponentsHeader } from "@/features/components-showcase/components-header"
import { COMPONENTS } from "@/features/components-showcase/registry"
import { Footer } from "@/features/portfolio/components/footer"
import { Panel, Separator } from "@/features/portfolio/components/panel"
import { Tag } from "@/features/portfolio/components/tag"

export const metadata: Metadata = {
  title: "Components showcase",
  description: "Live previews of every component on this site.",
}

export default function ComponentsShowcasePage() {
  return (
    <main className="max-w-screen overflow-x-clip px-2 pt-14">
      <div className="mx-auto md:max-w-3xl">
        <Separator />
        <Panel>
          <ComponentsHeader count={COMPONENTS.length} view="showcase" />
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
