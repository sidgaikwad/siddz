import { RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"

import { ComponentList } from "@/features/components-showcase/component-list"
import { COMPONENTS } from "@/features/components-showcase/registry"
import { Panel, PanelContent, PanelHeader } from "@/features/portfolio/components/panel"
import { StackGlobe } from "@/features/portfolio/components/stack-globe"
import { Tag } from "@/features/portfolio/components/tag"
import { EDUCATION, EXPERIENCES, PROFILE, TECH_STACK } from "@/features/portfolio/data/profile"
import { getPublishedBlogPosts } from "@/lib/blog"

export function About() {
  return (
    <Panel id="about">
      <PanelHeader title="About" />
      <PanelContent className="text-muted-foreground space-y-3 leading-relaxed">
        {PROFILE.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </PanelContent>
    </Panel>
  )
}

export function TechStack() {
  return (
    <Panel id="stack">
      <PanelHeader title="Stack" />
      <div className="dot-grid border-line relative border-b">
        <StackGlobe skills={TECH_STACK.flatMap((g) => g.items)} />
        <span className="text-muted-foreground/60 pointer-events-none absolute bottom-2 left-3 font-mono text-[11px] tracking-wide uppercase">
          drag to rotate
        </span>
      </div>
      <div>
        {TECH_STACK.map((group) => (
          <div
            key={group.group}
            className="border-line grid gap-2 p-4 not-last:border-b sm:grid-cols-[8rem_1fr]"
          >
            <p className="text-sm font-medium">{group.group}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function Experiences() {
  return (
    <Panel id="experience">
      <PanelHeader title="Experience" count={EXPERIENCES.length} />
      <ol className="relative">
        {EXPERIENCES.map((exp) => (
          <li key={exp.company + exp.role} className="border-line space-y-3 p-4 not-last:border-b">
            <div className="flex items-start gap-3">
              <span className="bg-muted border-line flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-semibold">
                {exp.company.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{exp.company}</p>
                  {exp.current && (
                    <span className="relative flex size-2" aria-label="Current">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-500 opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
                    </span>
                  )}
                </div>
                <p className="text-sm">{exp.role}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {exp.period} <span className="mx-1">·</span> {exp.location}
                </p>
              </div>
            </div>
            {exp.points?.length ? (
              <ul className="text-muted-foreground list-disc space-y-1 pl-11 text-sm marker:text-xs">
                {exp.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            ) : null}
            {exp.skills?.length ? (
              <div className="flex flex-wrap gap-1.5 pl-11">
                {exp.skills.map((sk) => (
                  <Tag key={sk}>{sk}</Tag>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Panel>
  )
}

export function Education() {
  return (
    <Panel id="education">
      <PanelHeader title="Education" />
      <div>
        {EDUCATION.map((edu) => (
          <div
            key={edu.school}
            className="border-line flex items-start gap-3 p-4 not-last:border-b"
          >
            <span className="bg-muted border-line flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-semibold">
              {edu.school.split(" ").at(-1)?.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{edu.school}</p>
              <p className="text-sm">{edu.degree}</p>
              <p className="text-muted-foreground font-mono text-xs">{edu.period}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function ComponentsPreview() {
  return (
    <Panel id="components">
      <PanelHeader title="Components" count={COMPONENTS.length} />
      <div className="pt-4">
        <div className="screen-line-bottom h-px" />
        <ComponentList items={COMPONENTS.slice(0, 12)} />
      </div>
      <div className="flex justify-center py-4">
        <Link
          href="/components"
          className="bg-secondary text-secondary-foreground shadow-foreground/20 hover:bg-secondary/80 inline-flex h-8 items-center gap-2 rounded-md pr-2.5 pl-3 text-sm font-medium shadow-[inset_0_0_1px] transition-colors"
        >
          All components
          <RiArrowRightLine className="size-4" aria-hidden />
        </Link>
      </div>
    </Panel>
  )
}

export function BlogPreview() {
  const posts = getPublishedBlogPosts().slice(0, 4)
  if (!posts.length) return null

  return (
    <Panel id="blog">
      <PanelHeader title="Blog" count={posts.length} />
      <div>
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="group border-line hover:bg-muted/50 flex items-center gap-4 p-4 transition-colors not-last:border-b"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{post.data.title}</p>
              {post.data.description && (
                <p className="text-muted-foreground truncate text-sm">{post.data.description}</p>
              )}
            </div>
            <time className="text-muted-foreground shrink-0 font-mono text-xs">
              {new Date(post.data.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </Link>
        ))}
        <Link
          href="/blog"
          className="screen-line-top text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 p-3 text-sm transition-colors"
        >
          All posts <RiArrowRightLine className="size-4" aria-hidden />
        </Link>
      </div>
    </Panel>
  )
}
