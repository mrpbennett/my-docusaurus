import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

// Grid of topic tiles: eyebrow (pillar), serif tag name, post count.
// `eyebrowFor(tag)` returns the small label shown above each tag name.
export default function TopicGrid({ tags, eyebrowFor, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <ul className={styles.grid}>
      {tags.map((tag) => (
        <li key={tag.permalink} className={styles.cell}>
          <Link className={styles.tile} to={tag.permalink} rel="tag">
            <span className="eyebrow">{eyebrowFor?.(tag) ?? "Topic"}</span>
            <Heading className={styles.name}>{tag.label}</Heading>
            <span className={styles.row}>
              <span>
                {tag.count} {tag.count === 1 ? "post" : "posts"}
              </span>
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
