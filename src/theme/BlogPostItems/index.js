// Swizzled (ejected) from @docusaurus/theme-classic BlogPostItems.
// Used by every post list (blog index, tag pages, author pages). Renders
// numbered index rows from post metadata instead of full post previews.
import React from "react";
import PostRow from "@site/src/components/PostRow";

export default function BlogPostItems({ items }) {
  return (
    <ol className="m-0 list-none border-t border-rule p-0">
      {items.map(({ content: { metadata } }) => (
        <PostRow key={metadata.permalink} post={metadata} headingLevel={2} showExcerpt />
      ))}
    </ol>
  );
}
