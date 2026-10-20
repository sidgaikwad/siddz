"use client"

import { features, site } from "@packages/config/site"
import { RiGithubFill } from "@remixicon/react"
import { cn } from "cn"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ModeToggle } from "@/components/common/mode-toggle"

const navLinks = [
  { href: "/#about", label: "About", hideOnMobile: true },
  { href: "/#projects", label: "Projects" },
  { href: "/components", label: "Components" },
  ...(features.blog ? [{ href: "/blog", label: "Blog" }] : []),
]

export function Navbar() {
  const pathname = usePathname()

  if (pathname?.startsWith("/console") || pathname?.startsWith("/dashboard")) return null

  return (
    <header className="bg-background/80 fixed top-0 left-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 md:max-w-3xl md:border-x">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-md text-xs">
            SG
          </span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <nav
            aria-label="Main navigation"
            className="mr-2 flex items-center gap-3 text-sm sm:gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors",
                  "hideOnMobile" in link && link.hideOnMobile && "max-sm:hidden",
                  pathname?.startsWith(link.href) && link.href !== "/"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {site.social.github && (
            <a
              href={site.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-md transition-colors"
            >
              <RiGithubFill className="size-4" />
            </a>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
