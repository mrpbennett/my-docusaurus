import React, { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { usePluginData } from "@docusaurus/useGlobalData";
import { formatDate } from "@site/src/lib/blog";

const UNITS = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 6048e2],
  ["day", 864e2],
  ["hour", 3600],
  ["minute", 60],
];

function timeAgo(date) {
  const seconds = (Date.now() - new Date(date).getTime()) / 1000;
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return format.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}

// Last commit time: the build-time value (src/plugins/status-plugin.js) is
// rendered first as an absolute date so server and client HTML match, then
// replaced with a refreshed relative time once mounted. If the browser fetch
// fails (offline, rate-limited) the build-time value stays.
function useLastCommit(repo, buildValue) {
  const [state, setState] = useState({ date: buildValue, relative: false });

  useEffect(() => {
    const controller = new AbortController();
    if (buildValue) setState({ date: buildValue, relative: true });
    fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(([commit]) => {
        const date = commit?.commit?.committer?.date;
        if (date) setState({ date, relative: true });
      })
      .catch(() => { });
    return () => controller.abort();
  }, [repo, buildValue]);

  return state;
}

export default function StatusStrip() {
  const { siteConfig } = useDocusaurusContext();
  const { homelab, repo, location } = siteConfig.customFields.status;
  const { lastCommit } = usePluginData("status-plugin");
  const commit = useLastCommit(repo, lastCommit);

  return (
    <div className="border-b border-line bg-sunken">
      <ul
        className="mx-auto my-0 flex min-h-[34px] max-w-content list-none items-center gap-6 overflow-x-auto px-[var(--gutter)] py-0 font-mono text-[12px] whitespace-nowrap text-muted [scrollbar-width:none] [&_b]:font-medium [&_b]:text-soft [&_li]:m-0"
        aria-label="Site status"
      >
        <li>
          <span
            className="mr-2 inline-block size-[7px] rounded-full bg-ok align-[1px] shadow-[0_0_0_3px_color-mix(in_srgb,var(--c-ok)_18%,transparent)]"
            aria-hidden="true"
          />
          <b>homelab</b> {homelab.nodes} nodes · k8s {homelab.kubernetes} · Talos{" "}
          {homelab.talos}
        </li>
        {commit.date && (
          <li>
            <a
              className="group text-inherit no-underline hover:text-heading hover:no-underline"
              href={`https://github.com/${repo}/commits`}
              rel="noopener"
            >
              <b>home-ops</b> last commit{" "}
              <time className="text-accent group-hover:underline" dateTime={commit.date}>
                {commit.relative ? timeAgo(commit.date) : formatDate(commit.date)}
              </time>
            </a>
          </li>
        )}
        <li className="max-sm:hidden">
          writing from <b>{location}</b>
        </li>
      </ul>
    </div>
  );
}
