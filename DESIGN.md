# Design

## Theme

Dark, single theme, locked. One deliberate inversion: the Profile band is the
paper colour, full width, and the sticky header inverts with it. That is the
only theme switch on the page and it is a composition device, not a mode.

## Color

All tokens live at the top of `assets/css/site.css`.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#050507` | page ground |
| `--ink-soft` | `#0b0b0f` | tiles, stage ground, stat panel base |
| `--panel` | `#0c0c10c7` | sticky header, over blur |
| `--paper` | `#f0ede7` | primary text, Profile band ground |
| `--silver` | `#b9bec8` | body copy on dark |
| `--silver-dim` | `#8a8e97` | eyebrows, meta, footer |
| `--ruby` | `#ff355f` | the single accent |
| `--crimson` | `#8d102d` | accent on the light band, hero haze base |
| `--gold` | `#c5a56d` | one role only: the leadership stat label |
| `--line` | `#f0ede726` | hairlines |
| `--line-strong` | `#f0ede74d` | control borders |

One accent, used identically everywhere: ruby marks the current nav item, the
second line of every section title, index numbers, award years, the primary
button, the "New" mark, the pipeline rail, the row under the pointer in a list,
and the ring around the wall tile under the pointer.
Gold appears exactly once. Nothing else is saturated except the artwork.

The "New" mark sets ink on ruby rather than white on ruby: it is small text, and
ink clears 4.5:1 where white does not.

`--silver-dim` was lifted from `#767b84` to `#8a8e97` so meta text clears 4.5:1
on `--ink`.

## Typography

Two families, self-hosted as variable WOFF2, preloaded, `font-display: swap`.

- **Display: Syne** (400 to 800). All headings, index numbers, award titles, the
  monogram. Uppercase only in the hero and the 404.
- **Body: Manrope** (200 to 800). Everything else.

Rules held throughout:

- Display letter-spacing never tighter than `-0.04em`.
- Hero clamps at `8rem`; the contact title at `7rem`.
- Body measure capped at 65ch, narrower where a column is narrow.
- `text-wrap: balance` on headings, `pretty` on prose.
- `font-variant-numeric: tabular-nums` on every number that sits in a column:
  featured numbers, headline numbers, award years.
- Uppercase is reserved for labels of four words or fewer.

The second line of a two-line section title is the accent colour and its own
block; in the hero and the contact title the middle word is stroke-only
(`-webkit-text-stroke`), which is the signature of the reference build.

## Layout

- `--content: min(100% - 1.5rem, 92rem)`, widening to `min(100% - 2rem, 92rem)`
  at 900px.
- Mobile-first. Five breakpoints, all `min-width`: **560px** (roomier tiles,
  rail cards go side by side), **760px** (quick view goes side by side),
  **900px** (desktop header, hero reels leave the flow, side-by-side splits,
  pipeline tabs on a rail), **1100px** (three-column grid and capability set),
  **1280px** (four-column grid).
- The work grid is two columns from the smallest phone. In a single column it
  was thirteen screens of scrolling.
- Corner radius: one scale. `--radius` (1rem, 1.1rem at desktop) for tiles and
  panels; full pill for every control. Nothing in between.
- Section rhythm via `clamp()` so vertical space compresses on small screens
  rather than stepping at a breakpoint.
- Z-index is a named scale: `--z-sticky: 50`, `--z-progress: 60`, `--z-skip: 100`,
  `--z-boot: 200`. No arbitrary values anywhere.

## Components

- **Header.** Monogram, wordmark, nav, Motion switch, mail link. Burger below
  900px. Inverts to `.is-light` over the Profile band.
- **Featured block.** Index, one meta line, title, an underlined "Open game"
  link, then a full-bleed stage. Used twice, for the two titles with cinematics.
  No paragraph: the clip is the description.
- **Hero reels.** Key art on three strips, each a link to its title. Two tilted
  rows in the flow on a phone; from 900px three columns on a plane rotated in
  3D, masked so it fades into the title on the left and into the ground at top
  and bottom. The strips travel with the scroll.
- **Headline numbers.** Three figures in a band of their own under the hero, so
  the art wall runs to the hero's edge and the numbers sit on clean ground. No
  headcount and no count of titles: neither is this page's to publish.
- **Rail card.** Latest releases. Square art, tag, title, two-line description,
  a pill. Lit from behind by a blurred copy of its own art.
- **Filter chips.** Toggle buttons (`aria-pressed`), names only.
- **Tile.** Square art over a bar carrying title, type and year. Square reserved
  in CSS; a shimmer holds it until the image decodes. A "Details" cue rises onto
  the art on hover and on keyboard focus.
- **Quick view.** A native `<dialog>`. Art on the left, facts on the right,
  stacked on a phone. Next and previous step through the filtered set.
- **Pipeline.** A ticker of stage names, then six stages. Pills above one panel
  on a phone; from 900px a vertical rail with a node per stage and the open
  stage beside it. Panels share one grid cell so the height never changes.
- **Discipline list.** One row per discipline: its name and what it delivers.
- **Career list.** In the light band. Period, role, company; a dot marks a role
  that is current.
- **Stage.** Poster `<img>` under a `<video>` and a caption chip. No control:
  every clip plays, muted and looping, while it is on screen.
- **Split.** Text against a portrait stage; the recognition section flips it.
- **Award row.** Year, title, source. Three columns from 560px, stacked below.

## Motion

Custom cubic-beziers only, never the CSS keywords.

