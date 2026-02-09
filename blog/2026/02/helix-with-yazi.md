---
title: How to Make Yazi and Helix Play Nice
tags: [terminal]
keywords:
  - Helix
  - Yazi
  - Terminal
last_updated:
  date: 2026-02-09
---

Look, I love Helix. It's fast, it's modal, and it doesn't make me feel like I'm piloting a 747 just to edit some code. But you know what it was missing? A solid file manager integration that didn't require me to spawn Zellij or tmux just to browse directories without leaving my editor.

<!-- truncate -->

Enter Yazi—the blazingly fast terminal file manager written in Rust (because of course it is). And thanks to some absolute wizardry from the Yazi maintainer himself, we can now run Yazi directly inside Helix without all the multiplexer overhead.

## The Problem

Initially, folks tried to replicate the LazyGit integration pattern with Yazi. You know, the usual:

```toml
"C-f" = [":new", ":insert-output yazi --chooser-file=/dev/stdout", ":buffer-close!", ":redraw"]
```

Spoiler alert: it didn't work. Helix would just freeze until you mashed Enter or quit Yazi. Not exactly the smooth experience we were hoping for.

The issue? Yazi is an interactive TUI application, and Helix's `:insert-output` wasn't designed to handle interactive programs gracefully. It was like trying to fit a square peg in a round hole—technically possible with enough force, but not pretty.

## The Solution (That Actually Works)

Then sxyazi (the Yazi creator) showed up in the GitHub discussion like some kind of terminal wizard and dropped this absolute gem:

```toml
[keys.normal]
space.e = [
  ':sh rm -f /tmp/unique-file',
  ':insert-output yazi "%{buffer_name}" --chooser-file=/tmp/unique-file',
  ':sh printf "\x1b[?1049h\x1b[?2004h" > /dev/tty',
  ':open %sh{cat /tmp/unique-file}',
  ':redraw',
]
```

Let me break down what's happening here because it's legitimately clever:

### The Play-by-Play

1. **Clear the temp file** - We're using `/tmp/unique-file` as our communication bridge between Yazi and Helix. First, nuke it to avoid stale data.

2. **Launch Yazi with context** - The `"%{buffer_name}"` expansion passes your current file location to Yazi, so it opens in the right directory. The `--chooser-file` flag tells Yazi to write the selected file path to our temp file when you pick something.

3. **The magic escape sequence** - This is where it gets spicy. That `printf "\x1b[?1049h\x1b[?2004h"` sends ANSI escape codes to the terminal:
   - `\x1b[?1049h` switches to the alternate screen buffer (the same thing full-screen TUIs use)
   - `\x1b[?2004h` enables bracketed paste mode

   These codes basically tell the terminal "hey, we're done with the interactive stuff now" and prevent Helix from getting confused about terminal state.

4. **Open the chosen file** - Read whatever Yazi wrote to the temp file and open it in Helix.

5. **Refresh everything** - `redraw` makes sure Helix updates its display properly.

## Bonus: Image and Video Previews

Because Yazi is actually insane (in a good way), you can preview images and videos directly in your terminal while browsing files. Just make sure your terminal supports it (kitty, wezterm, or anything with sixel support).

## Extra Tweaks for the Power Users

### Want the working directory to follow you around?

```toml
C-f = [
  ':sh rm -f /tmp/unique-file',
  ':sh rm -f /tmp/unique-cwd-file',
  ":insert-output yazi --chooser-file=/tmp/unique-file --cwd-file=/tmp/unique-cwd-file",
  ':insert-output echo "\x1b[?1049h\x1b[?2004h" > /dev/tty',
  ':open %sh{cat /tmp/unique-file}',
  ':cd %sh{cat /tmp/unique-cwd-file}',
  ':redraw',
]
```

### Got parentheses in your paths (looking at you, Next.js)?

Use single quotes around the buffer name expansion:

```toml
":insert-output yazi '%{buffer_name}' --chooser-file=/tmp/unique-file",
```

### Mouse scroll acting weird after using Yazi?

Toggle it off and on (yeah, seriously):

```toml
":set-option mouse false",
":set-option mouse true",
```

## Known Issues

There's still a minor quirk where exiting Helix after using Yazi can leave some terminal artifacts on screen. The latest fix using `:sh printf` instead of `:insert-output echo` helps, but it's not 100% solved yet. The Helix team is aware and there's [an issue tracking](https://github.com/helix-editor/helix/issues/15059) a proper command for launching external TUI apps.

Also, if you're using Zellij, you might want to check out alternative approaches that leverage floating panes instead of trying to run Yazi inside Helix directly. YMMV.

## The Bottom Line

This integration is honestly pretty slick once you get it set up. No more `Ctrl-Z`-ing out to your shell, no terminal multiplexer required, just press a keybind and you're in a proper file manager that doesn't suck.

Props to sxyazi for not only building Yazi but also taking the time to figure out how to make it work seamlessly with other tools. This is the kind of polish that makes the terminal ecosystem actually pleasant to use.

Now go forth and navigate your directories in style. Your `cd` key is about to get a lot less worn out.
