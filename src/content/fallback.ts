import type { SiteContent } from '@/types/content'

/**
 * The site ships with a full set of content so it runs the moment you clone it.
 * Every field here maps 1:1 to a Sanity document, so switching the CMS on
 * replaces this file's role without touching a single component.
 */
export const fallbackContent: SiteContent = {
  settings: {
    tagline: 'A creative technology studio building things that move.',
    aboutLead:
      'Qublox is a studio for brands that would rather be felt than scrolled past.',
    aboutBody: [
      'We work at the seam where brand, motion and engineering stop being separate departments. A campaign that ships as a static board and a site that ships as a template are the same failure wearing different clothes — so we build the identity and the thing it lives inside at the same time, in the same room.',
      'Nine people. No account layer. You talk to whoever is making the work.',
    ],
    techIntro:
      'Everything below runs in production, on real client work, today. No lab demos.',
    techModules: [
      {
        _id: 'mod-render',
        code: 'RND',
        name: 'REALTIME RENDER',
        status: 'ONLINE',
        lines: [
          'WebGL / WebGPU pipelines, hand-written shaders.',
          'Deferred lighting, GPU particles, signed-distance geometry.',
          'Budget: 16ms frame, 60fps floor on 4-year-old hardware.',
        ],
      },
      {
        _id: 'mod-motion',
        code: 'MTN',
        name: 'MOTION SYSTEMS',
        status: 'ONLINE',
        lines: [
          'Scroll-linked and gesture-driven choreography.',
          'Physics springs over easing curves wherever a hand is involved.',
          'Every sequence has a reduced-motion twin, not a disabled one.',
        ],
      },
      {
        _id: 'mod-web',
        code: 'WEB',
        name: 'INTERACTIVE WEB',
        status: 'STABLE',
        lines: [
          'Next.js, TypeScript, edge rendering, content that ops can edit.',
          'Core Web Vitals treated as a design constraint, not a report card.',
          'Accessibility to WCAG 2.2 AA — audited, not assumed.',
        ],
      },
      {
        _id: 'mod-film',
        code: 'FLM',
        name: 'FILM + POST',
        status: 'STABLE',
        lines: [
          'Direction, grade, finish. Anamorphic and large-format capture.',
          'Houdini and Nuke for anything the camera cannot be talked into.',
          'Delivered in every ratio the media plan actually needs.',
        ],
      },
      {
        _id: 'mod-xr',
        code: 'SPT',
        name: 'SPATIAL + XR',
        status: 'BETA',
        lines: [
          'Installations, LED volumes, headset and handset AR.',
          'Room-scale tracking with sub-frame latency compensation.',
          'Built to survive a trade floor for nine hours a day.',
        ],
      },
    ],
    communityLead:
      'ERISED is our open room. Once a month we clear the studio, put something unfinished on the projector, and argue about it.',
    contactLead:
      'Tell us what you are making. We answer every message ourselves, usually within two working days.',
    email: 'hello@qublox.studio',
    socials: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Are.na', href: 'https://are.na' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'LinkedIn', href: 'https://linkedin.com' },
    ],
    location: 'Bengaluru, IN — 12.97°N 77.59°E',
  },

  services: [
    {
      _id: 'svc-brand',
      title: 'Brand Systems',
      marquee: 'BRAND SYSTEMS',
      description:
        'Identities built as working systems — type, motion, sound and rules that survive contact with a real production calendar.',
      capabilities: ['Naming', 'Identity design', 'Type commissioning', 'Guidelines'],
    },
    {
      _id: 'svc-motion',
      title: 'Motion Design',
      marquee: 'MOTION DESIGN',
      description:
        'Frame-accurate choreography for screens of every size, from a six-second pre-roll to a forty-metre LED wall.',
      capabilities: ['Art direction', 'Animation', '3D + simulation', 'Sound design'],
    },
    {
      _id: 'svc-web',
      title: 'Interactive Web',
      marquee: 'INTERACTIVE WEB',
      description:
        'Sites and product surfaces engineered in-house. Designed to be fast first and impressive second, which is how they end up both.',
      capabilities: ['Design', 'Front-end', 'CMS', 'Performance'],
    },
    {
      _id: 'svc-film',
      title: 'Film & Post',
      marquee: 'FILM + POST',
      description:
        'Original direction and finishing, with the VFX pipeline sitting in the same building as the edit.',
      capabilities: ['Direction', 'Production', 'VFX', 'Colour'],
    },
    {
      _id: 'svc-spatial',
      title: 'Spatial & XR',
      marquee: 'SPATIAL + XR',
      description:
        'Physical installations and mixed-reality work that behaves itself in a room full of strangers.',
      capabilities: ['Concept', 'Hardware', 'Software', 'Install'],
    },
  ],

  projects: [
    {
      _id: 'prj-halcyon',
      title: 'Halcyon Broadcast',
      client: 'Halcyon',
      year: '2025',
      discipline: 'Identity + Motion',
      blurb:
        'A rebrand delivered as a live broadcast package: 400 assets generated from twelve rules.',
      anchor: 0.08,
      side: 'above',
      imageUrl: null,
      plate: { hue: 168, variant: 'bars' },
    },
    {
      _id: 'prj-nullform',
      title: 'Nullform',
      client: 'Nullform Audio',
      year: '2025',
      discipline: 'Interactive',
      blurb:
        'A synth you play by scrolling. Shipped as the product page, became the product.',
      anchor: 0.24,
      side: 'below',
      imageUrl: null,
      plate: { hue: 292, variant: 'waveform' },
    },
    {
      _id: 'prj-monolith',
      title: 'Monolith 7',
      client: 'Aster Group',
      year: '2024',
      discipline: 'Spatial',
      blurb:
        'Nine metres of LED and a tracking rig that let two hundred people move one object at once.',
      anchor: 0.4,
      side: 'above',
      imageUrl: null,
      plate: { hue: 32, variant: 'grid' },
    },
    {
      _id: 'prj-vhs',
      title: 'Ghost Formats',
      client: 'Self-initiated',
      year: '2024',
      discipline: 'Film',
      blurb:
        'A short shot entirely on decommissioned broadcast hardware, then finished at 8K.',
      anchor: 0.56,
      side: 'below',
      imageUrl: null,
      plate: { hue: 8, variant: 'noise' },
    },
    {
      _id: 'prj-transit',
      title: 'Transit Layer',
      client: 'Kestrel Rail',
      year: '2024',
      discipline: 'Product + Web',
      blurb:
        'Wayfinding for eleven stations, driven by one schema and readable at four metres.',
      anchor: 0.72,
      side: 'above',
      imageUrl: null,
      plate: { hue: 210, variant: 'orbit' },
    },
    {
      _id: 'prj-aperture',
      title: 'Aperture Study',
      client: 'Leica Camera',
      year: '2023',
      discipline: 'Interactive + Film',
      blurb:
        'A hundred-year lens archive, navigable by focal length instead of by date.',
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
      role: 'Founder / Creative Director',
      serial: 'QX-01-0001',
      jp: 'クリエイティブ',
      clearance: 'ROOT',
      since: '2019',
      specs: [
        { label: 'DISCIPLINE', value: 'DIRECTION' },
        { label: 'OUTPUT', value: 'FILM / IDENTITY' },
      ],
      imageUrl: null,
      hue: 188,
    },
    {
      _id: 'team-02',
      name: 'Ana Beltrán',
      role: 'Head of Motion',
      serial: 'QX-02-0114',
      jp: 'モーション',
      clearance: 'LEVEL 4',
      since: '2020',
      specs: [
        { label: 'DISCIPLINE', value: 'ANIMATION' },
        { label: 'OUTPUT', value: '3D / SIMULATION' },
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
      since: '2020',
      specs: [
        { label: 'DISCIPLINE', value: 'GRAPHICS' },
        { label: 'OUTPUT', value: 'WEBGL / WEBGPU' },
      ],
      imageUrl: null,
      hue: 138,
    },
    {
      _id: 'team-04',
      name: 'Nadia Okonkwo',
      role: 'Design Lead',
      serial: 'QX-04-0331',
      jp: 'デザイン',
      clearance: 'LEVEL 3',
      since: '2021',
      specs: [
        { label: 'DISCIPLINE', value: 'IDENTITY' },
        { label: 'OUTPUT', value: 'TYPE / SYSTEMS' },
      ],
      imageUrl: null,
      hue: 34,
    },
    {
      _id: 'team-05',
      name: 'Ilya Sorokin',
      role: 'Technical Director, Spatial',
      serial: 'QX-05-0402',
      jp: 'スペイシャル',
      clearance: 'LEVEL 3',
      since: '2022',
      specs: [
        { label: 'DISCIPLINE', value: 'INSTALLATION' },
        { label: 'OUTPUT', value: 'HARDWARE / XR' },
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
      location: 'Qublox Studio, Indiranagar',
      blurb:
        'Three works-in-progress on the projector. The people who made them have to sit through your notes.',
      status: 'upcoming',
      seats: '40 SEATS',
    },
    {
      _id: 'evt-02',
      title: 'Shader Night',
      kind: 'WORKSHOP',
      date: '03 OCT 2026',
      location: 'Qublox Studio, Indiranagar',
      blurb:
        'Bring a laptop. Leave with a fragment shader you understand line by line.',
      status: 'upcoming',
      seats: '24 SEATS',
    },
    {
      _id: 'evt-03',
      title: 'Type in Motion',
      kind: 'TALK',
      date: '21 NOV 2026',
      location: 'Bangalore International Centre',
      blurb:
        'Variable fonts, kinetic typography, and why most of it is still done badly.',
      status: 'upcoming',
      seats: '120 SEATS',
    },
    {
      _id: 'evt-04',
      title: 'ERISED Vol. 01',
      kind: 'PUBLICATION',
      date: '08 MAR 2026',
      location: 'Print run of 500',
      blurb:
        'The first year of the room, set in risograph. Sold out in nine days.',
      status: 'past',
      seats: 'SOLD OUT',
    },
  ],
}
