// Swizzled (ejected) from @docusaurus/theme-classic BlogTagsPostsPage.
// Changes: header uses the shared PageHeader; tag is the title and the count
// and description sit underneath.
import React from "react";
import clsx from "clsx";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import { useBlogTagsPostsPageTitle } from "@docusaurus/theme-common/internal";
import Link from "@docusaurus/Link";
import BlogLayout from "@theme/BlogLayout";
import BlogListPaginator from "@theme/BlogListPaginator";
import SearchMetadata from "@theme/SearchMetadata";
import BlogPostItems from "@theme/BlogPostItems";
import Unlisted from "@theme/ContentVisibility/Unlisted";
import PageHeader from "@site/src/components/PageHeader";

function BlogTagsPostsPageMetadata({ tag }) {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata
        title={title}
        description={tag.description ?? `Posts about ${tag.label}.`}
      />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  );
}

function BlogTagsPostsPageContent({ tag, items, sidebar, listMetadata }) {
  return (
    <BlogLayout sidebar={sidebar}>
      {tag.unlisted && <Unlisted />}
      <PageHeader command={`ls ~/tags/${tag.label}`} title={`#${tag.label}`}>
        <p>
          {tag.count} {tag.count === 1 ? "post" : "posts"}
          {tag.description ? ` · ${tag.description}` : ""} ·{" "}
          <Link href={tag.allTagsPath}>All tags</Link>
        </p>
      </PageHeader>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={listMetadata} />
    </BlogLayout>
  );
}

export default function BlogTagsPostsPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}
    >
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
