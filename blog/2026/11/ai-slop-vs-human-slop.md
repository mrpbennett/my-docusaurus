---
title: AI slop vs human slop
tags: [opinion]
keywords:
  - ai
  - slop
  - pull requests
  - code review
  - opinion
last_update:
  date: 2026-11-13
---

Every few weeks I see another project announce that it won't accept AI-generated pull requests. The reasoning is always the same: AI writes slop, humans write good code, so keep the machines out.

I get the frustration. I don't think the argument holds up.

<!-- truncate -->

## Slop isn't new

Unless you're a 1000x developer (and I've met very few of those), you've written slop. So have I. So has everyone whose code I've viewed. Half-understood copy-and-paste from Stack Overflow, a function that does five things, a `// TODO fix this later` that is still there four years on.

Before AI came along, I was writing my Python scripts by hand. I am a self-taught 'developer'. I've never done a computer science degree or any learning about computer science. Things like LeetCode still scare the shit out of me.

Everything that I have taught myself has been through Stack Overflow, YouTube, books, etc. And yes, I have copied and pasted functions and resolutions to my issues. Again, this is no different to AI writing it for me. I still had an understanding of what I was copying and pasting.

But I would consider my early code human slop. I was copying and pasting my way through scripts to get the job done. They weren't beautiful handcrafted scripts, but they worked. I would consider my early work to be a lot of human slop. But it got the job done, and clients were happy.

No one has ever written a policy banning human PRs because of human slop. We called it code review and got on with it. And sometimes those human-written PRs would break production.

## What actually differs

The difference I can see is where the slop comes from. One lot was written by an agent, and the other by a developer who is junior or isn't a so-called _'10x developer'_.

We have all written slop in the past. Even today, I am better at writing code, but I still use an AI to make myself more productive. Even if I'd written it myself, I would get an AI to potentially sense check it for me.

Bad code is bad code. It either passes review or it doesn't. The reviewer doesn't need to know who, or what, typed it.

If anything, the agent version has one small advantage. It doesn't get defensive when you ask it to redo something.

Even today, I use AI to write most of my code. I do review every output, but the majority of my stuff is written by an agent. It would take me a lot longer to write the code, especially in a language that I don't really use on a daily basis. That is where AI has helped me a lot.

## Why a ban misses the point

Banning AI PRs treats the tool as the problem. The real problem is someone sending code they haven't read and can't explain. That was true before agents, and it's true now. The agent only makes it faster.

A sensible rule would be 'you own what you submit'. If you can't explain a change, it doesn't go in. That applies to a human who pasted it from a forum just as much as an agent that generated it.

As an example, DHH is using a lot of agents to speed up the development of Omarchy, yet some of the open source projects he has used to build it are no longer allowing AI contributions. And really, we know DHH, the founder of Ruby on Rails. He is an amazing developer, but he is happy to use agents to create stuff faster, allowing him to ship faster.

A quote from [Ryan R. Hughes](https://x.com/ryanrhughes), one of the Omarchy core team, sums it up pretty well.

> Assuming human-written = good and AI-written = bad is  lazy, and wrong.
> I've spent plenty of my career debugging handcrafted true slop. Both can produce good work and garbage.
> Critique the work. Explain what's wrong. Calling everything “AI slop” just shows your own ignorance.

## Jobs

This is also why I'm not worried about AI taking my job. Somebody still has to decide what to build, read what comes out, and say 'no, that's wrong' (or 'yes, but not like that'). The typing was never the hard part.

As a lead solution engineer, I used to write a lot of my scripts by hand, and really I would consider them human slop. As I've mentioned above, I'm not a formally trained developer. I'm self-taught. And today I do use AI to write the majority of my code simply because it is quicker and I'm more effective at shipping products and solutions for clients because of it.

## Where I've landed

AI slop and human slop are the same problem. The fix is a good review process and making people own their output, not banning a tool. Where I have landed today is that I use agents to write the majority of my code, and I do review the process and the output. I ask for adjustments, but using agents today has made me a hundred times more productive. Especially for languages that I'm not very good at, it has allowed me to build better products and better solutions to help clients.

I don't agree we should be banning AI-produced code. AI slop versus human slop is the same; it has just been written by someone else. As long as that person owns the output from the agent and understands it, we should allow AI-written code. Otherwise, in my opinion, the people who don't won't be innovating as quickly as the rest of us.
