---
slug: attempt-to-master-vim-motions
title: Attempting to Master Vim Motions
tags: [neovim]
keywords:
  - nvim
  - neovim
  - vim motions
last_updated:
  date: 2025-08-15
---

I am not a professional developer, but I am a hobbyist one, who knows what the future holds. As a Lead Solution Engineer, I do get to tinker with code in my day-to-day. But it's not my main role, more of a side quest. However, outside of my role I do love to tinker with code and homelabbing. Before I became a Solution Engineer, I spent some time in IT, which meant a lot of time in the terminal.

<!-- truncate -->

I think looking back on it, this sparked a love for terminal use and cli tools. Although I have spent most of my development work in an IDE (VSC / DataGrip / PyCharm). I have started to slowly transition from those to NeoVim. Before I got started with NVIM, I spent some time in actual Vim and could never exit. Looks like [I was not the only one](https://stackoverflow.com/questions/11828270/how-do-i-exit-vim) with StackOverflow having a post that was viewed over 3.2 million times. The infamous `:q` was only the beginning.

The paragraphs below explain or give some tidbits of info on how I felt like I could use Vim Motions on a day-to-day basis.

## Keybindings I found helpful

- `h, j, k, l`: These will help you move left, down, up, right
- `a`: inserts character in insert mode beginning of line
- `A`: enter insert at the end of a line.
- `i`: insert character in insert mode after character
- `I`: enter insert at the beginning of a line
- `e, E`: jump forwards to the end of a word using uppercase E will include punctuation
- `w, W`: jump forwards to the start of a word using uppercase W will include punctuation
- `b, B`: jump backwards to the start of a word using uppercase B will include punctuation
- `o`: start a new line in insert mode below current line
- `O`: start a new line in insert mode above the current line
- `r`: replace a single character
- `gg`: jump to the top of the page
- `G`: jump to the bottom of the page
- `ctrl-d`: jump down the page
- `ctrl-u`: jump up the page

In `COMMAND` mode I found `%s/<find-word>/<replace-word>/g` very useful to search for words and replace them with something else. Appending `/g` does this globally and `/gc` does the same but with confirmation.

I posted something on [Reddit](https://www.reddit.com/r/vim/comments/1m6lzba/started_the_journey/) where I found a lot of awesome tips and sites, some of which are listed below. The below consists of videos or reading material I used to get better with Vim, as well as some awesome CLI tools to make your life that bit easier when in the terminal.

## Distros

I have been told and also read that I should learn to use vim motions and vim in general before I use a distro or at least learn to set up my own. I don't really have time to set my own up. So I use the amazing [Lazyvim](https://www.lazyvim.org/) which is actually fantastic. There are many out there such as, [NVChad](https://nvchad.com/) and [LunarVim](https://www.lunarvim.org/), but I find LazyVim to be the best.

Having said that, because I have a homelab I have spent a lot of time just using vim. As I didn't want to faff around with installing distros on a server just to edit a few files. So I felt confident enough to move to a distro.

People say you should own your own config, in case the maintainers one day stop maintaining the distro. This could also happen with your favourite plugins too, it's just the way of open source I guess. However, there is [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim) which isn't a distro but more of a starting point for your own config which is less daunting. I have started to work along side my own config and Lazyvim. You can learn more about the project by watching [The Only Video You Need to Get Started with Neovim](https://youtu.be/m8C0Cq9Uv9o?si=hUiZO8vpR6VBeLjv), which has been put together by one of the core Nvim devs and the maintainer of the project [TJ DeVries](https://www.youtube.com/@teej_dv)

## Awesome Info

A lot of this info has been found from various sources mainly Youtube and the awesome creators such as:

- [ThePrimeagen](https://www.youtube.com/@ThePrimeagen)
- [TypeCraft](https://www.youtube.com/@typecraft_dev)
- [DevOps Toolbox](https://www.youtube.com/@devopstoolbox)
- [Henry Misc](https://www.youtube.com/@henrymisc)
- [Josean Martinez](https://www.youtube.com/@joseanmartinez)
- [TJ DeVries](https://www.youtube.com/@teej_dv)

I am sure there are plenty more like but these are the guys I seem to be going back too.

- **Vim Motion**
  - YT: [Vim As Your Editor - Series](https://www.youtube.com/playlist?list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R) by ThePrimeagen
    - [Introduction](https://www.youtube.com/watch?v=X6AR2RMB5tE&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=2)
    - [Horizontal Movement](https://www.youtube.com/watch?v=5JGVtttuDQA&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=3&t=204s)
    - [Vertical Movement](https://www.youtube.com/watch?v=KfENDDEpCsI&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=4)
    - [Advance Motion Pt1](https://www.youtube.com/watch?v=qZO9A5F6BZs&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=5)
    - [Advance Motion Pt2](https://www.youtube.com/watch?v=uL9oOZStezw&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=6)
    - [Tips & Tricks](https://www.youtube.com/watch?v=FrMRyXtiJkc&list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R&index=8)
  - YT: [Give Me 20 Minutes and I’ll Make You a Vim Motions Expert](https://youtu.be/z4eA2eC28qg?si=uhj-CWEbE2ipD1Ow) by DevOps Toolbox
  - [Vim Cheat Sheet](https://vim.rtorr.com/)
  - [Vim Hero](https://www.vim-hero.com/)
  - [Vim Adventures](https://vim-adventures.com/)
  - [Practical Vim command workflow](https://m4xshen.dev/posts/vim-command-workflow)
    - [hardtime.nvim](https://github.com/m4xshen/hardtime.nvim)
  - [Vim Motions & Tricks I Wish I Learned Sooner](https://youtu.be/RdyfT2dbt78?si=tUd6gg7D8W152Yne) by Henry Misc
  - [More Vim Tricks That Blew My Mind](https://youtu.be/wgbvBDR4yxk?si=WMdNzLkC3efmClik) by Henry Misc
  - [Vim's Most Misunderstood Feature: Tabs](https://youtu.be/sK6HR9lzgU0?si=PPNqZ4brkPhinpZs) by Henry Misc
  - [This VIM trick BLEW MY MIND](https://youtu.be/bTmEqmtr_6I?si=hbJMig1MwMuwZ0OQ) by Typecraft
  - [30 Vim commands you NEED TO KNOW (in just 10 minutes)](https://youtu.be/RSlrxE21l_k?si=qmy_jjT_xenRgrdw) by Typecraft
  - [Vim Motions for absolute beginners!!!](https://youtu.be/lWTzqPfy1gE?si=PYZnnAaJz4-UIo2J) by Dispatch
  - [Intermediate Vim Motions and Pro Tips!!!](https://youtu.be/nBjEzQlJLHE?si=zeRByx_Pa84-Y62-) by Dispatch

- **Terminals**
  - [Ghostty](https://ghostty.org/)
  - [Warp](https://www.warp.dev/terminal)

- **CLI Tools**
  - YT: [7 Amazing Terminal API tools](https://youtu.be/eyXxEBZMVQI?si=UAz-yntLzHTDpfo-) by DevOps Toolbox
  - YT: [fzf](https://youtu.be/MvLQor1Ck3M?si=w8-Qkqaccopn_Fgk) by DevOps Toolbox
  - YT: [fzf](https://youtu.be/oTNRvnQLLLs?si=Nq7WmOqIfVCZXBT8) by Typecraft
  - YT: [Lazygit - The Best Way To Use Git On The Terminal](https://www.youtube.com/watch?v=Ihg37znaiBo) by Josean Martinez
  - YT: [Yazi](https://www.youtube.com/watch?v=iKb3cHDD9hw) by Josean Martinez
  - YT: [Zellij](https://youtu.be/ZPfQS5FHNYQ?si=IFqwO8vvaRWvFZeV) by Typecraft

  **Github**
  - [yazi](https://github.com/sxyazi/yazi) - File Manager
  - [posting](https://posting.sh/) - API client
  - [curlie](https://github.com/rs/curlie) - A better `curl`
  - [eza](https://github.com/eza-community/eza) - A better `ls`
  - [zoxide](https://github.com/ajeetdsouza/zoxide) - Learn your directories
  - [bat](https://github.com/sharkdp/bat) - Syntax highlighting
  - [mitmproxy](https://github.com/mitmproxy/mitmproxy) - Charles for the terminal
  - [zellij](https://github.com/zellij-org/zellij) - terminal multiplexer

- **LazyVim**
  - [lazyvim.org](https://www.lazyvim.org/)
  - YT: [LazyVim from Scratch to BeastMode](https://www.youtube.com/watch?v=evCmP4hH7ZU&t=391s) by DevOps Toolbox

- **Nvim**
  - [Full Neovim Setup from Scratch in 2025](https://youtu.be/KYDG3AHgYEs?si=rcvgxBGs5wpzHXNg) by Henry Misc
  - [How I Setup Neovim To Make It AMAZING in 2024: The Ultimate Guide](https://youtu.be/6pAG3BHurdM?si=skgkAbKGBigyQCpl) by Josean Martinez
  - [NeoVim setup config playlist](https://www.youtube.com/watch?v=J9yqSdvAKXY&list=PLsz00TDipIffxsNXSkskknolKShdbcALR) by TypeCraft

- **Other**
  - Book: [Practical Vim 2nd Edition](https://www.amazon.co.uk/dp/1680501275?ref=ppx_yo2ov_dt_b_fed_asin_title)
  - Book: [lazyvim-ambitious-devs](https://lazyvim-ambitious-devs.phillips.codes/)
  - YT: [How To Use Vim/Neovim Macros For Next Level Productivity](https://youtu.be/K4PoBfz3WLA?si=-L-cXr2oP_3dgB4t) by Josean Martinez
  - [Vim Hardtime](https://github.com/takac/vim-hardtime)
  - [Touch typing](https://www.keybr.com/)
