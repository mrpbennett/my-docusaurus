---
slug: setting-proxmox-with-tailscale
title: Quick way to setup Proxmox with Tailscale for remote access
authors: [me]
tags: [homelab]
date: 2025-10-31T16:19
---

I sometimes work remotely (away from my cosy home office) and I need to access my homelab from any location. Accessing Proxmox using Tailscale is super easy. First you will need to install Tailscale on your Proxmox nodes.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Once installed run `tailscale up` and authenticate with your account. Easy, Tailscale is installed and you will be able to see it under your account list.

## Enable HTTPS access to the Proxmox Web UI

The Proxmox Web UI is served over HTTPS by default on port `8006`. The default certificate is self-signed, so you will need to accept the certificate warning in your browser. Which as we all know is rather a big PIA. So let's change that.

The following script will use Tailscale to generate a certificate for the Proxmox host and install it in the Proxmox certificate store. However it will only generate the cert once, when the cert expires you will have to accept the certificate warning again. Let's change that...

First we need to install [`jq`](https://jqlang.org/) without that the script below will fail as we can't populate the `$NAME` variable. So run: `sudo apt-get install jq`

Once installed, create a file in your `/root` directory, I called mine `tailscale-cert.sh` this will need to be run via cron. Therefore, we need to create a cron job. Before you do that though, add the contents below to your `tailscale-cert.sh` file:

```bash
#!/bin/bash
NAME="$(tailscale status --json | jq '.Self.DNSName | .[:-1]' -r)"
tailscale cert "${NAME}"
pvenode cert set "${NAME}.crt" "${NAME}.key" --force --restart

```

## Setting up cron

Now let's change the permissions on our script and make it executable

```bash
chmod +x tailscale-cert.sh
```

Now you have your file, let's set up a job to keep that cert up to date. From the terminal, enter edit mode for your user’s crontab using the following command:

```bash
crontab -e
```

The first time you run this command, the OS should ask you what editor you would like to use with a little menu like this:

```bash
no crontab for user - using an empty one

Select an editor.  To change later, run 'select-editor'.
  1. /bin/nano     <---- easiest
  2. /usr/bin/vim.basic
  3. /usr/bin/vim.tiny
  4. /bin/ed

Choose 1-4 [1]:
```

Being a [LazyVim](https://lazyvim.org) user I of course picked 3. If you're using `vim` simply press `G` to get to the bottom of the cron page and enter the following:

```bash
0 3 1 * * /root/tailscale-cert.sh
```

This will run the script every month on the 1st at 3AM renewing your certificate.

For reference, here's how the cron syntax works:

```
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, where both 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Then again if you're using `vim` type the following command `:wqa` to save and quit all.

There you have it...Proxmox setup with Tailscale including a certificate.
