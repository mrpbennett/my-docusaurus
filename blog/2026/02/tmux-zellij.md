---
title: "Zellij vs Tmux: My Terminal Multiplexer Journey"
tags: [terminal]
keywords:
  - tmux
  - Zellij
  - Multiplexer
  - Terminal
last_updated:
  date: 2026-02-24
---

Terminal multiplexers are one of those tools that, once you start using them, you wonder how you ever survived without one. Whether you're managing a homelab, running long-lived data engineering pipelines, or just tired of juggling dozens of terminal tabs, a multiplexer changes the game entirely.

<!--truncate-->

In this post I'm going to walk through both **Zellij** and **Tmux** — two of the most popular options — share why I landed where I did, and show you the config I actually use day-to-day.

## What's a Terminal Multiplexer, Anyway?

If you're new to the concept: a terminal multiplexer lets you split a single terminal window into multiple panes, manage named sessions that persist even after you disconnect, and generally treat your terminal like a proper workspace rather than a throwaway window.

This is invaluable when you're SSH'd into a remote machine, running a Kubernetes cluster, or just want a reproducible terminal layout that's waiting for you every time you sit down.

## Tmux — The Old Guard

Tmux has been around since 2007 and is the de facto standard. It's available in virtually every package manager, battle-tested, and has an enormous community behind it. If you've ever inherited a server setup from someone else, there's a good chance Tmux was already installed.

I came to Tmux the way most people do — it was just already there. Every server I SSH'd into had it installed, every tutorial referenced it, and when I started reading about how [Anthropic](https://www.anthropic.com/) lets Claude spin up agents inside Tmux sessions, that sealed it: this was the tool I should actually learn properly.

What I like about Tmux is that it's essentially infrastructure at this point. The plugin ecosystem is enormous — TPM alone opens up things like Catppuccin theming and seamless clipboard integration. The scriptability is unmatched; you can build elaborate session layouts in shell scripts and have your entire workspace reconstruct itself from scratch.

The frustrations are real though. The default keybindings feel like they were designed for a keyboard I don't own. `Ctrl+b` as the prefix collides with shell navigation, and `%` and `"` for splits are ergonomically bizarre. Finding a leader key that doesn't fight with everything else in your workflow — Neovim, the shell, the OS — takes genuine experimentation. The config DSL is also verbose enough that you'll spend an afternoon reading the man page before you're comfortable with it.

### My Tmux Config

```bash
# ~/.config/tmux/tmux.conf

# =============================================================================
# General Settings
# =============================================================================
# Unbind default prefix (Ctrl+b)
unbind C-b

# Set Ctrl-s as new leader key
set -g prefix Ctrl-s
bind Ctrl-s send-prefix

# mouse support and terminal settings
set -g mouse on
set -g default-terminal "tmux-256color"

set -g set-clipboard on          # use system clipboard
set -g status-position top       # macOS / darwin style
set -g detach-on-destroy off     # don't exit from tmux when closing a session

setw -g mode-keys vi

# Enable Yazi Image Previewer
set -g allow-passthrough on
set -ga update-environment TERM
set -ga update-environment TERM_PROGRAM

# Reload config
unbind r
bind R source-file "$HOME/.config/tmux/tmux.conf" \; display-message "tmux.conf reloaded ☺️"

# =============================================================================
# Window, Pane & Session Management
# =============================================================================
# Pane navigation using hjkl
bind-key h select-pane -L
bind-key j select-pane -D
bind-key k select-pane -U
bind-key l select-pane -R

bind -r -T prefix H resize-pane -L 20
bind -r -T prefix J resize-pane -D 20
bind -r -T prefix K resize-pane -U 7
bind -r -T prefix L resize-pane -R 7

bind x kill-pane
bind r command-prompt -I "#W" "rename-window '%%'"

# Pop a floating pane: Opens a large centered popup with your default shell
bind f display-popup -w 80% -h 80% -E $SHELL

# LazyVim Window splits
bind | split-window -h -c "#{pane_current_path}"    # split window right
bind - split-window -v -c "#{pane_current_path}"    # split window down

unbind c
bind t new-window -c "#{pane_current_path}"         # new tab with <leader> t

# Window and pane numbering
set-window-option -g pane-base-index 1
set -g base-index 1                                 # Start windows at 1, not 0
setw -g pane-base-index 1                           # Start panes at 1, not 0
set -g renumber-windows on                          # renumber all windows when any window is closed

set -g automatic-rename off
set -g allow-rename off

bind s command-prompt -p "Session name:" "new-session -s '%%'"
bind o choose-session                               # zellij session keybind
bind d kill-session

# =============================================================================
# List of plugins
# =============================================================================
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'catppuccin/tmux#v2.1.3'
set -g @plugin 'tmux-plugins/tmux-yank'

# =============================================================================
# Catppuccin theme options
# =============================================================================
set -g @catppuccin_flavor "mocha"
set -g @catppuccin_window_status_style "basic"
set -g @catppuccin_window_current_text " #{window_name}"
set -g @catppuccin_window_text " #{window_name}"
set -g @catppuccin_window_current_number_color "#{?window_zoomed_flag,#{@thm_yellow},#{@thm_mauve}}" # typos: ignore
set -g @catppuccin_window_number_color "#{?window_zoomed_flag,#{@thm_yellow},#{@thm_overlay_2}}" # typos: ignore

# ============================================================================
# STATUS LINE CONFIGURATION
# ============================================================================

# Status line length settings
set -g status-right-length 100
set -g status-left-length 100
set -g status-left "#{E:@catppuccin_status_session}"

# Status line modules
set -g status-right "#{E:@catppuccin_status_application}"

# Initialize TMUX plugin manager
run '~/.tmux/plugins/tpm/tpm'
```

