# Norair Harutyunyan — Game Art Portfolio

A static, self-hosted portfolio for Norair Harutyunyan: Art Production Lead,
Game Art Team Lead and Senior 2D Artist, Yerevan.

No framework, no build step, no runtime dependencies. Open `index.html` and it
works. GitHub Pages serves the repository root as-is.

**Live:** https://norohtn.github.io/Norair_Harutyunyan_Portfolio/

---

## What the page is for

It has to do two jobs at once. The first is the one any art portfolio does:
show the released work, large and fast. The second is specific to a production
lead: show *how* the work gets made and who makes it. So the page runs in that
order.

1. **Hero.** Title, role, and a wall of key art that travels with the scroll.
2. **Headline numbers.** Years in iGaming, disciplines, illustrating since.
3. **Two featured cinematics.** The God of Atlantis and Fortune Don Tiger.
4. **Latest releases.** The five newest titles on a horizontal rail.
5. **Work.** Every title, filterable by type, each opening a quick view.
6. **Process.** The six-stage art pipeline, from brief to release.
7. **Team.** The five disciplines the pipeline runs across, plus capabilities.
8. **Motion, recognition, profile and career path, contact.**

Two things are deliberately absent: the size of the team, and a count of
titles. Neither appears anywhere on the page, in the share card, or in the page
description.

---

## Layout

```
index.html                     the whole page, one file
assets/css/site.css            hand-authored, mobile-first
assets/js/site.js              progressive enhancement only
assets/fonts/*.woff2           Syne (display) + Manrope (body), self-hosted
games/*.png + *.webp           game thumbnails, 302/604/906 WebP + PNG fallback
media/*.mp4 + *-poster.webp    4 clips, two rungs each, plus poster frames
og-cover.jpg                   1200x630 share card
resume.html                    résumé source; the PDF is printed from it on deploy
Norair_Harutyunyan_Resume.pdf  linked from the hero and the profile band
favicon.svg / favicon.ico / apple-touch-icon.png
robots.txt / sitemap.xml / .nojekyll
```

The site has no third-party origin at all: no CDN, no font service, no
analytics, no external image host. Every asset it renders is in this repository.

## Media pipeline

Source clips were 4K, 85 MB for four files. They ship as two H.264 rungs each
plus a WebP poster, 22.6 MB in total:

| Clip | Desktop | Mobile | Duration |
|---|---|---|---|
| `atlantis-cinematic` | 1620x1080 | 1080x720 | 14.4s |
| `fortune-don-tiger-cinematic` | 1920x1080 | 1280x720 | 12.1s |
| `pascal-sbc-recognition` | 900x1600 | 608x1080 | 18.6s |
| `character-motion-reel` | 900x1600 | 608x1080 | 28.0s |

Encoded with `libx264`, `-movflags +faststart`, closed GOP every 60 frames so the
loop restarts without a stall. The three silent clips carry no audio track at
all.

## Thumbnail pipeline

Each tile is a ladder cut from one square master, so the browser picks exactly
one rung and never the whole set:

| Rung | Width | Quality |
|---|---|---|
| `name.webp` | 302 | q84 |
| `name@2x.webp` | 604 | q82 |
| `name@3x.webp` | 906 | q80 |

Each rung is a Lanczos downscale plus an unsharp pass sized to the reduction:
heaviest at 302, lightest at 906. The PNG inside each `<picture>` is the no-WebP
fallback at 302, and no browser that supports WebP ever requests it.

```sh
ffmpeg -i master.png -vf "scale=906:906:flags=lanczos,unsharp=3:3:0.35:3:3:0.0" \
  -c:v libwebp -preset picture -compression_level 6 -quality 80 slug@3x.webp
ffmpeg -i master.png -vf "scale=604:604:flags=lanczos,unsharp=3:3:0.45:3:3:0.0" \
  -c:v libwebp -preset picture -compression_level 6 -quality 82 slug@2x.webp
ffmpeg -i master.png -vf "scale=302:302:flags=lanczos,unsharp=3:3:0.55:3:3:0.0" \
  -c:v libwebp -preset picture -compression_level 6 -quality 84 slug.webp
ffmpeg -i master.png -vf "scale=302:302:flags=lanczos,unsharp=3:3:0.55:3:3:0.0,format=rgb24" slug.png
```

**Where the masters came from.** The original tiles were cut from 1254x1254
masters Norair supplied. The six added in November 2026 were taken from the
public Pascal Gaming site, and the source sizes differ:

