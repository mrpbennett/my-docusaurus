# mrpbennett.dev v3 redesign — "Field notes"

Mockup: `docs/design/mockup-v2.html` (toolbar: Home / Post / About / Dark; also `#post-dark` etc. in the URL).
Inspiration: workspaces.xyz (tokens pulled from its CSS: paper `#fbfaf6`, ink `#1a1916`, line `#e4e2db`,
muted `#6b6960`, sage `#dbe7d0`, IBM Plex Serif/Sans, 0 radius).

## Design direction
- **Ethos**: three pillars across the whole site — Infrastructure · Developer · Product design.
  Existing tags map onto a pillar (homelab/kubernetes → Infra; terminal/ai/go/sql/python → Developer).
- **Palette** (moved away from Workspaces' warm cream + sage, per Paul). Two candidates in the mockup, toggle "Palette A/B":
  - A "Ink & Violet": cool stone `#f6f5f2`, ink `#17171b`, lavender tint `#e6e1f7`, violet accent `#5b3fc4`; dark `#111114` / accent `#ab96ff`.
  - B "Graphite & Signal": cool grey `#f4f5f6`, ink `#14171b`, peach tint `#ffe4d1`, orange accent `#b93e0a`; dark `#0f1113` / accent `#ff8f55`.
  - Green `--ok` reserved for the status dot only. All text pairs ≥ 4.5:1 in all four modes (checked).
- **Type**: IBM Plex Serif (light 300 display headings), Plex Sans (body), Plex Mono (eyebrows, meta, code).
  Self-hosted woff2, replacing Inter + JetBrains Mono. Catppuccin Prism → a muted ink/sage Prism theme.
- **Engineering flavour**: status strip under the nav, numbered posts ("No. 028"), a per-post **spec sheet** rail
  (the counterpart to Workspaces' gear list), mono metadata, typographic grid "plates" as covers when a post has no image,
  an About "Changelog".

## Implementation (one commit per step, user approval before each commit)
- [x] 1. Tokens + fonts: swap fonts, rewrite `--c-*`/Infima mapping in `src/css/custom.css`, new Prism theme, 0 radius, both modes. Default to light? (Q1)
- [x] 2. Navbar (Index / Writing / Topics / About — no Uses) + status strip + footer. Strip: `homelab 3 nodes · k8s v1.37 · Talos v1.14.5`
      from `customFields`, plus **home-ops last commit** (sha · message · relative time → commit URL): fetched from
      `api.github.com/repos/mrpbennett/home-ops/commits/main` at build time in the blog plugin (SSR, no flash), refreshed
      client-side on load; keeps the build value on failure/rate limit (60 req/h unauthenticated)
- [x] 3. Blog plugin: expose post number (chronological index), pillar per post/tag, post index → global data
- [x] 4. Home: masthead, pillars, Latest feature, Recently cards, Topics, Index, feed CTA (`src/pages/index.js`)
- [x] 5. Post page: header (eyebrow/dek/byline/AI chip), hero plate/cover, 2-col body + sticky rail (Contents, Filed under), prev/next
- [x] 6. Blog list / tags / archive restyled to match the Index rows and Topics tiles
- [x] 7. About page rebuild (portrait = GitHub avatar URL so it tracks the profile picture, prose, three pillars, numbers, changelog, AI disclosure, contact)
- [x] 8. Verify: build, URL diff vs baseline (no permalink changes), contrast check, screenshots at 390/768/1366 both modes, Lighthouse

## Decisions (Paul, 2026-11-12)
- Palette **B "Graphite & Signal"** (orange). **Dark is the default** mode.
- **No `stack:` frontmatter**, so no spec sheet. Rail = Contents + Filed under.
- Status strip home-ops item: **"home-ops last commit · 2 days ago"** only (no hash, no message).
- Portrait + byline avatar = GitHub avatar URL. "Uses" dropped.
- Pillars from existing tags: Infra = homelab, kubernetes, devops · Developer = terminal, ai, go, sql, databases,
  trino, editor, neovim, linux, omarchy · Product design = none yet (shown honestly as "first posts soon").
- No new frontmatter. Covers are generated plates (post number / `~/tag`), or `image:` if a post sets one.

## Review (2026-11-12)
Implemented, uncommitted (awaiting Paul's approval). `npm run build` clean (no broken links), the URL set is
identical to the previous build (52 pages), no browser console errors on the main pages, and screenshots checked
at 1366 and 390 px in both modes. Every text and syntax colour pair is >= 4.5:1.
- Tokens/fonts: `src/css/custom.css` rewritten on the same 3 layers; IBM Plex Sans/Serif/Mono self-hosted
  (Inter/JetBrains removed); `src/prism/graphite.js` replaces Catppuccin.
- Status strip: `src/theme/Navbar` wrapper + `src/components/StatusStrip`; `src/plugins/status-plugin.js` fetches
  the home-ops last commit at build (optional `GITHUB_TOKEN`); the browser refreshes it as relative time.
- Data: `src/plugins/blog-plugin.js` adds `number`, `pillar`, `pillars[].count`; helpers in `src/lib/blog.js`.
- Pages: home, about, post (ejected `BlogPostPage`), list, topics, tag, archive (ejected). New `Plate`, `TopicGrid`.
  Removed unused `BlogPostItem/Header` + `Footer` swizzles.
- Assets: favicon/logo/icons/OG card regenerated; `build-images.sh` now also runs on Linux (chromium + magick).
- Follow-ups: "Product design" pillar has no tags yet, so it shows "first posts soon". Only 1 post has a
  `description:`, so the dek line rarely appears. Some posts' `last_updated` date is earlier than their publish date.

---

# mrpbennett.dev redesign

Mockup: `docs/design/mockup.html` (open in a browser; toolbar switches Home/Post and light/dark).

## Findings from repo inspection
- Docusaurus 3.9.2, plain JS (no TypeScript), no Tailwind. `docs: false`, blog at `/blog`.
- Homepage: `src/pages/index.js` + custom `src/plugins/recent-posts.js`. The plugin re-parses
  markdown with gray-matter and *guesses* dates from folder names (`YYYY-MM-01`), so its dates and
  permalinks can drift from Docusaurus's own.
- **Permalinks are mixed**: 21 posts use `slug:` → `/blog/<slug>`; 7 without a slug →
  `/blog/YYYY/MM/<file>`. Baseline URL list snapshotted; every build will be diffed against it.
- Only 5/28 posts have `date:`; the rest get their date from git history. Some use `last_update`,
  others `last_updated` (the latter is silently ignored). Out of scope — content untouched — but flagged.
- Google Fonts `@import` (render-blocking), `.markdown` forced to monospace, Dracula/GitHub Prism themes.
- `authors.yml` title typo: "Lead Solutions Enginer".
- Baseline `npm run build` passes; only warnings are 2 untracked-in-git posts.

## Design direction
- **Palette**: Catppuccin Mocha (dark, default) / Latte (light). Mauve = accent/links, green = prompt,
  peach = sparing highlight (pinned). Latte accents darkened for text so all pairs pass AA (verified ≥4.5:1).
- **Type**: JetBrains Mono (headings, code, meta) + Inter (body), both self-hosted via `@fontsource-variable/*`
  (woff2, `font-display: swap`, no third-party request).
- **Tokens** in `src/css/custom.css`: `--ctp-*` raw palette → semantic `--c-*` → mapped onto Infima `--ifm-*`.

## Implementation plan (one commit per area)
- [x] 1. Design system: fonts, tokens, Infima mapping, Catppuccin Prism themes, base a11y (focus rings), dark default
- [x] 2. Homepage: replace `recent-posts` plugin with a thin wrapper around the blog plugin exposing real
      metadata (date, reading time, tags, excerpt, `featured`) → terminal hero (CSS-only typing, reduced-motion safe),
      Pinned cards, Latest rows, tag cloud
- [x] 3. Blog: swizzle (wrap) BlogPostItem header/footer, post list rows, tag chips w/ counts, prose measure,
      code block title + copy styling, admonitions, tables, TOC, prev/next. Local search (`@easyops-cn/docusaurus-search-local`)
- [x] 4. About page, navbar (Home/Posts/Tags/About/search), expanded footer, AI disclosure (`ai_assisted`, `ai_note`)
- [x] 5. SEO: titles/descriptions, SVG logo + favicon set, OG image (1200×630), Person + BlogPosting JSON-LD,
      sitemap, canonical, RSS/Atom metadata
- [~] 6. a11y/perf pass (WebP conversion NOT done), Lighthouse at 360/768/1280, URL diff vs baseline

## Open questions (need answers before step 2/4)
- Which posts are pinned? (mockup guesses 3)
- About page facts / contact email / socials (authors.yml lists X + LinkedIn — include?)
- Keep Google Analytics (gtag)? It costs some Lighthouse perf; fine to keep.

## Review
Done in 6 local commits (e04e89b..d1071e1). Pinned section dropped per Paul. Build clean, post URLs unchanged.
Stopped before image optimisation (WebP) at Paul's request.
