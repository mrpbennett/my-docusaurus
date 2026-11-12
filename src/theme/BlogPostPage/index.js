// Swizzled (ejected) from @theme-classic BlogPostPage.
// Changes: instead of BlogLayout's article + TOC columns, builds an editorial
// post: a full-width header (number, pillar, title, dek, byline) and cover
// plate, then the body next to a sticky rail with the contents and a
// "Filed under" summary. Collapsible TOC on narrow screens. The stock
// BlogPostItem Header/Footer aren't used on this page; Content still is, so
// the AI disclosure wrapper (../BlogPostItem/Content) applies.
import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { HtmlClassNameProvider, ThemeClassNames } from "@docusaurus/theme-common";
import { BlogPostProvider, useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogLayout from "@theme/BlogLayout";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostPaginator from "@theme/BlogPostPaginator";
import BlogPostPageMetadata from "@theme/BlogPostPage/Metadata";
import BlogPostPageStructuredData from "@theme/BlogPostPage/StructuredData";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import ContentVisibility from "@theme/ContentVisibility";
import Plate from "@site/src/components/Plate";
import { AiLabel, isAiAssisted } from "@site/src/components/AiDisclosure";
import {
  formatDate,
  formatNumber,
  isoDate,
  readingMinutes,
  usePillar,
  usePostSummary,
} from "@site/src/lib/blog";
import styles from "./styles.module.css";

// Posts rarely list `authors`; fall back to the site owner
function useByline(authors) {
  const { person } = useDocusaurusContext().siteConfig.customFields;
  const [author] = authors;
  return {
    name: author?.name ?? person.name,
    title: author?.title ?? person.jobTitle,
    image: author?.imageURL ?? person.image,
  };
}

// Docusaurus reads `last_update`; some posts use `last_updated`
function updatedDate(frontMatter) {
  return (frontMatter.last_update ?? frontMatter.last_updated)?.date ?? null;
}

function PostHeader({ summary, pillar }) {
  const { metadata } = useBlogPost();
  const { title, date, readingTime, authors, frontMatter } = metadata;
  const byline = useByline(authors);
  const tag = metadata.tags[0];

  return (
    <header className={styles.header}>
      <p className={styles.crumbs}>
        {summary && <span className="eyebrow">No. {formatNumber(summary.number)}</span>}
        {(pillar || tag) && (
          <>
            {summary && <span className="eyebrow" aria-hidden="true">·</span>}
            <span className={clsx("eyebrow", styles.crumbStrong)}>
              {[pillar?.label, tag?.label].filter(Boolean).join(" / ")}
            </span>
          </>
        )}
      </p>
      <h1 className={styles.title}>{title}</h1>
      {frontMatter.description && <p className={styles.dek}>{frontMatter.description}</p>}
      <div className={styles.byline}>
        <img className={styles.avatar} src={byline.image} alt="" width="36" height="36" />
        <span className={styles.author}>
          <b>{byline.name}</b>
          <span>{byline.title}</span>
        </span>
        <span className={styles.meta}>
          <time dateTime={isoDate(date)}>{formatDate(date)}</time> ·{" "}
          {readingMinutes(readingTime)} min read
        </span>
        {isAiAssisted(frontMatter) && <AiLabel />}
      </div>
    </header>
  );
}

function FiledUnder({ pillar }) {
  const { metadata } = useBlogPost();
  const { date, readingTime, tags, frontMatter } = metadata;
  const updated = updatedDate(frontMatter);

  return (
    <section className={styles.railSection} aria-labelledby="filed-under">
      <h2 id="filed-under" className={styles.railTitle}>
        Filed under
      </h2>
      <dl className={styles.spec}>
        {pillar && (
          <>
            <dt>Pillar</dt>
            <dd>
              <Link to={`/blog/tags#${pillar.id}`}>{pillar.label}</Link>
            </dd>
          </>
        )}
        {tags.length > 0 && (
          <>
            <dt>{tags.length === 1 ? "Tag" : "Tags"}</dt>
            <dd>
              {tags.map((tag, index) => (
                <React.Fragment key={tag.permalink}>
                  {index > 0 && " · "}
                  <Link to={tag.permalink} rel="tag">
                    {tag.label}
                  </Link>
                </React.Fragment>
              ))}
            </dd>
          </>
        )}
        <dt>Published</dt>
        <dd>
          <time dateTime={isoDate(date)}>{isoDate(date)}</time>
        </dd>
        {updated && (
          <>
            <dt>Updated</dt>
            <dd>
              <time dateTime={isoDate(updated)}>{isoDate(updated)}</time>
            </dd>
          </>
        )}
        <dt>Reading</dt>
        <dd>{readingMinutes(readingTime)} min</dd>
      </dl>
    </section>
  );
}

function BlogPostPageContent({ sidebar, children }) {
  const { metadata, toc } = useBlogPost();
  const { nextItem, prevItem, frontMatter, permalink, tags } = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  const summary = usePostSummary(permalink);
  const pillar = usePillar(summary?.pillar);
  const showToc = !hideTableOfContents && toc.length > 0;
  const tag = tags[0]?.label;

  return (
    <BlogLayout sidebar={sidebar}>
      <ContentVisibility metadata={metadata} />
      <article className={styles.post}>
        <PostHeader summary={summary} pillar={pillar} />
        <Plate
          size="hero"
          tint
          glyph={tag ? `~/${tag}` : "~/notes"}
          corner={[pillar?.label ?? "Field note", summary && `No. ${formatNumber(summary.number)}`]}
        />
        <div className={styles.body}>
          <div className={styles.content}>
            {showToc && (
              <TOCCollapsible
                toc={toc}
                minHeadingLevel={tocMinHeadingLevel}
                maxHeadingLevel={tocMaxHeadingLevel}
                className={styles.mobileToc}
              />
            )}
            <BlogPostItemContent>{children}</BlogPostItemContent>
          </div>
          <aside className={styles.rail} aria-label="About this post">
            {showToc && (
              <section className={clsx(styles.railSection, styles.railToc)} aria-labelledby="toc-title">
                <h2 id="toc-title" className={styles.railTitle}>
                  Contents
                </h2>
                <TOC
                  toc={toc}
                  minHeadingLevel={tocMinHeadingLevel}
                  maxHeadingLevel={tocMaxHeadingLevel}
                  className={styles.toc}
                />
              </section>
            )}
            <FiledUnder pillar={pillar} />
          </aside>
        </div>
      </article>
      {(nextItem || prevItem) && (
        <div className={styles.paginator}>
          <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
        </div>
      )}
    </BlogLayout>
  );
}

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}
      >
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <BlogPostPageContent sidebar={props.sidebar}>
          <BlogPostContent />
        </BlogPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
