"use client"

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { useState } from "react"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label="Copy code"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1 transition-colors"
    >
      {copied ? <RiCheckLine className="size-4" /> : <RiFileCopyLine className="size-4" />}
    </button>
  )
}
