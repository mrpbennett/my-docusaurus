# Homepage Redesign

Inspired by michelletilley.net — a clean homepage with an intro blurb and recent posts, with the blog moved to `/blog`.

## Changes

### 1. Blog path

- `docusaurus.config.js`: change `routeBasePath: "/"` → `routeBasePath: "/blog"`
- The blog list moves from `/` to `/blog`

### 2. New homepage (`src/pages/index.js`)

Custom React page with:

- **Prompt header**: `mrpbennett@dino:~ $ cat README.md` in primary color
- **Blurb**: Two paragraphs from the About page ("I'm Paul a Software Writer..." and "My life's work...")
- **Recent Posts section**: Up to 5 most recent posts, fetched via `useGlobalData`, each showing:
  - Title (link to post)
  - Description (blog post description)
  - Date (formatted)
- **"View all posts →"** link to `/blog`
- Terminal footer prompt (`$`)

Posts fetched via `@docusaurus/useGlobalData` from `docusaurus-plugin-content-blog`.

### 3. Navbar

Unchanged.

### 4. No new dependencies

Uses only: `@docusaurus/useGlobalData`, `@theme/Layout`, `@docusaurus/Link`, React.

## Files touched

| File | Action |
|------|--------|
| `docusaurus.config.js` | Edit: change `routeBasePath` |
| `src/pages/index.js` | Create: custom homepage |
