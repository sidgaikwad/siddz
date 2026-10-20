import { codeToHtml } from "shiki"

import { CopyButton } from "@/features/components-showcase/copy-button"

export async function CodeBlock({
  code,
  lang = "tsx",
  title,
}: {
  code: string
  lang?: string
  title?: string
}) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
  })

  return (
    <div className="border-line overflow-hidden rounded-xl border">
      <div className="border-line bg-muted/40 flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-muted-foreground font-mono text-xs">{title ?? lang}</span>
        <CopyButton value={code} />
      </div>
      <div
        className="max-h-[32rem] overflow-auto text-[13px] [&_pre]:p-4 [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
