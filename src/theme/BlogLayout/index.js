// Swizzled (ejected) from @theme-classic BlogLayout.
// Changes: no blog sidebar (the navbar covers navigation) and a single
// full-width column instead of Infima's 12-column offsets. Post pages build
// their own header / body / rail grid (see ../BlogPostPage), so `toc` is
// ignored here.
import React from "react";
import Layout from "@theme/Layout";

export default function BlogLayout(props) {
  // eslint-disable-next-line no-unused-vars
  const { sidebar, toc, children, ...layoutProps } = props;

  return (
    <Layout {...layoutProps}>
      <main className="container pt-14 pb-8">{children}</main>
    </Layout>
  );
}
