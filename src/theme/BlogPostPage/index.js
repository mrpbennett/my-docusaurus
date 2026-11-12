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

const RAIL_SECTION = "border-t border-rule";
const RAIL_TITLE =
  "m-0 py-3 font-mono text-2xs font-medium tracking-wider text-heading uppercase";

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
    <header className="max-w-header pb-8">
      <p className="m-0 flex flex-wrap gap-2">
        {summary && <span className="eyebrow">No. {formatNumber(summary.number)}</span>}
        {(pillar || tag) && (
          <>
            {summary && <span className="eyebrow" aria-hidden="true">·</span>}
            <span className="eyebrow [--eyebrow-color:var(--c-heading)]">
              {[pillar?.label, tag?.label].filter(Boolean).join(" / ")}
            </span>
          </>
        )}
      </p>
      <h1 className="my-4 text-3xl leading-[1.04]">{title}</h1>
      {frontMatter.description && (
        <p className="m-0 max-w-[46ch] font-serif text-lead leading-[1.45] font-light text-soft">
          {frontMatter.description}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
        <img className="size-9 bg-tint object-cover" src={byline.image} alt="" width="36" height="36" />
        <span className="flex flex-col pr-4 leading-[1.35] sm:border-r sm:border-line max-sm:pr-0 [&_b]:font-medium [&_b]:text-heading [&>span]:text-muted max-sm:[&>span]:hidden">
          <b>{byline.name}</b>
          <span>{byline.title}</span>
        </span>
        <span className="font-mono text-xs text-muted">
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
    <section className={RAIL_SECTION} aria-labelledby="filed-under">
      <h2 id="filed-under" className={RAIL_TITLE}>
        Filed under
      </h2>
      <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] [&_a]:text-heading [&>dd]:m-0 [&>dd]:border-t [&>dd]:border-line [&>dd]:py-2 [&>dd]:text-right [&>dd]:font-mono [&>dd]:text-xs [&>dd]:leading-[1.6] [&>dd]:text-heading [&>dt]:m-0 [&>dt]:border-t [&>dt]:border-line [&>dt]:py-2 [&>dt]:pr-4 [&>dt]:text-muted">
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
      <article>
        <PostHeader summary={summary} pillar={pillar} />
        <Plate
          size="hero"
          tint
          glyph={tag ? `~/${tag}` : "~/notes"}
          corner={[pillar?.label ?? "Field note", summary && `No. ${formatNumber(summary.number)}`]}
        />
        <div className="grid grid-cols-1 gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_var(--rail-width)] lg:gap-18">
          <div className="min-w-0">
            {showToc && (
              <TOCCollapsible
                toc={toc}
                minHeadingLevel={tocMinHeadingLevel}
                maxHeadingLevel={tocMaxHeadingLevel}
                className="mb-8 lg:hidden"
              />
            )}
            <BlogPostItemContent>{children}</BlogPostItemContent>
          </div>
          <aside
            className="grid content-start gap-8 text-sm lg:sticky lg:top-[calc(var(--ifm-navbar-height)+1.5rem)] lg:max-h-[calc(100vh-var(--ifm-navbar-height)-3rem)] lg:self-start lg:overflow-y-auto lg:[scrollbar-width:thin]"
            aria-label="About this post"
          >
            {showToc && (
              <section className={clsx(RAIL_SECTION, "max-lg:hidden")} aria-labelledby="toc-title">
                <h2 id="toc-title" className={RAIL_TITLE}>
                  Contents
                </h2>
                <TOC
                  toc={toc}
                  minHeadingLevel={tocMinHeadingLevel}
                  maxHeadingLevel={tocMaxHeadingLevel}
                  className="static max-h-none overflow-visible"
                />
              </section>
            )}
            <FiledUnder pillar={pillar} />
          </aside>
        </div>
      </article>
      {(nextItem || prevItem) && (
        <div className="max-w-measure">
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
