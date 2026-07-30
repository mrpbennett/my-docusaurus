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
