// Swizzled (ejected) from @docusaurus/theme-classic BlogListPage.
// Changes: adds a visible page header (the stock page has no h1) and links to
// the tags index and archive.
import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import BlogListPaginator from "@theme/BlogListPaginator";
import SearchMetadata from "@theme/SearchMetadata";
import BlogPostItems from "@theme/BlogPostItems";
import BlogListPageStructuredData from "@theme/BlogListPage/StructuredData";
import PageHeader from "@site/src/components/PageHeader";

function BlogListPageMetadata({ metadata }) {
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const isBlogOnlyMode = permalink === "/";
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent({ metadata, items, sidebar }) {
  const { page, totalPages, totalCount } = metadata;
  return (
    <BlogLayout sidebar={sidebar}>
      <PageHeader
        eyebrow={page > 1 ? `Writing · page ${page} of ${totalPages}` : `Writing · ${totalCount} entries`}
        title="Writing"
      >
        <p>
          Field notes on infrastructure, developer tools and the opinions behind them.
          Browse by <Link to="/blog/tags">topic</Link> or see the{" "}
          <Link to="/blog/archive">archive</Link>.
        </p>
      </PageHeader>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
