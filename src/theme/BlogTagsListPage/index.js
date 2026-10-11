// Swizzled (ejected) from @docusaurus/theme-classic BlogTagsListPage.
// Changes: a flat, scannable cloud of tag chips with post counts (most used
// first) instead of an A–Z letter index, which is overkill for a small tag set.
import React from "react";
import clsx from "clsx";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import SearchMetadata from "@theme/SearchMetadata";
import Tag from "@theme/Tag";
import PageHeader from "@site/src/components/PageHeader";
import styles from "./styles.module.css";

export default function BlogTagsListPage({ tags, sidebar }) {
  const sorted = [...tags].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}
    >
      <PageMetadata
        title="Tags"
        description="Browse every post on mrpbennett.dev by topic."
      />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <PageHeader command="ls ~/tags" title="Tags">
          <p>
            {tags.length} topics, most-written-about first.
          </p>
        </PageHeader>
        <ul className={styles.cloud}>
          {sorted.map((tag) => (
            <li key={tag.permalink}>
              <Tag {...tag} />
            </li>
          ))}
        </ul>
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
