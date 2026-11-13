import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PageHeader from "@site/src/components/PageHeader";
import Section from "@site/src/components/Section";
import { SparkIcon } from "@site/src/components/AiDisclosure";
import { isoDate, useBlogData } from "@site/src/lib/blog";

const CONTACT_EMAIL = "pbennett.uk@outlook.com";

// What each pillar covers, in tools. Keep to things there are posts about.
const PILLAR_DETAIL = {
  infrastructure: {
    text: "A Talos cluster on Bare Metal, using GitOps with Argo CD.",
    tools: ["Talos · ArgoCD", "Keycloak · Vault", "AlertManager· Prometheus"],
  },
  developer: {
    text: "The editor, terminal and languages I use every day, and how I work with AI.",
    tools: ["Ghostty · LazyVim", "Python · SQL · Go", "Claude Code · Herdr"],
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
      description="About Paul Bennett, a Lead Solutions Engineer in AdTech based in Dorset, UK, who writes about running a Kubernetes homelab, developer tools and the opinions behind them."
    >
      <main className="container pt-14">
        <PageHeader eyebrow="About" title="Paul Bennett">
          <p>I run my own infrastructure, and I write down how it works.</p>
        </PageHeader>

        <section className="grid gap-8 border-t border-line py-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16" aria-label="Who I am">
          <figure className="m-0 max-w-[420px]">
            <img
              className="block aspect-[4/5] h-auto w-full bg-tint object-cover"
              src={person.image}
              alt="Paul Bennett"
              width="460"
              height="460"
            />
            <figcaption className="mono mt-2.5 text-muted">{status.location} · husband, dog dad, biker</figcaption>
          </figure>
          <div className="max-w-measure text-prose leading-[1.72]">
            <p className="font-serif text-[1.5rem] leading-[1.5] font-light text-heading">
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
          <ul className="m-0 grid list-none border border-line bg-raised p-0 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const detail = PILLAR_DETAIL[pillar.id] ?? {};
              return (
                <li
                  key={pillar.id}
                  className="m-0 flex flex-col gap-3 border-b border-line p-6 last:border-b-0 md:border-b-0 md:[&+&]:border-l md:[&+&]:border-line"
                >
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, "0")} · {pillar.label}
                  </span>
                  <h3 className="m-0 text-[1.5rem]">{pillar.title}</h3>
                  {detail.text && <p className="m-0 text-[15px] text-muted">{detail.text}</p>}
                  {detail.quote && (
                    <blockquote className="m-0 border-l-2 border-rule pl-3.5 font-serif text-[1.125rem] leading-[1.45] font-light text-heading italic">
                      “{detail.quote}”
                    </blockquote>
                  )}
                  {detail.tools && (
                    <ul className="m-0 list-none p-0 font-mono text-xs leading-[1.9] text-soft [&>li]:before:text-muted [&>li]:before:content-['—_']">
                      {detail.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  )}
                  <Link className="mt-auto pt-2 underline" to={`/blog/tags#${pillar.id}`}>
                    {pillar.count > 0 ? `Read ${pillar.label.toLowerCase()} →` : "First posts soon →"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="numbers" title="By the numbers">
          <dl className="m-0 grid grid-cols-2 border-t border-rule md:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse justify-end pt-5 pr-5">
                <dt className="text-sm font-normal text-muted">{label}</dt>
                <dd className="m-0 font-serif text-[3.5rem] leading-none font-light tracking-[-0.03em] text-heading">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="changelog" title="Changelog" aside={<span className="mono">git log --oneline</span>}>
          <ol className="m-0 list-none p-0">
            {CHANGELOG.map((entry) => (
              <li
                key={entry.title}
                className="m-0 grid gap-x-8 gap-y-1 border-t border-line py-5 last:border-b md:grid-cols-[120px_1fr]"
              >
                <span className="mono leading-[2] text-muted">{entry.year}</span>
                <div>
                  <h3 className="mt-0 mb-1 text-lg">{entry.title}</h3>
                  <p className="m-0 max-w-[60ch] text-[15px] text-muted">
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
          <div className="flex max-w-measure gap-4 border-l-2 border-accent bg-tint p-6 text-tint-ink [&_p:last-child]:mb-0">
            <span className="mt-1 flex-none">
              <SparkIcon size={16} />
            </span>
            <div>
              <p>
                I write the posts myself, from my own notes, commands and mistakes. I use AI as a
                proofreader: it checks spelling and grammar, and makes small edits to clumsy
                sentences. It doesn't decide what I think or what I did.
              </p>
              <p>
                Occasionally AI helps with more than that, such as turning my rough notes into a
                first draft. I review, test and edit everything before publishing. Those posts are
                marked <strong>AI-assisted</strong> under the title, with a short note at the end.
              </p>
            </div>
          </div>
        </Section>

        <Section id="contact" title="Get in touch">
          <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
            {CONTACT.map(({ title, text, links }) => (
              <li key={title} className="m-0 border-t border-rule pt-4">
                <h3 className="mt-0 mb-1.5 text-xl">{title}</h3>
                <p className="mt-0 mb-2 text-[15px] text-muted">{text}</p>
                <p className="mt-0 mb-2 text-[15px] [&_a]:text-heading [&_a]:wrap-anywhere">
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
