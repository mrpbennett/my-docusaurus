// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import catppuccin from "./src/prism/catppuccin.js";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const fontFaces = [
  ["Inter", "inter-latin-wght", "100 900"],
  ["JetBrains Mono", "jetbrains-mono-latin-wght", "100 800"],
]
  .flatMap(([family, file, weight]) =>
    ["normal", "italic"].map(
      (style) =>
        `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(/fonts/${file}-${style}.woff2) format("woff2")}`,
    ),
  )
  .join("");

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
  customFields: { person: PERSON },
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
    ...["inter-latin-wght-normal", "jetbrains-mono-latin-wght-normal"].map(
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
        { name: "theme-color", content: "#1e1e2e" },
      ],
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "mrpbennett.dev",
        hideOnScroll: false,
        logo: {
          alt: "mrpbennett.dev home",
          src: "img/logo.svg",
          width: 26,
          height: 26,
        },
        items: [
          { to: "/", label: "Home", position: "left", activeBaseRegex: "^/$" },
          {
            to: "/blog",
            label: "Posts",
            position: "left",
            // Highlight for posts and archive, but not the tags pages
            activeBaseRegex: "^/blog(?!/tags)",
          },
          { to: "/blog/tags", label: "Tags", position: "left" },
          { to: "/about", label: "About", position: "left" },
          { type: "search", position: "right" },
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
            title: "Site",
            items: [
              { label: "Posts", to: "/blog" },
              { label: "Tags", to: "/blog/tags" },
              { label: "Archive", to: "/blog/archive" },
              { label: "About", to: "/about" },
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
        theme: catppuccin,
        darkTheme: catppuccin,
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
