import React from "react";
import Link from "@docusaurus/Link";
import { formatDate, formatNumber, isoDate, usePostSummary } from "@site/src/lib/blog";

const meta = "font-mono text-xs text-muted";

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
    <Tag className="relative m-0 grid grid-cols-[56px_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-4 transition-[background] duration-[var(--dur)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent hover:bg-[linear-gradient(90deg,var(--c-bg-sunken),transparent)] md:grid-cols-[72px_minmax(0,1fr)_140px_96px] md:gap-x-6">
      <span className={meta}>{number ? formatNumber(number) : "—"}</span>
      <div className="min-w-0">
        <Heading className="m-0 font-serif text-lg leading-[1.3] font-normal tracking-[-0.01em]">
          <Link
            to={permalink}
            className="text-heading no-underline after:absolute after:inset-0 after:content-[''] hover:text-heading hover:no-underline focus-visible:outline-none"
          >
            {title}
          </Link>
        </Heading>
        {showExcerpt && description && (
          <p className="mt-1 mb-0 line-clamp-2 max-w-[64ch] text-[15px] leading-[1.55] text-muted">
            {description}
          </p>
        )}
      </div>
      <span className={`${meta} hidden md:block`}>{tags[0]?.label}</span>
      <time className={`${meta} text-right whitespace-nowrap`} dateTime={isoDate(date)}>
        {formatDate(date, { day: false })}
      </time>
    </Tag>
  );
}
