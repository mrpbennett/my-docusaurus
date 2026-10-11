// Swizzled (ejected) from @docusaurus/theme-classic BlogPostItems.
// Used by every post list (blog index, tag pages, author pages). Renders compact
// rows from post metadata instead of full post previews.
import React from "react";
import PostRow from "@site/src/components/PostRow";
import styles from "./styles.module.css";

export default function BlogPostItems({ items }) {
  return (
    <ol className={styles.rows}>
      {items.map(({ content: { metadata } }) => (
        <PostRow key={metadata.permalink} post={metadata} headingLevel={2} />
      ))}
    </ol>
  );
}
