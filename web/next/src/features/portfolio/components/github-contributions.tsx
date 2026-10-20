import type { SkylineDay } from "@/components/sidd-ui/github-skyline"
import { ContributionsView } from "@/features/portfolio/components/contributions-view"
import { Panel, PanelContent } from "@/features/portfolio/components/panel"
import { PROFILE } from "@/features/portfolio/data/profile"

async function getContributions() {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${PROFILE.username}?y=last`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      total: { lastYear: number }
      contributions: SkylineDay[]
    }
    return { total: data.total.lastYear, days: data.contributions }
  } catch {
    return null
  }
}

function toWeeks(days: SkylineDay[]) {
  const weeks: (SkylineDay | null)[][] = []
  const firstDow = new Date(`${days[0]?.date}T00:00:00Z`).getUTCDay()
  let week: (SkylineDay | null)[] = Array.from({ length: firstDow }, () => null)
  for (const day of days) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) weeks.push(week)
  return weeks
}

export async function GitHubContributions() {
  const data = await getContributions()
  if (!data) return null

  return (
    <Panel>
      <h2 className="sr-only">GitHub contributions</h2>
      <PanelContent>
        <ContributionsView
          weeks={toWeeks(data.days)}
          total={data.total}
          username={PROFILE.username}
        />
      </PanelContent>
    </Panel>
  )
}
