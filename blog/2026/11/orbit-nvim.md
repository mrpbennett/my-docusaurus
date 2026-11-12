---
title: "Building Orbit: A Database IDE That Lives Inside Neovim"
tags: [product, neovim, databases, sql]
keywords:
  - neovim
  - lazyvim
  - database
  - sql
  - datagrip
  - lua
  - product development
last_updated:
  date: 2026-11-12
---

**Building Orbit: A Database IDE That Lives Inside Neovim**

_The problem, the fix, and the outcome of the first product I built for myself._

For a long time DataGrip was my main IDE for working with data. It's a great tool. But it's also heavy, and on a slower machine I spent a lot of my day waiting on it. Meanwhile, everything else I did happened in the terminal, in [LazyVim](https://www.lazyvim.org/). So I built [Orbit](https://github.com/mrpbennett/orbit.nvim), a database IDE for Neovim. The tagline sums up the idea: _your database revolves around your editor, not the other way around._

<!-- truncate -->

This post is set out like a product development write-up. It covers the problem I had, how I worked out what to build, the decisions that shaped it, and where it ended up.

<!-- SCREENSHOT: hero shot / orbit-ad.gif of Orbit running in LazyVim -->

---

## Part 1: The problem

### DataGrip was slowing me down

DataGrip does everything: schema browsing, autocomplete, result grids, saved queries, many database drivers. The cost is that it's a full JetBrains IDE running on the JVM. On my main machine that was fine. On a slower machine it was a real problem:

- **Slow to start.** I'd open DataGrip to run one quick query and then wait for it to finish loading.
- **Heavy on resources.** It took a large share of memory and CPU just by being open, and everything else got slower while it ran.
- **Laggy while working.** Indexing, introspection and UI lag made the slow moments happen while I was trying to work.

<!-- SCREENSHOT/STAT: optional, e.g. DataGrip memory usage vs Neovim in btop -->

### The bigger problem: switching contexts

The resource usage was the obvious pain point. The constant switching was worse. My day looked like this:

1. Write code in LazyVim.
2. Need to check some data.
3. Alt-tab to DataGrip and wait for it.
4. Write the query using a different editor and different muscle memory.
5. Copy a value out and go back to the terminal.
6. Repeat a few dozen times a day.

Every round trip broke my concentration. My certain vim motions didn't work, my keymaps didn't work, and my editor setup wasn't there. I was effectively running two editors, and one of them was much heavier than the other.

### What I actually wanted

When I wrote down what I needed from DataGrip day to day, the list was much shorter than its feature set:

- Pick a connection and run a query.
- See the results in a grid.
- Browse schemas: tables, views and columns.
- Autocomplete table and column names.
- Keep a library of saved queries.
- Not accidentally run an `UPDATE` without a `WHERE`.

And one hard requirement: **I never want to leave the terminal.**

---

## Part 2: The fix

### Why build rather than adopt?

There are already database plugins for Neovim, and the repo description says as much: _"Yes Another One…"_. I tried the existing options, but none of them felt like the workflow I wanted, or were missing certain features. Building my own was also a good excuse to learn Lua properly, which was a goal in its own right.

I was a previous big [vim-dadbod](https://github.com/tpope/vim-dadbod) user, and although it was really good, certain features did not work for me. For example, the main reason I wanted to build Orbit was to use it within Trino as well as have the ability to use my saved queries.

### How it was built

Orbit was built with AI agents, using [Matt Pocock's skills](https://github.com/mattpocock/skills) to guide the process. I was the product owner. I decided what got built, in what order, and what "done" meant. The agents did much of the implementation, and I used them to learn how the Lua worked. I'll write about that workflow separately, but one habit is worth mentioning here: big decisions were written down as **Architecture Decision Records (ADRs)**. Several of them come up below.

### Design principle 1: use the clients you already have

The most important early decision was that **Orbit doesn't ship database drivers**. It runs the command-line clients you already have installed: `psql`, `mysql`, `sqlite3`, `trino`, `redis-cli`, `vsql` and `sqlcmd`. Each database gets a small "Connector" that knows how to talk to its CLI and parse the output.

This kept Orbit lightweight:

- No native binaries for me to build, sign and distribute.
- No third-party Neovim plugins required.
- Authentication, TLS and versions are handled by the clients you already trust.

Running a new process for every query would be slow, so for SQL Server, SQLite, PostgreSQL, MySQL and Vertica Orbit **keeps one process open per profile**. Queries, schema browsing and completion all share that connection, so session state such as transactions and temp tables persists until you disconnect.

There's a trade-off. CLI output is designed for people to read, not for programs to parse. Each Connector uses whichever machine-readable format its client offers: CSV for `psql`, JSON for `sqlite3`, XML for `mysql`, HTML tables for `vsql` and RESP3 JSON for Redis. Orbit rejects malformed output rather than show a partial result.

### Design principle 2: one workspace, toggled with one key

I didn't want Orbit to take over my editor. `:OrbitWorkspace` (or `<leader>D`) opens a **dedicated tab** with a profile and schema browser on the left and an ordinary query buffer on the right. Pressing it again closes the tab.

<!-- SCREENSHOT: the Workspace tab, sidebar + query buffer + result grid -->

The workflow is designed to feel like Vim:

1. `<CR>` on a profile binds it to the current query buffer.
2. `l` / `h` expands and collapses schemas, tables and columns.
3. `n` opens a new query buffer already bound to that profile.
4. `<leader>E` runs the statement under the cursor, or the visual selection.
5. Results appear in a reusable result grid at the bottom.

Each query buffer has its **own connection profile**, so one buffer can point at Postgres and another at Trino without any global "current connection" to keep track of.

#### One Workspace

![one workspace](https://github.com/mrpbennett/orbit.nvim/raw/main/assets/preview.png)

### Design principle 3: autocomplete that understands SQL

Autocomplete was the feature that would decide whether I could actually stop using DataGrip. The first version used regexes on the current line to spot `FROM` and `JOIN`. That worked for simple queries and failed as soon as I wrote anything real: multi-line statements, string literals, comments, aliases.

That led to [**ADR-0002: a hand-rolled SQL tokenizer**](https://github.com/mrpbennett/orbit.nvim/blob/main/docs/adr/0002-hand-rolled-sql-tokenizer-for-completion.md). Instead of adding more regex or pulling in a parsing library, Orbit now has a small, dependency-free Lua tokenizer. The regex approach was removed entirely rather than kept as a fallback, so there aren't two overlapping ways of working out the context.

Completion now understands clauses:

- Tables and views after `FROM`, `JOIN`, `UPDATE` and `INTO`.
- Columns in `SELECT`, `WHERE`, `ON`, `GROUP BY`, `ORDER BY`, and so on.
- **Aliases**: in `SELECT u.| FROM users u`, `u.` completes `users`'s columns.
- Scope rules: subqueries and `UNION` branches don't leak aliases into each other.

It's delivered through a [blink.cmp](https://github.com/Saghen/blink.cmp) source, and it **never runs a database client while you type**. Schemas are preloaded in the background when you select a profile, and completion reads only from that cache.

<!-- SCREENSHOT: alias-aware completion in action -->

### Design principle 4: guardrails, not handcuffs

Running queries straight from your editor makes it easy to run the wrong one by accident. Orbit **asks for confirmation before any potentially mutating statement**. A single `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `USE` or `VALUES` runs straight away; anything else asks first. The SQL Server classifier is stricter, and Redis uses the server's own `COMMAND` metadata to decide what's read-only.

The README is clear that this is a convenience guardrail, not a security boundary. It exists to catch the 4pm mistake, not to replace database permissions.

Credentials get the same care: the profile file has to be `0600` or Orbit refuses to load it, passwords can come from environment variables, and secrets are never passed on the command line.

### Iterating: features that came from using it every day

Once I was using Orbit every day, the gaps were obvious, and most of the later features came from them:

- **Saved queries** ([ADR-0001](https://github.com/mrpbennett/orbit.nvim/blob/main/docs/adr/0001-named-saved-query-locations.md)). I keep queries for work and personal projects, so `saved_query_dirs` supports multiple named locations, each shown as its own tree in the sidebar. `:OrbitSave` saves the current buffer into one of them, and you can rename, move, preview and delete without leaving the sidebar.
- **The Structure panel.** Some of my queries are several hundred lines of CTEs. `:OrbitStructure` opens a tree of every statement, CTE, query block and clause, and highlights where your cursor is. You can run the highlighted element directly.
- **SQL Server, done twice.** SQL Server started on Microsoft's Go `sqlcmd` (ADR-0003). That didn't work for my environment, which needed domain authentication, so ADR-0004 replaced it with **selectable transports**: `sqlcmd` or a small Java helper using the jTDS JDBC driver. Writing the first decision down made the change easier, because the reasons for the original choice were recorded.
- **`:OrbitDoctor`.** Because Orbit relies on clients you install yourself, "why won't it connect?" is usually a missing binary or an unset environment variable. Doctor checks profiles, executables, versions and password sources **without connecting** or running any SQL.

#### Saved queries

![saved_query_dirs](https://github.com/mrpbennett/orbit.nvim/raw/main/assets/savedqueries.png)

#### Query Structure Panel

![query structure panel](https://github.com/mrpbennett/orbit.nvim/raw/main/assets/structure.png)

### Paying down the debt

After a run of feature releases, I did a deliberate refactoring pass at the end of September:

- Replaced loose "adapters" with an explicit **Connector registry and contract**.
- Routed every statement run through **a single execution module**.
- Unified SQL statement boundary detection, so execution, completion and the Structure panel all use the same tokenizer.
- Made child-process creation **injectable**, so it can be tested without a real database.

None of this was visible to users, but it's why adding a new Connector now takes a small, well-defined piece of work.

---

## Part 3: The outcome

### Where Orbit is today

From the first commit on 24 August 2026 to v0.3.1 on 21 September 2026, Orbit went from a weekend experiment to the tool I use every day:

| Area           | What's there                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| Databases      | PostgreSQL, MySQL, SQLite, Trino, SQL Server, Vertica, Redis                  |
| Workspace      | Toggleable tab, profile/schema browser, per-buffer profiles, result grid      |
| Completion     | Clause- and alias-aware SQL, Redis commands and keys, via blink.cmp           |
| Productivity   | Saved queries across multiple locations, Structure panel, sample statements   |
| Safety         | Mutation confirmation, `0600` profile file, secrets kept out of argv          |
| Dependencies   | Neovim 0.10+ and your own database clients. No required Neovim plugins.       |

### What changed for me

- **I rarely use DataGrip any more.** Querying data now happens in the same editor as everything else.
- **The slower machine is usable.** Orbit is Neovim plus a CLI process, a fraction of what a full IDE used.
- **My concentration lasts.** Checking a value means switching tabs inside Neovim, not switching applications.
- **I learned a little Lua** by building something I use every day, which is a better way to learn than tutorials.

<!-- YOUR NOTE: any concrete before/after numbers here (startup time, RAM) would really strengthen this section -->

### Lessons from my first product

1. **Build for a specific frustration.** "DataGrip is slow and I don't want to leave the terminal" was concrete enough to judge every feature against.
2. **List what you actually use, not what the incumbent offers.** The core feature list was six items long. Everything else came from using it.
3. **Lean on existing tools.** Using the database CLIs instead of shipping drivers saved a lot of work, at the cost of parsing their output carefully.
4. **Write decisions down.** The ADRs paid off when the SQL Server approach had to change.
5. **Use it every day.** The best features (saved queries, the Structure panel, Doctor) came from my own friction, not from planning.
6. **Schedule the refactor.** Shipping fast and then cleaning up deliberately worked better than trying to get everything perfect up front.

### Try it

With [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "mrpbennett/orbit.nvim",
  opts = {},
}
```

Then run `:OrbitProfiles` to create your connection profile file, `:OrbitWorkspace` to open the workspace, and `<leader>E` to run your first query. The [README](https://github.com/mrpbennett/orbit.nvim) has full profile examples for every database.

If you also live in LazyVim and dread switching to a database GUI, give it a go. [Issues](https://github.com/mrpbennett/orbit.nvim/issues) and [PRs](https://github.com/mrpbennett/orbit.nvim/pulls) are welcome.
