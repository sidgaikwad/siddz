import { RiArrowRightUpLine, RiArrowUpLine } from "@remixicon/react"
import Link from "next/link"

import { DotMatrixWordmark } from "@/components/sidd-ui/dot-matrix-wordmark"
import { LocalTime } from "@/features/portfolio/components/local-time"
import { PROFILE, SOCIAL_LINKS } from "@/features/portfolio/data/profile"

const NAV = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/components", label: "Components" },
  { href: "/blog", label: "Blog" },
]

const LINK = "text-muted-foreground hover:text-foreground transition-colors"

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-line space-y-3 p-4 max-sm:not-last:border-b sm:not-last:border-r">
      <p className="text-muted-foreground/70 font-mono text-[11px] tracking-widest uppercase">
        {title}
      </p>
      <ul className="space-y-1.5 text-sm">{children}</ul>
    </div>
  )
}

export function Footer() {
  const linkedin = SOCIAL_LINKS.find((s) => s.icon === "linkedin")

  return (
    <footer className="screen-line-top border-line relative border-x">
      <div className="screen-line-bottom flex flex-wrap items-end justify-between gap-4 px-4 py-8">
        <p className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          Have an idea? <span className="text-muted-foreground">Let&apos;s build it.</span>
        </p>
        {linkedin && (
          <a
            href={linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-foreground text-background inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Say hi on LinkedIn
            <RiArrowRightUpLine className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>

      <div className="screen-line-bottom grid sm:grid-cols-3">
        <Column title="Navigate">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className={LINK}>
                {n.label}
              </Link>
            </li>
          ))}
        </Column>
        <Column title="Elsewhere">
          {SOCIAL_LINKS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK} inline-flex items-center gap-1`}
              >
                {s.label}
                <RiArrowRightUpLine className="size-3.5" />
              </a>
            </li>
          ))}
        </Column>
        <Column title="Now">
          <li className="text-muted-foreground font-mono text-xs">
            <LocalTime timeZone={PROFILE.timeZone} seconds />
          </li>
          <li className="text-muted-foreground">{PROFILE.location}</li>
          {PROFILE.openToWork && (
            <li className="text-foreground flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Open to opportunities
            </li>
          )}
        </Column>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 px-4 py-3 font-mono text-[11px]">
        <p>
          © {new Date().getFullYear()} {PROFILE.name} · Built on{" "}
          <a
            href="https://zerostarter.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline decoration-current/30 underline-offset-3"
          >
            ZeroStarter
          </a>{" "}
          · Inspired by{" "}
          <a
            href="https://chanhdai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline decoration-current/30 underline-offset-3"
          >
            chanhdai.com
          </a>
        </p>
        <a
          href="#"
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          Back to top <RiArrowUpLine className="size-3.5" />
        </a>
      </div>

      <div data-drone-light className="relative left-1/2 w-screen -translate-x-1/2 px-2 pt-2">
        <DotMatrixWordmark text="SIDDHARTH" />
      </div>
    </footer>
  )
}
