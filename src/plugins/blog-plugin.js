// Thin wrapper around the official blog plugin that also publishes a small
// summary of the blog as global data for the homepage (latest posts + tag
// counts). Using the plugin's own content means dates, permalinks, excerpts and
// reading times always match the real blog pages.
const blogPluginExports = require("@docusaurus/plugin-content-blog");

const defaultBlogPlugin = blogPluginExports.default;

const RECENT_POSTS = 5;

function summarisePost({ metadata }) {
  return {
    title: metadata.title,
    permalink: metadata.permalink,
    date: metadata.date,
    description: metadata.description,
    readingTime: metadata.readingTime,
    tags: metadata.tags.map(({ label, permalink }) => ({ label, permalink })),
  };
}

async function blogPluginWithHomeData(context, options) {
  const blogPlugin = await defaultBlogPlugin(context, options);

  return {
    ...blogPlugin,
    async contentLoaded(args) {
      await blogPlugin.contentLoaded(args);
      const { content, actions } = args;

      const listed = content.blogPosts.filter(
        ({ metadata }) => !metadata.unlisted,
      );
      const tags = Object.values(content.blogTags)
        .filter((tag) => !tag.unlisted)
        .map(({ label, permalink, items }) => ({
          label,
          permalink,
          count: items.length,
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

      actions.setGlobalData({
        recentPosts: listed.slice(0, RECENT_POSTS).map(summarisePost),
        tags,
        postCount: listed.length,
      });
    },
  };
}

module.exports = {
  ...blogPluginExports,
  default: blogPluginWithHomeData,
};
