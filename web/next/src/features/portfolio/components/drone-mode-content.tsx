"use client"

import { RiArrowRightUpLine } from "@remixicon/react"

import {
  DroneExitButton,
  DroneReveal,
  DroneScramble,
  DroneScrollHint,
  DroneSection,
} from "@/components/sidd-ui/drone-mode"
import { LocalTime } from "@/features/portfolio/components/local-time"
import { Tag } from "@/features/portfolio/components/tag"
import {
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  SOCIAL_LINKS,
  TECH_STACK,
} from "@/features/portfolio/data/profile"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{children}</p>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-xs transition-colors"
    >
      {children}
      <RiArrowRightUpLine className="size-3.5" />
    </a>
  )
}

// What the drone's headlight reveals in drone mode, one DroneSection per screen.
export function DroneModeContent() {
  return (
    <>
      <DroneSection label="Hello">
        <DroneReveal>
          <Eyebrow>Transmission 01 · incoming</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text={PROFILE.name}
          className="text-5xl font-bold tracking-tight text-balance lg:text-6xl"
        />
        <DroneReveal index={1}>
          <p className="text-muted-foreground text-lg">
            {PROFILE.role} · {PROFILE.currentWork}
          </p>
        </DroneReveal>
        <DroneReveal index={2}>
          <p className="font-mono text-sm">
            {PROFILE.location} · <LocalTime timeZone={PROFILE.timeZone} />
          </p>
        </DroneReveal>
        <DroneReveal index={3}>
          <DroneScrollHint>Scroll to explore</DroneScrollHint>
        </DroneReveal>
      </DroneSection>

      <DroneSection label="About">
        <DroneReveal>
          <Eyebrow>02 · Pilot profile</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text="Who is flying this thing"
          className="text-4xl font-bold tracking-tight"
        />
        {PROFILE.about.map((p, i) => (
          <DroneReveal key={p} index={i + 1}>
            <p className="text-muted-foreground leading-relaxed">{p}</p>
          </DroneReveal>
        ))}
      </DroneSection>

      <DroneSection label="Experience">
        <DroneReveal>
          <Eyebrow>03 · Flight log</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text="Where I have flown"
          className="text-4xl font-bold tracking-tight"
        />
        <ol className="space-y-4">
          {EXPERIENCES.map((exp, i) => (
            <li key={exp.company + exp.role}>
              <DroneReveal index={i + 1} className="border-l pl-4">
                <p className="flex items-center gap-2 font-medium">
                  {exp.company}
                  {exp.current && (
                    <span className="bg-success size-2 rounded-full motion-safe:animate-pulse" />
                  )}
                </p>
                <p className="text-sm">{exp.role}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {exp.period} · {exp.location}
                </p>
              </DroneReveal>
            </li>
          ))}
        </ol>
      </DroneSection>

      <DroneSection label="Stack">
        <DroneReveal>
          <Eyebrow>04 · Payload</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text="What I build with"
          className="text-4xl font-bold tracking-tight"
        />
        {TECH_STACK.map((group, i) => (
          <DroneReveal key={group.group} index={i + 1} className="space-y-2">
            <p className="text-sm font-medium">{group.group}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </DroneReveal>
        ))}
      </DroneSection>

      <DroneSection label="Projects">
        <DroneReveal>
          <Eyebrow>05 · Missions</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text="Things I have shipped"
          className="text-4xl font-bold tracking-tight"
        />
        <ul className="space-y-4">
          {PROJECTS.slice(0, 4).map((project, i) => (
            <li key={project.name}>
              <DroneReveal
                index={i + 1}
                className="bg-background/60 space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className="text-muted-foreground font-mono text-xs">{project.year}</span>
                </div>
                <p className="text-muted-foreground text-sm">{project.description}</p>
                <div className="flex gap-4">
                  <ExternalLink href={project.repo}>Code</ExternalLink>
                  {project.url && <ExternalLink href={project.url}>Live</ExternalLink>}
                </div>
              </DroneReveal>
            </li>
          ))}
        </ul>
      </DroneSection>

      <DroneSection label="Contact">
        <DroneReveal>
          <Eyebrow>06 · Open channel</Eyebrow>
        </DroneReveal>
        <DroneScramble
          as="h2"
          text="Have an idea? Let's build it."
          className="text-4xl font-bold tracking-tight text-balance"
        />
        <DroneReveal index={1} className="flex flex-wrap gap-4">
          {SOCIAL_LINKS.map((s) => (
            <ExternalLink key={s.label} href={s.href}>
              {s.label} {s.handle}
            </ExternalLink>
          ))}
        </DroneReveal>
        <DroneReveal index={2}>
          <DroneExitButton>Land the drone</DroneExitButton>
        </DroneReveal>
      </DroneSection>
    </>
  )
}
