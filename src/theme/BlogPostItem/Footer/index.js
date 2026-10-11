// Wraps @theme-original/BlogPostItem/Footer.
// On the post page the footer only held the tag list, which now lives in the
// header next to the date (see ../Header/Info). If last-update or edit links
// are enabled later, remove this wrapper to bring the stock footer back.
import React from "react";
import Footer from "@theme-original/BlogPostItem/Footer";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

export default function FooterWrapper(props) {
  const { isBlogPostPage } = useBlogPost();
  return isBlogPostPage ? null : <Footer {...props} />;
}
