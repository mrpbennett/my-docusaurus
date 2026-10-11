// Catppuccin syntax theme for prism-react-renderer.
// Colours are CSS variables (see src/css/custom.css), so one theme serves both
// Latte (light) and Mocha (dark) and stays in sync with the colour mode.

/** @type {import('prism-react-renderer').PrismTheme} */
const catppuccin = {
  plain: {
    color: "var(--ctp-text)",
    backgroundColor: "var(--c-code-bg)",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--ctp-overlay1)", fontStyle: "italic" },
    },
    { types: ["punctuation"], style: { color: "var(--ctp-subtext0)" } },
    {
      types: ["keyword", "atrule", "important", "selector", "rule"],
      style: { color: "var(--ctp-mauve)" },
    },
    {
      types: ["string", "char", "attr-value", "inserted", "regex"],
      style: { color: "var(--ctp-green)" },
    },
    {
      types: ["number", "boolean", "constant", "symbol", "unit"],
      style: { color: "var(--ctp-peach)" },
    },
    {
      types: ["function", "function-variable", "method"],
      style: { color: "var(--ctp-blue)" },
    },
    {
      types: ["class-name", "builtin", "namespace", "maybe-class-name"],
      style: { color: "var(--ctp-yellow)" },
    },
    {
      types: ["property", "attr-name", "key", "variable", "parameter"],
      style: { color: "var(--ctp-lavender)" },
    },
    { types: ["tag"], style: { color: "var(--ctp-blue)" } },
    { types: ["operator", "entity", "url"], style: { color: "var(--ctp-teal)" } },
    { types: ["deleted"], style: { color: "var(--ctp-red)" } },
    { types: ["bold"], style: { fontWeight: "bold" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

export default catppuccin;
