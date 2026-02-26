import React from "react";
import Layout from "@theme/Layout";
import Gopher from "../img/pages/about/dancing-gopher.gif";

export default function About() {
  return (
    <Layout title="About" description="About Paul Bennett">
      <main className="about-main">
        <p
          className="about-prompt"
          style={{ color: "var(--ifm-color-primary)" }}
        >
          mrpbennett@homelab:~/about $ cat README.md
        </p>

        <div className="about-section">
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

        <div className="about-section">
          <p
            className="about-section-title"
            style={{ color: "var(--ifm-color-primary)" }}
          >
            $ ls ~/tools
          </p>
          <ul className="about-list">
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>Editor</strong>:{" "}
                <a href="https://lazyvim.org">LazyVim</a>,{" "}
                <a href="https://www.jetbrains.com/datagrip/">DataGrip</a>
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>Keyboard</strong>:{" "}
                <a href="https://www.zsa.io/voyager">ZSA Voyager</a> with
                ambient switches
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>OS</strong>: MacOS
              </span>
            </li>
          </ul>
        </div>

        <div className="about-section">
          <p
            className="about-section-title"
            style={{ color: "var(--ifm-color-primary)" }}
          >
            $ cat links.txt
          </p>
          <ul className="about-list">
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <a href="https://github.com/mrpbennett">github.com/mrpbennett</a>
            </li>
          </ul>
        </div>

        <div className="about-gopher">
          <img src={Gopher} alt="Dancing Gopher" />
        </div>
      </main>
    </Layout>
  );
}
