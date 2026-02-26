import React from "react";
import Layout from "@theme/Layout";
import Gopher from "../img/pages/about/dancing-gopher.gif";

export default function About() {
  return (
    <Layout title="About" description="About Paul Bennett">
      <main className="max-w-[760px] mx-auto px-6 py-16 font-mono prose prose-lg dark:prose-invert">
        {/* Terminal prompt header */}
        <p
          className="text-xs mb-10 tracking-wide"
          style={{ color: "var(--ifm-color-primary)", marginTop: "2.5rem" }}
        >
          mrpbennett@homelab:~/about $ cat README.md
        </p>

        {/* Bio — let prose handle h1 and paragraph colours */}
        <div className="mb-16 mt-10">
          <p>
            Software Writer based in Dorset. I enjoy mastering Vim, tinkering
            with my homelab using Kubernetes. Main language of choice is Python
            and SQL, while learning Go at the moment. Currently a Lead Solution
            Engineer in AdTech.
          </p>
          <p>
            I like to keep track of things I learn in my{" "}
            <a href="https://github.com/mrpbennett">TIL repo</a> — I often find
            myself looking back through it as a refresher.
          </p>
          <p>
            My life's work is to make technology easy to understand and
            interesting to learn about. Husband, doggo dad.
          </p>
        </div>

        {/* Tools — not-prose prevents list indentation conflicts */}
        <div className="not-prose mb-14">
          <p
            className="text-xs mb-5 tracking-wide"
            style={{ color: "var(--ifm-color-primary)" }}
          >
            $ ls ~/tools
          </p>
          <ul className="text-sm space-y-3 list-none p-0 m-0">
            <li className="flex gap-3">
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>Editor</strong>:{" "}
                <a href="https://lazyvim.org">LazyVim</a>,{" "}
                <a href="https://www.jetbrains.com/datagrip/">DataGrip</a>
              </span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>Keyboard</strong>:{" "}
                <a href="https://www.zsa.io/voyager">ZSA Voyager</a> with
                ambient switches
              </span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>OS</strong>: MacOS
              </span>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="not-prose mb-14">
          <p
            className="text-xs mb-5 tracking-wide"
            style={{ color: "var(--ifm-color-primary)" }}
          >
            $ cat links.txt
          </p>
          <ul className="text-sm space-y-3 list-none p-0 m-0">
            <li className="flex gap-3">
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <a href="https://github.com/mrpbennett">github.com/mrpbennett</a>
            </li>
          </ul>
        </div>

        {/* Gopher at bottom */}
        <div className="not-prose  flex justify-center">
          <img src={Gopher} alt="Dancing Gopher" className="w-24" />
        </div>
      </main>
    </Layout>
  );
}
