---
title: "Fixing Discord Alerts on kube-prometheus-stack"
tags: [homelab]
keywords:
  - homelab
  - monitoring
  - prometheus
  - devops
  - linux
  - sre
last_updated:
  date: 2026-10-11
---

**My Alertmanager Was Silently Dead for Two Days: Fixing Discord Alerts on kube-prometheus-stack**

_A debugging story, a fix, and a pile of lessons for anyone wiring Alertmanager into Discord on a homelab Kubernetes cluster._

I run a small Talos Linux cluster at home, managed with Argo CD (GitOps, ApplicationSets), and monitored with `kube-prometheus-stack`. I had alerts routed to Discord. Or so I thought. I wasn't getting any notifications, and when I finally went looking, the problem was bigger than a bad webhook: **Alertmanager wasn't running at all**, and had not been for about two days.

<!-- truncate -->

This post walks through what was wrong, how I fixed it, how I tested it, and then how I used the working pipeline to add alerts that actually catch real problems. Along the way there are a handful of lessons that would have saved me hours.

**Stack:** Talos Linux, Argo CD ApplicationSets, kube-prometheus-stack chart 79.4.1, Prometheus Operator v0.86.2, Alertmanager v0.29.0, Longhorn, CloudNativePG, cert-manager, Loki/Alloy, Vault.

---

## Part 1: Finding out why nothing was arriving

### Start at the bottom of the pipeline

An alert's journey looks like this:

```
Prometheus rule fires
  -> Alertmanager receives it
    -> route matches (by labels)
      -> receiver sends to Discord webhook
```

When "nothing arrives," the instinct is to check the webhook URL or the Discord channel. I did the opposite and checked each stage in order, starting with the stage everything depends on: _is Alertmanager actually running?_

```bash
kubectl get pods -A | grep -i alertmanager      # nothing
kubectl get alertmanager -n monitoring
```

```
NAME                                 VERSION   REPLICAS   READY   RECONCILED   AVAILABLE
kube-prometheus-stack-alertmanager   v0.29.0   1          0       False        False
```

The `Alertmanager` custom resource existed, but `READY 0` and `RECONCILED False`. No StatefulSet, no pod. The webhook was never the issue because nothing was there to use it.

### The actual error

`kubectl describe alertmanager` shows the reason in its status conditions:

```
Reason: ReconciliationFailed
Message: provision alertmanager configuration: failed to initialize from secret:
  yaml: unmarshal errors:
  line 30: field webhook_url_file not found in type alertmanager.discordConfig
  line 34: field webhook_url_file not found in type alertmanager.discordConfig
```

The Prometheus Operator **validates the Alertmanager config using its own Go structs** before it creates the pod. My config used `webhook_url_file`, which is a valid _Alertmanager_ option but is not known to the _operator's_ Discord config type in this version. So the operator refused to reconcile, never created the StatefulSet, and just kept logging `StatefulSet not found` once a minute.

My original config looked like this (in the Helm values):

```yaml
alertmanager:
  config:
    receivers:
      - name: discord-critical
        discord_configs:
          - webhook_url_file: /etc/alertmanager/secrets/alertmanager-discord/alertmanager-critical
            send_resolved: true
  alertmanagerSpec:
    secrets:
      - alertmanager-discord # mounted the secret into the pod
```

This is a very common pattern for `webhook_url_file` with Slack and others. It's easy to assume it works for Discord too. It doesn't, at least not through the operator.

> **Lesson 1:** When using the Prometheus Operator, "valid Alertmanager config" and "config the operator accepts" are not the same thing. Always check `kubectl describe alertmanager` (the `Reconciled` condition) and the operator logs, not just the Alertmanager pod.

> **Lesson 2:** A broken Alertmanager config fails _silently from your point of view_. Nothing alerts you that your alerting is down. More on fixing that at the end.

---

## Part 2: The fix, using AlertmanagerConfig

There are two ways out:

1. Put the webhook URL inline (`webhook_url:`) in the Helm values. Simple, but now a secret is committed to git. No.
2. Use the operator's own `AlertmanagerConfig` CRD, which can reference a Kubernetes Secret key for the webhook URL.

