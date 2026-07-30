import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';

export default function Home() {
  const { recentPosts } = usePluginData('recent-posts');

  return (
    <Layout title="Home" description="mrpbennett.dev">
      <main className="home-main">
        <p className="home-prompt" style={{ color: 'var(--ifm-color-primary)' }}>
          mrpbennett@dino:~ $ cat README.md
        </p>

        <div className="home-blurb">
          <p>
            I'm Paul a Software Writer based in Dorest who loves the terminal. I
            enjoy building applications with AI and tinkering with my homelab
            using Kubernetes. Main languages of choice are Python and SQL,
            whilst trying to learn Go. Currently a Lead Solution Engineer in
            AdTech.
          </p>
          <p>
            My life's work is to make technology easy to understand and
            interesting to learn about. Husband, doggo dad and biker.
          </p>
        </div>

        <p className="home-section-title" style={{ color: 'var(--ifm-color-primary)' }}>
          $ ls ~/posts | tail -5
        </p>

        <div className="home-posts">
          {recentPosts.map((post) => (
            <article key={post.permalink} className="home-post">
              <h3 className="home-post-title">
                <Link to={post.permalink}>{post.title}</Link>
              </h3>
              {post.description && (
                <p className="home-post-desc">{post.description}</p>
              )}
              <time className="home-post-date" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </article>
          ))}
        </div>

        <Link to="/blog" className="home-view-all">
          View all posts →
        </Link>

        <p className="home-prompt" style={{ color: 'var(--ifm-color-primary)' }}>
          $
        </p>
      </main>
    </Layout>
  );
}
