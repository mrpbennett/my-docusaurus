import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

// One post in a list: date, title, excerpt, reading time and tags. The whole
// row is clickable via the title link's ::after overlay; tag links sit above
// it so they stay independently clickable.
// `headingLevel` keeps the outline valid: 2 directly under a page h1 (blog
// lists), 3 under a section h2 (homepage).
export default function PostRow({ post, as: Tag = "li", headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const { title, permalink, date, description, readingTime, tags = [] } = post;
  const isoDate = String(date).slice(0, 10);

  return (
    <Tag className={styles.row}>
      <time className={styles.date} dateTime={isoDate}>
        {isoDate}
      </time>
      <div>
        <Heading className={styles.title}>
          <Link to={permalink} className={styles.link}>
            {title}
          </Link>
        </Heading>
        {description && <p className={styles.excerpt}>{description}</p>}
        <div className={styles.meta}>
          {readingTime !== undefined && (
            <span>{Math.max(1, Math.ceil(readingTime))} min read</span>
          )}
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag.permalink}>
                  <Link className={`tag-chip ${styles.tag}`} to={tag.permalink}>
                    {tag.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Tag>
  );
}