| Token | Curve | Used for |
|---|---|---|
| `--ease-out-quart` | `cubic-bezier(.25,1,.5,1)` | default, all state changes |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | reveals, focus pull, image scale, line rise, tilt release |
| `--ease-reel` | `cubic-bezier(.1,.75,.15,1)` | anything that behaves like a reel coming to rest: the hero spin-in, the rolling numbers |

| Duration | Where |
|---|---|
| `--in` 150ms | hover on |
| `--out` 220ms | hover off, all control state |
| `--enter` 260ms | header theme change, skip link |
| 120ms | tile tilt while the pointer is moving (linear, so it tracks) |
| 450ms | tile image scale, reveal |
| 500ms | quick view in; filter re-layout |
| 600ms | tile tilt release |
| 200ms | stage focus pull (linear; it only smooths the steps between frames) |
| 950ms | heading line rise |
| 1.5s | number roll, 120ms apart per digit |
| 1.7 to 2s | hero reels spin in, 140 to 160ms apart |
| 6.5s | pipeline clock per stage |
| about 50s | one full turn of a hero reel at its idle pace, before the scroll adds to it |

Hover is faster on than off so nothing snaps away. Every hover rule sits inside
`@media (any-hover:hover) and (any-pointer:fine)`. The `any-` forms matter: an
iPad with a trackpad answers no to `(hover:hover)` because touch is its primary
input, and it should still get hover. A phone with only a finger matches
neither, so a tap leaves nothing stuck. The script makes the same distinction
per event, by `pointerType`, rather than once per device. Press feedback is
`scale(.97)` on controls, `scale(.99)` on tiles. Only `transform`, `opacity` and
`filter` are animated; `filter` is dropped while a stage sits at the centre so
no blur pass stays alive on a clip that is being watched.

Reveals are staggered 40ms apart within a row, capped at six steps, and gated
behind `.js` so the page is never blank without scripts. A four second safety
timer reveals everything if the observer never fires.

Every moving thing answers to one of three causes, and nothing moves without
one: **arrival** (reveals, line rise, the reel spin-in, the number roll),
**the visitor** (the wall and the ticker travelling with the scroll, the focus
pull, tilt, highlight, magnet, drag, the plane's lean), or **a clock the
visitor can see and stop** (the pipeline bar).

Motion is on by default, for every visitor. The header switch turns all of it
off at once (clips, reels, rolls, tilt, ticker, clock, transitions) and the
choice is remembered. This was a decision by the owner: the page is a reel, and
it should arrive playing. The operating system's reduced-motion setting is
honoured only when script is unavailable, where there is no switch to press.

## Effects

- **Hero canvas.** WebGL, a domain-warped fbm haze in crimson to ruby, anchored
  upper-right where the reference build puts its glow, `mix-blend-mode: screen`
  over the CSS gradient. Grain at 1.8% kills banding. DPR capped at 1.25; the
  effect halves its resolution once frames pass 34ms and removes itself entirely
  if that continues. Off with the Motion switch.
- **Backdrop blur** is only ever on fixed or sticky surfaces: the header, the
  caption chips, the quick-view backdrop. Never on scrolling content.
- **Hero plane.** `perspective: 70rem` on the container, then
  `rotateX(15deg) rotateY(-24deg) rotateZ(7deg)` on the plane. The pointer adds
  at most 3 degrees on X and 4.5 on Y through two custom properties, with a
  900ms transition doing the smoothing.
- **Hero wall travel.** Each strip holds its set three times and is moved by
  one `translate3d` per frame while the hero is on screen. The first and third
  run down as the page scrolls down and the middle one runs up; all three
  reverse with the scroll. 45% of the scroll distance is passed on, eased with a
  little weight, on top of an idle stroll that comes to rest under a pointer so
  a title can be picked. No two strips keep the same pace.
- **Wall hover.** The tile under the pointer scales to 1.08 and takes a ruby
  ring; the rest fall to 40% opacity. A click opens that title's quick view.
- **Focus pull.** A clip is sharp while its centre is within 14% of the window
  height of the window's centre, then gains up to 14px of blur, a 30% dim and a
  6% scale as it is scrolled away, up or down.
- **Tile tilt.** `perspective(60rem)` with up to 4.5 degrees either way, and a
  `soft-light` radial highlight at the pointer.
- **Ambient glow.** Rail cards and the quick view sit on a blurred, saturated
  copy of their own art at about a third opacity. It is the only place colour
  leaves the artwork, and it is the artwork's own colour.
- **Rolling numbers.** Per-digit strips translated with one transition each. The
  reference to a reel is deliberate; it is the one piece of iGaming vocabulary
  the interface borrows.
- **View transitions.** Filtering names each tile for the length of one
  transition, so the browser animates the re-layout. No library, no FLIP code.

## Deliberate deviations from the reference build

- Hero display size capped at `8rem` rather than `9.5rem`, and letter-spacing
  relaxed from `-0.055em` to `-0.04em`, so glyphs stop touching at large sizes.
- The sticky header inverts over the Profile band. In the reference build it
  stays white-on-paper and its labels are unreadable there.
- "Book of the Sun" points at the public game page; the reference build points it
  at a staging host.
- Em dashes in prose are replaced by commas or periods; award category separators
  become parentheses or a comma. Award names themselves are unchanged.
- Nav carries Work, Process, Team, Motion, Profile and Contact. The wordmark
  beside the monogram is hidden between 900 and 1100px to make room for them.
