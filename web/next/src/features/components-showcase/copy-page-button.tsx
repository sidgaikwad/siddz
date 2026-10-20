"use client"

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { useState } from "react"

export function CopyPageButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(markdown)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="border-line hover:bg-muted flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors"
    >
      {copied ? <RiCheckLine className="size-4" /> : <RiFileCopyLine className="size-4" />}
      {copied ? "Copied" : "Copy page"}
    </button>
  )
}
