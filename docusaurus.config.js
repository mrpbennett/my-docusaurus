// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import graphite from "./src/prism/graphite.js";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// [family, file stem, CSS weight, styles]. Files live in /static/fonts.
const fontFaces = [
  ["IBM Plex Sans", "ibm-plex-sans-latin-wght", "100 700", ["normal", "italic"]],
  ["IBM Plex Serif", "ibm-plex-serif-latin-300", "300", ["normal", "italic"]],
  ["IBM Plex Serif", "ibm-plex-serif-latin-400", "400", ["normal", "italic"]],
  ["IBM Plex Mono", "ibm-plex-mono-latin-400", "400", ["normal"]],
  ["IBM Plex Mono", "ibm-plex-mono-latin-500", "500", ["normal"]],
]
  .flatMap(([family, file, weight, styles]) =>
    styles.map(
      (style) =>
        `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(/fonts/${file}-${style}.woff2) format("woff2")}`,
    ),
  )
  .join("");

// Topic groups shown on the homepage, tags page and post rail. Each tag
// belongs to at most one pillar; posts take the pillar of their first tag
// that has one (see src/plugins/blog-plugin.js).
const PILLARS = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    title: "The cluster",
    description: "Kubernetes, Talos, GitOps, storage and the observability around it.",
    tags: ["homelab", "kubernetes", "devops"],
  },
  {
    id: "developer",
    label: "Developer",
    title: "The toolbox",
    description: "Terminal setups, editors, CLI tools, Python, SQL, Go and AI workflow.",
    tags: ["terminal", "ai", "go", "sql", "databases", "trino", "editor", "neovim", "linux", "omarchy"],
  },
  {
    id: "product",
    label: "Product design",
    title: "The craft",
    description: "Why some tools feel good to use, interface decisions, and making tech easy to follow.",
    tags: [],
  },
];

// The strip under the navbar. Edit by hand when the cluster changes; the
// home-ops last-commit time is fetched (src/plugins/status-plugin.js).
const STATUS = {
  homelab: { nodes: 3, kubernetes: "v1.37", talos: "v1.14.5" },
  repo: "mrpbennett/home-ops",
  now: "Cloud Associate Engineer",
  location: "Dorset, UK",
};

const SITE_URL = "https://mrpbennett.dev";
const DESCRIPTION =
  "Paul Bennett on the terminal, Python, SQL and Go, AI-assisted development, and running a Kubernetes homelab.";

