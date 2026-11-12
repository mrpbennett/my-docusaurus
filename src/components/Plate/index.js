import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Typographic cover for posts without photography: a faint grid, a large
// serif "glyph", and optional corner labels and terminal lines. Purely
// decorative, so it's hidden from assistive tech; the surrounding card or
// header carries the real title.
//
//   size    "card" | "feature" | "hero"
//   tint    use the accent tint instead of the raised surface
//   corner  [left, right] mono labels across the top
//   lines   terminal lines shown in a small console at the bottom
export default function Plate({ glyph, size = "card", tint = false, corner, lines, className }) {
  return (
    <div
      className={clsx(styles.plate, styles[size], tint && styles.tint, className)}
      aria-hidden="true"
    >
      {corner ? (
        <div className={styles.corner}>
          <span className="eyebrow">{corner[0]}</span>
          {corner[1] && <span className={styles.cornerRight}>{corner[1]}</span>}
        </div>
      ) : (
        <span />
      )}
      <div className={styles.glyph}>{glyph}</div>
      {lines?.length > 0 && (
        <pre className={styles.console}>
          {lines.map((line) => (
            <span key={line} className={styles.line}>
              <span className="ps1">❯</span> {line}
            </span>
          ))}
        </pre>
      )}
    </div>
  );
}
