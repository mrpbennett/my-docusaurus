---
slug: window-swapping-with-vim
title: Using vim bindings for window swapping with Omarchy
tags: [linux, omarchy]
keywords:
  - lazyvim
  - omarchy
  - linux
last_updated:
  date: 2025-10-24
---

I have been using [Omarchy](https://omarchy.org) for a good while now at the time of writing this, my OS is 19 days old and I have gone many installs since v1. One thing I struggled with being on a keyboard without dedicated arrow keys was window navigation. With [LazyVim](https://lazyvim.org) being my main editor I have got use to using vim motions for navigation. Therefore behold my keybindings for window navigation in Omarchy.

<!--truncate-->

```conf
# Unbind SUPER J & K from toggle splitscreen, show key bindings, and map SUPER S to toggle splitscreen
unbind = SUPER, J
unbind = SUPER, K
bindd = SUPER, S, Toggle split, togglesplit # dwindle

# Bind move focus keys and move window keys to use vim motions
bindd = SUPER, H, Move focus left, movefocus, l
bindd = SUPER, L, Move focus right, movefocus, r
bindd = SUPER, K, Move focus up, movefocus, u
bindd = SUPER, J, Move focus down, movefocus, d
bindd = SUPER ALT, H, Move window to group on left, moveintogroup, l
bindd = SUPER ALT, L, Move window to group on right, moveintogroup, r
bindd = SUPER ALT, K, Move window to group on top, moveintogroup, u
bindd = SUPER ALT, J, Move window to group on bottom, moveintogroup, d

# Bind SUPER SHIFT W to close(quit) windows, SUPER B to show key bindings, and unbind SUPER W so I don't accidently close a window when trying to open the browser.
unbind = SUPER, W
bindd = SUPER SHIFT, W, Close active window, killactive
bindd = SUPER, B, Show key bindings, exec, omarchy-menu-keybindings

# Swap active window with the one next to it with SUPER + SHIFT + vim motions
bindd = SUPER SHIFT, H, Swap window to the left, swapwindow, l
bindd = SUPER SHIFT, L, Swap window to the right, swapwindow, r
bindd = SUPER SHIFT, K, Swap window up, swapwindow, u
bindd = SUPER SHIFT, J, Swap window down, swapwindow, d

```
