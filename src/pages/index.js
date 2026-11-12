import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import Plate from "@site/src/components/Plate";
import PostRow from "@site/src/components/PostRow";
import TopicGrid from "@site/src/components/TopicGrid";
import {
  formatDate,
  formatNumber,
  isoDate,
  readingMinutes,
  useBlogData,
} from "@site/src/lib/blog";
import styles from "./index.module.css";

const RECENT = 4;
const INDEX_ROWS = 10;
const TOPICS = 5;

function Section({ id, title, aside, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        <Heading as="h2" id={id} className={styles.sectionTitle}>
          {title}
        </Heading>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Masthead({ since }) {
  return (
    <section className={styles.masthead} aria-label="Introduction">
      <div>
        <p className="eyebrow">Field notes{since ? ` · since ${since}` : ""}</p>
        <h1 className={styles.headline}>
          Notes from the terminal, the cluster &amp; the <em>space between</em> them.
        </h1>
      </div>
      <div className={styles.intro}>
        <p>
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
    <ul className={styles.pillars} aria-label="What I write about">
      {pillars.map((pillar, index) => (
        <li key={pillar.id} className={styles.pillar}>
          <Link to={`/blog/tags#${pillar.id}`} className={styles.pillarLink}>
            <span className={clsx("eyebrow", styles.pillarEyebrow)}>
              {String(index + 1).padStart(2, "0")} · {pillar.label}
            </span>
            <span className={styles.pillarTitle}>{pillar.title}</span>
            <span className={styles.pillarText}>{pillar.description}</span>
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
    <article className={styles.feature}>
      <Link to={post.permalink} tabIndex={-1} aria-hidden="true" className={styles.featurePlate}>
        <Plate
          size="feature"
          tint
          glyph={tag ? `~/${tag}` : "~/notes"}
          corner={[[pillarLabel, tag].filter(Boolean).join(" · "), formatNumber(post.number)]}
          lines={[`cat ${post.permalink}`, `read ${readingMinutes(post.readingTime)}m`]}
        />
      </Link>
      <div className={styles.featureText}>
        <p className="eyebrow">
          No. {formatNumber(post.number)} ·{" "}
          <time dateTime={isoDate(post.date)}>{formatDate(post.date)}</time>
        </p>
        <h3 className={styles.featureTitle}>
          <Link to={post.permalink}>{post.title}</Link>
        </h3>
        {post.description && <p className={styles.featureExcerpt}>{post.description}</p>}
        <p className={clsx("mono", styles.featureMeta)}>
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
    <li className={styles.card}>
      <Link to={post.permalink} className={styles.cardLink}>
        <Plate size="card" tint={tint} glyph={formatNumber(post.number)} corner={[pillarLabel ?? "Note"]} />
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <span className="mono">
          {formatDate(post.date, { day: false })} · {readingMinutes(post.readingTime)} min
        </span>
      </Link>
    </li>
  );
}

function FeedCta() {
  return (
    <section className={styles.cta} aria-labelledby="subscribe">
      <div>
        <h2 id="subscribe" className={styles.ctaTitle}>
          Get the next field note.
        </h2>
        <p>New posts every few weeks. No newsletter and no tracking pixels, just a feed.</p>
      </div>
      <div className={styles.ctaLinks}>
        <a className="btn" href="/blog/rss.xml">
          RSS feed
        </a>
        <a className="btn btn--ghost" href="/blog/atom.xml">
          Atom
        </a>
        <a className="btn btn--ghost" href="https://github.com/mrpbennett" rel="me noopener">
          GitHub
        </a>
      </div>
    </section>
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
      <main className={clsx("container", styles.page)}>
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
            <ul className={styles.cards}>
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
              <ol className={styles.rows}>
                {posts.slice(0, INDEX_ROWS).map((post) => (
                  <PostRow key={post.permalink} post={post} />
                ))}
              </ol>
              {postCount > INDEX_ROWS && (
                <p className={styles.more}>
                  <Link to="/blog">All {postCount} posts →</Link>
                </p>
              )}
            </>
          ) : (
            <p className={styles.empty}>No posts yet.</p>
          )}
        </Section>

        <FeedCta />
      </main>
    </Layout>
  );
}
