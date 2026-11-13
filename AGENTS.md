# Agent Guide: Blog Proofreading and Writing

This guide covers two jobs: proofreading existing posts, and writing new ones. Posts live in `blog/YYYY/MM/*.md`. Authors are in `blog/authors.yml` and tags are in `blog/tags.yml`.

Posts in `blog/2024/` and `blog/2025/` are handwritten by Paul. They are the reference for Paul's voice.

## UK English

Both jobs use British spelling, grammar and punctuation in prose.

- `-ise` not `-ize` (organise, optimise, realise), `-yse` not `-yze` (analyse), `-our` not `-or` (colour, behaviour), `-re` not `-er` (centre), `-ogue` (catalogue).
- Noun/verb pairs: `licence`/`license`, `practice`/`practise`. Also `defence`, `grey`, `towards`, `got` (not `gotten`).
- `programme` only for a TV or event programme; `program` stays for software.
- Double the `l` when adding suffixes: cancelled, modelling, travelling.
- Dates read day-month-year: 9 February 2026.
- Single quotes for speech and quoted words, with punctuation outside unless it belongs to the quote.
- No Oxford comma unless it removes ambiguity.
- Use 'while' and 'among'. Use 'whilst' or 'amongst' only where they sound natural.

## Leave untouched

These stay exactly as written, even when they break the rules above:

- Code, commands, config, file paths, URLs, and anything inside backticks or fenced blocks.
- Technical identifiers in prose, even without backticks: Kubernetes fields and values, HTTP headers, flags, API names. In `blog/2024/11/horizontalpodautoscaler.md`, prose 'utilization' becomes 'utilisation', but `type: Utilization` stays.
- Quoted error messages, terminal output, and quotes from other people or projects.
- Product, project and tool names, in their own capitalisation (Helix, Yazi, Neovim, Kubernetes, Argo CD).
- MDX and Docusaurus syntax: `import` lines, components such as `<Tabs>`, admonitions (`:::tip`), the `<!-- truncate -->` marker and image paths.
- Front matter keys and YAML quoting. You may fix typos in `title` and `keywords` values.

## Proofreading

When asked to proofread 'all posts', the scope is every file matching `blog/**/*.md`. Work one post at a time, or give each post its own subagent. The job is done when every post has an entry in the report.

For each post:

1. Fix spelling to UK English.
2. Fix grammar and punctuation: tense consistency, subject/verb agreement, run-ons, comma splices, apostrophes, missing words. Convert double quotes in prose to single quotes and remove Oxford commas, in every post.
3. Fix clumsy or unclear sentences with the smallest change that works. Keep the author's voice: jokes, asides and opinions stay. In 2024 and 2025 posts, correct errors only and leave the voice and structure as Paul wrote them.
4. Fix Markdown problems: heading levels that skip, code blocks missing a language tag, inconsistent list style.
5. If you change a heading's text, its anchor changes too. Search `blog/` and `src/` for links ending in `#old-anchor` and update them.
6. Leave `last_update` dates alone. Proofreading is not a content update.

Flag anything that looks factually wrong instead of fixing it. If the user asks for a review only, report and do not edit.

Report per post: what you changed, grouped by type, and what you flagged but left alone, with `file:line` references.

### Tone pass

Run this only when the user asks for a tone pass by name. It applies the rules in 'Sounding human' below to existing posts from 2026 onwards. It never applies to 2024 and 2025 posts, because they are the voice reference.

## Writing a new post

1. **Gather the story.** Ask Paul for five things: the goal, the setup, what went wrong along the way, the real commands and output, and Paul's verdict on the result. This step is done when you have all five. Every anecdote, number and piece of output in the post comes from Paul. Where something is missing, leave `<!-- TODO: ... -->` for Paul to fill in.
2. **Read the voice reference.** Read `blog/2025/08/vim-motions.md`, `blog/2025/11/talos-cluster.md` and `blog/2024/11/horizontalpodautoscaler.md`. Copy the voice (plain, chatty, honest, a bit cheeky), not the typos.
3. **Draft** using 'Sounding human' and 'Structure' below.
4. **Check the draft**, then follow 'Before finishing'.

### Who's reading

Someone comfortable in a terminal who hasn't used this tool before. Explain anything beyond that once, in plain words, ideally by comparing it to something everyday, then use the term freely. Easy to understand does not mean simplistic.

### Sounding human

- Write in the first person, as Paul, like explaining it to a mate over a pint.
- Open with the problem or the itch, in Paul's words. Stop when the last useful thing has been said.
- Mix short sentences with longer ones, and short paragraphs with longer ones.
- Use contractions (it's, don't, I'd).
- Explain the 'why' before the 'how'. A long command is fine once the reader knows what it's for.
- Keep the dead ends and the honest opinions. 'This took me an evening to work out' beats a polished success story.
- Be specific. Real numbers, versions and outcomes beat adjectives.
- Use full stops, commas and brackets for asides. Em dashes are rare.
- Use one well-chosen example rather than a list of three adjectives. Ask a question only if a reader would actually ask it.

Some phrases instantly read as machine-written. Rewrite every line this check flags:

```bash
grep -nEi "delve|dive in|game.?changer|unlock|seamless|robust|leverag|revolutionis|in conclusion|worth noting|fast-paced|ever-evolving|landscape|elevate|supercharge|happy coding|hope this helps|—" blog/YYYY/MM/post.md
```

### Structure

- Opening: one or two paragraphs on the problem, then `<!-- truncate -->`.
- Body: headings only where they help someone skim, named after what happens in that section. Code blocks always have a language tag.
- Ending: what to try next, what's still broken, or a short honest takeaway.
- Screenshots go in an `imgs/` folder next to the post, as in `blog/2026/10/imgs/`.

### Front matter

```yaml
---
title: Short, plain, specific title
tags: [one-or-two-from-tags.yml]
keywords:
  - lowercase-or-product-names
last_update:
  date: YYYY-MM-DD
---
```

- Use `last_update`, which is the key Docusaurus reads. Some older posts use `last_updated`, which works only because `src/theme/BlogPostPage/index.js` checks both.
- Reuse tags from `blog/tags.yml`. Only add a new tag if nothing fits, and add it to the file.
- File name: lowercase and hyphenated, in `blog/YYYY/MM/`, e.g. `blog/2026/11/my-post.md`.

## Before finishing

- Proofread anything you wrote, using the steps above.
- Run `npm run build` to check the post renders and that links and images resolve. Report the result honestly, including failures.
- Do not commit, push or open a PR. Paul approves those.
