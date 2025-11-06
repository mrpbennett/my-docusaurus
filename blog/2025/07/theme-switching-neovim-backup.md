---
slug: switching-themes-in-neovim
title: Switching themes automatically in Neovim
tags: [neovim]
keywords:
  - neovim
  - nvim
last_updated:
  date: 2025-07-31
---

We're going to be using [Catppuccin](https://github.com/catppuccin/nvim) and this setup is generally for MacOS but this idea will work on Linux too. On **macOS**, you can run this shell command in Lua to get the current system appearance:

<!-- truncate -->

![image](https://images.ctfassets.net/53u3hzg2egeu/63LY79GFopUFfYGL5Gj74C/c28f4b8a733eaad3e8a8402d723c3a21/213472445-091e54fb-091f-4448-a631-fa6b2ba7d8a5.png)

```bash
defaults read -g AppleInterfaceStyle 2>/dev/null
```

This will output:

- `"Dark"` if dark mode is enabled.
- Nothing if in light mode.

Now we can adjust our `colorscheme.lua` config by adding the following before we return the color scheme.

```lua
-- Detect system appearance (macOS only)
local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
local result = handle:read("*a")
handle:close()

local is_dark = result:match("Dark") ~= nil

-- Decide flavour and background based on appearance
local flavour = is_dark and "macchiato" or "latte"
local background = {
  light = "latte",
  dark = "mocha",
}
```

To complete your `colorscheme` config it should look like the below.

```lua
-- Detect system appearance (macOS only)
local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
local result = handle:read("*a")
handle:close()

local is_dark = result:match("Dark") ~= nil

-- Decide flavour and background based on appearance
local flavour = is_dark and "macchiato" or "latte"
local background = {
  light = "latte",
  dark = "mocha",
}

return {
  {
    "catppuccin/nvim",
    name = "catppuccin",
    lazy = false,

    opts = {
      flavour = flavour, -- use detected flavour
      background = background,
      transparent_background = false,
      no_italic = true,
      no_bold = true,
      no_underline = true,
      term_colors = true,

      integrations = {
        cmp = true,
        gitsigns = true,
        neotree = true,
        treesitter = true,
        notify = false,
        mini = {
          enabled = true,
          indentscope_color = "",
        },
      },
    },
  },

  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "catppuccin",
    },
  },
}
```

This is for the [Catppuccin](https://github.com/catppuccin/nvim) theme. Which I have every where, you're able to amend the above Catppuccin options by following [this guide](https://github.com/catppuccin/nvim?tab=readme-ov-file#configuration)