I went with option 2. The webhook URLs stay in a Secret (mine is populated from Vault by the Vault Secrets Operator), and git contains only references.

### Step 1: strip Discord out of the Helm values

The chart still needs a root route and a receiver, so I left a `"null"` receiver as the default and removed everything Discord-specific:

```yaml
alertmanager:
  config:
    route:
      group_by: ["alertname", "cluster", "service"]
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 3h
      receiver: "null"
    receivers:
      - name: "null"
```

### Step 2: tell the operator not to scope routes to one namespace

This is the gotcha that would have bitten me later. By default, the operator **adds a `namespace="<AlertmanagerConfig's namespace>"` matcher** to every route in an `AlertmanagerConfig`. My AlertmanagerConfig lives in `monitoring`, so it would only match alerts _from_ the `monitoring` namespace. An alert from Longhorn, CNPG, or anything else would silently fall through to the null receiver.

Fix it in the Alertmanager spec:

```yaml
alertmanager:
  alertmanagerSpec:
    alertmanagerConfigMatcherStrategy:
      type: None
```

> **Lesson 3:** If you want a single global routing tree, set `alertmanagerConfigMatcherStrategy: {type: None}`. Otherwise your AlertmanagerConfig only sees its own namespace's alerts, and you won't notice until a real alert goes missing.

### Step 3: the AlertmanagerConfig

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: discord
  namespace: monitoring
spec:
  route:
    receiver: discord-warning # default for anything unmatched
    groupBy: ["alertname", "cluster", "service"]
    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 3h
    routes:
      # Swallow always-firing / known-noisy alerts
      - receiver: "null"
        matchers:
          - name: alertname
            value: Watchdog
      - receiver: "null"
        matchers:
          - name: severity
            value: critical
          - name: alertname
            value: KubeSchedulerDown|KubeProxyDown|KubeControllerManagerDown
            matchType: =~
      # Critical -> critical channel
      - receiver: discord-critical
        matchers:
          - name: severity
            value: critical
  receivers:
    - name: "null"
    - name: discord-critical
      discordConfigs:
        - apiURL:
            name: alertmanager-discord # Secret name
            key: alertmanager-critical # key inside the Secret
          sendResolved: true
    - name: discord-warning
      discordConfigs:
        - apiURL:
            name: alertmanager-discord
            key: alertmanager-warning
          sendResolved: true
```

Notes worth knowing:

- Order matters. Routes are evaluated top to bottom and the first match wins (unless `continue: true`). The "swallow" routes must come **before** the generic `severity=critical` route.
- Matchers on `AlertmanagerConfig` are structured (`name`/`value`/`matchType`), not the `severity = "critical"` string syntax you use in plain Alertmanager config.
- The operator renames receivers to `<namespace>/<config-name>/<receiver>` in the merged config, e.g. `monitoring/discord/discord-warning`. Don't be surprised when you see that in the UI.
- The CRD version is `v1alpha1`. Check that your installed CRD actually has `discordConfigs`: it's missing from older operator versions.

I validated the manifest against the live API server without creating anything:

```bash
kubectl apply --dry-run=server -f alertmanager-config.yaml
```

### A GitOps gotcha: my ApplicationSets weren't managed by Argo

I pushed the change and nothing happened. It turned out the live `ApplicationSet` resources in my cluster were not themselves managed by Argo CD: nothing watched the `appsets/` directory. Argo was faithfully syncing from the _old_ ApplicationSet definition. I had to apply the ApplicationSet manifests by hand once:

```bash
kubectl apply --server-side -f appsets/kube-prometheus-helm/appset-helm-kube-prometheus.yaml
```

If you generate your Applications from ApplicationSets, consider an app-of-apps that manages the ApplicationSets too, or you'll hit the same "I pushed but nothing changed" confusion. If an Application shows `Synced` but the content is stale, check where its spec comes from.

---

## Part 3: Testing it end to end

Once Alertmanager came up (`2/2 Running`, `Reconciled: True`), I tested the whole path by posting synthetic alerts straight to the Alertmanager API through a port-forward:

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 19093:9093 &

curl -s -X POST http://127.0.0.1:19093/api/v2/alerts \
  -H 'Content-Type: application/json' -d '[
  {"labels":{"alertname":"TestAlertWarning","severity":"warning","namespace":"default"},
   "annotations":{"summary":"Test warning alert","description":"Testing routing"}},
  {"labels":{"alertname":"TestAlertCritical","severity":"critical","namespace":"default"},
   "annotations":{"summary":"Test critical alert","description":"Testing routing"}}]'
```

