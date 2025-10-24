---
slug: connecting-to-a-vpn-in-omarchy
title: Connecting to Forticlient in Omarchy with openfortivpn
authors: [me]
tags: [omarchy, linux]
date: 2025-08-15T00:00
---

I have found a love for window tile management whether that be [Aerospace](https://nikitabobko.github.io/AeroSpace/guide) for MacOs or [Hyprland](https://hypr.land/) for Arch. They suit my workflow especially on a large 32" screen, I have been playing with [Omarchy](https://omarchy.org/) An opinionated Arch + Hyprland Setup by [DHH](https://dhh.dk/)

<!-- truncate -->

It's still being fleshed out but so far I think DHH and the Omarchy community are doing awesome work. However, for myself to move away from M1 Macbook Pro to Omarchy for work, I needed to use a VPN. Forticlient only has `.rep` and `.deb` packages, meaning Arch needed something else.

After some googling, some ChatGPT and being pointed in the right direction from the Omarchy community I came across [openfortivpn](https://archlinux.org/packages/extra/x86_64/openfortivpn/) this is how I set things up for myself.

### Install openfortivpn

Arch provides `openfortivpn` in the official repo:

```bash
sudo pacman -S openfortivpn
```

Or use the latest dev version from the AUR:

```bash
yay -S openfortivpn-git
```

### Setting up your config file

Once installed you will need to set up your config file this is generally located at `/etc/openfortivpn/config`

```txt
host = vpn.example.com
port = 443
username = john.doe
password = mySecretPassword   # optional, omit for interactive prompt
```

Once you have that, make sure only root can read it:

```bash
sudo chmod 600 /etc/openfortivpn/config
```

### Running the VPN

Once the above steps are done you can do the following:

```bash
sudo openfortivpn
```

In my case this then prompted me to accept a token on my phone before allowing me to connect. Once connected the connection will continue to run inside the termainal window. If you were to close the window your connection will be dropped.

To prevent this, so I can have my terminal window back I set up the following alias.

```bash
alias vpnc="nohup sudo openfortivpn -c /etc/openfortivpn/config &"
```

---

There we have it...what seemed daunting was actually pretty simple, just needed a few config files.
