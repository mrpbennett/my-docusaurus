import React from "react";
import Link from "@docusaurus/Link";

// Grid of topic tiles: eyebrow (pillar), serif tag name, post count.
// `eyebrowFor(tag)` returns the small label shown above each tag name.
export default function TopicGrid({ tags, eyebrowFor, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(180px,1fr))] border-t border-l border-line p-0">
      {tags.map((tag) => (
        <li key={tag.permalink} className="m-0 border-r border-b border-line bg-raised">
          <Link
            className="flex h-full min-h-[150px] flex-col gap-6 p-5 text-inherit no-underline transition-[background] duration-[var(--dur)] hover:bg-sunken hover:text-inherit hover:no-underline"
            to={tag.permalink}
            rel="tag"
          >
            <span className="eyebrow">{eyebrowFor?.(tag) ?? "Topic"}</span>
            <Heading className="m-0 font-serif text-xl leading-[1.15] font-normal text-heading">
              {tag.label}
            </Heading>
            <span className="mt-auto flex justify-between font-mono text-xs text-muted">
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