With my current Tmux config, I have tried to mirror as many key bindings as possible from Zellij and LazyVim to make the transition more manageable. Let's break some down:

```
bind | split-window -h -c "#{pane_current_path}"    # split window right
bind - split-window -v -c "#{pane_current_path}"    # split window down
```

The above are what I use within LazyVim to split my panes after pressing my leader key. Which means pane splitting for me is no longer a pain — I felt `%` wasn't ergonomic anyway.

```
bind x kill-pane
bind r command-prompt -I "#W" "rename-window '%%'"
bind s command-prompt -p "Session name:" "new-session -s '%%'"
bind o choose-session
bind d kill-session
```

Here I have taken inspiration from Zellij for killing panes, renaming windows or sessions as well as picking a session. All taken from the Zellij keybindings.

These bindings are hopefully going to help me get the best experience from Tmux.

## Zellij — The Modern Challenger

Zellij is the newer kid on the block, written in Rust, and takes a very different philosophy to the UX problem. Rather than requiring you to memorise a dense keymap upfront, it renders its available keybindings directly in a status bar — much friendlier for getting started. It also has a proper plugin system and a layout file format that makes reproducible workspaces genuinely pleasant.

I actually used Zellij first, before Tmux, which probably colours my opinion. What drew me in immediately was the status bar — that persistent strip at the bottom showing you exactly which mode you're in and what keys are available is a genuinely brilliant onboarding mechanism. With Tmux you're expected to have the man page memorised; with Zellij the tool teaches you as you go.

The modal UX (Pane mode, Tab mode, Session mode, Resize mode) maps well onto how I think about workspace management. Pressing `Ctrl p` to enter Pane mode and then navigating feels intentional and predictable, rather than a prefix-key soup. And because the keybindings are mode-scoped, there's much less surface area for conflicts with Neovim or shell bindings.

Where Zellij lags behind is ecosystem maturity. The plugin system is promising but not as deep as Tmux's. You won't find a Zellij equivalent for every Tmux plugin out there, and the community is smaller. But for day-to-day use it's genuinely plug-and-play in a way that Tmux never quite is out of the box.

### My Zellij Config

