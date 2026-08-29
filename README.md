# Qublox

A scroll-driven site for Qublox — a production house and software studio.

The whole page is one signal passing through six machines. Each section is a
different device, and the device dictates the ground colour, the typeface and
the noise. That is what earns the background flips: they are not mood changes,
they are different phosphors.

```
CRT SET ─▶ LOWER THIRD ─▶ FILM CAMERA ─▶ A WHOLE MACHINE ─▶ ID SCANNER ─▶ THROWN PAINT
 hero        about          media          machine           team         erised
 bone        bone           void           void              void         yellow
```

## Running it

```bash
bun install
bun dev          # http://localhost:3000
```

It runs with no configuration at all. Sanity and SMTP are both optional
overlays — see below.

```bash
bun run typecheck
bun run build
```

## Content

Every section reads from `getSiteContent()` (`src/sanity/lib/content.ts`),
which returns the shapes in `src/types/content.ts`. Components never know
whether the data came from the CMS or from the bundled copy.

**Without Sanity** the site serves `src/content/fallback.ts`, which is a
complete set — nothing is missing or lorem.

**With Sanity**, copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
```

Then, once per project:

```bash
bun run sanity login          # opens a browser
bun run sanity dataset create production   # skip if it already exists
bun run sanity:cors           # allow the embedded Studio on localhost
```

Restart the dev server and the Studio is at **`/studio`**.

**There is no schema push.** The embedded Studio bundles the schemas from
`sanity.config.ts` at build time, so editing a file under
`src/sanity/schemas/` and reloading the page is the whole deploy cycle. The
CLI is only for what lives on Sanity's side: datasets, CORS origins, tokens.
(`bun run sanity:deploy-schema` exists, but it publishes the schema for
Sanity's own hosted tooling — the Studio here does not read it.)

For production, add the deployed origin too:

```bash
bun run sanity cors add https://your-domain.com --credentials
```

Sanity is treated as an *override* layer: any collection that comes back
empty, or a read that fails outright, falls through to the bundled content, so
a half-filled Studio can never leave the site blank.

Document types: `siteSettings`, `service`, `project`, `techModule`,
`teamMember`, `communityEvent`.

### What's editable

Effectively all standing copy. `siteSettings` is grouped into Studio tabs that
match the sections, so an editor opens the tab for the thing they are looking
at rather than scrolling one flat list where `eyebrow` and `lead` each appear
six times:

| Tab | Covers |
|---|---|
| General | Tagline, email, location, socials, the header's channel tuner, footer serial |
| CH 01 Hero | **The wall of type behind the set**, instrument strip, scroll cue, the plates printed on the television itself |
| CH 02 About | Eyebrows, lead line, highlighted words, paragraphs, **the "What we make" heading** |
| CH 03 Media | Eyebrow, year range, the REC and format labels on the footer strip |
| CH 04 Tech | BIOS boot lines, the typed command, file name, desktop icons, the error dialog |
| CH 05 Crew | Eyebrows, scanner label, and the authorisation paragraph printed on every ID card |
| CH 06 Contact | Eyebrows, heading, lead, budget options, the after-sending message |
| ERISED | Lead, event eyebrows, closing line |

The hero's wall of type is its own field rather than being derived from the
services list, because it is tuned for rhythm — short, loud phrases read at a
glance while scrolling — and that is a different job from describing a service.

**Nothing is required.** Settings deep-merge over the bundled content: an
empty string, an empty array or an absent group falls back rather than
blanking the page, so a half-filled Studio is always safe. Arrays replace
wholesale rather than merging element-wise — a list of boot lines is one
editorial decision, and splicing CMS entries into bundled ones would produce
nonsense.

## Contact form

`POST /api/contact` → nodemailer → your Gmail. Fill in `.env.local`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASSWORD=<a Google App Password, not your account password>
CONTACT_TO=you@gmail.com
```

Get an App Password at **myaccount.google.com → Security → 2-Step
Verification → App passwords**. Gmail rewrites `From` to the authenticated
account, so the sender goes in `Reply-To`, where it is actually useful.

Requests are validated with zod, rate-limited to 4 per IP per 10 minutes, and
screened by a honeypot field. With SMTP unset the route returns 503 and the
form tells the visitor to email directly — it never fails silently.

## How the animation is built

Everything scroll-linked runs on Motion values, so scrolling does not
re-render React. Lenis provides the smoothing; it drives real scroll position,
which is why `useScroll` works untouched.

Four things are worth knowing before editing:

**`src/lib/range.ts` — always run scroll input ranges through `ramp()`.**
Motion promotes scroll-linked transforms to native `ScrollTimeline`
animations, and WAAPI rejects keyframe offsets outside `[0,1]` or that do not
strictly increase. An input range running to `1.004` throws at runtime.