Then three checks, in increasing order of "proof":

**1. Did it route where I expected?**

```bash
curl -s http://127.0.0.1:19093/api/v2/alerts/groups
```

`TestAlertWarning` landed on `monitoring/discord/discord-warning` and `TestAlertCritical` on `monitoring/discord/discord-critical`. The known-noisy alerts (Watchdog, KubeProxyDown, ...) landed on `null`. Routing confirmed.

**2. Did delivery succeed?** Alertmanager does not log successful sends at the default log level, so look at its metrics instead:

```bash
curl -s http://127.0.0.1:19093/metrics | grep -E 'alertmanager_notifications(_failed)?_total.*discord'
```

```
alertmanager_notifications_total{integration="discord"} 9
alertmanager_notifications_failed_total{integration="discord",reason="clientError"} 0
alertmanager_notifications_failed_total{integration="discord",reason="serverError"} 0
...
```

Nine sent, zero failed in every category. A bad webhook URL shows up as `clientError`.

**3. Did it land in Discord?** Only your eyes can confirm this.

Two testing traps I walked into:

- **`group_wait` and `repeat_interval` make re-testing confusing.** My first test POST was delivered after the 30s `group_wait`. When I re-posted the same alerts, Alertmanager considered them the same group already notified and (correctly) did not resend for `repeat_interval` (3h). The counter didn't move and I briefly thought it was broken. To re-test, change the `alertname` label or temporarily lower `repeat_interval`.
- **A POST that fails can look like silence.** `curl -s` hides HTTP errors. Use `-w '\nHTTP %{http_code}\n'` and expect `200`.

> **Lesson 4:** Test with synthetic alerts via the API, verify routing with `/api/v2/alerts/groups`, and verify delivery with the `alertmanager_notifications_failed_total` metrics. Don't rely on "I didn't see an error."

---

## Part 4: Now that alerts work, are they the _right_ alerts?

A working pipeline is only useful if the right things flow through it. I audited what was actually monitored:

```bash
kubectl get servicemonitor,podmonitor -A
kubectl get prometheusrule -A
```

The default `kube-prometheus-stack` rules cover Kubernetes itself (nodes, kubelet, API server, etcd, pods). They know nothing about the _applications_ you run. I had metrics for Longhorn, CNPG, and Loki flowing into Prometheus with **no alerts defined on any of them**. I also had no metrics at all for cert-manager and Argo CD.

### Make sure Prometheus actually selects your rules and monitors

By default the chart restricts Prometheus to objects carrying the Helm release label. These settings make it select everything in all namespaces:

```yaml
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
    serviceMonitorSelector: {}
    serviceMonitorNamespaceSelector: {}
    podMonitorSelectorNilUsesHelmValues: false
    ruleSelectorNilUsesHelmValues: false
    probeSelectorNilUsesHelmValues: false
```

Without `ruleSelectorNilUsesHelmValues: false`, a `PrometheusRule` you drop in another namespace may be ignored with no error.

### Check the real metric names and labels _before_ writing rules

I queried Prometheus for every metric and its labels rather than guessing from documentation. This caught a real subtlety: CloudNativePG's `cnpg_collector_last_available_backup_timestamp` is only **non-zero on the primary**; replicas report `0`. A naive rule would alert constantly. The fix is to aggregate:

```promql
time() - max by (namespace) (cnpg_collector_last_available_backup_timestamp) > 8 * 86400
```

I then **evaluated every alert expression against the live Prometheus** before committing, checking that each parsed and returned the series I expected (none firing at the time):

