import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { WritingList } from '@/components/writing-list'
import { ProjectGrid } from '@/components/project-grid'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="max-w-[680px] mx-auto px-6">
      <Nav />
      <Hero />
      <div className="space-y-16">
        <WritingList limit={5} />
        <div id="projects">
          <ProjectGrid />
        </div>
      </div>
      <Footer />
    </div>
  )
}
