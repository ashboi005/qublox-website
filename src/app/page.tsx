import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Clapperboard } from '@/components/media/Clapperboard'
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
  const { settings, services, projects, team } = await getSiteContent()

  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <BackgroundController />
      <Header channels={settings.channels} />
      <CubeCursor />
      <Grain />
      <Vignette />
      {/* the slate claps CH 03 open, across the seam rather than in it */}
      <Clapperboard copy={settings.media} />

      <main id="main">
        {/* CH 01 — the signal arrives */}
        <Hero settings={settings} />
        {/* CH 02 — the caption */}
        <About settings={settings} services={services} />
        {/* CH 03 — the camera runs */}
        <Media projects={projects} copy={settings.media} />
        {/* CH 04 — the machine, cold start to running */}
        <Machine settings={settings} />
        {/* CH 05 — the crew */}
        <Team team={team} copy={settings.team} />
        {/* CH 06 — the reply */}
        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />
    </SmoothScroll>
  )
}
