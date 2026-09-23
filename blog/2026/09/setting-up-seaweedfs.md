---
title: "Setting up SeaweedFS"
tags: [homelab]
keywords:
  - homelab
  - storage
  - s3
  - devops
  - linux
  - sre
last_updated:
  date: 2026-09-23
---

When it comes to homelab and storage there are many options, and for a long while MinIO was the default answer. Spin up a container, point your apps at it, done. It just worked, so nobody really questioned it.

After Apr 25, 2026 MinIO ceased development, the homelab community decided to look else where. That announcement kicked off a fair bit of scrambling in the self-hosted world, myself included, since I had MinIO backing a fair chunk of my S3-compatible storage. After a bit of digging around and reading through what other people had landed on, [SeaweedFS](https://seaweedfs.com/) kept coming up as the natural replacement, so I figured it was worth giving it a proper go.

There were a couple of other names floating around too, Garage and Ceph's RGW mainly, but both felt like more than I needed for a homelab. Garage is great if you're spreading storage across a handful of geographically separate nodes, and Ceph is Ceph, powerful but a lot of moving parts for what is essentially "give my apps an S3 bucket". SeaweedFS's `mini` mode hit the sweet spot of one binary, one process, S3-compatible, and no cluster babysitting required.

<!-- truncate -->

## Setting up SeaweedFS

For this example, we will be setting this up in a Ubuntu VM. I have setup SeaweedFS on Kubernetes before but i thought this would be a good change and keeps things off my cluster. Keeping it on its own VM also means if I want to tear it down and rebuild from scratch, I'm not touching anything else running in the cluster.

First we need to create a VM for this I used [community-scripts.org](https://community-scripts.org/scripts?type=vm&preview=ubuntu-vm) for ease of use, it saves you clicking through the Proxmox wizard every single time. I'm using Proxmox here and you simply paste this

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/vm/ubuntu-vm.sh)"
```

Into your PVE shell and follow along, I gave my VM 200Gb of storage, 2 cores and 4GB of ram. That's plenty for a homelab bucket or two, bump it up if you're planning on throwing anything serious at it. Once the VM is setup and you have access via SSH. It's time to install SeaweedFS.

First lets install the binary

```bash
curl -fsSL https://raw.githubusercontent.com/seaweedfs/seaweedfs/master/install.sh | bash
```

That drops the `weed` binary onto the box, which is the single binary that runs pretty much everything SeaweedFS needs, master, volume, filer and S3 gateway all included. Rather than juggling separate services for each of those, I wanted this running as a proper systemd service so it survives reboots without me having to remember to start it manually. Here's the unit file I used:

```ini
[Unit]
Description=SeaweedFS Mini
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/youruser/seaweedfs
ExecStart=/usr/local/bin/weed mini -dir=./data
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Swap out `youruser` for your actual username and drop that file in `/etc/systemd/system/seaweedfs.service`, then reload systemd and bring the service up

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now seaweedfs
```

The `mini` mode is what makes this so painless for a homelab setup, it bundles the master, volume server, filer and S3 API into a single process rather than making you stitch them together yourself. And with a quick status check we can confirm it's running

```bash
systemctl status seaweedfs
```

If that comes back green you're good to go, SeaweedFS is now running with an S3-compatible endpoint and an Admin UI ready and waiting. Time to actually put a bucket in it.

## Migrating data off MinIO

Since the whole reason I was doing this was jumping ship from MinIO, I didn't want to just start fresh, I had backups and other bits already sat in buckets I needed to keep. `rclone` made this painless, since it happily treats both endpoints as just another S3 remote. A couple of `rclone config` entries pointing at my old MinIO endpoint and my new SeaweedFS one, then

```bash
rclone sync minio:cloudnativepg-backup seaweedfs:cloudnativepg-backup --progress
```

and it copies everything across, checksums included. Worth doing a `rclone check` afterwards just to be sure nothing got mangled in transit before you point anything at the new bucket for real.

## Creating an S3 user

SeaweedFS ships its own interactive shell, which is where you'll do most of your day to day admin. Drop into it and create a bucket along with a user who has access to it

```bash
weed shell
> s3.bucket.create -name cloudnativepg-backup
> s3.user.provision -name paul -bucket cloudnativepg-backup -role readwrite
```

That second command is doing a fair bit of heavy lifting for you. s3.user.provision performs three steps in one command:

1. Creates an IAM policy scoped to cloudnativepg-backup
2. Creates the user paul with a freshly generated access key and secret key
3. Attaches the policy to the user

The access key and secret key are printed in the shell output, so make sure you copy those somewhere safe before you close the terminal. You can also view them any time from the Admin UI at `http://localhost:23646`, handy if you forget to grab them the first time round.

Depending on what you're granting access for, you'll want to pick the right role rather than defaulting to `admin` for everything. Available roles

| Role | Object actions | Bucket actions |
| --------- | ------------------------------------------ | -------------- |
| `readonly` | `s3:GetObject` | `s3:ListBucket` |
| `readwrite` | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` | `s3:ListBucket` |
| `admin` | `s3:*` | `s3:*` |

For most of my homelab apps, `readwrite` scoped to a single bucket is more than enough, backups and general object storage don't need admin rights over the whole SeaweedFS instance. Point your app's S3 endpoint config at your VM's address and the access/secret key pair, and you're off, SeaweedFS behaves like any other S3-compatible target from there on.

## Accessing the endpoints

Once everything is setup you can access the UI by `http://<vm-ip>:23646` as well as the S3 connection on port `8333` here is how I would use it to connect to a bucket.

```bash
aws --endpoint-url http://<vm-ip>:8333 s3 ls s3://cloudnativepg-backup --profile seaweedfs
```

## A few things worth knowing before you commit

`mini` mode is genuinely great for a homelab, but it's worth being clear-eyed about what you're trading away. Everything, master, volume, filer and S3 gateway, runs as a single process on a single VM, so there's no built-in replication happening across nodes. If that VM or its disk dies, your data goes with it. For my use case, that's an acceptable trade since the important stuff, like the CloudnativePG backups, already exists elsewhere too. If you're planning on making this your only copy of anything, look at running SeaweedFS's proper distributed setup (separate master/volume servers) instead of `mini`.

The other thing I tripped over was the data directory filling up quietly in the background. `weed mini` doesn't warn you as you approach the disk limit on the VM, it just starts failing writes once it's full. A quick `df -h` cron job or a Proxmox alert on that VM's disk usage saves you from finding out the hard way.

There's also no TLS out of the box, the S3 endpoint and Admin UI are both plain HTTP. Fine if it's staying inside your homelab network, but if you're exposing it any further than that, put it behind a reverse proxy or a Tailscale funnel rather than opening it up directly.

## Wrapping up

A few weeks in and SeaweedFS has quietly been doing its job, which is really all I want from storage. CloudnativePG backups land where they're supposed to, my other apps didn't notice the endpoint change once I swapped the credentials over, and I haven't had to think about it since. Losing MinIO felt like a bigger deal at the time than it turned out to be, if anything, `mini` mode is a simpler setup than MinIO ever was for a single-VM homelab use case. If you're in the same boat, give it a proper go before assuming you need to replicate your old setup one-for-one.
