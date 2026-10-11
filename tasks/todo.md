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
