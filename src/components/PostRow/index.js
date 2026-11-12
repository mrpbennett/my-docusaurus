import React from "react";
import Link from "@docusaurus/Link";
import { formatDate, formatNumber, isoDate, usePostSummary } from "@site/src/lib/blog";
import styles from "./styles.module.css";

// One post in an index list: number, serif title (+ optional excerpt), first
// tag and date. The whole row is clickable via the title link's ::after
// overlay. `headingLevel` keeps the outline valid: 2 directly under a page h1
// (blog lists), 3 under a section h2 (homepage).
export default function PostRow({ post, as: Tag = "li", headingLevel = 3, showExcerpt = false }) {
  const Heading = `h${headingLevel}`;
  const { title, permalink, date, description, tags = [] } = post;
  const summary = usePostSummary(permalink);
  const number = post.number ?? summary?.number;

  return (
    <Tag className={styles.row}>
      <span className={styles.number}>{number ? formatNumber(number) : "—"}</span>
      <div className={styles.main}>
        <Heading className={styles.title}>
          <Link to={permalink} className={styles.link}>
            {title}
          </Link>
        </Heading>
        {showExcerpt && description && <p className={styles.excerpt}>{description}</p>}
      </div>
      <span className={styles.tag}>{tags[0]?.label}</span>
      <time className={styles.date} dateTime={isoDate(date)}>
        {formatDate(date, { day: false })}
      </time>
    </Tag>
  );
}
