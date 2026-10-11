import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

// Posts opt in with front matter:
//   ai_assisted: true
//   ai_note: "Optional sentence that replaces the default disclosure text."
export const ABOUT_AI_PATH = "/about#ai";
const DISCLOSURE_ID = "ai-disclosure";
const DEFAULT_NOTE =
  "I wrote this post with help from AI for drafting, editing or code examples. I've reviewed, tested and edited everything before publishing.";

export function isAiAssisted(frontMatter) {
  return frontMatter?.ai_assisted === true;
}

export function SparkIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" />
    </svg>
  );
}

// Small pill under the post title; jumps to the disclosure at the end.
export function AiLabel() {
  return (
    <a className={styles.label} href={`#${DISCLOSURE_ID}`}>
      <SparkIcon />
      AI-assisted
    </a>
  );
}

// Short note at the end of the post.
export function AiDisclosure({ note }) {
  return (
    <aside
      id={DISCLOSURE_ID}
      className={styles.disclosure}
      aria-label="AI assistance disclosure"
    >
      <span className={styles.icon}>
        <SparkIcon size={16} />
      </span>
      <p>
        {note || DEFAULT_NOTE} <Link to={ABOUT_AI_PATH}>How I use AI</Link>
      </p>
    </aside>
  );
}
