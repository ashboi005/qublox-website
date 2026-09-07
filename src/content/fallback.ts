import type { SiteContent } from '@/types/content'

/**
 * The site ships with a full set of content so it runs the moment you clone it.
 * Every field maps 1:1 to a Sanity document, so switching the CMS on replaces
 * this file's role without touching a single component.
 */
export const fallbackContent: SiteContent = {
  settings: {
    tagline: 'A production house and a software studio, under one roof.',
    channels: [
      { id: 'hero', label: 'CH 01', name: 'SIGNAL' },
      { id: 'about', label: 'CH 02', name: 'STUDIO' },
      { id: 'work', label: 'CH 03', name: 'MEDIA' },
      { id: 'tech', label: 'CH 04', name: 'TECH' },
      { id: 'team', label: 'CH 05', name: 'CREW' },
      { id: 'contact', label: 'CH 06', name: 'CONTACT' },
    ],
    email: 'qbloxhq@gmail.com',
    location: 'Amritsar, IN — 31.63°N 74.87°E',
    socials: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'YouTube', href: 'https://youtube.com' },
      { label: 'LinkedIn', href: 'https://linkedin.com' },
    ],

    hero: {
      marquee: [
        'SHORT FILMS',
        'ADS + CAMPAIGNS',
        'CUSTOM SOFTWARE',
        'AI AGENTS',
        'POST + MOTION',
        'INTERACTIVE',
      ],
      broadcasts: [
        'PRODUCTION',
        'MEDIA HOUSE',
        'TECH HOUSE',
        'SHORT FILM',
        'ADS',
        'CUSTOM SOFTWARE',
        'AI AGENTS',
        'POST + VFX',
        'CAMPAIGNS',
      ],
      serial: 'NDFR-00 NMB 00001',
      established: 'EST. 2025',
      scrollCue: '↓ SCROLL TO TUNE',
      tvBrand: 'QUBLOX',
      tvModel: 'MODEL QX-CRT · SOLID STATE · 1984',
      tvChannel: 'VHF',
    },

    about: {
      eyebrow: 'CH 02 — STUDIO',
      kicker: 'WHAT WE ARE',
      lead: 'Qublox makes the film and builds the thing the film is about.',
      // The two verbs are the whole proposition, so they get the two brand
      // colours; "film" gets the marker because it is the word people arrive
      // looking for.
      highlights: [
        { word: 'makes', color: 'red' },
        { word: 'builds', color: 'blue' },
        { word: 'film', color: 'yellow' },
      ],
      body: [
        'Most work needs both halves and gets them from two suppliers who have never met. A campaign arrives with no product behind it; a product ships with a screen recording for a launch film. We run a shoot floor and an engineering team in the same building, so the ad, the short film and the software it is selling are made by people who talk to each other daily.',
        'We do not do social media management. We direct, shoot, cut and grade — and we write production software, custom platforms and AI agents that actually go live.',
      ],
      servicesTitle: 'What we make',
    },

    media: {
      slateProduction: 'QUBLOX',
      slateDirector: 'R. MENON',
      eyebrow: 'CH 03 — MEDIA',
      yearRange: '2023 — 2025',
      recLabel: 'REC',
      formatLabel: '24 FPS · 16MM',
    },

    machine: {
      bootLines: [
        'QUBLOX BIOS v2.6.1 — (C) 1984, 2026',
        '',
        'CPU ............. QX-9 @ 4.77 MHz      [ OK ]',
        'MEMORY .......... 655,360 BYTES        [ OK ]',
        'DISPLAY ......... CGA 640x200          [ OK ]',
        'TAPE DECK ....... NOT PRESENT          [ -- ]',
        '',
        'MOUNTING /dev/phosphor ................. DONE',
        'LOADING SYSTEMS MANIFEST ............... DONE',
        '',
        'STARTING QUBLOX/DOS ...',
      ],
      command: 'type capabilities.txt',
      fileName: 'CAPABILITIES.TXT',
      intro: 'Everything below runs on real client work, in production, today. No lab demos.',
      errorTitle: 'QUBLOX.EXE',
      errorLines: [
        'Cannot enumerate capabilities from the shell.',
        'Read CAPABILITIES.TXT directly instead?',
      ],
      icons: [
        { label: 'CAPABILITIES.TXT', kind: 'doc' },
        { label: 'QUBLOX.EXE', kind: 'app' },
        { label: 'REEL_2025.AVI', kind: 'film' },
      ],
      modules: [
        {
          _id: 'mod-software',
          code: 'SWE',
          name: 'CUSTOM SOFTWARE',
          status: 'ONLINE',
          lines: [
            'Bespoke platforms, internal tools, and the systems under them.',
            'TypeScript, Go, Postgres. Deployed on infrastructure we hand over.',
            'Built to be maintained by your team, not held hostage by ours.',
          ],
        },
        {
          _id: 'mod-agents',
          code: 'AGT',
          name: 'AI AGENTS',
          status: 'ONLINE',
          lines: [
            'Agentic systems that do a defined job end to end and log what they did.',
            'Retrieval, tool use, evaluation harnesses, human review where it matters.',
            'Scoped to a measurable outcome — never a chatbot for its own sake.',
          ],
        },
        {
          _id: 'mod-production',
          code: 'PRD',
          name: 'FILM PRODUCTION',
          status: 'ONLINE',
          lines: [
            'Development through delivery: script, board, crew, location, shoot.',
            'Large-format and anamorphic capture, on-set colour management.',
            'Short films, brand films and commercials, at broadcast spec.',
          ],
        },
        {
          _id: 'mod-post',
          code: 'PST',
          name: 'POST + VFX',
          status: 'STABLE',
          lines: [
            'Offline, online, grade and finish under one schedule.',
            'Houdini and Nuke for anything the camera cannot be talked into.',
            'Delivered in every ratio and codec the media plan actually needs.',
          ],
        },
      ],
    },

    team: {
      eyebrow: 'CH 05 — CREW',
      note: 'IDENTIFICATION ON DEMAND',
      scanner: 'NEXUS 9 SRS',
      authorisation:
        'Authorisation granted to the above operator to direct, build and ship work on behalf of Qublox, and to argue with anyone who says it cannot be done in the time available.',
      agency: 'QUBLOX',
      cardFooter: 'PROPERTY OF QUBLOX',
    },

    community: {
      lead: 'ERISED is our open room. Once a month we clear the studio, put something unfinished on the projector, and argue about it.',
      eventsEyebrow: 'ERISED / EVENTS',
      openNote: 'OPEN TO ALL',
      closing: 'Nothing is ticketed and nothing is filmed.',
      closingLinkLabel: 'Ask to be on the list.',
    },

    contact: {
      eyebrow: 'CH 06 — CONTACT',
      replyNote: 'REPLY WITHIN 2 WORKING DAYS',
      title: 'Start a signal',
      lead: 'Tell us what you are making — a film, a platform, or both. We answer every message ourselves, usually within two working days.',
      budgets: ['Under ₹5L', '₹5–15L', '₹15–40L', '₹40L+', 'Not sure yet'],
      successTitle: 'Message received.',
      successBody:
        'It went straight to a person, not a queue. You will hear back within two working days.',
    },

    footer: {
      serial: 'IDENTIFICATION NUMBER 06746HDFGFS634523 64',
      backToTop: '↑ BACK TO CH 01',
    },
  },

  services: [
    {
      _id: 'svc-films',
      title: 'Short Films',
      marquee: 'SHORT FILMS',
      description:
        'Original and branded short-form, developed with you from the first draft and shot properly — crew, kit, locations, the whole unit.',
      capabilities: ['Development', 'Direction', 'Production', 'Finish'],
    },
    {
      _id: 'svc-ads',
      title: 'Ads & Campaigns',
      marquee: 'ADS + CAMPAIGNS',
      description:
        'Commercials and campaign films that are made, not assembled from stock. One idea, cut for every place it has to run.',
      capabilities: ['Concept', 'Film', 'Edit', 'Delivery'],
    },
    {
      _id: 'svc-software',
      title: 'Custom Software',
      marquee: 'CUSTOM SOFTWARE',
      description:
        'Platforms, tools and product surfaces built to spec by the engineers who will still be reachable after launch.',
      capabilities: ['Product', 'Engineering', 'Infrastructure', 'Handover'],
    },
    {
      _id: 'svc-agents',
      title: 'AI Agents',
      marquee: 'AI AGENTS',
      description:
        'Agentic systems scoped to a job with a number attached to it, with evaluation and human review built in from the start.',
      capabilities: ['Scoping', 'Retrieval', 'Tooling', 'Evaluation'],
    },
    {
      _id: 'svc-post',
      title: 'Post & Motion',
      marquee: 'POST + MOTION',
      description:
        'Edit, VFX, grade and motion design, run on the same schedule as the shoot instead of bolted on after it.',
      capabilities: ['Edit', 'VFX', 'Grade', 'Motion'],
    },
    {
      _id: 'svc-interactive',
      title: 'Interactive',
      marquee: 'INTERACTIVE',
      description:
        'Realtime web, configurators and installations — the places where the film and the software stop being separate things.',
      capabilities: ['WebGL', 'Realtime', 'Installation', 'Web'],
    },
  ],

  projects: [
    {
      _id: 'prj-halcyon',
      title: 'Ninety Seconds',
      client: 'Halcyon',
      year: '2025',
      discipline: 'Short Film',
      blurb: 'A single-take short shot on the factory floor it was written about.',
      anchor: 0.08,
      side: 'above',
      imageUrl: null,
      plate: { hue: 168, variant: 'bars' },
    },
    {
      _id: 'prj-nullform',
      title: 'Nullform Console',
      client: 'Nullform Audio',
      year: '2025',
      discipline: 'Software',
      blurb: 'The mixing platform, and the launch film that shows it working.',
      anchor: 0.24,
      side: 'below',
      imageUrl: null,
      plate: { hue: 292, variant: 'waveform' },
    },
    {
      _id: 'prj-monolith',
      title: 'Monolith',
      client: 'Aster Group',
      year: '2024',
      discipline: 'Campaign',
      blurb: 'A film, nine metres of LED, and a tracking rig two hundred people drove at once.',
      anchor: 0.4,
      side: 'above',
      imageUrl: null,
      plate: { hue: 32, variant: 'grid' },
    },
    {
      _id: 'prj-triage',
      title: 'Triage',
      client: 'Kestrel Health',
      year: '2024',
      discipline: 'AI Agents',
      blurb: 'An intake agent that routes 4,000 cases a day and shows its working on each one.',
      anchor: 0.56,
      side: 'below',
      imageUrl: null,
      plate: { hue: 210, variant: 'orbit' },
    },
    {
      _id: 'prj-vhs',
      title: 'Ghost Formats',
      client: 'Self-initiated',
      year: '2024',
      discipline: 'Short Film',
      blurb: 'Shot entirely on decommissioned broadcast hardware, finished at 8K.',
      anchor: 0.72,
      side: 'above',
      imageUrl: null,
      plate: { hue: 8, variant: 'noise' },
    },
    {
      _id: 'prj-aperture',
      title: 'Aperture',
      client: 'Leica Camera',
      year: '2023',
      discipline: 'Interactive + Film',
      blurb: 'A century of lenses, navigable by focal length instead of by date.',
      anchor: 0.88,
      side: 'below',
      imageUrl: null,
      plate: { hue: 48, variant: 'aperture' },
    },
  ],

  team: [
    {
      _id: 'team-01',
      name: 'Ravi Menon',
      role: 'Founder / Director',
      serial: 'QX-01-0001',
      jp: 'ディレクター',
      clearance: 'ROOT',
      since: '2025',
      specs: [
        { label: 'DISCIPLINE', value: 'DIRECTION' },
        { label: 'OUTPUT', value: 'FILM / CAMPAIGN' },
      ],
      imageUrl: null,
      hue: 188,
    },
    {
      _id: 'team-02',
      name: 'Ana Beltrán',
      role: 'Head of Production',
      serial: 'QX-02-0114',
      jp: 'プロダクション',
      clearance: 'LEVEL 4',
      since: '2025',
      specs: [
        { label: 'DISCIPLINE', value: 'PRODUCTION' },
        { label: 'OUTPUT', value: 'SHOOT / SCHEDULE' },
      ],
      imageUrl: null,
      hue: 292,
    },
    {
      _id: 'team-03',
      name: 'Tomo Ishikawa',
      role: 'Principal Engineer',
      serial: 'QX-03-0207',
      jp: 'エンジニア',
      clearance: 'LEVEL 4',
      since: '2025',
      specs: [
        { label: 'DISCIPLINE', value: 'SOFTWARE' },
        { label: 'OUTPUT', value: 'PLATFORMS / AGENTS' },
      ],
      imageUrl: null,
      hue: 138,
    },
    {
      _id: 'team-04',
      name: 'Nadia Okonkwo',
      role: 'Creative Lead',
      serial: 'QX-04-0331',
      jp: 'クリエイティブ',
      clearance: 'LEVEL 3',
      since: '2026',
      specs: [
        { label: 'DISCIPLINE', value: 'CONCEPT' },
        { label: 'OUTPUT', value: 'ADS / IDENTITY' },
      ],
      imageUrl: null,
      hue: 34,
    },
    {
      _id: 'team-05',
      name: 'Ilya Sorokin',
      role: 'Head of Post',
      serial: 'QX-05-0402',
      jp: 'ポスト',
      clearance: 'LEVEL 3',
      since: '2026',
      specs: [
        { label: 'DISCIPLINE', value: 'POST / VFX' },
        { label: 'OUTPUT', value: 'GRADE / FINISH' },
      ],
      imageUrl: null,
      hue: 12,
    },
  ],

  events: [
    {
      _id: 'evt-01',
      title: 'Rough Cut No. 14',
      kind: 'SCREENING',
      date: '12 SEP 2026',
      location: 'Qublox Studio, Amritsar',
      blurb:
        'Three works-in-progress on the projector. The people who made them have to sit through your notes.',
      status: 'upcoming',
      seats: '40 SEATS',
    },
    {
      _id: 'evt-02',
      title: 'Agents Night',
      kind: 'WORKSHOP',
      date: '03 OCT 2026',
      location: 'Qublox Studio, Amritsar',
      blurb: 'Bring a laptop. Leave with an agent that does one job properly and logs it.',
      status: 'upcoming',
      seats: '24 SEATS',
    },
    {
      _id: 'evt-03',
      title: 'Shot on Anything',
      kind: 'TALK',
      date: '21 NOV 2026',
      location: 'Amritsar Town Hall',
      blurb: 'A night about making films with the camera you already own, and why it is enough.',
      status: 'upcoming',
      seats: '120 SEATS',
    },
    {
      _id: 'evt-04',
      title: 'ERISED Vol. 01',
      kind: 'PUBLICATION',
      date: '08 MAR 2026',
      location: 'Print run of 500',
      blurb: 'The first year of the room, set in risograph. Sold out in nine days.',
      status: 'past',
      seats: 'SOLD OUT',
    },
  ],
}
