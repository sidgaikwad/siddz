"use client"

import { RiArrowDownSLine, RiArrowRightUpLine, RiGithubFill } from "@remixicon/react"
import { cn } from "cn"
import { useState } from "react"

import { Panel, PanelHeader } from "@/features/portfolio/components/panel"
import { Tag } from "@/features/portfolio/components/tag"
import { PROJECTS } from "@/features/portfolio/data/profile"

const INITIAL = 5

export function Projects() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? PROJECTS : PROJECTS.slice(0, INITIAL)

  return (
    <Panel id="projects">
      <PanelHeader title="Projects" count={PROJECTS.length} />
      <div>
        {visible.map((project) => (
          <article key={project.name} className="border-line space-y-2 p-4 not-last:border-b">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-muted-foreground font-mono text-xs">{project.year}</p>
              </div>
              <div className="flex items-center gap-1">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} live site`}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
                  >
                    <RiArrowRightUpLine className="size-4" />
                  </a>
                )}
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name} on GitHub`}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
                >
                  <RiGithubFill className="size-4" />
                </a>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </article>
        ))}
        {PROJECTS.length > INITIAL && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="screen-line-top text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-1 p-3 text-sm transition-colors"
          >
            {expanded ? "Show less" : `Show ${PROJECTS.length - INITIAL} more`}
            <RiArrowDownSLine
              className={cn("size-4 transition-transform", expanded && "rotate-180")}
              aria-hidden
            />
          </button>
        )}
      </div>
    </Panel>
  )
}
