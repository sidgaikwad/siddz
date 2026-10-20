import {
  GitHubSkylineDemo,
  IntroLoaderDemo,
  IsometricMarkDemo,
  MarqueeDemo,
  Name3DDemo,
  NumberTickerDemo,
  ParticleSphereDemo,
  SpotlightCardDemo,
  TechGlobeDemo,
  TerminalDemo,
  TextFlipDemo,
} from "@/features/components-showcase/demos"

export type ShowcaseItem = {
  slug: string
  name: string
  description: string
  file: string
  tags: string[]
  usage: string
  features: string[]
  // Draft copy in first person: rewrite each story in your own words.
  story: string[]
  Demo: React.ComponentType
}

export const COMPONENTS: ShowcaseItem[] = [
  {
    slug: "isometric-mark",
    name: "Isometric Mark",
    description:
      "Any word as an isometric, extruded block mark. Outlines light up toward your cursor; press it and the letters sink with a metal click.",
    file: "isometric-mark.tsx",
    tags: ["3D", "svg", "sound"],
    usage: `<IsometricMark text="SIDDZ" className="max-w-[540px]" />`,
    features: [
      "Pure SVG: a block font is projected onto an isometric grid, no WebGL needed.",
      "Only true edges get an outline, so letters read as solid shapes, not stacks of cubes.",
      "Faces are painted back to front, so nearer blocks correctly hide the ones behind.",
      "A radial light on the outlines follows the cursor across the whole page.",
      "Press to sink the letters on a spring, with a CC0 metal click by Kenney.",
    ],
    story: [
      "chanhdai.com opens with an isometric mark of his initials that follows your cursor and clicks when you press it. It was the first detail on any portfolio that made me stop and play.",
      "I wanted the same feeling for SIDD, but generated from a tiny block font instead of drawn by hand, so I can change the word whenever I want.",
    ],
    Demo: IsometricMarkDemo,
  },
  {
    slug: "name-3d",
    name: "3D Name",
    description:
      "Extruded, beveled 3D letters that tilt with the cursor. Click a letter to make it jump and flip, with a synthesized key click.",
    file: "name-3d.tsx",
    tags: ["3D", "three.js", "sound"],
    usage: `<Name3D text="SIDDHARTH" className="h-72 w-full" />`,
    features: [
      "Each letter is its own mesh, built from a typeface font with TextGeometry and a soft bevel.",
      "Two materials per letter: bright faces, darker sides, so the shape reads in both themes.",
      "Click a letter: it jumps, flips a full turn and plays a click pitched to its position.",
      "The click is synthesized with the Web Audio API, so there is no audio file to load.",
      "Contact shadow underneath grounds the word on the page.",
    ],
    story: [
      "The hero is the first thing anyone sees, and I wanted it to be my name, not a decoration. Flat text felt too quiet; a 3D word you can poke felt like me.",
      "The click sound came from wanting the letters to feel like keys on a mechanical keyboard, the thing I touch more than anything else all day.",
    ],
    Demo: Name3DDemo,
  },
  {
    slug: "tech-globe",
    name: "Tech Globe",
    description:
      "A particle globe with spikes radiating out to labels for every skill. Auto-rotates, drag to spin, labels fade with depth.",
    file: "tech-globe.tsx",
    tags: ["3D", "three.js", "data"],
    usage: `<TechGlobe skills={["React", "Rust", "Go"]} className="h-96 w-full" />`,
    features: [
      "Skills are spread evenly over the sphere with a Fibonacci lattice, however many you pass.",
      "All spikes are one line-segments draw call; tips are one points draw call.",
      "Labels are real DOM (crisp text, theme colors) and fade and shrink as they rotate to the back.",
      "Back-facing labels ignore the pointer so they never steal clicks.",
    ],
    story: [
      "My skills list was a wall of tags. Everything had the same weight and nothing invited you to look.",
      "Putting them on a slowly turning globe makes the stack feel like one connected thing, and you discover a few new ones every time it turns.",
    ],
    Demo: TechGlobeDemo,
  },
  {
    slug: "particle-sphere",
    name: "Particle Sphere",
    description:
      "Thousands of points on a sphere, displaced by GPU simplex noise, with orbit rings and depth fade. Follows the theme.",
    file: "particle-sphere.tsx",
    tags: ["3D", "three.js", "shader"],
    usage: `<ParticleSphere className="h-80 w-full" count={6000} />`,
    features: [
      "6,000 points placed evenly with a Fibonacci sphere, no textures or models to download.",
      "Simplex noise runs in the vertex shader, so the motion costs almost nothing on the CPU.",
      "Points fade with depth and tilt toward the cursor for a sense of volume.",
      "Monochrome by default: white on dark, black on light, or pass any color.",
      "Respects prefers-reduced-motion.",
    ],
    story: [
      "My first hero was a row of colorful 3D cubes. It looked like a toy, not like the rest of this site, which is all thin lines and black space.",
      "I wanted something that felt engineered: precise, quiet, and alive. A cloud of points shaped by noise reads like a data visualization rather than a decoration, and writing the shader myself was the fun part.",
    ],
    Demo: ParticleSphereDemo,
  },
  {
    slug: "github-skyline",
    name: "GitHub Skyline",
    description:
      "Your contribution calendar as an orbiting 3D city of bars, rendered with one instanced mesh.",
    file: "github-skyline.tsx",
    tags: ["3D", "three.js", "data"],
    usage: `<GitHubSkyline weeks={weeks} className="h-64 w-full" />`,
    features: [
      "One InstancedMesh draws every day of the year in a single draw call.",
      "Bar height uses a square-root scale so quiet weeks stay visible next to busy ones.",
      "Auto-rotates slowly; drag to orbit.",
      "Takes the same week/day data as the 2D graph, so the two views can be swapped.",
    ],
    story: [
      "A year of commits is a lot of small decisions, and the flat green grid hides how uneven that work really is.",
      "Turning it into a skyline makes the busy stretches stand out at a glance. It also gave me an excuse to learn instanced rendering properly.",
    ],
    Demo: GitHubSkylineDemo,
  },
  {
    slug: "intro-loader",
    name: "Intro Loader",
    description:
      "A full-screen intro: greetings slide through a mask, a counter climbs to 100, then the curtain lifts with a curved edge.",
    file: "intro-loader.tsx",
    tags: ["animation", "page"],
    usage: `<IntroLoader words={["Hello", "Bonjour"]} finale="Your Name" />`,
    features: [
      "Words rise into a masked line and leave upward, timed back to back.",
      "Counter and progress line climb together on an ease-out curve.",
      "Curtain lifts with a curved trailing edge, content drifts up as it fades.",
      "Plays on every fresh page load, but not when you navigate back to the page inside the site.",
      "Skipped entirely with reduced motion.",
    ],
    story: [
      "I kept coming back to studio sites whose intros felt like the opening of a film. I wanted that first second on my site to feel intentional too.",
      "The greetings are the languages I hear around me: Hindi at home in Mumbai, Japanese from the course I am building, and a few more. It ends on my name.",
    ],
    Demo: IntroLoaderDemo,
  },
  {
    slug: "terminal",
    name: "Terminal",
    description: "A macOS-style terminal that types commands and prints their output, on a loop.",
    file: "terminal.tsx",
    tags: ["animation"],
    usage: `<Terminal lines={[{ command: "bun run dev", output: ["ready"] }]} />`,
    features: [
      "Types each command with slightly random timing, so it feels human.",
      "Prints output after a short pause, then moves to the next line.",
      "Loops or stops after the last command.",
      "Auto-scrolls as new lines appear.",
    ],
    story: [
      "I spend most of my day in a terminal, and a lot of my side projects are CLIs and TUIs (PortMan, Termin API, commit-it).",
      "Showing a command run is a faster way to explain a tool than a paragraph of text, so I built a terminal I can drop into any page.",
    ],
    Demo: TerminalDemo,
  },
  {
    slug: "spotlight-card",
    name: "Spotlight Card",
    description: "A card whose border and background glow follow the pointer.",
    file: "spotlight-card.tsx",
    tags: ["interaction"],
    usage: `<SpotlightCard color="rgba(56,189,248,.35)">...</SpotlightCard>`,
    features: [
      "Pointer position is written to CSS variables, so React never re-renders on move.",
      "Glow shows on both the 1px border and the background.",
      "Configurable color and spotlight size.",
    ],
    story: [
      "I like interfaces that respond to you before you click. A light that follows the cursor makes a static grid of cards feel tactile.",
      "Most versions I found re-rendered on every mouse move. Keeping it in CSS variables made it smooth and simple.",
    ],
    Demo: SpotlightCardDemo,
  },
  {
    slug: "text-flip",
    name: "Text Flip",
    description: "Cycles through words with a blur-and-rise transition.",
    file: "text-flip.tsx",
    tags: ["text", "animation"],
    usage: `<TextFlip words={["web apps", "CLIs", "APIs"]} />`,
    features: [
      "Blur, fade and rise in one short keyframe.",
      "Configurable interval.",
      "Announces changes politely to screen readers.",
    ],
    story: [
      "One line is never enough to say what I do. Rotating a few short phrases under my name keeps the header clean and still tells the whole story.",
    ],
    Demo: TextFlipDemo,
  },
  {
    slug: "number-ticker",
    name: "Number Ticker",
    description: "Counts up to a value with an ease-out curve when it scrolls into view.",
    file: "number-ticker.tsx",
    tags: ["text", "data"],
    usage: `<NumberTicker value={1938} />`,
    features: [
      "Starts only when the number scrolls into view.",
      "Ease-out cubic curve, so it lands softly.",
      "Tabular digits so the width does not jump.",
      "Shows the final value immediately with reduced motion.",
    ],
    story: [
      "Numbers like a year of contributions mean more when you see them add up. A small count-up draws the eye without being loud.",
    ],
    Demo: NumberTickerDemo,
  },
  {
    slug: "marquee",
    name: "Marquee",
    description:
      "Infinite horizontal scroller with edge fade, pause on hover and reduced-motion support.",
    file: "marquee.tsx",
    tags: ["layout", "animation"],
    usage: `<Marquee duration={20}>{items}</Marquee>`,
    features: [
      "Pure CSS animation, no JavaScript loop.",
      "Soft fade on both edges with a mask.",
      "Pauses on hover, reverses on demand.",
      "Stops entirely with reduced motion.",
    ],
    story: [
      "My stack list kept growing and a wall of tags was hard to scan. A slow marquee shows everything in one calm line.",
    ],
    Demo: MarqueeDemo,
  },
]

export function getComponent(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug)
}

export function getNeighbors(slug: string) {
  const i = COMPONENTS.findIndex((c) => c.slug === slug)
  return {
    prev: i > 0 ? COMPONENTS[i - 1] : undefined,
    next: i >= 0 && i < COMPONENTS.length - 1 ? COMPONENTS[i + 1] : undefined,
  }
}
