// Thin wrapper around the official blog plugin that also publishes a summary
// of the blog as global data for the homepage, post pages and topic pages.
// Using the plugin's own content means dates, permalinks, excerpts and
// reading times always match the real blog pages.
//
// Global data (usePluginData("docusaurus-plugin-content-blog")):
//   posts     every listed post, newest first, with `number` (oldest = 1) and
//             `pillar` (id of the first pillar any of its tags belongs to)
//   tags      listed tags with post counts and pillar, most used first
//   pillars   customFields.pillars plus a `count` of posts in each
//   postCount number of listed posts
const blogPluginExports = require("@docusaurus/plugin-content-blog");

const defaultBlogPlugin = blogPluginExports.default;

function pillarLookup(pillars) {
  const byTag = new Map();
  for (const pillar of pillars) {
    for (const tag of pillar.tags) byTag.set(tag, pillar.id);
  }
  return (label) => byTag.get(label) ?? null;
}

async function blogPluginWithHomeData(context, options) {
  const blogPlugin = await defaultBlogPlugin(context, options);
  const pillars = context.siteConfig.customFields.pillars ?? [];
  const pillarOf = pillarLookup(pillars);

  return {
    ...blogPlugin,
    async contentLoaded(args) {
      await blogPlugin.contentLoaded(args);
      const { content, actions } = args;

      // content.blogPosts is newest first
      const listed = content.blogPosts.filter(({ metadata }) => !metadata.unlisted);

      const posts = listed.map(({ metadata }, index) => {
        const tags = metadata.tags.map(({ label, permalink }) => ({ label, permalink }));
        return {
          number: listed.length - index,
          title: metadata.title,
          permalink: metadata.permalink,
          date: metadata.date,
          description: metadata.description,
          readingTime: metadata.readingTime,
          pillar: tags.map((tag) => pillarOf(tag.label)).find(Boolean) ?? null,
          tags,
        };
      });

      const tags = Object.values(content.blogTags)
        .filter((tag) => !tag.unlisted)
        .map(({ label, permalink, description, items }) => ({
          label,
          permalink,
          description: description ?? null,
          count: items.length,
          pillar: pillarOf(label),
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

      actions.setGlobalData({
        posts,
        tags,
        pillars: pillars.map((pillar) => ({
          ...pillar,
          count: posts.filter((post) => post.pillar === pillar.id).length,
        })),
        postCount: posts.length,
      });
    },
  };
}

module.exports = {
  ...blogPluginExports,
  default: blogPluginWithHomeData,
};
