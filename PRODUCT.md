# Product

## Register

brand

The design is the product. This is a portfolio: the page has to do the job a
reel does, which is to make a hiring lead want the person before they have
finished reading.

## Users

Art directors, studio leads, producers and recruiters in iGaming and game
studios, most of them opening the link from a message or a LinkedIn profile,
often on a phone, usually giving it under a minute before deciding whether to
keep scrolling. A second, smaller audience is peers and collaborators checking
specific titles.

The job to be done: judge, quickly, whether this person can run art production
at studio scale, and then find a way to contact them. For a production lead that
judgment rests on things a reel alone does not show: what shipped, how the work
is organised, and which disciplines it is organised across.

## Product Purpose

Present Norair Harutyunyan's released iGaming work and production leadership as
one page that loads anywhere, needs no login, and survives without any
third-party host. Success is a visitor reaching the contact block with a clear
sense of the range of the work: the shipped titles, the cinematics, a six-stage
pipeline, and the five disciplines it runs across.

Two things are deliberately not published: the size of the team and a count of
titles. The first is the studio's to disclose, not this page's; the second
invites counting instead of looking.

## Brand Personality

Composed, cinematic, exact. The voice states facts and gets out of the way: game
titles, mechanics, dates, counts. Nothing is claimed that a link cannot back up,
and studio awards are labelled as studio awards rather than personal ones. The
emotional target is confidence, not excitement; the art carries the colour, so
the interface stays dark and quiet around it.

Three words: cinematic, exact, unhurried.

## Anti-references

- The generated preview host the earlier version depended on. A portfolio whose
  images live on somebody else's temporary domain is not a portfolio.
- Template artist sites: masonry wall of thumbnails, no hierarchy, no order, no
  statement of what the person actually did.
- iGaming marketing pages: gold gradients, coin explosions, exclamation marks.
  The work already contains that energy; repeating it in the frame is noise.
- Motion for its own sake. Parallax on everything, scroll-jacking, a custom
  cursor, anything that plays without a cause the visitor can name.

## Design Principles

1. **The art is the loudest thing on the page.** Every interface surface stays
   near-black and low chroma so the game thumbnails and cinematics are the only
   saturated objects in view.
2. **Show the work, then the claim.** Key art is on screen before the first
   scroll; featured titles, the latest releases and the full grid come before
   any statement about process, leadership or awards.
3. **Own every byte.** No external host, no CDN, no font service. If it renders
   today it renders in three years.
4. **Nothing is claimed without a link.** Every title opens its details and from
   there the live game and the studio's own game page. Game facts are the ones
   the studio publishes. Studio awards are attributed to the studio in the same
   sentence.
5. **Motion has a cause.** It marks an arrival, answers the visitor, or runs on a
   clock the visitor can see and stop. Clips pull into focus to cover the
   poster-to-video swap; the reels settle the way a reel does; a tile leans
   because a pointer is on it. Motion with no cause gets cut.
6. **Show the production, not only the product.** A production lead's portfolio
   names the stages, the gates and the disciplines. They get the same finish as
   the artwork.
7. **Cut what does not earn its place.** Game-design detail lives one click
   away in the quick view, not on the page. A section says one thing.

## Accessibility & Inclusion

Target WCAG 2.1 AA.

- Motion is on by default, by the owner's decision, and the header's Motion
  switch is the single control that stops all of it: clips, the hero canvas,
  the reels, the number roll, the tilt, the ticker, the pipeline clock, the
  focus-pull blur and all reveals. The choice is remembered. This meets WCAG
  2.2.2 (a mechanism to pause, stop or hide) but it does not follow the
  operating system's reduced-motion setting, except when script is unavailable.
  That is a known trade-off, and reversing it is a one-line change in
  `site.js`: derive the default from `prefers-reduced-motion` again.
- The pipeline advances on its own, so it follows WCAG 2.2.2 as well: hover or
  focus holds it, the first interaction stops it for good, and the Motion switch
  turns it off.
- The quick view is a native modal dialog: focus is trapped inside it, Escape
  closes it, and focus returns to the tile that opened it.
- The Motion switch is the pause mechanism for auto-playing clips longer than
  five seconds (WCAG 2.2.2). There are no per-clip controls. Where a browser
  refuses autoplay (Low Power Mode, data savers), the first touch, click or key
  anywhere on the page starts the clips.
- The hero wall is a pointer shortcut into titles that are all in the Work grid
  under their own names, so it is hidden from assistive tech and kept out of the
  tab order rather than read out as forty-five unlabelled links.
- Every interactive target is at least 44px tall. Focus is always visible, never
  removed.
- The page is fully readable and navigable with JavaScript disabled.
- Body text holds 4.5:1 or better against its background in both the dark page
  and the light profile band; the sticky header inverts over that band so its
  own labels never drop below contrast.
