import React from "react";
import Layout from "@theme/Layout";
import Gopher from "../img/pages/about/dancing-gopher.gif";

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div class="container mx-auto prose font-serif text-2xl max-w-3/4">
        <h1>Hey 👋</h1>
        <p>
          I'm Paul a Software Writer based in Dorset. I enjoy mastering Vim,
          tinkering with my homelab using Kubernetes. Main language of choice is
          Python and SQL, while learning Go at the moment. Currently a Lead
          Solution Engineer in AdTech. I like to keep track of things I learn in
          my <a href="#">TIL repo</a>, I often find myself looking through this
          as a refresher.
        </p>
        <p>
          My life's work is to make technology easy to understand and
          interesting to learn about. I'm a husband, doggo dad.
        </p>
        <p>Some of my favorite tools include:</p>
        <ul className="border border-sky-800">
          <li>
            <span className="font-bold">Editor</span>:{" "}
            <a href="https://lazyvim.org">LazyVim</a>,{" "}
            <a href="https://www.jetbrains.com/datagrip/">DataGrip</a>, while
            giving <a href="https://zed.dev">Zed</a> a try.
          </li>
          <li>
            <span className="font-bold">Keyboard</span>:{" "}
            <a href="https://www.zsa.io/voyager">ZSA Voyager</a> with ambient
            switches
          </li>
          <li>
            <span className="font-bold">OS</span>:{" "}
            <a href="https://omarchy.org">Omarchy</a>
          </li>
        </ul>

        <p>
          You can <a href="#">read my writing</a> or <a href="#">code</a>, or{" "}
          <a href="#">follow me online</a>. I also make <a href="#">videos</a>,
          advise companies, and do angel investing. <a href="#">Reach out</a> if
          interested.
        </p>
        <img src={Gopher} />
      </div>
    </Layout>
  );
}
