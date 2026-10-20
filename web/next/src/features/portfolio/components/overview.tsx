import {
  RiArrowRightUpLine,
  RiBriefcase4Line,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMapPin2Line,
  RiTimeLine,
} from "@remixicon/react"

import { LocalTime } from "@/features/portfolio/components/local-time"
import { Panel, PanelContent } from "@/features/portfolio/components/panel"
import { PROFILE, SOCIAL_LINKS } from "@/features/portfolio/data/profile"

const SOCIAL_ICONS = { github: RiGithubFill, linkedin: RiLinkedinBoxFill }

function InfoItem({
  icon: Icon,
  children,
}: {
  icon: typeof RiTimeLine
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="bg-muted/60 border-line flex size-7 shrink-0 items-center justify-center rounded-md border">
        <Icon className="text-muted-foreground size-4" aria-hidden />
      </span>
      {children}
    </li>
  )
}

export function Overview() {
  return (
    <Panel>
      <h2 className="sr-only">Overview</h2>
      <PanelContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          <InfoItem icon={RiBriefcase4Line}>{PROFILE.currentWork}</InfoItem>
          <InfoItem icon={RiMapPin2Line}>{PROFILE.location}</InfoItem>
          <InfoItem icon={RiTimeLine}>
            <LocalTime timeZone={PROFILE.timeZone} />
          </InfoItem>
          {PROFILE.openToWork && (
            <li className="flex items-center gap-3 text-sm">
              <span className="flex size-7 items-center justify-center">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
              </span>
              Open to new opportunities
            </li>
          )}
        </ul>
      </PanelContent>
    </Panel>
  )
}

export function SocialLinks() {
  return (
    <Panel>
      <h2 className="sr-only">Social links</h2>
      <div className="grid sm:grid-cols-2">
        {SOCIAL_LINKS.map((link) => {
          const Icon = SOCIAL_ICONS[link.icon]
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-line hover:bg-muted/50 flex items-center gap-3 p-4 transition-colors max-sm:not-last:border-b sm:not-last:border-r"
            >
              <Icon className="size-8 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{link.label}</p>
                <p className="text-muted-foreground truncate text-sm">{link.handle}</p>
              </div>
              <RiArrowRightUpLine
                className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          )
        })}
      </div>
    </Panel>
  )
}
