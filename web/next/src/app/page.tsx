import { IntroLoader } from "@/components/sidd-ui/intro-loader"
import { Architecture } from "@/features/portfolio/components/architecture"
import { Footer } from "@/features/portfolio/components/footer"
import { GitHubContributions } from "@/features/portfolio/components/github-contributions"
import { Overview, SocialLinks } from "@/features/portfolio/components/overview"
import { Separator } from "@/features/portfolio/components/panel"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import { ProjectsTerminal } from "@/features/portfolio/components/projects-terminal"
import {
  About,
  BlogPreview,
  ComponentsPreview,
  Education,
  Experiences,
  TechStack,
} from "@/features/portfolio/components/sections"
import { VoxelLab } from "@/features/portfolio/components/voxel-lab"

export default function Home() {
  return (
    <>
      <IntroLoader />
      <main className="max-w-screen overflow-x-clip px-2 pt-14">
        <div data-intro-page className="mx-auto md:max-w-3xl [&_[data-slot=panel]]:scroll-mt-22">
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

          <ProjectsTerminal />
          <Separator />

          <Architecture />
          <Separator />

          <VoxelLab />
          <Separator />

          <BlogPreview />
          <Separator />

          <Footer />
        </div>
      </main>
    </>
  )
}
