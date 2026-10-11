// Wraps @theme-original/BlogPostItem/Content.
// Appends the AI disclosure to the end of posts flagged `ai_assisted: true`.
import React from "react";
import Content from "@theme-original/BlogPostItem/Content";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { AiDisclosure, isAiAssisted } from "@site/src/components/AiDisclosure";

export default function ContentWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { frontMatter } = metadata;

  return (
    <>
      <Content {...props} />
      {isBlogPostPage && isAiAssisted(frontMatter) && (
        <AiDisclosure note={frontMatter.ai_note} />
      )}
    </>
  );
}
