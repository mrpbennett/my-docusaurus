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

        const parts = relPath.split(path.sep);
        const fileSlug = path.basename(filePath, path.extname(filePath));
        const postDate = data.date
          ? new Date(data.date)
          : parts.length >= 3
            ? new Date(`${parts[0]}-${parts[1]}-01`)
            : null;

        let permalink;
        if (data.slug && data.slug !== fileSlug) {
          permalink = `/blog/${data.slug.replace(/^\//, '')}`;
        } else if (parts.length >= 3) {
          permalink = `/blog/${parts[0]}/${parts[1]}/${fileSlug}`;
        } else {
          permalink = `/blog/${fileSlug}`;
        }

        posts.push({
          title: data.title || fileSlug,
          description: data.description || '',
          date: postDate ? postDate.toISOString() : '',
          permalink,
          tags: data.tags || [],
        });
      }

      const dated = posts.filter((p) => p.date);
      dated.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { recentPosts: dated.slice(0, 5) };
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
