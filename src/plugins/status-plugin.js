// Fetches the time of the last commit to the home-ops repo at build time and
// publishes it as global data for the status strip under the navbar
// (src/components/StatusStrip). The strip refreshes it in the browser too;
// this value means the first paint already has a real date and the strip
// still works when the GitHub API is unreachable or rate-limited.
//
// Set GITHUB_TOKEN in the build environment to lift the unauthenticated
// rate limit (60 requests/hour per IP); it isn't required.

const TIMEOUT_MS = 5000;

async function fetchLastCommit(repo) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
  const [commit] = await res.json();
  return commit?.commit?.committer?.date ?? null;
}

module.exports = function statusPlugin(context) {
  const { repo } = context.siteConfig.customFields.status;

  return {
    name: "status-plugin",

    async loadContent() {
      try {
        return { lastCommit: await fetchLastCommit(repo) };
      } catch (error) {
        // Never fail the build over a decorative status line
        console.warn(`[status-plugin] Could not fetch last commit for ${repo}: ${error.message}`);
        return { lastCommit: null };
      }
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};
