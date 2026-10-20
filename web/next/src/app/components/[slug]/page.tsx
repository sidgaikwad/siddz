import { readFileSync } from "node:fs"
import { join } from "node:path"

import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/features/components-showcase/code-block"
import { ComponentsMobileNav } from "@/features/components-showcase/components-sidebar"
import { CopyPageButton } from "@/features/components-showcase/copy-page-button"
import { PageToc } from "@/features/components-showcase/page-toc"
import { PreviewTabs } from "@/features/components-showcase/preview-tabs"
import { COMPONENTS, getComponent, getNeighbors } from "@/features/components-showcase/registry"
import { Footer } from "@/features/portfolio/components/footer"
import { Panel, PanelContent, Separator } from "@/features/portfolio/components/panel"
import { Tag } from "@/features/portfolio/components/tag"

const SECTIONS = [
  { id: "preview", label: "Preview" },
  { id: "features", label: "Features" },
  { id: "story", label: "Why I built this" },
  { id: "usage", label: "Usage" },
]

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const item = getComponent(slug)
  return item ? { title: item.name, description: item.description } : {}
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="screen-line-bottom scroll-mt-20 px-4 py-2 text-2xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  )
}

function NavArrow({ href, label, dir }: { href?: string; label: string; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? RiArrowLeftLine : RiArrowRightLine
  const cls =
    "border-line flex size-8 items-center justify-center rounded-md border transition-colors"
  if (!href)
    return (
      <span className={`${cls} text-muted-foreground/40`} aria-hidden>
        <Icon className="size-4" />
      </span>
    )
  return (
    <Link href={href} aria-label={label} title={label} className={`${cls} hover:bg-muted`}>
      <Icon className="size-4" />
    </Link>
  )
}

export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const { slug } = await params
  const item = getComponent(slug)
  if (!item) notFound()

  const source = readFileSync(join(process.cwd(), "src/components/sidd-ui", item.file), "utf8")
  const { prev, next } = getNeighbors(slug)
  const { Demo } = item

  const markdown = [
    `# ${item.name}`,
    item.description,
    "## Features",
    ...item.features.map((f) => `- ${f}`),
    "## Why I built this",
    ...item.story,
    "## Usage",
    "```tsx\n" + item.usage + "\n```",
    "## Source",
    "```tsx\n" + source + "\n```",
  ].join("\n\n")

  return (
    <main className="max-w-screen overflow-x-clip px-2 pt-14">
      <PageToc sections={SECTIONS} />
      <div className="mx-auto md:max-w-3xl">
        <Separator />
        <Panel>
          <ComponentsMobileNav items={COMPONENTS.map((c) => ({ slug: c.slug, name: c.name }))} />
          <div className="screen-line-bottom flex items-center justify-between gap-2 px-4 py-2.5">
            <Link
              href="/components"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-sm transition-colors"
            >
              <RiArrowLeftLine className="size-4" /> Components
            </Link>
            <div className="flex items-center gap-1.5">
              <CopyPageButton markdown={markdown} />
              <NavArrow
                href={prev && `/components/${prev.slug}`}
                label={prev ? `Previous: ${prev.name}` : ""}
                dir="prev"
              />
              <NavArrow
                href={next && `/components/${next.slug}`}
                label={next ? `Next: ${next.name}` : ""}
                dir="next"
              />
            </div>
          </div>
          <h1 className="screen-line-bottom px-4 py-3 text-4xl font-semibold tracking-tight">
            {item.name}
          </h1>
          <PanelContent className="space-y-4">
            <p className="text-muted-foreground text-lg">{item.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <div id="preview" className="scroll-mt-20">
              <PreviewTabs
                preview={<Demo />}
                code={<CodeBlock code={source} title={`components/sidd-ui/${item.file}`} />}
              />
            </div>
          </PanelContent>
        </Panel>
        <Separator />

        <Panel>
          <SectionTitle id="features">Features</SectionTitle>
          <PanelContent>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5 marker:text-xs">
              {item.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </PanelContent>
        </Panel>
        <Separator />

        <Panel>
          <SectionTitle id="story">Why I built this</SectionTitle>
          <PanelContent>
            <figure className="border-foreground/20 space-y-3 border-l-2 pl-4">
              {item.story.map((p) => (
                <p key={p} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
              <figcaption className="text-foreground/70 font-mono text-xs">Sidd</figcaption>
            </figure>
          </PanelContent>
        </Panel>
        <Separator />

        <Panel>
          <SectionTitle id="usage">Usage</SectionTitle>
          <PanelContent>
            <CodeBlock code={item.usage} title="example.tsx" />
          </PanelContent>
        </Panel>
        <Separator />

        <Panel>
          <div className="grid grid-cols-2">
            {prev ? (
              <Link
                href={`/components/${prev.slug}`}
                className="group border-line hover:bg-muted/50 border-r p-4 transition-colors"
              >
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <RiArrowLeftLine className="size-3.5" /> Previous
                </p>
                <p className="font-medium">{prev.name}</p>
              </Link>
            ) : (
              <div className="border-line border-r" />
            )}
            {next ? (
              <Link
                href={`/components/${next.slug}`}
                className="group hover:bg-muted/50 p-4 text-right transition-colors"
              >
                <p className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                  Next <RiArrowRightLine className="size-3.5" />
                </p>
                <p className="font-medium">{next.name}</p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </Panel>
        <Separator />
        <Footer />
      </div>
    </main>
  )
}
