// Single source for everything the home page shows. Edit this file to update the portfolio.

export const PROFILE = {
  name: "Siddharth Gaikwad",
  username: "sidgaikwad",
  avatar: "https://avatars.githubusercontent.com/u/48375212?v=4",
  role: "Full Stack Engineer",
  currentWork: "Member of Technical Staff at Carbon",
  location: "Mumbai, India",
  timeZone: "Asia/Kolkata",
  openToWork: true,
  flipSentences: [
    "Full Stack Engineer",
    "TypeScript, React & Node.js",
    "Exploring Rust and Go",
    "Building things people actually use",
  ],
  about: [
    "Hey, I'm Sidd, a full stack engineer from Mumbai. I'm a Member of Technical Staff at Carbon Manufacturing Systems, and before that I was a founding engineer at vly.ai (YC F24) and shipped full stack products at VendorBay, LabelBlind and Algoocean.",
    "Most of my work lives in TypeScript across React, Next.js and Node.js, backed by PostgreSQL and Redis. On the side I build developer tools (TUIs, CLIs, starters, a gamified course platform) and spend my evenings with Rust and Go.",
    "Fun fact: console.log debugger, unashamed.",
  ],
}

export const SOCIAL_LINKS = [
  { label: "GitHub", handle: "@sidgaikwad", href: "https://github.com/sidgaikwad", icon: "github" },
  {
    label: "LinkedIn",
    handle: "siddharth-gaikwad",
    href: "https://www.linkedin.com/in/siddharth-gaikwad-720497205/",
    icon: "linkedin",
  },
] as const

export const TECH_STACK = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Rust", "Go", "Python", "SQL"] },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Vite", "shadcn/ui"] },
  {
    group: "Backend",
    items: [
      "Node.js",
      "Express",
      "Hono",
      "Bun",
      "gRPC",
      "PostgreSQL",
      "Redis",
      "MongoDB",
      "Prisma",
      "Drizzle",
    ],
  },
  {
    group: "Tools",
    items: ["Docker", "GitHub Actions", "Turborepo", "Vercel", "Netlify", "Linux"],
  },
]

export type Experience = {
  company: string
  role: string
  period: string
  location: string
  current?: boolean
  points?: string[]
  skills?: string[]
}

// From LinkedIn. Add `points` (what you built, impact) and `skills` per role when ready.
export const EXPERIENCES: Experience[] = [
  {
    company: "Carbon Manufacturing Systems",
    role: "Member of Technical Staff",
    period: "May 2026 - Present",
    location: "United States (Remote)",
    current: true,
  },
  {
    company: "VendorBay Technology",
    role: "Software Engineer",
    period: "Mar 2026 - Apr 2026",
    location: "Toronto, Canada (Remote)",
  },
  {
    company: "vly.ai (YC F24)",
    role: "Founding Engineer",
    period: "Dec 2025 - Jan 2026",
    location: "San Francisco Bay Area (Remote)",
  },
  {
    company: "LabelBlind",
    role: "Full Stack Developer",
    period: "Aug 2024 - Aug 2025",
    location: "Mumbai, India",
  },
  {
    company: "Algoocean Technologies",
    role: "Associate Software Engineer",
    period: "Aug 2023 - Jul 2024",
    location: "Ulhasnagar, India",
  },
]

export const EDUCATION = [
  {
    school: "University of Mumbai",
    degree: "Bachelor of Engineering, Information Technology",
    period: "2021 - 2024",
  },
]

export type Project = {
  name: string
  description: string
  repo: string
  url?: string
  stack: string[]
  year: string
}

export const PROJECTS: Project[] = [
  {
    name: "Be Better Dev",
    description:
      "Courses you study like a game: spaced review, streaks, XP and badges. Three courses and 561 lessons, starting with Rust: Zero to Production. Built on ZeroStarter.",
    repo: "https://github.com/sidgaikwad/be-better-dev",
    url: "https://be-better-dev-next.vercel.app",
    stack: ["Next.js", "Hono", "PostgreSQL", "Better Auth"],
    year: "2026",
  },
  {
    name: "Kotoba",
    description:
      "Offline-first macOS language tutor built around register: knowing which version of a sentence to use with which person. First course: Japanese for software engineers.",
    repo: "https://github.com/sidgaikwad/kotoba",
    stack: ["TypeScript", "macOS", "Offline-first"],
    year: "2026",
  },
  {
    name: "siddcn",
    description: "A component library website with docs, in the spirit of shadcn/ui.",
    repo: "https://github.com/sidgaikwad/siddcn",
    url: "https://siddcn-website.vercel.app",
    stack: ["Next.js", "Tailwind CSS", "MDX"],
    year: "2026",
  },
  {
    name: "Termin API",
    description:
      "Postman for the terminal: a TUI API client with REST, GraphQL and WebSocket support and persistent collections.",
    repo: "https://github.com/sidgaikwad/triggr",
    stack: ["TypeScript", "OpenTUI", "Bun"],
    year: "2026",
  },
  {
    name: "PortMan",
    description:
      "A terminal UI for managing ports: search by port, process or PID, kill processes, find free ports and watch active connections.",
    repo: "https://github.com/sidgaikwad/portman",
    stack: ["TypeScript", "TUI", "Node.js"],
    year: "2026",
  },
  {
    name: "papercraft",
    description:
      "Fast, production-ready PDF generation from HTML using a pre-warmed Chrome pool: about 10x faster than vanilla Puppeteer with 70% less memory.",
    repo: "https://github.com/sidgaikwad/papercraft",
    stack: ["TypeScript", "Puppeteer", "Node.js"],
    year: "2026",
  },
  {
    name: "GitHub Issue Analyzer",
    description:
      "Express service that fetches and caches a repo's open issues, then answers natural-language questions about them with Claude.",
    repo: "https://github.com/sidgaikwad/github-issue-analyzer",
    stack: ["TypeScript", "Express", "Claude API"],
    year: "2026",
  },
  {
    name: "commit-it",
    description:
      "Interactive CLI for writing conventional commits fast, with quick mode and smart type detection.",
    repo: "https://github.com/sidgaikwad/commit-it",
    stack: ["JavaScript", "CLI"],
    year: "2026",
  },
  {
    name: "Algo Stream",
    description:
      "Full stack Twitch clone with RTMP/WHIP livestreaming, ingress generation, live chat and Stripe.",
    repo: "https://github.com/sidgaikwad/Algo-Stream",
    url: "https://algo-stream.vercel.app",
    stack: ["Next.js 14", "Prisma", "MySQL", "Tailwind CSS"],
    year: "2024",
  },
  {
    name: "Rust CRUD API",
    description: "A CRUD REST API written in Rust while learning ownership, async and concurrency.",
    repo: "https://github.com/sidgaikwad/rust-crud-api",
    stack: ["Rust"],
    year: "2025",
  },
  {
    name: "Redis in Go",
    description: "A from-scratch Redis-style key-value server in Go, alongside gRPC experiments.",
    repo: "https://github.com/sidgaikwad/redis-in-go",
    stack: ["Go", "Networking"],
    year: "2025",
  },
]
