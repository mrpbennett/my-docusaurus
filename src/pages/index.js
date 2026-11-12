import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Plate from "@site/src/components/Plate";
import PostRow from "@site/src/components/PostRow";
import Section from "@site/src/components/Section";
import TopicGrid from "@site/src/components/TopicGrid";
import {
  formatDate,
  formatNumber,
  isoDate,
  readingMinutes,
  useBlogData,
} from "@site/src/lib/blog";

const RECENT = 4;
const INDEX_ROWS = 10;
const TOPICS = 5;

function Masthead({ since }) {
  return (
    <section
      className="grid gap-8 pt-16 pb-12 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16"
      aria-label="Introduction"
    >
      <div>
        <p className="eyebrow">Field notes{since ? ` · since ${since}` : ""}</p>
        <h1 className="mt-4 mb-0 text-4xl leading-[1.02]">
          Notes from the terminal, the cluster &amp; the <em className="italic">space between</em>{" "}
          them.
        </h1>
      </div>
      <div>
        <p className="max-w-[40ch] text-md text-soft">
          I'm Paul, a Lead Solutions Engineer in AdTech. I write about the infrastructure I run
          myself, the tools I live in, and how good products get made.
        </p>
        <Link to="/about">More about me →</Link>
      </div>
    </section>
  );
}

function Pillars({ pillars }) {
  return (
    <ul
      className="mt-0 mb-12 grid list-none border-t border-rule p-0 md:grid-cols-3"
      aria-label="What I write about"
    >
      {pillars.map((pillar, index) => (
        <li
          key={pillar.id}
          className="group m-0 border-b border-line md:border-b-0 md:[&+&]:border-l md:[&+&]:border-line md:[&+&]:pl-5"
        >
          <Link
            to={`/blog/tags#${pillar.id}`}
            className="flex h-full flex-col gap-1.5 pt-[18px] pr-5 pb-[22px] text-inherit no-underline hover:text-inherit hover:no-underline"
          >
            <span className="eyebrow [--eyebrow-color:var(--c-heading)]">
              {String(index + 1).padStart(2, "0")} · {pillar.label}
            </span>
            <span
              className={clsx(
                "mt-1 font-serif text-xl leading-[1.2] text-heading",
                "group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4",
              )}
            >
              {pillar.title}
            </span>
            <span className="mb-1.5 text-[14.5px] text-muted">{pillar.description}</span>
            <span className="mono">
              {pillar.count > 0
                ? `${pillar.count} ${pillar.count === 1 ? "post" : "posts"}`
                : "first posts soon"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Feature({ post, pillarLabel }) {
  const tag = post.tags[0]?.label;
  return (
    <article className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <Link to={post.permalink} tabIndex={-1} aria-hidden="true" className="block no-underline">
        <Plate
          size="feature"
          tint
          glyph={tag ? `~/${tag}` : "~/notes"}
          corner={[[pillarLabel, tag].filter(Boolean).join(" · "), formatNumber(post.number)]}
          lines={[`cat ${post.permalink}`, `read ${readingMinutes(post.readingTime)}m`]}
        />
      </Link>
      <div className="flex flex-col">
        <p className="eyebrow m-0">
          No. {formatNumber(post.number)} ·{" "}
          <time dateTime={isoDate(post.date)}>{formatDate(post.date)}</time>
        </p>
        <h3 className="my-4 font-serif text-[clamp(2rem,1.5rem+1.6vw,2.5rem)] leading-[1.08] font-light tracking-[-0.02em]">
          <Link
            to={post.permalink}
            className="text-heading no-underline hover:underline hover:decoration-1 hover:underline-offset-[5px]"
          >
            {post.title}
          </Link>
        </h3>
        {post.description && <p className="line-clamp-4 text-[1.03rem] text-soft">{post.description}</p>}
        <p className="mono mt-auto mb-0 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-muted">
          <span>{readingMinutes(post.readingTime)} min read</span>
          {post.tags.map((t) => (
            <span key={t.permalink}>#{t.label}</span>
          ))}
        </p>
      </div>
    </article>
  );
}

function Card({ post, pillarLabel, tint }) {
  return (
    <li className="m-0">
      <Link
        to={post.permalink}
        className="group block text-inherit no-underline hover:text-inherit hover:no-underline"
      >
        <Plate size="card" tint={tint} glyph={formatNumber(post.number)} corner={[pillarLabel ?? "Note"]} />
        <h3
          className={clsx(
            "mt-3.5 mb-1.5 font-serif text-[1.2rem] leading-[1.22] font-normal",
            "group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[3px]",
          )}
        >
          {post.title}
        </h3>
        <span className="mono text-muted">
          {formatDate(post.date, { day: false })} · {readingMinutes(post.readingTime)} min
        </span>
      </Link>
    </li>
  );
}

export default function Home() {
  const { posts, tags, pillars, postCount } = useBlogData();
  const pillarLabel = (id) => pillars.find((pillar) => pillar.id === id)?.label;
  const [latest, ...rest] = posts;
  const since = posts.length ? isoDate(posts[posts.length - 1].date).slice(0, 4) : null;

  return (
    <Layout
      title="Paul Bennett — infrastructure, developer tools and product design"
      description="Paul Bennett's field notes: running a Kubernetes homelab, the terminal, Python, SQL and Go, AI-assisted development, and how good tools get made."
    >
      <main className="container pb-8">
        <Masthead since={since} />
        <Pillars pillars={pillars} />

        {latest && (
          <Section
            id="latest"
            title="Latest"
            aside={<span className="mono">No. {formatNumber(latest.number)}</span>}
          >
            <Feature post={latest} pillarLabel={pillarLabel(latest.pillar)} />
          </Section>
        )}

        {rest.length > 0 && (
          <Section id="recently" title="Recently" aside={<Link to="/blog">All writing →</Link>}>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(220px,42vw),1fr))] gap-x-4 gap-y-6 p-0">
              {rest.slice(0, RECENT).map((post, index) => (
                <Card
                  key={post.permalink}
                  post={post}
                  pillarLabel={pillarLabel(post.pillar)}
                  tint={index === 2}
                />
              ))}
            </ul>
          </Section>
        )}

        {tags.length > 0 && (
          <Section id="topics" title="Topics" aside={<Link to="/blog/tags">Every topic →</Link>}>
            <TopicGrid
              tags={tags.slice(0, TOPICS)}
              eyebrowFor={(tag) => pillarLabel(tag.pillar) ?? "Topic"}
            />
          </Section>
        )}

        <Section id="index" title="The index" aside={<span className="mono">{postCount} entries</span>}>
          {posts.length > 0 ? (
            <>
              <ol className="m-0 list-none border-t border-rule p-0">
                {posts.slice(0, INDEX_ROWS).map((post) => (
                  <PostRow key={post.permalink} post={post} />
                ))}
              </ol>
              {postCount > INDEX_ROWS && (
                <p className="mt-6 mb-0 text-sm">
                  <Link to="/blog">All {postCount} posts →</Link>
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">No posts yet.</p>
          )}
        </Section>

      </main>
    </Layout>
  );
}
