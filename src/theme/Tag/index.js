// Swizzled (ejected) from @docusaurus/theme-classic Tag.
// Changes: uses the site-wide `tag-chip` style and gives the count an
// accessible label.
import React from "react";
import Link from "@docusaurus/Link";

export default function Tag({ permalink, label, count, description }) {
  return (
    <Link rel="tag" href={permalink} title={description} className="tag-chip">
      {label}
      {count ? (
        <span className="tag-chip__count">
          {count}
          <span className="sr-only">{count === 1 ? " post" : " posts"}</span>
        </span>
      ) : null}
    </Link>
  );
}
