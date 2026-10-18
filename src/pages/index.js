import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import PostRow from "@site/src/components/PostRow";
import styles from "./index.module.css";

// Tags surfaced in the hero, in display order. Any that don't exist
// (yet) are skipped, so this never produces a broken link.
const HERO_TAGS = ["terminal", "homelab", "kubernetes", "ai", "sql", "go"];

function Hero({ tags }) {
  const heroTags = HERO_TAGS.map((label) =>
    tags.find((tag) => tag.label === label),
  ).filter(Boolean);

  return (
    <section className={`container ${styles.hero}`} aria-label="Introduction">
      <h1 className={styles.name}>Paul Bennett</h1>
      <p className={styles.role}>Lead Solutions Engineer, AdTech</p>
      <div className={styles.bio}>
        <p>
          I'm Paul, a Lead Solutions Engineer in AdTech based in{" "}
          <strong>Dorset, UK</strong>. I live in the terminal, write mostly{" "}
          <strong>Python</strong> and <strong>SQL</strong> (and I'm learning{" "}
          <strong>Go</strong>), build things with AI, and tinker with my{" "}
          <strong>Kubernetes homelab</strong>.
        </p>
        <p>
          I like making technology easy to understand and interesting to learn
          about. Husband, dog dad and biker.{" "}
          <Link to="/about">More about me →</Link>
        </p>
      </div>
      {heroTags.length > 0 && (
        <ul className={styles.topics} aria-label="Topics I write about">
          {heroTags.map((tag) => (
            <li key={tag.permalink}>
              <Link to={tag.permalink}>{tag.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SectionHead({ id, command, label, link }) {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id} className={styles.sectionTitle}>
        <span aria-hidden="true">
          <span className="ps1">❯</span> {command}
        </span>
        <span className="sr-only">{label}</span>
      </h2>
      {link && <Link to={link.to}>{link.label} →</Link>}
    </div>
  );
}

export default function Home() {
  const { recentPosts, tags } = usePluginData("docusaurus-plugin-content-blog");

  return (
    <Layout
      title="Paul Bennett — terminal, data, AI and a Kubernetes homelab"
      description="Paul Bennett's blog: notes on the terminal, Python, SQL and Go, AI-assisted development, and running a Kubernetes homelab."
    >
      <main>
        <Hero tags={tags} />

        <section
          className={`container ${styles.section}`}
          aria-labelledby="latest-posts"
        >
          <SectionHead
            id="latest-posts"
            command={`ls -t ~/posts | head -${recentPosts.length}`}
            label="Latest posts"
            link={{ to: "/blog", label: "All posts" }}
          />
          {recentPosts.length > 0 ? (
            <ol className={styles.rows}>
              {recentPosts.map((post) => (
                <PostRow key={post.permalink} post={post} />
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>No posts yet.</p>
          )}
        </section>

        {tags.length > 0 && (
          <section
            className={`container ${styles.section}`}
            aria-labelledby="topics"
          >
            <SectionHead
              id="topics"
              command="ls ~/tags"
              label="Topics"
              link={{ to: "/blog/tags", label: "All tags" }}
            />
            <ul className={styles.tagCloud}>
              {tags.map((tag) => (
                <li key={tag.permalink}>
                  <Link className="tag-chip" to={tag.permalink}>
                    {tag.label}
                    <span className="tag-chip__count">
                      {tag.count}
                      <span className="sr-only">
                        {tag.count === 1 ? " post" : " posts"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </Layout>
  );
}
