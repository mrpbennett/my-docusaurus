// Wraps @theme-original/BlogPostItem/Header/Info.
// On the post page, puts the post's tags on the same line as date and reading
// time (they're removed from the footer, see ../../Footer).
import React from "react";
import Info from "@theme-original/BlogPostItem/Header/Info";
import Tag from "@theme/Tag";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import styles from "./styles.module.css";

export default function InfoWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { tags } = metadata;

  if (!isBlogPostPage || tags.length === 0) {
    return <Info {...props} />;
  }

  return (
    <div className={styles.meta}>
      <Info {...props} className={styles.info} />
      <ul className={styles.tags} aria-label="Tags">
        {tags.map((tag) => (
          <li key={tag.permalink}>
            <Tag {...tag} />
          </li>
        ))}
      </ul>
    </div>
  );
}
