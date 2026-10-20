import { RiVerifiedBadgeFill } from "@remixicon/react"

import { IsometricMark } from "@/components/sidd-ui/isometric-mark"
import { TextFlip } from "@/components/sidd-ui/text-flip"
import { PROFILE } from "@/features/portfolio/data/profile"

export function ProfileHeader() {
  return (
    <div className="screen-line-bottom border-line border-x">
      <figure className="border-line relative overflow-hidden border-b px-4 pt-8 pb-10 sm:px-10 sm:pt-10 sm:pb-12">
        <IsometricMark text="SIDDZ" className="mx-auto max-w-[420px]" />
        <figcaption className="text-muted-foreground/60 pointer-events-none absolute right-3 bottom-2 font-mono text-xs">
          Fig. 1
        </figcaption>
        <span className="text-muted-foreground/60 pointer-events-none absolute bottom-2 left-3 font-mono text-[11px] tracking-wide uppercase">
          follows your cursor · click for a sound
        </span>
      </figure>

      <div className="flex">
        <div className="border-line shrink-0 border-r p-1">
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            className="ring-foreground/10 size-24 rounded-full object-cover ring-1 sm:size-36"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-end">
          <div className="border-line flex items-center gap-2 border-t px-3 py-2 sm:px-4">
            <h1 className="text-xl leading-tight font-semibold tracking-tight min-[400px]:text-2xl sm:text-3xl">
              {PROFILE.name}
            </h1>
            <RiVerifiedBadgeFill className="size-5 shrink-0 text-sky-500" aria-label="Verified" />
          </div>
          <div className="border-line flex h-10 items-center border-t px-3 sm:px-4">
            <TextFlip
              words={PROFILE.flipSentences}
              className="text-muted-foreground font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
