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

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "mrpbennett.dev",
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
  ],
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://mrpbennett.dev",
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
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "mrpbennett.dev",
        logo: {
          alt: "My Site Logo",
          src: "img/logo.svg",
        },
        items: [
          { to: "/blog", label: "Posts", position: "left" },
          { to: "/blog/tags", label: "Tags", position: "left" },
          {
            href: "https://github.com/mrpbennett",
            logo: {
              src: "img/logo.svg",
              alt: "GitHub Logo",
            },
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Blog",
            items: [
              {
                label: "All Posts",
                to: "/blog",
              },
              {
                label: "Tags",
                to: "/blog/tags",
              },
            ],
          },
          {
            title: "Connect",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/mrpbennett",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} mrpbennett.dev. Built with Docusaurus.`,
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

  plugins: [
    [
      "./src/plugins/blog-plugin.js",
      {
        routeBasePath: "/blog",
        blogTitle: "ramblings from mrpbennett",
        blogDescription: "lalalalalala",
        showReadingTime: true,
        feedOptions: {
          type: ["rss", "atom"],
          xslt: true,
        },
        onInlineTags: "warn",
        onInlineAuthors: "warn",
        onUntruncatedBlogPosts: "warn",
      },
    ],
  ],
};

export default config;