```kdl
// ~/.config/zellij/config.kdl

keybinds clear-defaults=true {
    locked {
        bind "Ctrl g" { SwitchToMode "normal"; }
    }
    pane {
        bind "left" { MoveFocus "left"; }
        bind "down" { MoveFocus "down"; }
        bind "up" { MoveFocus "up"; }
        bind "right" { MoveFocus "right"; }
        bind "c" { SwitchToMode "renamepane"; PaneNameInput 0; }
        bind "d" { NewPane "down"; SwitchToMode "normal"; }
        bind "e" { TogglePaneEmbedOrFloating; SwitchToMode "normal"; }
        bind "f" { ToggleFocusFullscreen; SwitchToMode "normal"; }
        bind "i" { TogglePanePinned; SwitchToMode "normal"; }
        bind "n" { NewPane; SwitchToMode "normal"; }
        bind "p" { SwitchFocus; }
        bind "Ctrl p" { SwitchToMode "normal"; }
        bind "r" { NewPane "right"; SwitchToMode "normal"; }
        bind "s" { NewPane "stacked"; SwitchToMode "normal"; }
        bind "w" { ToggleFloatingPanes; SwitchToMode "normal"; }
        bind "z" { TogglePaneFrames; SwitchToMode "normal"; }
        // hjkl splits ---
        bind "h" {NewPane "right"; SwitchToMode "normal";}
        bind "j" {NewPane "down"; SwitchToMode "normal";}
        bind "k" {NewPane "up"; SwitchToMode "normal";}
        bind "l" {NewPane "left"; SwitchToMode "normal";}
    }
    tab {
        bind "left" { GoToPreviousTab; }
        bind "down" { GoToNextTab; }
        bind "up" { GoToPreviousTab; }
        bind "right" { GoToNextTab; }
        bind "1" { GoToTab 1; SwitchToMode "normal"; }
        bind "2" { GoToTab 2; SwitchToMode "normal"; }
        bind "3" { GoToTab 3; SwitchToMode "normal"; }
        bind "4" { GoToTab 4; SwitchToMode "normal"; }
        bind "5" { GoToTab 5; SwitchToMode "normal"; }
        bind "6" { GoToTab 6; SwitchToMode "normal"; }
        bind "7" { GoToTab 7; SwitchToMode "normal"; }
        bind "8" { GoToTab 8; SwitchToMode "normal"; }
        bind "9" { GoToTab 9; SwitchToMode "normal"; }
        bind "[" { BreakPaneLeft; SwitchToMode "normal"; }
        bind "]" { BreakPaneRight; SwitchToMode "normal"; }
        bind "b" { BreakPane; SwitchToMode "normal"; }
        bind "h" { GoToPreviousTab; }
        bind "j" { GoToNextTab; }
        bind "k" { GoToPreviousTab; }
        bind "l" { GoToNextTab; }
        bind "n" { NewTab; SwitchToMode "normal"; }
        bind "r" { SwitchToMode "renametab"; TabNameInput 0; }
        bind "s" { ToggleActiveSyncTab; SwitchToMode "normal"; }
        bind "Ctrl t" { SwitchToMode "normal"; }
        bind "x" { CloseTab; SwitchToMode "normal"; }
        bind "tab" { ToggleTab; }
    }
    resize {
        bind "left" { Resize "Increase left"; }
        bind "down" { Resize "Increase down"; }
        bind "up" { Resize "Increase up"; }
        bind "right" { Resize "Increase right"; }
        bind "+" { Resize "Increase"; }
        bind "-" { Resize "Decrease"; }
        bind "=" { Resize "Increase"; }
        bind "H" { Resize "Decrease left"; }
        bind "J" { Resize "Decrease down"; }
        bind "K" { Resize "Decrease up"; }
        bind "L" { Resize "Decrease right"; }
        bind "h" { Resize "Increase left"; }
        bind "j" { Resize "Increase down"; }
        bind "k" { Resize "Increase up"; }
        bind "l" { Resize "Increase right"; }
        bind "Ctrl r" { SwitchToMode "normal"; } // Ctrl n: conflicted with lazyvim changed to Ctrl r
    }
    move {
        bind "left" { MovePane "left"; }
        bind "down" { MovePane "down"; }
        bind "up" { MovePane "up"; }
        bind "right" { MovePane "right"; }
        bind "h" { MovePane "left"; }
        bind "Ctrl h" { SwitchToMode "normal"; }
        bind "j" { MovePane "down"; }
        bind "k" { MovePane "up"; }
        bind "l" { MovePane "right"; }
        bind "n" { MovePane; }
        bind "p" { MovePaneBackwards; }
        bind "tab" { MovePane; }
    }
    scroll {
        bind "e" { EditScrollback; SwitchToMode "normal"; }
        bind "s" { SwitchToMode "entersearch"; SearchInput 0; }
    }
    search {
        bind "c" { SearchToggleOption "CaseSensitivity"; }
        bind "n" { Search "down"; }
        bind "o" { SearchToggleOption "WholeWord"; }
        bind "p" { Search "up"; }
        bind "w" { SearchToggleOption "Wrap"; }
    }
    session {
        bind "a" {
            LaunchOrFocusPlugin "zellij:about" {
                floating true
                move_to_focused_tab true
            }
            SwitchToMode "normal"
        }
        bind "c" {
            LaunchOrFocusPlugin "configuration" {
                floating true
                move_to_focused_tab true
            }
            SwitchToMode "normal"
        }
        bind "Ctrl o" { SwitchToMode "normal"; }
        bind "p" {
            LaunchOrFocusPlugin "plugin-manager" {
                floating true
                move_to_focused_tab true
            }
            SwitchToMode "normal"
        }
        bind "s" {
            LaunchOrFocusPlugin "zellij:share" {
                floating true
                move_to_focused_tab true
            }
            SwitchToMode "normal"
        }
        bind "w" {
            LaunchOrFocusPlugin "session-manager" {
                floating true
                move_to_focused_tab true
            }
            SwitchToMode "normal"
        }
    }
    shared_except "locked" {
        bind "Alt left" { MoveFocusOrTab "left"; }
        bind "Alt down" { MoveFocus "down"; }
        bind "Alt up" { MoveFocus "up"; }
        bind "Alt right" { MoveFocusOrTab "right"; }
        bind "Alt +" { Resize "Increase"; }
        bind "Alt -" { Resize "Decrease"; }
        bind "Alt =" { Resize "Increase"; }
        bind "Alt [" { PreviousSwapLayout; }
        bind "Alt ]" { NextSwapLayout; }
        bind "Alt f" { ToggleFloatingPanes; }
        bind "Ctrl g" { SwitchToMode "locked"; }
        bind "Alt h" { MoveFocusOrTab "left"; }
        bind "Alt i" { MoveTab "left"; }
        bind "Alt j" { MoveFocus "down"; }
        bind "Alt k" { MoveFocus "up"; }
        bind "Alt l" { MoveFocusOrTab "right"; }
        bind "Alt n" { NewPane; }
        bind "Alt o" { MoveTab "right"; }
        bind "Alt p" { TogglePaneInGroup; }
        bind "Alt Shift p" { ToggleGroupMarking; }
        bind "Ctrl q" { Quit; }
    }
    shared_except "locked" "move" {
        bind "Ctrl h" { SwitchToMode "move"; }
    }
    shared_except "locked" "session" {
        bind "Ctrl o" { SwitchToMode "session"; }
    }
    shared_except "locked" "scroll" "search" "tmux" {
        bind "Ctrl b" { SwitchToMode "tmux"; }
    }
    shared_except "locked" "scroll" "search" {
        bind "Ctrl s" { SwitchToMode "scroll"; }
    }
    shared_except "locked" "tab" {
        bind "Ctrl t" { SwitchToMode "tab"; }
    }
    shared_except "locked" "pane" {
        bind "Ctrl p" { SwitchToMode "pane"; }
    }
    shared_except "locked" "resize" {
        bind "Ctrl r" { SwitchToMode "resize"; } // changed Ctrl n to Ctrl r to stop conflict with LazVim
    }
    shared_except "normal" "locked" "entersearch" {
        bind "enter" { SwitchToMode "normal"; }
    }
    shared_except "normal" "locked" "entersearch" "renametab" "renamepane" {
        bind "esc" { SwitchToMode "normal"; }
    }
    shared_among "pane" "tmux" {
        bind "x" { CloseFocus; SwitchToMode "normal"; }
    }
    shared_among "scroll" "search" {
        bind "PageDown" { PageScrollDown; }
        bind "PageUp" { PageScrollUp; }
        bind "left" { PageScrollUp; }
        bind "down" { ScrollDown; }
        bind "up" { ScrollUp; }
        bind "right" { PageScrollDown; }
        bind "Ctrl b" { PageScrollUp; }
        bind "Ctrl c" { ScrollToBottom; SwitchToMode "normal"; }
        bind "d" { HalfPageScrollDown; }
        bind "Ctrl f" { PageScrollDown; }
        bind "h" { PageScrollUp; }
        bind "j" { ScrollDown; }
        bind "k" { ScrollUp; }
        bind "l" { PageScrollDown; }
        bind "Ctrl s" { SwitchToMode "normal"; }
        bind "u" { HalfPageScrollUp; }
    }
    entersearch {
        bind "Ctrl c" { SwitchToMode "scroll"; }
        bind "esc" { SwitchToMode "scroll"; }
        bind "enter" { SwitchToMode "search"; }
    }
    renametab {
        bind "esc" { UndoRenameTab; SwitchToMode "tab"; }
    }
    shared_among "renametab" "renamepane" {
        bind "Ctrl c" { SwitchToMode "normal"; }
    }
    renamepane {
        bind "esc" { UndoRenamePane; SwitchToMode "pane"; }
    }
    shared_among "session" "tmux" {
        bind "d" { Detach; }
    }
    tmux {
        bind "left" { MoveFocus "left"; SwitchToMode "normal"; }
        bind "down" { MoveFocus "down"; SwitchToMode "normal"; }
        bind "up" { MoveFocus "up"; SwitchToMode "normal"; }
        bind "right" { MoveFocus "right"; SwitchToMode "normal"; }
        bind "space" { NextSwapLayout; }
        bind "\"" { NewPane "down"; SwitchToMode "normal"; }
        bind "%" { NewPane "right"; SwitchToMode "normal"; }
        bind "," { SwitchToMode "renametab"; }
        bind "[" { SwitchToMode "scroll"; }
        bind "Ctrl b" { Write 2; SwitchToMode "normal"; }
        bind "c" { NewTab; SwitchToMode "normal"; }
        bind "h" { MoveFocus "left"; SwitchToMode "normal"; }
        bind "j" { MoveFocus "down"; SwitchToMode "normal"; }
        bind "k" { MoveFocus "up"; SwitchToMode "normal"; }
        bind "l" { MoveFocus "right"; SwitchToMode "normal"; }
        bind "n" { GoToNextTab; SwitchToMode "normal"; }
        bind "o" { FocusNextPane; }
        bind "p" { GoToPreviousTab; SwitchToMode "normal"; }
        bind "z" { ToggleFocusFullscreen; SwitchToMode "normal"; }
    }
}

plugins {
    about location="zellij:about"
    compact-bar location="zellij:compact-bar"
    configuration location="zellij:configuration"
    filepicker location="zellij:strider" {
        cwd "/"
    }
    plugin-manager location="zellij:plugin-manager"
    session-manager location="zellij:session-manager"
    status-bar location="zellij:status-bar"
    strider location="zellij:strider"
    tab-bar location="zellij:tab-bar"
    welcome-screen location="zellij:session-manager" {
        welcome_screen true
    }
}

load_plugins {
}
web_client {
    font "monospace"
}

simplified_ui true
theme "catppuccin-mocha"
show_startup_tips false
pane_frames false

```

