// Adds Tailwind CSS v4 to Docusaurus' PostCSS pipeline. Tailwind is set up in
// src/css/custom.css (theme tokens, sources, no preflight).
module.exports = function tailwindPlugin() {
  return {
    name: "tailwind-plugin",
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(require("@tailwindcss/postcss"));
      return postcssOptions;
    },
  };
};