**`src/components/media/` — the camera path is sampled once.**
`getPointAtLength()` is cheap once and ruinous every frame, so the path is
sampled into a lookup table on mount and on resize, and interpolated inside
it. The trail is built in pixel space, not a normalised viewBox: a
non-uniform viewBox scales the dash pattern differently on each axis and
shatters the beam into arcs.

**`src/components/chrome/BackgroundController.tsx` — one owner for the
ground.** The colour is interpolated continuously against scroll position, not
switched at section boundaries. Sections declare `data-ground`; a blend zone
ends just before each new section begins. A fade still running once its
section is on screen reads as a rendering fault, so blends must finish early.

**CSS 3D cannot be relied on for the cube cursor.** Browsers sort
`preserve-3d` layers per element, not per pixel, so a far face wins a depth
test it should lose and you see through the cube. Backface culling trades that
for holes wherever a face rotates away; an opaque core trades the holes for a
black slab winning against the stickers in front of it. There is no
arrangement of those three that is correct at every angle, because the depth
order is not ours to set. `CubeCursor.tsx` draws to a canvas instead and sorts
its own quads back-to-front, which makes occlusion correct by construction.

**Sticky sections cannot hand over to each other.** A `sticky` child unpins a
viewport before its parent ends, so between two sticky sections there is
always a screen of scroll where the first slides away and the second has not
arrived. `Machine.tsx` is one section for that reason: the cold start, the
BIOS, the desktop, the cursor and the app all share a single scroll range,
because they are one machine starting up. Splitting them read as the machine
switching off and a different one switching on.

**Reduced motion is a design state, not a disabled one.** Every scroll
sequence has a composed static end state. `useReducedMotion()` switches to it;
the page must still read as finished with zero animation.

**A splat only looks like a splat near its own scale.** Both the ERISED
background and the mark itself are built from many hits at readable sizes
rather than one shape scaled up — past about twice its size the artwork loses
every feature that made it a splat. Same reason the hits are positioned
elements rather than shapes in one clip path: a clip path over a stretched
viewBox inherits the stretch and silently distorts the artwork.

## Structure

```
src/
  app/                    layout, page, /studio, /api/contact
  components/
    chrome/               header, ground controller
    hero/  media/  team/
    community/  tech/     section internals
    sections/             one file per chapter
    ui/                   scramble text, cube cursor, grain, reveals
  content/fallback.ts     the bundled copy
  lib/                    path sampling, range guard, reduced motion
  sanity/                 env, client, schemas, queries, content loader
  types/content.ts        the shapes every section consumes
public/brand/             the supplied Qublox and ERISED artwork
references/               the plates this was designed against
```

## Type

Five faces, each bound to a job: **Archivo** (variable width — the display
voice, stretched by scroll), **Space Grotesk** (body), **JetBrains Mono**
(terminal, ID cards, instrument labels), **Instrument Serif** (the
counterweight in the hero marquee), **Fredoka** (ERISED only).

## Colour

Sampled from the supplied artwork rather than guessed, so the page and the
logo files agree exactly:

| | |
|---|---|
| `--color-bone` `#f2f1ec` | hero and about ground |
| `--color-ink` `#0f1014` | from the Qublox logo's own ground |
| `--color-signal` `#ff2f36` | the Qublox dot |
| `--color-dos-blue` `#0000a8` | Turbo Vision, in the tech section |
| `--color-erised-yellow` `#fecb56` | sampled from the ERISED artwork |
| `--color-erised-blue` `#3a6ea5` | the ERISED outline |

## Two traps in scroll-linked Motion

Both cost real time here. Neither announces itself.

**1. Input ranges must span the whole timeline.** Motion compiles
scroll-linked style transforms into native `ScrollTimeline` animations. A
transform whose input range covers only part of the timeline —
`useTransform(p, [0.26, 0.31], [0, 1])` — does *not* hold outside that range
once compiled. It ramps back down over the remainder, so a fade-in becomes a
fade in and out. It presents as a timing bug, and there is no timing to fix.

Always go through `useScrollRange` (`src/lib/useScrollRange.ts`), which pads
the range with hold stops at 0 and 1.

**2. Offsets must be inside [0,1] and strictly increasing.** WAAPI throws
`Offsets must be null or in the range [0,1]` otherwise. A per-item range like
`start + slice * 1.02` overshoots on the last item and takes the whole page
down. `ramp()` in `src/lib/range.ts` conditions them; `useScrollRange` calls
it for you.

## Screenshotting it

Lenis eases toward its own internal scroll target, so a plain
`window.scrollTo` is treated as an interruption and eased away from — every
screenshot taken that way is a mid-flight frame rather than the state at that
position. `settleAt()` (in the scratch harness) re-issues the scroll until
`scrollY` both stops moving and matches the target. Without it, a correct
animation will look broken and a broken one will look fine.