The above is my current default for Zellij just cleans up a few things and add some key mappings that don't conflict with navigation in LazyVim

## Why I Haven't Picked (Yet)

Which one fits into my workflow? I am still deciding. I think I prefer Zellij, however Tmux seems to be so popular that it's worth sticking with and giving a proper go. I like both — the thing that draws me to Zellij is the plug-and-play experience. Mirroring key bindings across both tools means I don't get into much of a fuss when switching between them, which is genuinely helpful.

What I love about Zellij over Tmux is the use of modes — Tab, Pane, Session, and so on. Having these dedicated modes helps with navigation and usage. Whereas Tmux requires a leader key, and finding one that is ergonomic and fits within a broader workflow is proving hard. I have settled on `Ctrl-s` for now — it's accessible and doesn't stomp on anything critical.

In terms of performance I haven't noticed much difference between the two. I'm not a power user; I generally use these tools to keep sessions alive and split panes while working in different tabs for different tasks.

For now I'll continue working with both until I've settled on one. One of the main reasons I wanted to give Tmux a proper go is because of [Anthropic](https://www.anthropic.com/) allowing Claude to spin up agents in Tmux sessions.

## Wrapping Up

Both tools will serve you well — the "right" answer really comes down to whether you value the massive ecosystem and scriptability of Tmux, or the modern UX and Rust-powered ergonomics of Zellij.

If you're just getting started, I'd say try Zellij first — the discoverability alone will save you hours of frustration. Once you've got a feel for what a multiplexer can do, come back to Tmux with fresh eyes. You might find, like me, that you want both in your toolkit.
