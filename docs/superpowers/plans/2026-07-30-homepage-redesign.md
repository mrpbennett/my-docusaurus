# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current blog-at-root homepage into a custom landing page with a blurb + recent posts + "View all posts" link, with the blog moved to `/blog`.

**Architecture:** Two-file change — a small aggregation plugin reads blog post metadata at build time and stores it in Docusaurus's global data registry; a new `index.js` page reads that data and renders the blurb + recent posts. The blog config changes from `routeBasePath: "/"` to `"/blog"`.

**Tech Stack:** Docusaurus 3.9, React, gray-matter (already installed), fs-extra (already installed)

## Global Constraints

- No new npm dependencies
- Terminal-prompt style matches existing About page
- Navbar unchanged
- Existing blog pages (tags, etc.) remain at same relative paths

---

### Task 1: Change blog routeBasePath

**Files:**
- Modify: `docusaurus.config.js:55`

- [ ] **Step 1: Edit routeBasePath**

Change `routeBasePath: "/"` to `routeBasePath: "/blog"`:

```js
// docusaurus.config.js, line 55
blog: {
  routeBasePath: "/blog",
  blogTitle: "ramblings from mrpbennett",
```

- [ ] **Step 2: Verify the change**

Run the dev server and check that `/blog` shows the blog list and `/` shows nothing (or a dev 404):

```bash
npm run start
```

Expected: Navigate to `http://localhost:3000/blog` and see blog list. Navigate to `http://localhost:3000/` and see no content.

Kill the server when done.

---

### Task 2: Create the recent-posts plugin

**Files:**
- Create: `src/plugins/recent-posts.js`

This plugin reads the blog directory at build time, parses frontmatter, and stores the latest 5 posts' metadata in Docusaurus's global data registry so the homepage can access them.

- [ ] **Step 1: Create the plugin file**

```js
const path = require('path');
const fs = require('fs-extra');
const matter = require('gray-matter');

module.exports = function () {
  return {
    name: 'recent-posts',

    async loadContent() {
      const blogDir = path.resolve(process.cwd(), 'blog');
      if (!(await fs.pathExists(blogDir))) {
        return { recentPosts: [] };
      }

      const files = [];
      await collectFiles(blogDir, files);

      const posts = [];
      for (const filePath of files) {
        const relPath = path.relative(blogDir, filePath);
        const raw = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(raw);

        // Date from directory structure: blog/YYYY/MM/slug.md
        const parts = relPath.split(path.sep);
        const slug = path.basename(filePath, path.extname(filePath));
        let date;
        if (parts.length >= 3) {
          date = new Date(`${parts[0]}-${parts[1]}-01`);
        }

        posts.push({
          title: data.title || slug,
          description: data.description || '',
          date: date ? date.toISOString() : '',
          permalink: `/blog/${slug}`,
          tags: data.tags || [],
        });
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { recentPosts: posts.slice(0, 5) };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};

async function collectFiles(dir, result) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, result);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      result.push(fullPath);
    }
  }
}
```

- [ ] **Step 2: Register the plugin in docusaurus.config.js**

Add to the `plugins` array:

```js
plugins: ['./src/plugins/recent-posts.js'],
```

---

### Task 3: Create the custom homepage

**Files:**
- Create: `src/pages/index.js`

This page renders the terminal-style blurb, recent posts, and "View all posts" link using the data from the recent-posts plugin.

- [ ] **Step 1: Create the homepage**

```jsx
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';

export default function Home() {
  const { recentPosts } = usePluginData('recent-posts');

  return (
    <Layout title="Home" description="mrpbennett.dev">
      <main className="home-main">
        <p className="home-prompt" style={{ color: 'var(--ifm-color-primary)' }}>
          mrpbennett@dino:~ $ cat README.md
        </p>

        <div className="home-blurb">
          <p>
            I'm Paul a Software Writer based in Dorest who loves the terminal. I
            enjoy building applications with AI and tinkering with my homelab
            using Kubernetes. Main languages of choice are Python and SQL,
            whilst trying to learn Go. Currently a Lead Solution Engineer in
            AdTech.
          </p>
          <p>
            My life's work is to make technology easy to understand and
            interesting to learn about. Husband, doggo dad and biker.
          </p>
        </div>

        <p className="home-section-title" style={{ color: 'var(--ifm-color-primary)' }}>
          $ ls ~/posts | tail -5
        </p>

        <div className="home-posts">
          {recentPosts.map((post) => (
            <article key={post.permalink} className="home-post">
              <h3 className="home-post-title">
                <Link to={post.permalink}>{post.title}</Link>
              </h3>
              {post.description && (
                <p className="home-post-desc">{post.description}</p>
              )}
              <time className="home-post-date" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </article>
          ))}
        </div>

        <Link to="/blog" className="home-view-all">
          View all posts →
        </Link>

        <p className="home-prompt" style={{ color: 'var(--ifm-color-primary)' }}>
          $
        </p>
      </main>
    </Layout>
  );
}
```

- [ ] **Step 2: Add CSS for the homepage**

Add to `src/css/custom.css` (appended at end):

```css
/* Homepage styles */
.home-main {
  max-width: 760px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  font-family: "JetBrains Mono", monospace;
}

.home-prompt {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  margin-bottom: 2.5rem;
}

.home-blurb p {
  font-size: 1.125rem;
  line-height: 1.75;
  margin-bottom: 1.5rem;
}

.home-section-title {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.home-posts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.home-post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.home-post-title a {
  color: var(--ifm-font-color-base);
  text-decoration: none;
}

.home-post-title a:hover {
  color: var(--ifm-color-primary);
}

.home-post-desc {
  font-size: 0.875rem;
  color: var(--ifm-color-emphasis-600);
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.home-post-date {
  font-size: 0.75rem;
  color: var(--ifm-color-emphasis-400);
}

.home-view-all {
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.home-view-all:hover {
  text-decoration: underline;
}
```

---

### Task 4: Verify everything works

- [ ] **Step 1: Run the dev server**

```bash
npm run start
```

Expected output:
- `http://localhost:3000/` — shows the custom homepage with blurb, 5 recent posts, "View all posts →"
- `http://localhost:3000/blog` — shows the full blog listing
- `http://localhost:3000/tags` — still works
- `http://localhost:3000/about` — still works

- [ ] **Step 2: Check build**

```bash
npm run build
```

Expected: Site builds without errors.

## Spec coverage check

- RouteBasePath changed to /blog: ✓ Task 1
- Homepage with terminal-prompt blurb: ✓ Task 3
- About page paragraphs in blurb: ✓ Task 3
- Recent Posts (up to 5): ✓ Task 2 + 3
- View all posts → link: ✓ Task 3
- Navbar unchanged: ✓ (not touched)
- No new dependencies: ✓ (gray-matter and fs-extra already present)
