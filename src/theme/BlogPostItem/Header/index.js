// Wraps @theme-original/BlogPostItem/Header.
// Adds, on the post page only: the "AI-assisted" label for flagged posts and a
// collapsible table of contents for screens too narrow for the TOC rail.
import React from "react";
import Header from "@theme-original/BlogPostItem/Header";
import TOCCollapsible from "@theme/TOCCollapsible";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { AiLabel, isAiAssisted } from "@site/src/components/AiDisclosure";
import styles from "./styles.module.css";

export default function HeaderWrapper(props) {
  const { metadata, toc, isBlogPostPage } = useBlogPost();
  const { frontMatter } = metadata;
  const showToc =
    isBlogPostPage && !frontMatter.hide_table_of_contents && toc.length > 0;

  return (
    <>
      <Header {...props} />
      {isBlogPostPage && isAiAssisted(frontMatter) && (
        <div className={styles.aiLabel}>
          <AiLabel />
        </div>
      )}
      {showToc && (
        <TOCCollapsible
          toc={toc}
          minHeadingLevel={frontMatter.toc_min_heading_level}
          maxHeadingLevel={frontMatter.toc_max_heading_level}
          className={styles.mobileToc}
        />
      )}
    </>
  );
}
