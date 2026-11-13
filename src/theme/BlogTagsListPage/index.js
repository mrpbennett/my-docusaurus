// Swizzled (ejected) from @theme-classic BlogTagsListPage.
// Changes: tags grouped under the site's three pillars (customFields.pillars)
// as tiles with post counts, most used first, instead of an A–Z letter index.
// Tags without a pillar are listed under "Other".
import React from "react";
import clsx from "clsx";
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from "@docusaurus/theme-common";
import Heading from "@theme/Heading";
import BlogLayout from "@theme/BlogLayout";
import SearchMetadata from "@theme/SearchMetadata";
import PageHeader from "@site/src/components/PageHeader";
import TopicGrid from "@site/src/components/TopicGrid";
import { useBlogData } from "@site/src/lib/blog";

export default function BlogTagsListPage({ tags, sidebar }) {
  const { pillars, tags: summaries } = useBlogData();
  const pillarOf = new Map(summaries.map((tag) => [tag.permalink, tag.pillar]));
  const sorted = [...tags].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const groups = [
    ...pillars.map((pillar) => ({
      ...pillar,
      tags: sorted.filter((tag) => pillarOf.get(tag.permalink) === pillar.id),
    })),
    {
      id: "other",
      label: "Other",
      description: "Everything else.",
      tags: sorted.filter((tag) => !pillarOf.get(tag.permalink)),
    },
  ].filter((group) => group.id !== "other" || group.tags.length > 0);

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagsListPage)}
    >
      <PageMetadata title="Topics" description="Browse every post on mrpbennett.dev by topic." />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <PageHeader eyebrow={`Topics · ${tags.length} tags`} title="Topics">
          <p>Infrastructure, developer tools and my perspectives, most-written-about first.</p>
        </PageHeader>
        {groups.map((group, index) => (
          <section key={group.id} className="border-t border-line py-12" aria-labelledby={group.id}>
            <div className="mb-6">
              <p className="eyebrow mt-0 mb-2 [--eyebrow-color:var(--c-heading)]">
                {String(index + 1).padStart(2, "0")} · {group.label}
              </p>
              <Heading as="h2" id={group.id} className="mt-0 mb-2 text-2xl">
                {group.title ?? group.label}
              </Heading>
              <p className="m-0 max-w-[60ch] text-muted">{group.description}</p>
            </div>
            {group.tags.length > 0 ? (
              <TopicGrid tags={group.tags} eyebrowFor={() => group.label} />
            ) : (
              <p className="m-0 border border-dashed border-line-strong p-5 font-mono text-xs text-muted">
                First posts coming soon.
              </p>
            )}
          </section>
        ))}
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
