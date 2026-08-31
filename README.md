# Norair Harutyunyan — Game Art Portfolio

A static, self-hosted portfolio for Norair Harutyunyan: Game Art Team Lead, Art
Production Lead and Senior 2D Artist, Yerevan.

No framework, no build step, no runtime dependencies. Open `index.html` and it
works. GitHub Pages serves the repository root as-is.

**Live:** https://norohtn.github.io/Norair_Harutyunyan_Portfolio/

---

## Why this rewrite exists

The previous version of this repository pulled every image from
`norair-game-art.cocoa-ball-5078.chatgpt.site`, a generated preview host that
nobody here controls. The portfolio had no assets of its own: if that host went
away, the page went blank. Two thumbnails were already returning 404 because of
filename typos, and the four motion clips referenced by the old `motion.js`
(`0830.mp4`, `0830(1..3).mp4`) were never committed, so the motion section
rendered four empty boxes reading "Video file pending upload".

Everything is now local. The site has no third-party origin at all: no CDN, no
font service, no analytics, no external image host.

---

## Layout

```
index.html                     the whole page, one file
assets/css/site.css            hand-authored, mobile-first
assets/js/site.js              progressive enhancement only
assets/fonts/*.woff2           Syne (display) + Manrope (body), self-hosted
games/*.png + *.webp           22 game thumbnails, 302/604/906 WebP + PNG fallback
media/*.mp4 + *-poster.webp    4 clips, two rungs each, plus poster frames
og-cover.png                   1200x630 share card
Norair_Harutyunyan_Resume.pdf  linked from the hero and the profile band
favicon.svg / favicon.ico / apple-touch-icon.png
robots.txt / sitemap.xml / .nojekyll
```

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
all. Regenerate with `D:/_norair_src/encode.sh` if the sources change.

## Thumbnail pipeline

Thumbnails used to be the one asset with no headroom. The first build had only
the 302x302 tiles Pascal Gaming ships — their own file is literally named
`302X302 Avinho R10.png` — so the 604 rung was a baked Lanczos upscale rather
than real detail. Those tiles had also been cut to square from wider key art,
which quietly clipped the wordmark off the edge of Mega Plinko, ChartX, Juicy
Storm and a dozen others.

Norair supplied the 1254x1254 masters, which closes both problems at once. Every
tile is now the full square composition with nothing cropped, and the ladder is
three real rungs cut from the master instead of two part-invented ones:

| Rung | Width | Quality | Ladder total |
|---|---|---|---|
| `name.webp` | 302 | q84 | 0.59 MB |
| `name@2x.webp` | 604 | q82 | 1.51 MB |
| `name@3x.webp` | 906 | q80 | 2.37 MB |

Each rung is a Lanczos downscale plus an unsharp pass sized to the reduction:
heaviest at 302, where a 4.15x drop softens the most, lightest at 906. The
browser picks exactly one rung per tile, never the whole ladder.

`sizes` now names the fixed 476px a tile occupies once the shell caps at 92rem,
so a wide desktop stops fetching a 906 for a slot that never paints wider than
476. Below that cap the old percentage hints still apply.

The PNG inside each `<picture>` stays as the no-WebP fallback at 302, and no
browser that supports WebP ever requests it.

Regenerate the ladder with `D:/_norair_src/encode-thumbs.sh`, or directly:

```sh
ffmpeg -i master.PNG -vf "scale=906:906:flags=lanczos,unsharp=3:3:0.35:3:3:0.0" \
  -c:v libwebp -preset picture -compression_level 6 -quality 80 slug@3x.webp
```

## How the page behaves

- **Résumé links.** Both résumé buttons open the PDF in a new tab rather than
  forcing a download, so a reader can look before saving. Inside the PDF, phone,
  email, LinkedIn, Telegram and the portfolio are link annotations; the portfolio
  is repeated in the footer of both pages.
- **Boot screen.** Held until the fonts resolve, the document loads, and the
  first poster frame decodes; capped at 1.5s so a slow asset can never trap a
  visitor. It only exists when JavaScript runs.
- **Video.** Sources attach one viewport ahead of the clip, so playback starts
  full rather than buffering on screen. A `--soft` value written by an observer
  runs 0 while a clip is being watched and rises as it leaves, so each clip
  softens on the way out exactly as it sharpened on the way in, which also covers
  the hand-off from poster frame to first video frame. Clips pause off screen and
  on a hidden tab.
- **Motion switch.** The header control stops every clip, the hero canvas and all
  reveals at once, and remembers the choice. It defaults to the operating
  system's reduced-motion setting, and follows changes to it until someone
  chooses explicitly. This is the pause mechanism required by WCAG 2.2.2, so the
  per-clip buttons stay out of sight until hover or keyboard focus.
- **Hero canvas.** A slow ruby haze in WebGL, purely atmospheric. If the context
  is refused, or frames start costing more than 34ms, it steps aside and the CSS
  glow underneath carries the hero. It never renders under reduced motion.
- **Gallery.** Every thumbnail square is reserved in CSS, so lazy loading
  cannot shift the layout. A shimmer holds the slot until the image has decoded.

Without JavaScript the page is complete: all sections visible, all poster frames
shown, no overlay, every link live.

## Local preview

Any static server works. This repository is registered in `.claude/launch.json`:

```bash
node D:/_norair_src/serve.mjs 8231
```

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on
every push to `main`. There is no build step to go wrong.

## Editing

- **Game list:** the `.tile` blocks in `index.html`, numbered 01 to 22.
- **Copy:** all of it lives in `index.html`; there is no CMS and no data file.
- **Colour and type:** the custom properties at the top of `assets/css/site.css`.
- **Résumé:** `Norair_Harutyunyan_Resume.pdf` is generated, not hand-made. The
  generator lives at `D:/_norair_src/pdf/build-resume.mjs` (pdf-lib), with
  `fonts.mjs` fetching the static Syne and Manrope faces it embeds. Edit the
  copy in that script and re-run it, or replace the file keeping the filename.

## Known items for the owner

- Nineteen of the 22 game links are Pascal Gaming launcher URLs carrying a
  `launchToken`, a `partnerKey` and `mode=real`. They are inherited from the
  reference build. They are session-shaped and may expire; a public
  `pascalgaming.com/games/...` page is the durable alternative where one exists.
- The reference build pointed "Book of the Sun" at `pg-stage.rpd.cloud`, a
  staging host. That card now points at the public game page instead.
- Award entries in the recognition section are Pascal Gaming studio awards, and
  the section says so. They are not presented as individual awards.

## Reviewing the hero effect

The WebGL haze is skipped on software renderers (SwiftShader, llvmpipe) and on
machines reporting two cores or fewer, because there it costs main-thread time
that first paint needs. Append `?gl=force` to the URL to render it anyway, which
is also how it is checked in a headless browser.
