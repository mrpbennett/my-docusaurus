import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PageHeader from "@site/src/components/PageHeader";
import { SparkIcon } from "@site/src/components/AiDisclosure";
import { isoDate, useBlogData } from "@site/src/lib/blog";
import styles from "./about.module.css";

const CONTACT_EMAIL = "pbennett.uk@outlook.com";

// What each pillar covers, in tools. Keep to things there are posts about.
const PILLAR_DETAIL = {
  infrastructure: {
    text: "A Talos cluster on Proxmox, run GitOps-style with Argo CD.",
    tools: ["Talos · Proxmox", "Argo CD · Vault", "SeaweedFS · Prometheus"],
  },
  developer: {
    text: "The editor, shell and languages I use every day, and how I work with AI.",
    tools: ["Ghostty · Zellij · Helix", "Python · SQL · Go", "Claude Code"],
  },
  product: {
    quote: "Why does this tool feel good to use, and can I make mine feel like that?",
  },
};

// Newest first. Every entry links to the post it refers to.
const CHANGELOG = [
  {
    year: "2026",
    title: "Field notes",
    text: "Redesigned the site around three pillars: infrastructure, developer tools and product design.",
  },
  {
    year: "2025",
    title: "The homelab moves to Talos",
    text: "Rebuilt the cluster on Talos Linux in Proxmox.",
    link: { to: "/blog/talos-cluster-install", label: "Installing a Talos cluster in Proxmox" },
  },
  {
    year: "2024",
    title: "First cluster",
    text: "A highly available K3s cluster, with MetalLB in front of it.",
    link: { to: "/blog/installing-ha-k3s", label: "Installing a HA K3s cluster" },
  },
  {
    year: "2024",
    title: "First post",
    text: "Argo CD and the app-of-apps pattern.",
    link: {
      to: "/blog/installing-argocd-using-the-app-of-apps-pattern",
      label: "Installing ArgoCD using the app of apps pattern",
    },
  },
];

const CONTACT = [
  {
    title: "Say hello",
    text: "Questions about a post, or something I got wrong.",
    links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
  },
  {
    title: "Follow along",
    text: "Code, dotfiles and the home-ops repo live on GitHub.",
    links: [{ label: "github.com/mrpbennett", href: "https://github.com/mrpbennett" }],
  },
  {
    title: "Elsewhere",
    text: "Occasional posts and links, or subscribe to the feed.",
    links: [
      { label: "X", href: "https://x.com/mrpbennett" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/paulandrewbennett" },
      { label: "RSS", href: "/blog/rss.xml" },
    ],
  },
];

function Section({ id, title, aside, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        {/* Heading registers the id with the broken-anchor checker and offsets
            in-page jumps for the sticky navbar */}
        <Heading as="h2" id={id} className={styles.sectionTitle}>
          {title}
        </Heading>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function About() {
  const { person, status } = useDocusaurusContext().siteConfig.customFields;
  const { pillars, posts, postCount, tags } = useBlogData();
  const since = posts.length ? isoDate(posts[posts.length - 1].date).slice(0, 4) : null;

  const stats = [
    { value: postCount, label: "posts published" },
    { value: status.homelab.nodes, label: "nodes in the homelab" },
    { value: tags.length, label: "topics covered" },
    since && { value: since, label: "writing here since" },
  ].filter(Boolean);

  return (
    <Layout
      title="About"
      description="About Paul Bennett, a Lead Solutions Engineer in AdTech based in Dorset, UK, who writes about running a Kubernetes homelab, developer tools and product design."
    >
      <main className={`container ${styles.page}`}>
        <PageHeader eyebrow="About" title="Paul Bennett">
          <p>I run my own infrastructure, and I write down how it works.</p>
        </PageHeader>

        <section className={styles.intro} aria-label="Who I am">
          <figure className={styles.portrait}>
            <img src={person.image} alt="Paul Bennett" width="460" height="460" />
            <figcaption className="mono">{status.location} · husband, dog dad, biker</figcaption>
          </figure>
          <div className={styles.prose}>
            <p className={styles.lede}>
              I'm a Lead Solutions Engineer in AdTech. My job is turning complicated systems into
              things people can understand and use.
            </p>
            <p>
              I live in the terminal and write mostly Python and SQL. I'm learning Go, and I spend
              a lot of my spare time building things with AI and breaking (then fixing) a{" "}
              <Link to="/blog/tags/homelab">Kubernetes homelab</Link>.
            </p>
            <p>
              This site is a set of field notes: the tools I use, the problems I've worked through,
              and why some tools feel better to use than others.
            </p>
          </div>
        </section>

        <Section id="topics" title="What I write about">
          <ul className={styles.three}>
            {pillars.map((pillar, index) => {
              const detail = PILLAR_DETAIL[pillar.id] ?? {};
              return (
                <li key={pillar.id}>
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, "0")} · {pillar.label}
                  </span>
                  <h3 className={styles.threeTitle}>{pillar.title}</h3>
                  {detail.text && <p className={styles.threeText}>{detail.text}</p>}
                  {detail.quote && <blockquote className={styles.quote}>“{detail.quote}”</blockquote>}
                  {detail.tools && (
                    <ul className={styles.tools}>
                      {detail.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  )}
                  <Link className={styles.threeLink} to={`/blog/tags#${pillar.id}`}>
                    {pillar.count > 0 ? `Read ${pillar.label.toLowerCase()} →` : "First posts soon →"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="numbers" title="By the numbers">
          <dl className={styles.stats}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="changelog" title="Changelog" aside={<span className="mono">git log --oneline</span>}>
          <ol className={styles.timeline}>
            {CHANGELOG.map((entry) => (
              <li key={entry.title}>
                <span className="mono">{entry.year}</span>
                <div>
                  <h3 className={styles.timelineTitle}>{entry.title}</h3>
                  <p>
                    {entry.text}
                    {entry.link && (
                      <>
                        {" "}
                        <Link to={entry.link.to}>{entry.link.label}</Link>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="ai" title="How I use AI">
          <div className={styles.aiCard}>
            <span className={styles.aiIcon}>
              <SparkIcon size={16} />
            </span>
            <div>
              <p>
                Some of the content on this site is created with AI assistance, and I'd rather be
                upfront about it. I use AI tools to help with drafting, editing and writing code
                examples.
              </p>
              <p>
                I review, test and edit everything before publishing. Posts where AI played a
                meaningful part are marked <strong>AI-assisted</strong> under the title, with a
                short note at the end.
              </p>
            </div>
          </div>
        </Section>

        <Section id="contact" title="Get in touch">
          <ul className={styles.contact}>
            {CONTACT.map(({ title, text, links }) => (
              <li key={title}>
                <h3 className={styles.contactTitle}>{title}</h3>
                <p>{text}</p>
                <p className={styles.contactLinks}>
                  {links.map(({ label, href }, index) => (
                    <React.Fragment key={href}>
                      {index > 0 && <span aria-hidden="true"> · </span>}
                      <a href={href} rel={href.startsWith("http") ? "me noopener" : undefined}>
                        {label}
                      </a>
                    </React.Fragment>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </main>
    </Layout>
  );
}
