---
title: "Managing Talos machine config with patches, mise and hunk"
tags: [homelab]
keywords:
  - homelab
  - monitoring
  - hunk
  - talos
  - devops
  - linux
  - sre
last_updated:
  date: 2026-10-11
---

My homelab cluster, **portland**, is three Dell OptiPlex 7060 Micros running Talos Linux. All three are control-plane nodes that also run workloads. Everything inside Kubernetes is GitOps'd through Argo CD, but the Talos machine config underneath it was... not. I'd been changing nodes with `talosctl patch machineconfig`, one patch at a time, and slowly losing track of what was actually on each box.
<!-- truncate -->

This post walks through the workflow I ended up with: a handful of `mise` tasks that render each node's full config from patch files in git, show me a proper diff against the live node in [hunk](https://hunk.dev), and apply it one node at a time. It turned out to be a really pleasant way to work, so I wanted to share it.

## The question that started it

I had a shared patch, `patches/all-nodes.yaml`, with settings every node needs: install disk, DNS, Longhorn mounts, metrics endpoints and so on. I wanted to keep adding things to it, so I asked myself:

> Can I just keep re-running `talosctl patch` with this file every time I add something? Or do I need lots of little patch files?

Neither, it turns out. The problem is the command, not the file.

### Why `talosctl patch` over and over is a trap

`talosctl patch machineconfig` merges your patch into **whatever config the node has right now**. Each run builds on the result of the last one, so:

- **Some lists get appended rather than replaced.** Re-run a patch with `extraMounts` or `machine.files` and you can end up with duplicates.
- **`$patch: delete` only works once.** The second time, the thing you're deleting is already gone, and the patch errors out.
- **Removing a line from your patch file does nothing.** The setting stays on the node. Your git repo and your nodes quietly drift apart.

I found real drift when I first diffed my nodes: a kube-proxy metrics setting was on `kube-cp-1` but missing from the other two, because I'd only ever patched one node.

### The fix: render the whole config, then replace it

Instead of patching live nodes, **generate each node's complete config from scratch**, then apply it with `talosctl apply-config`, which replaces the node's config wholesale:

```
talosctl gen config (base)
  + patches/all-nodes.yaml    (shared by every node)
  + patches/kube-cp-N.yaml    (hostname, IP, VIP for one node)
  = rendered/kube-cp-N.yaml   → talosctl apply-config
```

This is declarative, the same way Argo CD is:

- Edit `all-nodes.yaml` as often as you like; re-render and re-apply.
- Delete a setting from a patch and it actually disappears from the node.
- Running it twice gives the same result.

So yes: **one big shared file is the right approach**. You just apply it differently.

## Repo layout

```
servers/talos-cluster/
├── mise.toml              # tools + tasks (this post)
├── schematic.yaml         # Image Factory schematic (system extensions)
├── patches/
│   ├── all-nodes.yaml     # shared config: committed
│   ├── kube-cp-1.yaml     # per-node: hostname + network: committed
│   ├── kube-cp-2.yaml
│   └── kube-cp-3.yaml
├── secrets.yaml           # cluster PKI: gitignored, backed up elsewhere
├── talosconfig            # admin credentials: gitignored
└── rendered/              # full generated configs: gitignored
```

The `.gitignore`:

```gitignore
# talosctl output contains the cluster PKI and admin credentials — never commit
controlplane.yaml
worker.yaml
talosconfig
secrets.yaml
# Full per-node configs rendered by `mise run talos:render`
rendered/
```

One gotcha I hit here: I originally had a `kube-cp-*.yaml` ignore rule for generated configs. Gitignore patterns without a slash match at **any depth**, so it was also silently ignoring `patches/kube-cp-*.yaml`. My per-node patches had never been committed. Sending rendered output to its own `rendered/` directory fixed that.

**The important file is `secrets.yaml`.** It holds the cluster's CA, keys and tokens. Without it, `gen config` mints a brand-new PKI every time, and applying that to a running cluster would be a very bad day. Keep it out of git, and back it up somewhere safe (I use Vault and a password manager).

## The mise tasks

