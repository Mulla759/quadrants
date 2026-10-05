import { CategoriesSection } from "./sections/CategoriesSection"
import { DoneSection } from "./sections/DoneSection"
import { FinalCta } from "./sections/FinalCta"
import { Footer } from "./sections/Footer"
import { Hero } from "./sections/Hero"
import { InspirationSection } from "./sections/InspirationSection"
import { KeyboardSection } from "./sections/KeyboardSection"
import { LocalFirstSection } from "./sections/LocalFirstSection"
import { MapSection } from "./sections/MapSection"
import { Nav } from "./sections/Nav"
import { RoadmapSection } from "./sections/RoadmapSection"
import { TodaySection } from "./sections/TodaySection"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Nav />
      <main>
        <Hero />
        <MapSection />
        <TodaySection />
        <DoneSection />
        <CategoriesSection />
        <KeyboardSection />
        <LocalFirstSection />
        <InspirationSection />
        <RoadmapSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
