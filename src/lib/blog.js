// Client-side helpers over the global data published by
// src/plugins/blog-plugin.js.
import { usePluginData } from "@docusaurus/useGlobalData";

export function useBlogData() {
  return usePluginData("docusaurus-plugin-content-blog");
}

// The summary (number, pillar, …) for one post, or undefined for unlisted ones
export function usePostSummary(permalink) {
  return useBlogData().posts.find((post) => post.permalink === permalink);
}

export function usePillar(id) {
  return useBlogData().pillars.find((pillar) => pillar.id === id);
}

// 7 → "007"
export function formatNumber(number) {
  return String(number).padStart(3, "0");
}

// ISO date (YYYY-MM-DD), stable between server and client renders
export function isoDate(date) {
  return String(date).slice(0, 10);
}

// "08 Oct 2026" / "Oct 2026", formatted in UTC so SSR and hydration agree
export function formatDate(date, { day = true } = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    day: day ? "2-digit" : undefined,
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function readingMinutes(readingTime) {
  return Math.max(1, Math.ceil(readingTime ?? 1));
}