[mise](https://mise.jdx.dev) does two jobs here. It pins the tools (`talosctl`, `hunk`, `yq`), and it gives me named tasks so I don't need to remember long `talosctl` invocations. Here's the full `mise.toml`, then each task in turn.

```toml
[tools]
talosctl = "latest"
hunk = "latest"
yq = "latest"

[env]
TALOSCONFIG = "{{config_root}}/talosconfig"

[vars]
# Kubernetes version the cluster runs; used by talos:render and talos:sync-k8s
k8s_version = "1.37.1"

[tasks."talos:render"]
description = "Render full machine configs for every node into rendered/"
run = '''
set -euo pipefail
[ -f secrets.yaml ] || { echo "secrets.yaml missing; run: mise run talos:secrets" >&2; exit 1; }
mkdir -p rendered
for n in 1 2 3; do
  talosctl gen config portland https://192.168.7.200:6443 \
    --with-secrets secrets.yaml \
    --talos-version v1.14 \
    --kubernetes-version {{vars.k8s_version}} \
    --output-types controlplane \
    --with-docs=false --with-examples=false \
    --config-patch @patches/all-nodes.yaml \
    --config-patch @patches/kube-cp-$n.yaml \
    --output rendered/kube-cp-$n.yaml --force
  talosctl validate --mode metal --config rendered/kube-cp-$n.yaml
done
'''

[tasks."talos:diff"]
description = "Render, then review live vs rendered configs in hunk"
depends = ["talos:render"]
usage = 'arg "[node]" help="1, 2 or 3; all nodes if omitted"'
run = '''
set -euo pipefail
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for n in ${usage_node:-1 2 3}; do
  talosctl --nodes 192.168.7.$n get machineconfig v1alpha1 -o jsonpath='{.spec}' > "$tmp/live-$n.yaml"
  yq '... comments="" | ... style=""' "$tmp/live-$n.yaml" > "$tmp/a-$n.yaml"
  yq '... comments="" | ... style=""' rendered/kube-cp-$n.yaml > "$tmp/b-$n.yaml"
  diff -u --label kube-cp-$n.yaml --label kube-cp-$n.yaml \
    "$tmp/a-$n.yaml" "$tmp/b-$n.yaml" >> "$tmp/changes.patch" || true
  summary=$(talosctl apply-config --nodes 192.168.7.$n --file rendered/kube-cp-$n.yaml --dry-run 2>&1 \
    | grep -A1 '^Dry run summary:' | tail -1)
  echo "kube-cp-$n: $summary"
done
if [ -s "$tmp/changes.patch" ]; then
  hunk patch "$tmp/changes.patch"
else
  echo "No changes: live configs match rendered/"
fi
'''

[tasks."talos:apply"]
description = "Render and apply the config to one node"
depends = ["talos:render"]
usage = 'arg "<node>" help="1, 2 or 3 — one node at a time so the control plane keeps quorum"'
run = '''
set -euo pipefail
talosctl apply-config --nodes 192.168.7.${usage_node} --file rendered/kube-cp-${usage_node}.yaml
'''

[tasks."talos:sync-k8s"]
description = "Sync Talos-managed Kubernetes manifests to the applied machine configs"
usage = 'flag "--dry-run" help="Preview the manifest changes without applying them"'
run = '''
set -euo pipefail
talosctl --nodes 192.168.7.1 upgrade-k8s --to {{vars.k8s_version}} ${usage_dry_run:+--dry-run}
'''

[tasks."talos:secrets"]
description = "Recreate secrets.yaml from kube-cp-1's live config"
run = '''
set -euo pipefail
[ ! -f secrets.yaml ] || { echo "secrets.yaml already exists" >&2; exit 1; }
live=$(mktemp)
trap 'rm -f "$live"' EXIT
talosctl --nodes 192.168.7.1 get machineconfig v1alpha1 -o jsonpath='{.spec}' > "$live"
talosctl gen secrets --from-controlplane-config "$live" -o secrets.yaml
'''
```

(The version in the repo has more comments; I trimmed them here.)

My nodes are `kube-cp-1..3` at `192.168.7.1..3`, which is why the tasks can build the IP from the node number. If yours aren't numbered that neatly, a small lookup in each task does the same job.

### `talos:render`: build the full configs

```sh
mise run talos:render
```

For each node, this runs `talosctl gen config` with the shared patch and that node's patch layered on top, writes the result to `rendered/kube-cp-N.yaml`, and validates it with `talosctl validate --mode metal`.

The thinking behind it:

- **`--with-secrets secrets.yaml`** reuses the existing cluster PKI. That's why it refuses to run without the file.
- **`--talos-version v1.14`** pins the config format to what the nodes run, even if my local `talosctl` is newer. Without it, a newer client could generate fields the nodes don't understand.
- **`--kubernetes-version`** comes from the `[vars]` block, so it's defined once and shared with `talos:sync-k8s`.
- **`--with-docs=false --with-examples=false`** leaves out the hundreds of lines of doc comments `gen config` normally adds. That makes the output small, readable and diffable.
- **The patch order matters.** `all-nodes.yaml` goes first, then the per-node file, so a per-node patch can override something shared.
- **Validating every render** catches a broken patch before it gets anywhere near a node.

You'll rarely run this on its own; the other tasks depend on it.

### `talos:diff`: see exactly what will change

```sh
mise run talos:diff      # all nodes
mise run talos:diff 2    # just kube-cp-2
```

This is my favourite task. It renders, fetches each node's **live** config, diffs the two, and opens the result in [hunk](https://hunk.dev), a review-first terminal diff viewer with split view and syntax highlighting. Before hunk opens, it also prints the dry run's verdict for each node, so I know up front whether a change will reboot anything:

```
kube-cp-1: Applied configuration without a reboot (skipped in dry-run).
kube-cp-2: Applied configuration without a reboot (skipped in dry-run).
kube-cp-3: Applied configuration without a reboot (skipped in dry-run).
```

`talosctl apply-config --dry-run` does print a diff on its own, but it's plain text in the terminal, one node at a time. Building a single multi-file patch and handing it to `hunk patch` lets me page through all three nodes as one review, the same way I'd review a PR.

The details that make it work:

- **Fetching the live config.** `talosctl get machineconfig v1alpha1 -o jsonpath='{.spec}'` returns the config the node is actually running.
- **The live configs contain the cluster PKI.** They go in a `mktemp -d` directory with a `trap` that deletes it on exit. Nothing sensitive is left lying around.
- **Normalising with `yq`.** A node's live config might have been applied with doc comments or without them, depending on how it was generated. Without normalising, a node with comments shows hundreds of changed lines and the real change is lost in them. `yq '... comments="" | ... style=""'` strips comments and resets quoting on both sides, so `auto: off` vs `auto: 'off'` doesn't show up as a change either.
- **Labels.** Labelling both sides of the diff with the same filename (`kube-cp-1.yaml`) stops hunk from treating each file as a rename.
- **The dry run writes to stderr.** That's why it has `2>&1`; I lost a few minutes to that one.

When there's nothing to change, it prints `No changes: live configs match rendered/` and doesn't open hunk. That's also a nice drift check to run every so often.

### `talos:apply`: apply to one node

```sh
mise run talos:apply 1
mise run talos:apply 2
mise run talos:apply 3
```

This re-renders, then runs `talosctl apply-config` against a single node. It requires a node number on purpose. With three control-plane nodes, etcd needs two of them healthy to keep quorum, so if a change does trigger a reboot I only want to lose one node at a time. Run `talos:diff` first, apply node 1, check it's happy (`kubectl get nodes`), then move on.

`apply-config` defaults to `--mode auto`. Talos applies what it can live and reboots only if a setting needs it. The dry-run line in `talos:diff` tells you which one you're getting before you commit to it.

### `talos:sync-k8s`: push changes into Kubernetes

```sh
mise run talos:sync-k8s --dry-run   # preview
mise run talos:sync-k8s             # do it
```

This one exists because of something I didn't know about Talos.

I'd set `metricsBindAddress: 0.0.0.0:10249` in a `KubeProxyConfig` document so Prometheus could scrape kube-proxy. I applied it to all three nodes, `talos:diff` showed no changes, and kube-proxy still wasn't exposing metrics. Digging in:

- Talos had created a **new** kube-proxy ConfigMap with the setting in it...
- ...but the kube-proxy DaemonSet still pointed at the **old** one, and its pods were days old.

**Talos creates the Kubernetes manifests it manages (kube-proxy, CoreDNS, flannel) but never updates existing ones.** The tool that syncs them is `talosctl upgrade-k8s`. Run it with `--to` set to the version you're **already on** and it upgrades nothing; it only brings the manifests in line with your machine configs. The dry run showed exactly that: the DaemonSet switches to the new ConfigMap, the old ConfigMap gets pruned, and everything else is unchanged.

So the rule is: **after a `talos:apply` that touches `KubeProxyConfig`, `KubeCoreDNSConfig` or `KubeFlannelCNIConfig`, run `talos:sync-k8s`.** Most changes (DNS, mounts, registry mirrors, kubelet flags) don't need it.

Two small details:

- **The version** comes from the same `[vars]` block as `talos:render`, so the two can't disagree.
- **The `--dry-run` flag** uses `${usage_dry_run:+--dry-run}`. Before trusting that, I checked how mise sets boolean flags: the variable is **unset** when the flag is left off, not set to `"false"`. If it had been `"false"`, the `:+` expansion would have added `--dry-run` on every run, and a "real" sync would quietly have done only a preview.

### `talos:secrets`: recover a lost `secrets.yaml`

```sh
mise run talos:secrets
```

This is the break-glass task. If `secrets.yaml` is gone, it pulls the live config from `kube-cp-1` and runs `talosctl gen secrets --from-controlplane-config` to rebuild it. It refuses to overwrite an existing file.

A Talos 1.14 gotcha here: a lot of older guides tell you to `talosctl read /system/state/config.yaml`. That path doesn't exist on 1.14 (`NotFound`). Reading the `machineconfig` resource through the API works instead, and `gen secrets` copes fine with the newer multi-document config format.

After recovering, run `talos:diff`. If any certificate, key or token lines show as changed, **stop**: your `secrets.yaml` doesn't match the cluster. If only your real changes show up, you're good. Then back the file up.

## The day-to-day loop

```sh
$EDITOR patches/all-nodes.yaml   # or patches/kube-cp-N.yaml
mise run talos:diff              # review in hunk
mise run talos:apply 1           # then 2, then 3
mise run talos:sync-k8s          # only for kube-proxy / CoreDNS / flannel changes
git add patches/ && git commit
```

## Writing patches: what goes where, and how

### Shared vs per-node

The rule I use: **if it's true of every node, it goes in `all-nodes.yaml`.** Only what makes a node unique goes in `kube-cp-N.yaml`.

| `all-nodes.yaml` (shared)        | `kube-cp-N.yaml` (per node)            |
| -------------------------------- | -------------------------------------- |
| Installer image and install disk | Hostname                               |
| DNS servers                      | Static IP address and routes           |
| Removing the control-plane taint | VIP (if only some nodes carry it)      |
| Kubelet flags and mounts         | Anything hardware-specific to that box |
| etcd and kube-proxy metrics      |                                        |
| containerd tweaks                |                                        |
| Registry mirrors                 |                                        |

Here's my whole per-node patch. It's small, and that's the point:

```yaml
---
apiVersion: v1alpha1
kind: HostnameConfig
auto: off
hostname: kube-cp-1
---
machine:
  network:
    interfaces:
      # Match the onboard NIC without hard-coding its name (eno1/enp0s31f6/...)
      - deviceSelector:
          physical: true
        dhcp: false
        addresses:
          - 192.168.7.1/22
        routes:
          - network: 0.0.0.0/0
            gateway: 192.168.4.1
        vip:
          ip: 192.168.7.200
```

### Two patch styles in one file

A patch file can hold several YAML documents separated by `---`. Since Talos 1.14 they come in two flavours, and you'll use both:

**1. Typed documents** (`apiVersion` + `kind`). Talos 1.14 has moved most settings out of the old monolithic config into their own documents. A typed document in your patch is merged into the document of the same `kind` (and `name`, where it has one) in the base config, or added if there isn't one yet:

```yaml
apiVersion: v1alpha1
kind: ResolverConfig
nameservers:
  - address: 192.168.4.2 # AdGuard
---
apiVersion: v1alpha1
kind: RegistryMirrorConfig
name: registry.70ld.dev:5000
endpoints:
  - url: https://registry.70ld.dev:5000
```

**2. The legacy `v1alpha1` block** (top-level `machine:` / `cluster:`, no `kind`). This is strategic-merged into the main config. It's still needed for settings that don't have their own document yet:

```yaml
cluster:
  etcd:
    extraArgs:
      listen-metrics-urls: http://0.0.0.0:2381
machine:
  kubelet:
    extraMounts:
      - destination: /var/lib/longhorn
        type: bind
        source: /var/lib/longhorn
        options: [bind, rshared, rw]
```

**Prefer the typed document when one exists.** On 1.14, setting the same thing in both places is an error: Talos rejects old keys like `machine.install`, `machine.network.nameservers` and `cluster.allowSchedulingOnControlPlanes` with "already set in v1alpha1 config", because the generated base already has the typed document. Go through the [Talos config reference](https://docs.siderolabs.com/talos/v1.14/) for the document that owns the setting you want.

`talosctl validate` tells you when you've used a deprecated field. I had the warning `.machine.files is deprecated; use dedicated configuration documents instead` on every render until I swapped this:

```yaml
# Old: deprecated machine.files
machine:
  files:
    - path: /etc/cri/conf.d/20-customization.part
      op: create
      permissions: 0o644
      content: |
        [plugins."io.containerd.cri.v1.runtime"]
          device_ownership_from_security_context = true
```

for its 1.14 replacement:

```yaml
# New: dedicated document (applying it restarts containerd, no reboot)
apiVersion: v1alpha1
kind: CRICustomizationConfig
name: device-ownership
content: |
  [plugins."io.containerd.cri.v1.runtime"]
    device_ownership_from_security_context = true
```

(The name `customization` is reserved for the legacy file, so pick something descriptive.)

### Deleting things: `$patch: delete`

Sometimes you need to **remove** something from the generated base. `$patch: delete` does that, either for a whole document or for a single key.

**Delete a whole document:**

```yaml
apiVersion: v1alpha1
kind: KubeletConfig
$patch: delete
```

I do this because the `KubeletConfig` document has no `extraMounts` field, and Longhorn needs one. Deleting the document lets the legacy `machine.kubelet` block (which does have `extraMounts`) take over. If you do this, carry over any values the generated document had, such as `image` and `defaultRuntimeSeccompProfileEnabled`.

**Delete a single key... unless the key has dots in it.** This one caught me out. I wanted to drop the control-plane `NoSchedule` taint so all three nodes run workloads. The obvious patch:

```yaml
# Doesn't work: "failed to delete path ... lookup failed"
apiVersion: v1alpha1
kind: KubeNodeConfig
taints:
  node-role.kubernetes.io/control-plane:
    $patch: delete
```

Talos turns that into the path `taints.node-role.kubernetes.io/control-plane` and splits it **on the dots**, so the lookup fails. `$patch: replace` doesn't help either; it ends up as a literal key in the output. Setting `cluster.allowSchedulingOnControlPlanes: true` was accepted but didn't remove the taint.

What works is deleting the whole document and recreating it without the taint. Both can go in the same patch file:

```yaml
apiVersion: v1alpha1
kind: KubeNodeConfig
$patch: delete
---
apiVersion: v1alpha1
kind: KubeNodeConfig
nodeIP: {}
labels:
  node-role.kubernetes.io/control-plane: ""
  node.kubernetes.io/exclude-from-external-load-balancers: ""
```

The catch: you now own that whole document, so keep the labels in line with what `gen config` produces when you upgrade Talos.

### Adding a new setting, end to end

Say I want to add a second DNS server:

1. **Find the owning document** in the config reference: here, `ResolverConfig`.
2. **Edit the shared patch:**
   ```yaml
   apiVersion: v1alpha1
   kind: ResolverConfig
   nameservers:
     - address: 192.168.4.2 # AdGuard
     - address: 192.168.4.3 # AdGuard (second Pi)
   ```
3. **Review it:** `mise run talos:diff`. Hunk should show only those lines changing, on all three nodes, and the summary line tells me whether a reboot is needed.
4. **Apply one node at a time:** `mise run talos:apply 1`, check, then nodes 2 and 3.
5. **Confirm:** `mise run talos:diff` should now say `No changes`.
6. **Commit** the patch.

If the setting is kube-proxy, CoreDNS or flannel config, add `mise run talos:sync-k8s` after step 4.

### What needs a reboot?

You don't need to memorise this; the dry-run line in `talos:diff` tells you. In my experience so far:

- **Applied live:** registry mirrors, the node taint/labels, `CRICustomizationConfig` (containerd restarts) and kube-proxy config (plus `sync-k8s`).
- **Needs a reboot:** etcd flags. Talos can't restart etcd through its API, so the new flags only take effect after a reboot.
- **Takes effect at the next install or upgrade:** installer image and install disk (`UnattendedInstallConfig`).

## Wrapping up

The whole thing is about a hundred lines of `mise.toml`, but it changed how comfortable I am touching the nodes:

- **Git is the source of truth for Talos now**, the same as it is for everything Argo CD manages.
- **Every change gets reviewed** in a proper diff before it lands, with the reboot impact up front.
- **Re-running anything is safe.** No more stacking patches on live nodes.
- **Drift shows up straight away.** `talos:diff` saying `No changes` is a really reassuring thing to see.

If you're running Talos and still `talosctl patch`-ing live nodes, give this a go.