| Title | Source | Ladder |
|---|---|---|
| Fortune Toro | 2048 | 302 / 604 / 906 |
| Golden Ace Power | 2048 | 302 / 604 / 906 |
| Fortune Dragão | 1024 | 302 / 604 / 906 |
| Piñata Pays | 302 | 302 native, 604 upscaled, no 906 |
| Fortune Calico | 302 | 302 native, 604 upscaled, no 906 |
| Franken Alive | 302 | 302 native, 604 upscaled, no 906 |

For the last three the studio only publishes a 302 tile. The 302 rung is that
file untouched; the 604 rung is a Lanczos upscale so high-density screens do not
fall back to bilinear; there is no 906 rung and the `srcset` does not claim one.
They are the only soft images on the page, most visibly in the quick view.
Dropping in a 1254px master and re-running the four commands above fixes each.

## How the page behaves

- **Boot screen.** Held until the fonts resolve, the document loads, and the
  first poster frame decodes; capped at 1.5s so a slow asset can never trap a
  visitor. When it clears, the title lines rise out of their masks and the hero
  reels spin in and settle one after another.
- **Hero wall.** Key art on three strips. On a phone they are two rows under
  the title; from 900px they become three columns on a plane tilted in 3D
  behind it. The strips travel with the scroll: the first and third run down as
  the page moves down, the middle one runs up, and all three reverse when the
  page does. Between scrolls they idle at a stroll. Under a mouse or trackpad
  the tile beneath the pointer comes forward with a ruby ring, the rest dim, the
  stroll comes to rest so a title can be picked, and the plane leans a few
  degrees toward the pointer. A click or tap on any tile opens that title.
- **Rolling numbers.** Every headline number sits on per-digit strips that roll
  to their value the first time they are seen, the way a reel stops. The real
  number stays in the DOM for assistive tech.
- **Video.** Every clip plays, muted and looping, for as long as it is on
  screen. There is no play button. Sources attach one viewport ahead of the
  clip, so playback starts full rather than buffering on screen. A clip is sharp
  while it sits at the centre of the window and blurs, dims and eases back as it
  is scrolled away from the centre, up or down. Clips pause off screen and on a
  hidden tab. If a browser refuses autoplay (iOS Low Power Mode, data savers),
  the first touch, click or key anywhere on the page starts them.
- **Filters.** All / Slots / Crash / Instant / Table. Where the browser supports
  the View Transitions API the tiles glide to their new places; elsewhere the
  grid simply updates.
- **Quick view.** A tile is a plain link to its game. With JavaScript a click
  opens a native `<dialog>` instead: the art at full size, layout, volatility,
  maximum win, release date, and both links (the playable game and the public
  game page). Arrow keys and the two buttons step through whatever is currently
  filtered; Escape or a click on the backdrop closes it and focus returns to the
  tile. Modified clicks (new tab, new window) still follow the link.
- **"New" marks.** A tile whose `data-date` falls within the last three months
  gets a mark. It is computed at load, so it retires itself.
- **Hover.** With a mouse or trackpad a tile leans toward the pointer, a soft
  highlight follows it across the art, and a "Details" cue rises onto the art.
  This includes an iPad with a trackpad, which most hover checks miss: the
  stylesheet asks `(any-hover:hover)` rather than `(hover:hover)`, and the
  script reads `pointerType` on each event.
- **Latest releases rail.** A scroll-snap strip: it swipes on touch, scrolls
  with the wheel or arrow keys, and drags with a mouse. Each card is lit by a
  blurred copy of its own art.
- **Pipeline.** A ticker of the stage names whose pace follows the scroll, then
  six stages as tabs. While nobody has touched them they advance on their own
  every 6.5 seconds; hovering or focusing holds the clock, and the first click
  or key press hands control over for good. All panels are stacked in one grid
  cell, so the section never changes height as stages change.
- **Motion switch.** Motion is on by default for every visitor. The header
  control stops all of it at once (clips, the hero canvas, the wall, the
  ticker, the pipeline clock, the tilt, every reveal and transition) and
  remembers the choice. This is the pause mechanism required by WCAG 2.2.2. It
  does not follow the operating system's reduced-motion setting; see the note
  under Known items.
- **Hero canvas.** A slow ruby haze in WebGL, purely atmospheric. If the context
  is refused, or frames start costing more than 34ms, it steps aside and the CSS
  glow underneath carries the hero.
- **Résumé links.** Both résumé buttons open the PDF in a new tab. The PDF is
  printed from `resume.html` by the Pages workflow on every deploy.

Without JavaScript the page is complete: all sections visible, all six pipeline
stages listed in order, every title a link to its game, all poster frames shown,
no overlay. The filter bar, rail arrows and copy button are absent rather than
present and broken.

