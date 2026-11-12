// Swizzled (ejected) from @theme-classic BlogArchivePage.
// Changes: the shared PageHeader instead of Infima's coloured hero, and each
// year as numbered index rows (newest first) instead of three bullet columns.
import React from "react";
import { PageMetadata } from "@docusaurus/theme-common";
import Heading from "@theme/Heading";
import BlogLayout from "@theme/BlogLayout";
import PageHeader from "@site/src/components/PageHeader";
import PostRow from "@site/src/components/PostRow";

// blogPosts arrive newest first; Map keeps the years in that order
function postsByYear(blogPosts) {
  const years = new Map();
  for (const { metadata } of blogPosts) {
    const year = metadata.date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), metadata]);
  }
  return [...years];
}

export default function BlogArchive({ archive }) {
  const years = postsByYear(archive.blogPosts);

  return (
    <>
      <PageMetadata title="Archive" description="Every post on mrpbennett.dev, by year." />
      <BlogLayout>
        <PageHeader eyebrow={`Archive · ${archive.blogPosts.length} entries`} title="Archive">
          <p>Everything, by year.</p>
        </PageHeader>
        {years.map(([year, posts]) => (
          <section key={year} className="py-8" aria-labelledby={`y${year}`}>
            <div className="mb-4 flex items-baseline justify-between">
              <Heading as="h2" id={`y${year}`} className="m-0 text-2xl">
                {year}
              </Heading>
              <span className="mono text-muted">{posts.length} posts</span>
            </div>
            <ol className="m-0 list-none border-t border-rule p-0">
              {posts.map((post) => (
                <PostRow key={post.permalink} post={post} />
              ))}
            </ol>
          </section>
        ))}
      </BlogLayout>
    </>
  );
}