```bash
# Extract exprs from the PrometheusRule manifests and run each through the query API
kubectl apply --dry-run=client -f rules/ -o json | python3 ...
```

> **Lesson 5:** Don't write PromQL from memory. Query the metric, look at the labels, check what a healthy value looks like, then write the rule. Run each expression against live data before you ship it.

### The alerts I added

| Area              | Alerts                                                                                                                         | Notes                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **CloudNativePG** | instance down, replication lag > 30s, backup stale, backup failed, WAL archive backlog, connections > 80% of `max_connections` | Backup-stale threshold is 8 days because my backups are weekly. Match it to _your_ schedule.          |
| **Longhorn**      | volume degraded (30m), volume faulted, node not ready, disk not ready, disk usage 80% / 90%                                    | `degraded` has a `for: 30m` because replica rebuilds legitimately take a while. `faulted` fires fast. |
| **cert-manager**  | cert expiring < 14d, < 3d, not ready                                                                                           | Needs the ServiceMonitor enabled (below).                                                             |
| **Argo CD**       | app OutOfSync (30m), app Degraded/Missing, sync failed                                                                         | Needs metrics enabled (below).                                                                        |
| **Vault**         | pod not ready (sealed)                                                                                                         | See below: no Vault metrics needed.                                                                   |
| **external-dns**  | repeated soft errors, sync stale                                                                                               | Broken DNS sync is quiet and annoying.                                                                |
| **Loki / Alloy**  | compactor stale, 5xx rate, Alloy down                                                                                          | Loss of logs is a silent failure.                                                                     |

A typical rule, with the shape I used everywhere:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: longhorn-alerts
  namespace: monitoring
spec:
  groups:
    - name: longhorn
      rules:
        - alert: LonghornVolumeFaulted
          expr: longhorn_volume_robustness{state="faulted"} == 1
          for: 1m
          labels:
            severity: critical # <- this label drives the Discord route
          annotations:
            summary: "Longhorn volume {{ $labels.pvc }} is faulted"
            description: "Volume {{ $labels.pvc_namespace }}/{{ $labels.pvc }} has no healthy replicas."
```

The `severity` label is the contract between your rules and your routes. Every rule I wrote sets it, because that's what decides which Discord channel gets the message.

### Turning on metrics for things that weren't scraped

Both cert-manager and Argo CD export Prometheus metrics, but the chart does not create ServiceMonitors by default:

```yaml
# cert-manager chart values
prometheus:
  enabled: true
  servicemonitor:
    enabled: true
```

```yaml
# argo-cd chart values: repeat for controller, server, repoServer, applicationSet
controller:
  metrics:
    enabled: true
    serviceMonitor:
      enabled: true
