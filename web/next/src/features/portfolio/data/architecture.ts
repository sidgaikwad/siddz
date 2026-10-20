import type { DiagramDef } from "@/components/sidd-ui/drilldown-diagram"

// How this portfolio actually works. Click-through tree used by the Architecture section.
export const ARCHITECTURE: DiagramDef[] = [
  {
    id: "system",
    title: "System",
    description: "The whole site end to end. Dashed nodes open their own diagram.",
    code: `flowchart LR
  user(["Visitor"]) --> edge["Vercel edge"]
  edge --> app["Next.js 16 app"]
  app --> gh[("GitHub API")]
  app --> mdx[["MDX blog · Fumadocs"]]
  repo["GitHub repo · siddz"] --> ci["Deploy pipeline"]
  ci --> edge`,
    drill: { app: "app", gh: "projects", ci: "deploy" },
  },
  {
    id: "app",
    title: "Next.js app",
    description:
      "App Router on ZeroStarter. Only the web app is deployed; the Hono API is not needed for the portfolio.",
    code: `flowchart TD
  layout["Root layout · navbar · theme"] --> home["Home page"]
  layout --> comps["Components"]
  layout --> blog["Blog · MDX"]
  home --> intro["Intro loader"]
  home --> sections["11 sections"]
  comps --> detail["Component pages"]`,
    drill: { home: "home", comps: "components", intro: "intro", sections: "home" },
  },
  {
    id: "home",
    title: "Home page",
    description: "Every section on the home page, top to bottom.",
    code: `flowchart TB
  subgraph top["Above the fold"]
    direction LR
    hero["Isometric SIDDZ"] --> overview["Overview"] --> contrib["Contributions"]
  end
  subgraph mid["Content"]
    direction LR
    about["About"] --> compsP["Components"] --> stack["Tech globe"] --> exp["Experience"]
  end
  subgraph low["Work"]
    direction LR
    projects["Projects terminal"] --> blogP["Blog"] --> footer["Dot-matrix footer"]
  end
  top --> mid --> low`,
    drill: { contrib: "contrib", compsP: "components", projects: "projects" },
  },
  {
    id: "projects",
    title: "Projects data",
    description: "Live GitHub stats are fetched on the server and cached for a day.",
    code: `sequenceDiagram
  participant S as ProjectsTerminal (server)
  participant G as GitHub REST
  participant B as ProjectBrowser (client)
  S->>G: GET /repos/sidgaikwad/:repo
  S->>G: GET /commits?per_page=1
  Note right of G: Link header "last" page = commit count
  S->>G: GET /users/sidgaikwad/repos
  G-->>S: stars, forks, dates (revalidate 24h)
  S->>B: items + total stars
  B->>B: wheel, arrow keys, typed terminal
  Note over B: ASCII eye strings track the selection`,
  },
  {
    id: "contrib",
    title: "Contributions",
    code: `flowchart LR
  api["contributions API"] --> weeks["toWeeks()"]
  weeks --> grid["2D grid"]
  weeks --> sky["3D skyline · one InstancedMesh"]
  sky --> zoom["Zoom buttons · wheel after click"]`,
  },
  {
    id: "components",
    title: "Components",
    code: `flowchart LR
  registry["registry.ts"] --> demos["demos.tsx"]
  registry --> list["List · /components"]
  registry --> show["Showcase"]
  registry --> page["Component page"]
  page --> src["Source via shiki"]
  page --> nav["Sidebar + TOC"]`,
  },
  {
    id: "intro",
    title: "Intro loader",
    code: `flowchart LR
  tl["GSAP timeline"] --> card["Boot card"]
  card --> pixel["Pixel Dev · voxels"]
  tl --> words["Wipe words"]
  tl --> counter["Counter + status"]
  tl --> exit["One lift + page zoom"]
  bg["Dev terminals"] -.-> card`,
  },
  {
    id: "deploy",
    title: "Deploy pipeline",
    description: "What happens between a commit and the live site.",
    code: `flowchart LR
  commit["Commit on canary"] --> hooks["lefthook · oxfmt · oxlint · build · commitlint"]
  hooks --> push["Push canary + main"]
  push --> vercel["Vercel build · bun + turbo"]
  vercel --> prod(["siddz-delta.vercel.app"])
  push --> preview["canary preview URL"]`,
  },
]
