export type RepoStats = {
  stars: number
  forks: number
  watchers: number
  commits: number | null
  language: string | null
  license: string | null
  sizeKb: number
  branch: string
  createdAt: string
  pushedAt: string
}

const DAY = 86400

function headers(): HeadersInit {
  // Optional: unauthenticated GitHub allows 60 requests an hour, a token raises it to 5,000.
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export function repoSlug(url: string) {
  const [, owner, name] = new URL(url).pathname.split("/")
  return { owner: owner!, name: name! }
}

async function commitCount(owner: string, name: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=1`, {
    headers: headers(),
    next: { revalidate: DAY },
  })
  if (!res.ok) return null
  const last = res.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/)?.[1]
  if (last) return Number(last)
  const body = (await res.json()) as unknown[]
  return body.length
}

export async function getRepoStats(url: string): Promise<RepoStats | null> {
  const { owner, name } = repoSlug(url)
  try {
    const [res, commits] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${name}`, {
        headers: headers(),
        next: { revalidate: DAY },
      }),
      commitCount(owner, name),
    ])
    if (!res.ok) return null
    const d = (await res.json()) as {
      stargazers_count: number
      forks_count: number
      subscribers_count: number
      language: string | null
      license: { spdx_id: string } | null
      size: number
      default_branch: string
      created_at: string
      pushed_at: string
    }
    return {
      stars: d.stargazers_count,
      forks: d.forks_count,
      watchers: d.subscribers_count,
      commits,
      language: d.language,
      license: d.license?.spdx_id && d.license.spdx_id !== "NOASSERTION" ? d.license.spdx_id : null,
      sizeKb: d.size,
      branch: d.default_branch,
      createdAt: d.created_at.slice(0, 10),
      pushedAt: d.pushed_at.slice(0, 10),
    }
  } catch {
    return null
  }
}

export async function getTotalStars(username: string) {
  let total = 0
  for (let page = 1; page <= 5; page++) {
    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=owner`,
        { headers: headers(), next: { revalidate: DAY } },
      )
      if (!res.ok) return total || null
      const repos = (await res.json()) as { stargazers_count: number; fork: boolean }[]
      total += repos.filter((r) => !r.fork).reduce((sum, r) => sum + r.stargazers_count, 0)
      if (repos.length < 100) break
    } catch {
      return total || null
    }
  }
  return total
}
