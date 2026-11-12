// Swizzled (ejected) from @theme-classic BlogLayout.
// Changes: no blog sidebar (the navbar covers navigation) and a single
// full-width column instead of Infima's 12-column offsets. Post pages build
// their own header / body / rail grid (see ../BlogPostPage), so `toc` is
// ignored here.
import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";

export default function BlogLayout(props) {
  // eslint-disable-next-line no-unused-vars
  const { sidebar, toc, children, ...layoutProps } = props;

  return (
    <Layout {...layoutProps}>
      <main className={clsx("container", styles.wrap)}>{children}</main>
    </Layout>
  );
}
