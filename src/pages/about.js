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
          mrpbennett@dino:~/about $ cat README.md
        </p>

        <div className="about-section">
          <p>
            I'm Paul a Software Writer based in Dorest who loves the terminal. I
            enjoy building applications with AI and tinkering with my homelab
            using Kubernetes. Main languages of choice are Python and SQL,
            whilst trying to learn Go. Currently a Lead Solution Engineer in
            AdTech.
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
                <strong>Terminal</strong>:
                <a href="https://ghostty.org"> Ghostty</a>
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <strong>Multiplexer</strong>:
                <a href="https://zellij.dev"> Zellij</a>
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
            $ ls ~/projects
          </p>
          <ul className="about-list">
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <a href="https://github.com/mrpbennett/bucky">Bucky</a> - A
                beautiful TUI for managing S3/SFTP/GCP storage
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <a href="https://github.com/mrpbennett/melon">Melon</a> - An
                alternative to the past fig.io
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <a href="https://github.com/mrpbennett/fastapi.nvim">
                  fastapi.nvim
                </a>{" "}
                - Port of the official FastAPI plugin for VSC
              </span>
            </li>
            <li>
              <span style={{ color: "var(--ifm-color-primary)" }}>▸</span>
              <span>
                <a href="https://github.com/booberrytheme">BooBerry Themes</a> -
                Ports from the popular Helix theme
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
