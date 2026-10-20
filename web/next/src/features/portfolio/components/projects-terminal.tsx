import { Panel, PanelHeader } from "@/features/portfolio/components/panel"
import { type BrowserItem, ProjectBrowser } from "@/features/portfolio/components/project-browser"
import { getRepoStats, getTotalStars, repoSlug } from "@/features/portfolio/data/github-stats"
import { PROFILE, PROJECTS } from "@/features/portfolio/data/profile"

export async function ProjectsTerminal() {
  const [stats, totalStars] = await Promise.all([
    Promise.all(PROJECTS.map((p) => getRepoStats(p.repo))),
    getTotalStars(PROFILE.username),
  ])

  const items: BrowserItem[] = PROJECTS.map((p, i) => {
    const { owner, name } = repoSlug(p.repo)
    return { ...p, owner, slug: name, stats: stats[i] ?? null }
  })

  return (
    <Panel id="projects">
      <PanelHeader title="Projects" count={PROJECTS.length} />
      <ProjectBrowser items={items} totalStars={totalStars} username={PROFILE.username} />
    </Panel>
  )
}
