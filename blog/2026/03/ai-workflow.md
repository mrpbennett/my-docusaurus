---
title: "My current AI workflow"
tags: [ai]
keywords:
  - cli
  - tooling
  - claude
  - claudecode
  - opencode
  - gpt
  - ai
  - agentic
  - worktrees
  - workflow
last_updated:
  date: 2026-03-25
---

AI agents are getting better at an absurd pace, and if I am honest, it can feel impossible to keep up. One week there is a new model, the next week there is a new coding tool, and then suddenly everyone has a strong opinion about how you should be working.

That said, this is also what makes the space fun. It still feels like one big ongoing experiment, and I am very much learning in public with the rest of it. So rather than pretend I have found the one true setup, I thought it would be more useful to walk through the workflow I am using right now, what each tool does well, and where I think each one fits.

<!--truncate-->

## Tooling

Here are the main tools I have been reaching for lately to get consistently better results.

**[get-shit-done](https://github.com/gsd-build/get-shit-done)**

This is a lightweight but surprisingly powerful meta-prompting, context engineering, and spec-driven development system for Claude Code and other agents. The big thing it helps with is context rot, which is where the quality of an agent's output slowly falls apart as the conversation gets longer and muddier.

What I like about `get-shit-done` is that it pushes you toward a more disciplined workflow. Instead of throwing a vague request at an agent and hoping for the best, it nudges you into planning, writing clearer specs, and validating the work properly.

For example, if I want an agent to add a feature to a side project, I no longer start with something lazy like "build me a settings page". I will use a more structured flow so the agent first works out the plan, writes down the assumptions, and only then starts implementing. That one change alone usually gives me better output than jumping straight into code generation.

**[agency-agents](https://github.com/msitarzewski/agency-agents)**

As the repo is described:

> A complete AI agency at your fingertips - From frontend wizards to Reddit community ninjas, from whimsy injectors to reality checkers. Each agent is a specialized expert with personality, processes, and proven deliverables.

It really does live up to that description. I have found some of the agents to be ridiculously good when used for the right job. The [Content Creator](https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-content-creator.md), for example, is excellent at turning rough project notes into a polished `README.md` that actually sounds like it was written by someone who cares.

This is where I think specialised agents shine. A general-purpose coding assistant can do a lot, but a purpose-built agent with a clear role often gives you a much stronger first draft. If I am writing docs, I would rather hand that off to something tuned for documentation. If I am reviewing product copy, a marketing-focused agent often has better instincts than a raw coding model.

A simple example: say I have hacked together a project over a weekend and the code works, but the docs are a mess. Instead of asking my main coding assistant to context-switch into "documentation mode", I can hand the repo summary to a content-focused agent and let it produce a cleaner first pass. It is a small change, but it keeps each tool doing the thing it is best at.

**[worktrunk](https://worktrunk.dev/)**

Worktrunk has a bunch of quality-of-life features that make working with multiple parallel changes much less painful. If you have ever used git worktrees directly from the CLI, you will know they are powerful but not always especially pleasant. Personally, I found the raw workflow a bit cumbersome.

Worktrunk smooths that out. It makes creating, jumping between, and cleaning up worktrees feel much more ergonomic, which matters a lot once you start using AI agents in parallel.

One really practical use case is when I want to explore multiple ideas at once. I might have one worktree for a feature branch, another for a risky refactor, and another where I let an agent experiment with a different approach entirely. That separation is brilliant because it stops one bad experiment from polluting the rest of the work.

This is probably the biggest shift in my workflow overall: I no longer think of AI as a single assistant living in one terminal window. I think of it more like a team of temporary contributors, and worktrees give each of them their own safe little sandbox.

## How It All Fits Together

The rough flow for me usually looks like this:

1. Start with a rough idea or problem I want to solve.
2. Use a structured system like `get-shit-done` to shape the task properly.
3. Spin up a dedicated agent, or a more specialised one from `agency-agents`, depending on what I need.
4. Do the work in an isolated worktree using `worktrunk` so I can compare, throw away, or merge changes cleanly.

That combination has made AI feel much more useful to me. Not because any one tool is magic, but because the workflow has a bit more structure. The better I get at setting context, isolating work, and choosing the right kind of agent for the job, the better the results tend to be.

I am sure this setup will change again in a few months, because the whole space moves too fast for anything to stay still. But right now this is the workflow that feels the most practical for how I like to work: a bit opinionated, a bit experimental, and very focused on keeping the chaos under control.
