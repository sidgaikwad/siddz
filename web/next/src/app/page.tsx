import { IntroLoader } from "@/components/sidd-ui/intro-loader"
import { GitHubContributions } from "@/features/portfolio/components/github-contributions"
import { Overview, SocialLinks } from "@/features/portfolio/components/overview"
import { Separator } from "@/features/portfolio/components/panel"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import { Projects } from "@/features/portfolio/components/projects"
import {
  About,
  BlogPreview,
  ComponentsPreview,
  Education,
  Experiences,
  Footer,
  TechStack,
} from "@/features/portfolio/components/sections"

export default function Home() {
  return (
    <main className="max-w-screen overflow-x-clip px-2 pt-14">
      <IntroLoader />
      <div className="mx-auto md:max-w-3xl [&_[data-slot=panel]]:scroll-mt-22">
        <Separator />
        <ProfileHeader />
        <Separator />

        <Overview />
        <SocialLinks />
        <GitHubContributions />
        <Separator />

        <About />
        <Separator />

        <ComponentsPreview />
        <Separator />

        <TechStack />
        <Separator />

        <Experiences />
        <Separator />

        <Education />
        <Separator />

        <Projects />
        <Separator />

        <BlogPreview />
        <Separator />

        <Footer />
      </div>
    </main>
  )
}