// Site owner, used for site-wide Person JSON-LD and as the fallback author in
// each post's BlogPosting data (src/theme/BlogPostPage/StructuredData).
const PERSON = {
  "@type": "Person",
  "@id": `${SITE_URL}/#paul`,
  name: "Paul Bennett",
  url: `${SITE_URL}/about`,
  jobTitle: "Lead Solutions Engineer",
  image: "https://avatars.githubusercontent.com/u/1844080?v=4",
  address: {
    "@type": "PostalAddress",
    addressRegion: "Dorset",
    addressCountry: "GB",
  },
  sameAs: [
    "https://github.com/mrpbennett",
    "https://x.com/mrpbennett",
    "https://www.linkedin.com/in/paulandrewbennett",
  ],
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "mrpbennett.dev",
  customFields: { person: PERSON, pillars: PILLARS, status: STATUS },
  headTags: [
    {
      tagName: "script",
      attributes: {},
      innerHTML:
        "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};",
    },
    // Self-hosted fonts. Declared here rather than in custom.css so webpack
    // doesn't fingerprint the URLs and they match the preload links below.
    {
      tagName: "style",
      attributes: {},
      innerHTML: fontFaces,
    },
    // Preload the two fonts used above the fold so text doesn't reflow on load
    ...["ibm-plex-sans-latin-wght-normal", "ibm-plex-serif-latin-300-normal"].map(
      (font) => ({
        tagName: "link",
        attributes: {
          rel: "preload",
          href: `/fonts/${font}.woff2`,
          as: "font",
          type: "font/woff2",
          crossorigin: "anonymous",
        },
      }),
    ),
    // Icons beyond the favicon.ico configured below
    { tagName: "link", attributes: { rel: "icon", type: "image/svg+xml", href: "/img/favicon.svg" } },
    { tagName: "link", attributes: { rel: "apple-touch-icon", href: "/img/apple-touch-icon.png" } },
    { tagName: "link", attributes: { rel: "manifest", href: "/site.webmanifest" } },
    {
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          PERSON,
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: "mrpbennett.dev",
            description: DESCRIPTION,
            inLanguage: "en-GB",
            author: { "@id": PERSON["@id"] },
          },
        ],
      }),
    },
  ],
  tagline: DESCRIPTION,
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: SITE_URL,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  organizationName: "mrpbennett", // Usually your GitHub org/user name.
  projectName: "docusaurus-blog", // Usually your repo name.
  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        // The blog is registered below via ./src/plugins/blog-plugin.js, a
        // wrapper that also exposes homepage data.
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          lastmod: "date",
          ignorePatterns: ["/search/**", "/search"],
        },
        gtag: {
          trackingID: "G-SX53WB34GC",
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Default social card; regenerate with scripts/images/build-images.sh
      image: "img/og-card.png",
      metadata: [
        // Fallback for pages that don't set their own description
        { name: "description", content: DESCRIPTION },
        { name: "author", content: "Paul Bennett" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@mrpbennett" },
        { name: "twitter:creator", content: "@mrpbennett" },
        { property: "og:site_name", content: "mrpbennett.dev" },
        { property: "og:locale", content: "en_GB" },
        { name: "theme-color", content: "#0f1113" },
      ],
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: false,
      },
      navbar: {
        // Wordmark only; ".dev" is added in CSS (.navbar__title::after)
        title: "mrpbennett",
        hideOnScroll: false,
        items: [
          { to: "/", label: "Index", position: "left", activeBaseRegex: "^/$" },
          {
            to: "/blog",
            label: "Writing",
            position: "left",
            // Highlight for posts and archive, but not the tags pages
            activeBaseRegex: "^/blog(?!/tags)",
          },
          { to: "/blog/tags", label: "Topics", position: "left" },
          { to: "/about", label: "About", position: "left" },
          { type: "search", position: "right" },
          {
            href: "pathname:///blog/rss.xml",
            label: "RSS",
            position: "right",
            className: "navbar-rss",
          },
          {
            href: "https://github.com/mrpbennett",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub profile",
          },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            title: "Explore",
            items: [
              { label: "Index", to: "/" },
              { label: "Writing", to: "/blog" },
              { label: "Topics", to: "/blog/tags" },
              { label: "Archive", to: "/blog/archive" },
              { label: "About", to: "/about" },
            ],
          },
          {
            title: "Topics",
            items: [
              { label: "Homelab", to: "/blog/tags/homelab" },
              { label: "Kubernetes", to: "/blog/tags/kubernetes" },
              { label: "Terminal", to: "/blog/tags/terminal" },
              { label: "AI", to: "/blog/tags/ai" },
            ],
          },
          {
            title: "Elsewhere",
            items: [
              { label: "GitHub", href: "https://github.com/mrpbennett" },
              { label: "X", href: "https://x.com/mrpbennett" },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/paulandrewbennett",
              },
              // TODO(paul): add more links here (e.g. Mastodon, Bluesky, email)
            ],
          },
          {
            title: "Subscribe",
            items: [
              // Plain hrefs: feeds aren't React routes
              { label: "RSS", href: "pathname:///blog/rss.xml" },
              { label: "Atom", href: "pathname:///blog/atom.xml" },
            ],
          },
        ],
        // Rendered as HTML. The AI note shows on every page by design.
        copyright: `<span>© ${new Date().getFullYear()} Paul Bennett</span><span class="footer-ai-note"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>Some content is created with AI assistance. <a href="/about#ai">Read more<span class="sr-only"> about how I use AI</span></a></span><a class="footer-top-link" href="#__docusaurus">Back to top ↑</a>`,
      },
      prism: {
        theme: graphite,
        darkTheme: graphite,
        additionalLanguages: [
          "bash",
          "sql",
          "http",
          "hcl",
          "toml",
          "lua",
          "ini",
          "docker",
          "ignore",
        ],
      },
    }),

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        indexDocs: false,
        indexBlog: true,
        blogRouteBasePath: "/blog",
        indexPages: true,
        explicitSearchResultPath: true,
        searchBarShortcutHint: true,
        searchResultLimits: 8,
      }),
    ],
  ],

  plugins: [
    "./src/plugins/status-plugin.js",
    [
      "./src/plugins/blog-plugin.js",
      {
        routeBasePath: "/blog",
        blogTitle: "Posts",
        blogDescription:
          "Every post on mrpbennett.dev: the terminal, Python, SQL and Go, AI-assisted development, and a Kubernetes homelab.",
        showReadingTime: true,
        // Navigation lives in the navbar; no left "recent posts" sidebar
        blogSidebarCount: 0,
        feedOptions: {
          type: ["rss", "atom"],
          xslt: true,
          title: "mrpbennett.dev",
          description: DESCRIPTION,
          copyright: `© ${new Date().getFullYear()} Paul Bennett`,
          language: "en-GB",
        },
        onInlineTags: "warn",
        onInlineAuthors: "warn",
        onUntruncatedBlogPosts: "warn",
      },
    ],
  ],
};

export default config;