## Local preview

Any static server works:

```bash
python3 -m http.server 8231
```

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on
every push to `main`, after printing the résumé PDF from `resume.html`.

**Cache busting.** GitHub Pages lets browsers keep every file for ten minutes.
The page, the stylesheet and the script change together, so a browser holding
an older stylesheet must never pair it with a newer page: that is what turned
the hero into a column of full-size key art on the day the reels shipped. The
stylesheet and script are therefore linked as `site.css?v=...` and
`site.js?v=...`, and the workflow replaces that value with the commit hash on
every deploy. Nothing needs bumping by hand; the value in the repository is only
a placeholder for local preview. If the stamp ever fails to apply, the deploy
fails and the previous version stays live.

## Editing

- **Add a game.** Copy a `.tile` block in `index.html`, cut its thumbnail ladder
  into `games/`, and fill the data attributes. They are the single source for
  the tile, the filter and the quick view:

  | Attribute | Example | Used for |
  |---|---|---|
  | `data-game` | `pinata-pays` | id; a rail card points at it with `data-ref` |
  | `data-cat` | `slots`, `crash`, `instant`, `table` | filter |
  | `data-type` | `Slot` | label |
  | `data-date` | `2026-11` | the "New" mark |
  | `data-released` | `Nov 2026` | quick view |
  | `data-layout`, `data-vol`, `data-max` | `5×4 · 1,024 ways` | quick view; omit any that do not apply |
  | `data-demo` | launcher URL | "Open game"; omit if there is no public demo |
  | `data-page` | `https://www.pascalgaming.com/games/...` | "Game page" |
  | `data-desc` | one or two factual sentences | quick view |

  Nothing else needs touching: no count of titles is written anywhere on the
  page.
- **Add a title to the hero wall or the rail.** Add a `.reel__item` (in all
  three copies of its strip) or an `.rcard`, with `data-ref` set to the tile's
  `data-game`. Clicking it then opens that tile's quick view.
- **Game links.** Use the clean launcher form,
  `https://pg.pascalgaming.com/launch?gameId=N&mode=real&partnerKey=...&culture=en&token=token_155`.
  It redirects through the launcher and mints a fresh `launchToken` on every
  visit, so it does not expire the way a copied `launchToken` URL does.
- **Pipeline and discipline copy.** The `.pipe__panel` and `.crew` blocks in
  `index.html`.
- **Awards.** The `.award` rows, newest first.
- **Career path.** The `.job` rows in the profile band; keep them in step with
  `resume.html`.
- **Colour and type.** The custom properties at the top of `assets/css/site.css`.
- **Share card.** `og-cover.jpg`, 1200x630.

## Known items for the owner

- **Motion ignores the system setting.** At the owner's request the page
  arrives playing for everyone, including visitors whose device asks for
  reduced motion; the header switch is their way to stop it. To follow the
  system setting again, change the default in `site.js` from
  `stored !== 'off'` to also require
  `!matchMedia('(prefers-reduced-motion: reduce)').matches` when nothing is
  stored.
- **The résumé still states a team size.** `resume.html` (and the PDF printed
  from it) still carries a line on how many specialists were led and mentored.
  The page no longer shows any headcount; the résumé was left as written.
- **LinkedIn was not readable.** The profile returns HTTP 999 to automated
  clients, so nothing on this page was taken from it. The career path mirrors
  `resume.html`. If the LinkedIn headline or dates differ, the résumé and the
  `.job` rows are the two places to change.
- **Three soft thumbnails.** Piñata Pays, Fortune Calico and Franken Alive need
  1254px masters; see the thumbnail pipeline above.
- **Three titles have no public demo.** Book of the Sun, Gates of Power, and
  Jack and Cheeky Duck link to their Pascal Gaming game page only, because that
  page publishes no demo link for them.
- **Game facts** (layout, volatility, maximum win, release month) are taken from
  the public Pascal Gaming game pages as of November 2026. Fields the studio
  lists as "TBD" or gives in mixed units are left out rather than guessed.
- **Award entries** in the recognition section are Pascal Gaming studio awards,
  and the section says so. They are not presented as individual awards. The
  2026 entry is as SiGMA lists it: Best New Game Release, Avinho R10, SiGMA
  World Awards, Rome, 2 November 2026.

## Reviewing the hero effect

The WebGL haze is skipped on software renderers (SwiftShader, llvmpipe) and on
machines reporting two cores or fewer, because there it costs main-thread time
that first paint needs. Append `?gl=force` to the URL to render it anyway, which
is also how it is checked in a headless browser.
