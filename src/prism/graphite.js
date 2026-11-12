// "Graphite & Signal" syntax theme for prism-react-renderer.
// Colours are CSS variables (--syn-*, see src/css/custom.css), so one theme
// serves light and dark and stays in sync with the colour mode. Deliberately
// restrained: orange for keywords, one cool and one warm secondary, the rest
// in ink and muted greys.

/** @type {import('prism-react-renderer').PrismTheme} */
const graphite = {
  plain: {
    color: "var(--syn-plain)",
    backgroundColor: "var(--c-code-bg)",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--syn-comment)", fontStyle: "italic" },
    },
    { types: ["punctuation", "operator"], style: { color: "var(--syn-punct)" } },
    {
      types: ["keyword", "atrule", "important", "selector", "rule", "tag"],
      style: { color: "var(--syn-keyword)" },
    },
    {
      types: ["string", "char", "attr-value", "inserted", "regex", "url"],
      style: { color: "var(--syn-string)" },
    },
    {
      types: ["number", "boolean", "constant", "symbol", "unit", "entity"],
      style: { color: "var(--syn-number)" },
    },
    {
      types: ["function", "function-variable", "method"],
      style: { color: "var(--syn-function)" },
    },
    {
      types: ["class-name", "builtin", "namespace", "maybe-class-name"],
      style: { color: "var(--syn-type)" },
    },
    {
      types: ["property", "attr-name", "key", "variable", "parameter"],
      style: { color: "var(--syn-plain)" },
    },
    { types: ["deleted"], style: { color: "var(--syn-deleted)" } },
    { types: ["bold"], style: { fontWeight: "bold" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};

export default graphite;
