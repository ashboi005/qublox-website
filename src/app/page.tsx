import { About } from '@/components/sections/About'
import { Community } from '@/components/sections/Community'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Media } from '@/components/sections/Media'
import { Team } from '@/components/sections/Team'
import { Machine } from '@/components/sections/Machine'
import { BackgroundController } from '@/components/chrome/BackgroundController'
import { Header } from '@/components/chrome/Header'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { CubeCursor } from '@/components/ui/CubeCursor'
import { Grain } from '@/components/ui/Grain'
import { Vignette } from '@/components/ui/Vignette'
import { getSiteContent } from '@/sanity/lib/content'

export default async function Page() {
  const { settings, services, projects, team, events } = await getSiteContent()

  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <BackgroundController />
      <Header />
      <CubeCursor />
      <Grain />
      <Vignette />

      <main id="main">
        {/* CH 01 — the signal arrives */}
        <Hero settings={settings} services={services} />
        {/* CH 02 — the caption */}
        <About settings={settings} services={services} />
        {/* CH 03 — the camera runs */}
        <Media projects={projects} />
        {/* CH 04 — the machine, cold start to running */}
        <Machine settings={settings} />
        {/* CH 05 — the crew */}
        <Team team={team} />
        {/* CH 06 — the room */}
        <Community settings={settings} events={events} />
        {/* CH 07 — the reply */}
        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />
    </SmoothScroll>
  )
}
