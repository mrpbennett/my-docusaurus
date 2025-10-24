import React from "react";
import Layout from "@theme/Layout";
import Gopher from "../img/pages/about/dancing-gopher.gif";

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
          fontSize: "20px",
        }}
      >
        <p>
          Hey 👋, I'm Paul a Software Writer based in Dorest. I enjoy mastering
          Vim, tinkering with my homelab using Kubernetes. Main language of
          choice is Python and SQL, while learning Go at the moment. Currently a
          Lead Solution Engineer in AdTech. I like to keep track of things I
          learn in my TIL repo, I often find myself looking through this as a
          refresher.
        </p>
        <p>
          Edit <code>pages/helloReact.js</code> and save to reload.
        </p>
        <img src={Gopher} />
      </div>
    </Layout>
  );
}
