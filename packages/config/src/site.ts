// Brand identity for this app: the single source a fork edits to rebrand. web reads it via lib/config.ts.
export const site = {
  name: "Siddharth Gaikwad",
  description:
    "Full stack engineer from Mumbai building developer tools with TypeScript, React, Node.js, Rust and Go.",
  tagline: "Full Stack Engineer",
  social: {
    discord: "",
    github: "https://github.com/sidgaikwad",
    x: "",
  },
  // Local-only dev agent identity (api/hono agents router).
  agent: {
    name: "LocalAgent",
    email: "agent@local.host",
  },
  // Injectable long-form text blocks. A product sets its own, or leaves them empty.
  apiReferenceDescription: "",
  llmsFullPreamble: "",
} as const

export type Site = typeof site

// Optional surfaces a fork enables or disables. Typed boolean (not `as const`) so a fork can flip them and the runtime gates are not dead code. Off means the routes 404 and the links, nav, sitemap, llms, and search drop the surface. waitlist off makes the home a plain landing page.
export const features = {
  allowlist: false,
  apiDocs: false,
  blog: true,
  docs: false,
  internalDocs: false,
  waitlist: false,
}

export type Feature = keyof typeof features