```

After the sync I confirmed data was arriving (`argocd_app_info` returned 30 series; cert-manager showed 7 certificates with ~87 days left) and that Prometheus reported every new rule group as `health: ok`.

### Vault: when there are no metrics, use readiness

Vault's telemetry needs extra server config and either a token or unauthenticated metrics access. Rather than reconfigure a secrets server for the sake of an alert, I used the fact that **a sealed Vault fails its readiness probe while the pod stays `Running`**. kube-state-metrics already exposes that:

```promql
kube_pod_status_ready{namespace="vault", pod=~"vault-[0-9]+", condition="true"} == 0
```

Cheap, no config change, and it catches the scenario that matters (Vault restarted and is sealed).

---

## Part 5: Things I learned that apply to anyone setting up Alertmanager

**1. Alert on your alerting.** The reason this lasted two days is that nothing watched Alertmanager itself. `kube-prometheus-stack` ships a `Watchdog` alert that fires _constantly by design_. Its purpose is to be sent to an external dead-man's-switch (healthchecks.io, Dead Man's Snitch, etc.) that pages you when the heartbeat **stops**. I currently route Watchdog to `null`, which wastes it. Pointing it at a heartbeat service is the single best resilience improvement for this setup.

**2. Kubernetes client-cert alerts are not about cert-manager.** After the fix I started seeing `KubeClientCertificateExpiration`. I assumed cert-manager would renew it, but that alert comes from `apiserver_client_certificate_expiration_seconds`: some client presenting a short-lived certificate to the API server. cert-manager only manages `Certificate` resources (mine are Let's Encrypt certs for ingress). Different mechanism entirely. If you see this alert, work out which client is using the cert; your own kubeconfig is the first place to check (`openssl x509 -noout -enddate`).

**3. Talos (and other minimal distros) trigger permanent `*Down` / `TargetDown` noise.** Talos binds the kube-proxy, kube-controller-manager and kube-scheduler metrics endpoints to localhost, so Prometheus can't scrape them from the pod network and those targets are down forever. The chart's `KubeProxyDown` etc. alerts fire permanently, and `TargetDown` fires for each of them. I silenced the specific `*Down` alerts, but the better fix is to change the bind addresses in the Talos machine config so you also get real control-plane metrics. Either way, **permanent noise trains you to ignore the channel**, which is how real alerts get missed.

**4. Route by severity, but think about inhibition.** Inhibit rules stop lower-severity alerts firing while a higher one already covers the same thing. The chart default (critical suppresses warning/info with the same `alertname` and `namespace`) is a good start. Consider adding one for "node is down," otherwise one dead node generates a flood of pod-level alerts.

**5. Pick `for:` durations deliberately.** Too short and you get flapping pages for transient blips; too long and you hear about outages late. My rule of thumb: `1m` for "it's definitely broken" (faulted volume), `5-15m` for "might be self-healing" (pod not ready), `30m+` for things that legitimately take time (replica rebuilds, out-of-sync apps).

**6. Match thresholds to your actual schedules.** My CNPG backup rule fires at 8 days because backups run weekly. Copying a "no backup in 26 hours" rule from a blog (including this one) onto a weekly schedule would page every day.

**7. Expect some alerts to fire immediately.** After enabling Argo CD metrics, two apps that had been quietly OutOfSync for days (`airflow`, `kubevirt-cdi`) were suddenly visible. That's the system working: new monitoring surfaces old problems. Budget a bit of time to either fix them or consciously silence them.

**8. Don't commit webhook URLs.** Discord webhook URLs are bearer credentials. Anyone with the URL can post to your channel. Using the `AlertmanagerConfig` secret reference keeps them out of git entirely.

**9. Verify at each layer.** The debugging order that worked: operator status (`describe alertmanager`) -> pod running -> config loaded -> routing (`/api/v2/alerts/groups`) -> delivery metrics -> Discord. Each layer has a different tool, and skipping straight to the end is how you spend an afternoon staring at a webhook that was never the problem.

---

## Checklist for setting this up yourself

- [ ] `kubectl get alertmanager -A`: `READY` matches `REPLICAS`, `RECONCILED` is `True`
- [ ] Webhook URLs live in a Secret, referenced from `AlertmanagerConfig.discordConfigs[].apiURL`
- [ ] `alertmanagerConfigMatcherStrategy: {type: None}` if you want global routing
- [ ] Noisy always-on alerts (Watchdog, distro-specific `*Down`) routed to a `null` receiver _before_ the catch-all routes
- [ ] Synthetic alert sent via `/api/v2/alerts`; routing verified at `/api/v2/alerts/groups`
- [ ] `alertmanager_notifications_failed_total` is 0
- [ ] Prometheus selectors (`*NilUsesHelmValues: false`) allow your ServiceMonitors and PrometheusRules from all namespaces
- [ ] Every rule sets a `severity` label that your routes match on
- [ ] Every rule expression run against live Prometheus before committing
- [ ] Watchdog wired to an external dead-man's-switch
- [ ] ApplicationSets (if used) are themselves under GitOps, or you remember to `kubectl apply` them

---

## Wrapping up

The root cause was one unsupported field in a config block, but the real failure was that nothing told me my alerting was down. The fix took an hour; noticing took two days. If you take one thing away: **monitor the monitor.** Everything else here is detail.

The full set of manifests (the AlertmanagerConfig, the PrometheusRules, and the Helm value changes) lives in my home-ops repo, and the rules are deliberately split one file per component so they're easy to adapt.
