// Swizzled (ejected) from @docusaurus/theme-classic BlogLayout.
// Changes: no blog sidebar (the navbar covers navigation), and a single centred
// column for lists or an article + sticky TOC grid for posts, instead of
// Infima's 12-column offsets.
import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";

export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;

  return (
    <Layout {...layoutProps}>
      <div
        className={clsx("container", styles.wrap, toc && styles.withToc)}
      >
        <main className={styles.main}>{children}</main>
        {toc && (
          <aside className={styles.toc} aria-labelledby="toc-title">
            <p id="toc-title" className={styles.tocTitle}>
              On this page
            </p>
            {toc}
          </aside>
        )}
      </div>
    </Layout>
  );
}
