import React from "react";
import clsx from "clsx";

// Typographic cover for posts without photography: a faint grid, a large
// serif "glyph", and optional corner labels and terminal lines. Purely
// decorative, so it's hidden from assistive tech; the surrounding card or
// header carries the real title.
//
//   size    "card" | "feature" | "hero"
//   tint    use the accent tint instead of the raised surface
//   corner  [left, right] mono labels across the top
//   lines   terminal lines shown in a small console at the bottom
const SIZES = {
  card: { box: "aspect-[4/3] p-3.5", glyph: "text-[44px]" },
  feature: { box: "aspect-[3/2] p-5", glyph: "text-[clamp(44px,6.5vw,88px)]" },
  hero: {
    box: "aspect-[4/1] min-h-[220px] px-7 py-6 max-sm:aspect-[4/3] max-sm:p-5",
    glyph: "text-[clamp(48px,8vw,112px)]",
  },
};

export default function Plate({ glyph, size = "card", tint = false, corner, lines, className }) {
  const { box, glyph: glyphSize } = SIZES[size];
  return (
    <div
      className={clsx(
        "relative flex flex-col justify-between gap-4 overflow-hidden border",
        // grid sits on ::before; children are lifted above it
        "before:pointer-events-none before:absolute before:inset-0 before:bg-grid before:content-[''] *:relative",
        tint
          ? "border-transparent bg-tint text-tint-ink [--eyebrow-color:var(--c-accent-ink)] before:opacity-[0.22]"
          : "border-line bg-raised text-heading before:opacity-55",
        box,
        className,
      )}
      aria-hidden="true"
    >
      {corner ? (
        <div className="flex justify-between gap-4">
          <span className="eyebrow">{corner[0]}</span>
          {corner[1] && (
            <span className={clsx("font-mono text-[12px] leading-[normal]", tint ? "text-tint-ink" : "text-muted")}>
              {corner[1]}
            </span>
          )}
        </div>
      ) : (
        <span />
      )}
      <div
        className={clsx(
          "font-serif leading-none font-light tracking-tightest wrap-anywhere",
          tint ? "text-tint-ink" : "text-heading",
          glyphSize,
        )}
      >
        {glyph}
      </div>
      {lines?.length > 0 && (
        <pre className="m-0 rounded-none border border-line bg-[color-mix(in_srgb,var(--c-bg-raised)_88%,transparent)] px-3 py-2.5 font-mono text-[12px] leading-[1.65] whitespace-pre-wrap text-soft">
          {lines.map((line) => (
            <span key={line} className="block">
              <span className="ps1">❯</span> {line}
            </span>
          ))}
        </pre>
      )}
    </div>
  );
}
