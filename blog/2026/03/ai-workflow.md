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
  date: 2026-06-23
---

AI agents are getting better at an absurd pace, and if I am honest, it can feel impossible to keep up. One week there is a new model, the next week there is a new coding tool, and then suddenly everyone has a strong opinion about how you should be working.

That said, this is also what makes the space fun. It still feels like one big ongoing experiment, and I am very much learning in public with the rest of it. So rather than pretend I have found the one true setup, I thought it would be more useful to walk through the workflow I am using right now, what each tool does well, and where I think each one fits.

<!--truncate-->

## Tooling

Here are the main tools I have been reaching for lately to get consistently better results.

**[superpowers](https://github.com/superpowers-sh/superpowers)**

This is a skill and context system for Claude Code that has become the backbone of how I work with agents. The core problem it solves is context rot — the slow degradation in output quality that happens as a conversation gets longer, muddier, and further from the original intent.

What I like about superpowers is that it gives the agent a library of specialised skills to draw on. Rather than relying on a general system prompt and hoping the model figures out the right approach, you invoke a skill that already knows what good looks like for that kind of task. Planning a feature, debugging a tricky issue, doing a thorough code review — there is a skill for each, and they wire in the right structure automatically.

For example, if I want an agent to add a feature, it no longer just starts generating code. It invokes a brainstorming skill first, works out the approach, surfaces assumptions, and only then moves to implementation. That one shift alone gives me noticeably better output than jumping straight into code generation.

**[codegraph](https://github.com/colbymchenry/codegraph)**

This one surprised me more than anything else I have added to the workflow recently. Codegraph builds a pre-indexed knowledge graph of your codebase — locally, using tree-sitter to parse the ASTs — and exposes it to the agent via MCP. Instead of burning a chunk of context watching the agent grep and read files trying to figure out how things connect, it can just ask the graph directly.

The benchmark numbers are genuinely striking: 58% fewer tool calls, 22% faster, and file reads dropped to near zero. In practice that means the agent spends less time on discovery and more time on the actual problem. It also auto-syncs when the code changes, so it stays accurate without you having to think about it.

The thing I appreciate most is that it is completely local. No sending code to an external service, no setup beyond running `codegraph init`. It just works.

**[ponytail](https://github.com/DietrichGebert/ponytail)**

Ponytail is one of those tools that makes you wonder how you tolerated the alternative. It makes your agent think like the laziest senior developer in the room — and I mean that as a genuine compliment.

The idea is a decision ladder the agent runs before writing any code. Does this need to exist at all? Is it already in the codebase? Does the stdlib do it? Can it be one line? Only if none of those rungs hold does it write something new. The result is that you stop getting over-engineered solutions to simple problems, stop accumulating unnecessary abstractions, and stop having agents add layers of scaffolding for use cases that will never arrive.

The motto is "the best code is the code you never wrote", and once you have worked with an agent that actually operates that way, it is hard to go back. It is not about being careless — validation, security, and error handling at real boundaries are never on the chopping block. It is about defaulting to simplicity everywhere else.

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
2. Let `superpowers` guide the agent into the right structure for the task — planning, spec, or review depending on what it is.
3. Let `codegraph` handle codebase orientation so the agent is not burning context on discovery before it even starts.
4. Trust `ponytail` to keep the output tight — no unnecessary abstractions, no scaffolding for hypothetical future requirements.
5. Spin up a dedicated agent, or a more specialised one from `agency-agents`, depending on what the work actually calls for.
6. Do everything in an isolated worktree using `worktrunk` so I can compare, throw away, or merge changes cleanly.

That combination has made AI feel much more useful to me. Not because any one tool is magic, but because the workflow has a bit more structure. The better I get at setting context, isolating work, and keeping output quality high, the better the results tend to be.

I am sure this setup will change again in a few months, because the whole space moves too fast for anything to stay still. But right now this is the workflow that feels the most practical for how I like to work: a bit opinionated, a bit experimental, and very focused on keeping the chaos under control.
