import {
  DotMatrixWordmarkDemo,
  GardenDemo,
  AsciiEyeDemo,
  PixelDevDemo,
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
  isNew?: boolean
  features: string[]
  // Draft copy in first person: rewrite each story in your own words.
  story: string[]
  Demo: React.ComponentType
}

export const COMPONENTS: ShowcaseItem[] = [
  {
    slug: "pixel-dev",
    isNew: true,
    name: "Pixel Dev",
    description:
      "A voxel developer in a hoodie typing at a MacBook, with a live code screen, steaming coffee and a plant, rendered as chunky pixel 3D.",
    file: "pixel-dev.tsx",
    tags: ["3D", "three.js", "pixel art"],
    usage: `<PixelDev className="aspect-square w-80" pixelScale={0.34} />`,
    features: [
      "Built entirely from boxes with flat shading, no models or textures to download.",
      "Rendered at about a third of the resolution and scaled up with image-rendering: pixelated.",
      "The laptop screen is a 64 by 40 canvas of syntax-coloured code that scrolls, with a blinking cursor.",
      "Hands type in alternation, the head nods along, steam rises and the camera sways around the desk.",
    ],
    story: [
      "I wanted the loader to show me doing the thing I actually do all day, but small and playful rather than a photo.",
      "Voxels felt right: a little game-like, readable at any size, and very much made by hand.",
    ],
    Demo: PixelDevDemo,
  },
  {
    slug: "ascii-eye",
    isNew: true,
    name: "ASCII Eye",
    description:
      "An almond eye drawn from scrolling text. The iris and pupil follow your cursor, it blinks now and then, and it reports where it is looking.",
    file: "ascii-eye.tsx",
    tags: ["canvas", "interaction", "ascii"],
    usage: `<AsciiEye onStateChange={(s) => console.log(s)} />`,
    features: [
      "Every character is placed on a grid inside an almond mask, so the eye is made of the text it shows.",
      "The pupil eases toward the pointer anywhere on the page, then drifts back to centre when you stop.",
      "Random blinks close the lids, and a live readout prints pupil coordinates and state.",
      "Reports tracking, idle or blinking so a status bar can show what the eye is doing.",
    ],
    story: [
      "hancore.dev has a small ASCII eye that watches you while you browse their projects, and it made the page feel alive.",
      "I wanted my projects section to have that same quiet sense of being seen, built from my own words.",
    ],
    Demo: AsciiEyeDemo,
  },
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
    isNew: true,
    name: "Intro Loader",
    description:
      "A centred boot card: a pixelated voxel developer at a MacBook, greetings that wipe left to right at speed, a counter, then one clean lift into the page.",
    file: "intro-loader.tsx",
    tags: ["animation", "page", "3D"],
    usage: `<IntroLoader words={["Hello", "Bonjour"]} finale="Your Name" />`,
    features: [
      "One GSAP timeline drives the card, words, counter, status and exit, so everything stays in sync.",
      "Each word reveals with a clip-path wipe from the left and leaves through the right in about a quarter second.",
      "The card holds the Pixel Dev voxel scene, rendered at a third of the resolution for crisp hard pixels.",
      "Exit is a single motion: the card drops away, the screen lifts as one panel and the page zooms into focus.",
      "Skip jumps to the reveal. Plays per fresh load and is skipped for reduced motion.",
    ],
    story: [
      "My first intros were big and cinematic, but they felt like they were about the animation, not about me.",
      "I pictured something small and calm in the middle of the screen: a tiny pixel version of me at my laptop, a few fast hellos, and then straight into the work.",
    ],
    Demo: IntroLoaderDemo,
  },
  {
    slug: "dot-matrix-wordmark",
    name: "Dot Matrix Wordmark",
    description:
      "A full-bleed footer wordmark drawn as a field of dots sampled from real type. Dots sweep in on reveal and swell under your cursor.",
    file: "dot-matrix-wordmark.tsx",
    tags: ["canvas", "interaction", "footer"],
    usage: `<DotMatrixWordmark text="SIDDHARTH" gap={7} crop={0.78} />`,
    features: [
      "Text is rasterised once off screen at the exact width, then sampled onto a dot grid, so it fits any viewport edge to edge.",
      "Dots sweep in left to right with a little jitter the first time the footer scrolls into view.",
      "A smoothed spotlight follows the pointer: nearby dots grow and brighten, everything else stays quiet.",
      "Cropped by the bottom edge with a fade mask, the detail most big-wordmark footers skip.",
      "Follows the theme colour, pauses off screen and respects reduced motion.",
    ],
    story: [
      "Big edge-to-edge wordmarks are everywhere in footers right now, and most are just huge text. I wanted mine to belong to this site, which is built out of dot grids and thin lines.",
      "Sampling the letters into dots made the name feel like part of the background pattern, and the cursor spotlight gives you a reason to linger at the bottom of the page.",
    ],
    Demo: DotMatrixWordmarkDemo,
  },
  {
    slug: "garden",
    name: "Garden",
    description:
      "A living strip of grass and wildflowers drawn on canvas. It sways in the wind and parts around your cursor.",
    file: "garden.tsx",
    tags: ["canvas", "interaction"],
    usage: `<Garden height={130} />`,
    features: [
      "Every blade and flower is generated procedurally on a 2D canvas, so there are no images to load.",
      "Two layers of grass with flowers between them give the strip depth.",
      "Layered sine waves make a wind that never quite repeats; blades near the cursor bend away.",
      "Pauses when off screen, caps the pixel ratio at 2, and draws a still frame for reduced motion.",
    ],
    story: [
      "I saw a directory site that ended in a strip of wildflowers and it made the bottom of the page feel like somewhere you arrive, not where the content runs out.",
      "I wanted that for my footer, under my name, but alive and reacting to you instead of a static image.",
    ],
    Demo: GardenDemo,
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
