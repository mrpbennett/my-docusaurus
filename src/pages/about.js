import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import PageHeader from "@site/src/components/PageHeader";
import { SparkIcon } from "@site/src/components/AiDisclosure";
import styles from "./about.module.css";

// TODO(paul): add a contact email (or remove the row) once you've picked one.
const CONTACT_EMAIL = null;

const LINKS = [
  { label: "GitHub", handle: "mrpbennett", href: "https://github.com/mrpbennett" },
  { label: "X", handle: "@mrpbennett", href: "https://x.com/mrpbennett" },
  {
    label: "LinkedIn",
    handle: "paulandrewbennett",
    href: "https://www.linkedin.com/in/paulandrewbennett",
  },
];

function Section({ id, command, title, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <p className={styles.command} aria-hidden="true">
        <span className="ps1">❯</span> {command}
      </p>
      {/* Heading registers the id with the broken-anchor checker and offsets
          in-page jumps for the sticky navbar */}
      <Heading as="h2" id={id} className={styles.title}>
        {title}
      </Heading>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

export default function About() {
  return (
    <Layout
      title="About"
      description="About Paul Bennett, a Lead Solutions Engineer in AdTech based in Dorset, UK, who writes about the terminal, data, AI-assisted development and a Kubernetes homelab."
    >
      <main className={`container ${styles.page}`}>
        <PageHeader command="cat ~/about.md" title="About">
          <p>
            Hi, I'm Paul. I'm a Lead Solutions Engineer in AdTech, based in
            Dorset, UK.
          </p>
        </PageHeader>

        <Section id="me" command="whoami" title="Who I am">
          <p>
            I live in the terminal. I write mostly Python and SQL, I'm learning
            Go, and I spend a lot of my spare time building things with AI and
            tinkering with a Kubernetes homelab.
          </p>
          <p>
            My life's work is to make technology easy to understand and
            interesting to learn about. This site is where I write up the
            tools I use and the problems I've worked through.
          </p>
          <p>Away from the keyboard I'm a husband, dog dad and biker.</p>
        </Section>

        <Section id="now" command="cat ~/now.md" title="What I'm working on">
          <ul>
            <li>
              Running my homelab cluster on Talos Linux, managed GitOps-style
              with Argo CD. See the{" "}
              <Link to="/blog/tags/homelab">homelab</Link> and{" "}
              <Link to="/blog/tags/kubernetes">kubernetes</Link> posts.
            </li>
            <li>
              Refining my <Link to="/blog/tags/ai">AI-assisted workflow</Link>{" "}
              and my <Link to="/blog/tags/terminal">terminal setup</Link>.
            </li>
            <li>Learning Go.</li>
            {/* TODO(paul): add current projects / anything else you're working on */}
          </ul>
        </Section>

        <Section id="ai" command="cat ~/ai.md" title="How I use AI">
          <div className={styles.aiCard}>
            <span className={styles.aiIcon}>
              <SparkIcon size={16} />
            </span>
            <div>
              <p>
                Some of the content on this site is created with AI assistance,
                and I'd rather be upfront about it. I use AI tools to help with
                drafting, editing and writing code examples.
              </p>
              <p>
                I review, test and edit everything before publishing. Posts
                where AI played a
                meaningful part are marked <strong>AI-assisted</strong> under
                the title, with a short note at the end.
              </p>
            </div>
          </div>
        </Section>

        <Section id="contact" command="cat ~/contact.md" title="Get in touch">
          <p>You can find me here:</p>
          <ul className={styles.links}>
            {LINKS.map(({ label, handle, href }) => (
              <li key={label}>
                <span className={styles.linkLabel}>{label}</span>
                <a href={href} rel="me noopener">
                  {handle}
                </a>
              </li>
            ))}
            <li>
              <span className={styles.linkLabel}>Email</span>
              {CONTACT_EMAIL ? (
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              ) : (
                <span className="todo-flag">TODO: contact email</span>
              )}
            </li>
            <li>
              <span className={styles.linkLabel}>Feed</span>
              <a href="/blog/rss.xml">RSS</a>
              <span aria-hidden="true"> · </span>
              <a href="/blog/atom.xml">Atom</a>
            </li>
          </ul>
        </Section>
      </main>
    </Layout>
  );
}
