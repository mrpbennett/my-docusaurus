// Swizzled (ejected) from @docusaurus/theme-classic BlogPostPage/StructuredData.
// Changes: most posts don't list `authors`, which leaves BlogPosting with an
// empty author array and no image. Fall back to the site owner (the Person
// declared site-wide in docusaurus.config.js) and the default social card.
import React from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useBlogPostStructuredData } from "@docusaurus/plugin-content-blog/client";

export default function BlogPostStructuredData() {
  const structuredData = useBlogPostStructuredData();
  const { siteConfig } = useDocusaurusContext();
  const { person } = siteConfig.customFields;
  const defaultImage = useBaseUrl(siteConfig.themeConfig.image, {
    absolute: true,
  });

  const data = {
    ...structuredData,
    author:
      structuredData.author?.length > 0
        ? structuredData.author
        : { "@type": "Person", "@id": person["@id"], name: person.name, url: person.url },
    image: structuredData.image ?? defaultImage,
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  );
}
