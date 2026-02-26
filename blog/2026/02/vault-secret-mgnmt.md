---
slug: kubernetes-secrets-vault-vso
title: Managing Kubernetes Secrets the GitOps Way with Vault and VSO
tags: [kubernetes]
keywords:
  - kubernetes
  - vault
  - secrets
  - gitops
  - homelab
last_updated:
  date: 2026-02-26
---

GitOps is great right up until you need to store a secret. Everything else lives in Git — manifests, Helm charts, ArgoCD app definitions — but the moment you need a database password or an S3 key, you've got a problem. You absolutely cannot put credentials in a repository, no matter how private it is.

<!--truncate-->

That's the constraint. And solving it properly took me longer than I'd like to admit.

The answer is [HashiCorp Vault](https://www.vaultproject.io/). Vault holds the actual secret values while your Git repo holds only a _reference_ to them. The bridge between the two is the Vault Secrets Operator (VSO) — it reads those references from your cluster, fetches the real values from Vault, and creates native Kubernetes secrets that your pods consume without knowing anything has changed.

## The Secret Zero Problem

The tension here is simple: GitOps says the desired state of your infrastructure lives in Git. Security says never put secrets in Git. You need something that satisfies both at once.

The pattern is: Git stores a reference to the secret (safe to commit), Vault stores the actual values, and an operator running in your cluster bridges the gap. Your pods just see a normal Kubernetes secret and don't care where it came from.

## Why VSO?

There are other tools that solve this problem. The External Secrets Operator (ESO) is the most popular — it's provider-agnostic and works with AWS Secrets Manager, GCP, Azure, and Vault alike. The Vault Agent Injector uses sidecar containers to push secrets into pods at runtime.

I went with VSO because Vault is my only secrets backend, and VSO is HashiCorp's own Kubernetes-native operator purpose-built for it. Fewer moving parts, and it has one feature I really wanted: automatic pod rollout restarts when a secret changes. With ESO you'd need to bolt on a separate tool like Reloader to get that. With VSO it's built in.

VSO also has first-class support for Vault's dynamic secrets, where Vault generates short-lived credentials on the fly rather than storing long-lived passwords — but that's a rabbit hole for another post.

## Setting Up Vault

### Deploying Vault

For a homelab or learning environment, the Helm chart with dev mode gets you going quickly:

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault --set "server.dev.enabled=true"
```

Dev mode means no unsealing ceremony and no TLS — it just works. You'd want HA mode with auto-unseal for production, but dev mode removes all the friction while you're learning the setup.

### Enabling a Secrets Engine

Vault organises secrets into engines. For static key-value secrets — which covers most application config — you want the **KV** engine. When you first open the Vault UI and navigate to Secrets Engines, you'll see a list that includes KV, Kubernetes, LDAP, PKI Certificates, and more. Pick **KV**. The Kubernetes engine is something else entirely; it generates Kubernetes service account tokens dynamically, which is a more advanced use case.

Choose **Version 2** when enabling KV — you get versioning, soft delete, and metadata at no extra complexity.

Or via the CLI:

```bash
vault secrets enable -path=kv kv-v2
```

### Creating Secrets in the Vault UI

You don't need to shell into the Vault pod to create secrets. The UI is perfectly fine for this, and it's the most intuitive way when you're getting started.

Navigate into your KV engine and click "Create secret." You'll fill in two things:

**Path** — a hierarchical location for your secret, like a folder structure. Something like `rustfs/vault-test` or `homelab/grafana`. This is the path your VSO resources will reference later.

**Secret data** — key-value pairs below the path. For example, an S3 configuration secret might look like:

| Key                     | Value            |
| ----------------------- | ---------------- |
| `AWS_ACCESS_KEY_ID`     | your access key  |
| `AWS_SECRET_ACCESS_KEY` | your secret key  |
| `S3_BUCKET`             | your bucket name |

Grouping related secrets under a single path is good practice — one VSO resource can pull them all into a single Kubernetes secret, and your deployments can mount everything at once with `envFrom`.

Beyond the UI, you can also manage secrets via the Vault CLI (set `VAULT_ADDR` and `VAULT_TOKEN`), the REST API, or Terraform for a fully declarative approach — more on that at the end.

### A Quick Note on Cubbyhole

Vault has a special engine called cubbyhole. This is _not_ where you store application secrets — that's what KV is for. Cubbyhole is scoped entirely to a single Vault token. Only that exact token can read its own cubbyhole, not even root can peek in, and when the token expires the cubbyhole is gone with it.

Its main use case is secure secret introduction via response wrapping. An admin wraps a secret with a short TTL, hands the wrapping token to an application, and the application can unwrap it exactly once. If anyone intercepts and unwraps it first, the legitimate attempt fails — so you know it's been compromised. Think of KV as the filing cabinet and cubbyhole as a self-destructing envelope.

## Configuring Vault Authentication

Before VSO can fetch anything, Vault needs to trust your Kubernetes cluster. This is the step that's easy to overlook and will result in `403 permission denied` errors if it's missing.

### Enabling Kubernetes Auth

Check if it's already enabled:

```bash
vault auth list
```

If you only see `token/` in the list, Kubernetes auth isn't enabled. You can enable it through the UI under **Access → Auth Methods → Enable new method → Kubernetes**, or via the CLI:

```bash
vault auth enable kubernetes
```

### Configuring the Auth Method

Once enabled, Vault needs to know how to talk to the Kubernetes API. In the UI, go to **Access → Authentication Methods → kubernetes → Configure** and set the **Kubernetes host** to:

```
https://kubernetes.default.svc.cluster.local:443
```

You can leave the CA certificate and Token Reviewer JWT fields blank if Vault is running as a pod in your cluster — it'll pick up the CA cert and service account JWT automatically from its own pod mount.

Via the CLI (port-forward if needed):

```bash
kubectl port-forward svc/vault -n vault 8200:8200

export VAULT_ADDR="http://127.0.0.1:8200"
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc.cluster.local:443"
```

### Creating Policies

Policies control what secrets a role can access. Create one per application or group of secrets. In the UI, go to **Policies → Create ACL policy**:

- **Name:** `rustfs-read`
- **Policy:**

```hcl
path "kv/data/rustfs/*" {
  capabilities = ["read"]
}
```

Don't be tempted to use the `default` policy for this. The `default` policy is attached to every token in Vault, so adding secret paths to it means every token in your cluster can access those secrets — the opposite of least-privilege.

### Creating Roles

Roles bind Kubernetes service accounts to Vault policies. In the UI, go to **Access → kubernetes → Create role**:

- **Name:** `vso-role`
- **Bound service account names:** `default`
- **Bound service account namespaces:** each namespace where you'll use VSO (e.g. `cnpg`, `rustfs`, `default`)
- **Token policies:** `rustfs-read`
- **Token TTL:** `3600`

This tells Vault: "when a pod using the `default` service account in the `cnpg` namespace presents a JWT, give it a token with the `rustfs-read` policy."

## Installing VSO

VSO installs into its own namespace and watches across the cluster for its custom resources:

```bash
helm install vault-secrets-operator hashicorp/vault-secrets-operator \
  -n vault-secrets-operator-system --create-namespace
```

Verify the CRDs it installed:

```bash
kubectl get crds | grep vault
```

As of VSO 1.3.0 you'll see `vaultconnections`, `vaultauths`, `vaultstaticsecrets`, and `vaultdynamicsecrets`. Note that `ClusterVaultConnection` isn't available in this version — you'll use namespace-scoped resources instead. A small amount of repetition across namespaces, but it keeps things explicit and easy to reason about.

## The GitOps Manifests

This is where it all comes together. You need three custom resources, and they all go in your **workload namespace** — not the Vault namespace, not the VSO namespace. VSO watches across namespaces just like how Flux runs in `flux-system` but manages resources everywhere.

### VaultConnection — Where is Vault?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultConnection
metadata:
  name: vault-connection
  namespace: cnpg
spec:
  address: http://vault.vault.svc.cluster.local:8200
```

### VaultAuth — How do I authenticate?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultAuth
metadata:
  name: vault-auth
  namespace: cnpg
spec:
  method: kubernetes
  mount: kubernetes
  kubernetes:
    role: vso-role
    serviceAccount: default
  vaultConnectionRef: vault-connection
```

### VaultStaticSecret — What do I fetch and where do I put it?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: rustfs-cloudnativepg
  namespace: cnpg
spec:
  vaultAuthRef: vault-auth
  mount: kv
  type: kv-v2
  path: rustfs/cloudnativepg
  refreshAfter: 60s
  destination:
    name: rustfs-cloudnativepg
    create: true
  rolloutRestartTargets:
    - kind: Deployment
      name: my-app
```

A few things worth calling out here:

**`mount: kv`** must match the path where you mounted the KV engine in Vault. If you see `kv/` in the Vault UI breadcrumb, use `kv` here.

**`destination.name`** is the name of the Kubernetes secret VSO will create — this is what your deployments reference. It doesn't need to match the Vault path; name it whatever makes sense for your workloads.

**`destination.create: true`** tells VSO it's allowed to create the secret if it doesn't already exist.

### Understanding rolloutRestartTargets

This is one of VSO's standout features. When you update a secret in Vault, VSO will detect the change and update the Kubernetes secret — but your running pods still have the old values loaded in memory. Without something to restart them, they'll keep using stale credentials until the next deploy.

`rolloutRestartTargets` solves this by telling VSO to automatically trigger a rolling restart of the specified workloads whenever the secret changes. Update your `AWS_SECRET_ACCESS_KEY` in the Vault UI, and within 60 seconds (based on `refreshAfter`) VSO picks up the change, updates the Kubernetes secret, and rolls new pods with the fresh values. No manual intervention, no Reloader, nothing extra needed.

You can target multiple workloads if the same secret is shared across them:

```yaml
rolloutRestartTargets:
  - kind: Deployment
    name: rustfs
  - kind: Deployment
    name: another-app
  - kind: StatefulSet
    name: some-database
```

It's optional — leave it out and VSO will still keep the Kubernetes secret in sync; you'd just need to restart pods yourself to pick up changes.

## Real-World Example: CloudNativePG Backups

Here's how this fits together in practice. CloudNativePG needs S3 credentials for WAL archiving and backups. The CNPG cluster spec expects a secret with specific key names:

```yaml
backup:
  retentionPolicy: "1d"
  barmanObjectStore:
    destinationPath: s3://cloudnativepg-dev-backup
    endpointURL: http://rustfs-svc.rustfs.svc.cluster.local:9000
    s3Credentials:
      accessKeyId:
        name: rustfs-cloudnativepg
        key: access_key
      secretAccessKey:
        name: rustfs-cloudnativepg
        key: access_secret_key
```

The things that need to match are the secret **name** (`rustfs-cloudnativepg`) and the **key names** (`access_key`, `access_secret_key`). So in Vault, create a secret at path `rustfs/cloudnativepg` with exactly those key names. Then the `VaultStaticSecret` with `destination.name: rustfs-cloudnativepg` creates the Kubernetes secret that CNPG can consume directly — no changes needed on the CNPG side.

## Reducing Boilerplate

Three resource types per namespace sounds like a lot, but in practice you share the `VaultConnection` and `VaultAuth` across all apps within the same namespace. You only need one `VaultStaticSecret` per secret path.

```
cnpg namespace:
  ├── VaultConnection  (one per namespace)
  ├── VaultAuth        (one per namespace)
  ├── VaultStaticSecret - rustfs-cloudnativepg
  ├── VaultStaticSecret - another-secret
  └── VaultStaticSecret - yet-another-secret
```

Each `VaultStaticSecret` references the same `vaultAuthRef: vault-auth`. Adding a new secret to an existing namespace is just one more file.

For a brand new namespace, you need the `VaultConnection` and `VaultAuth` too — two extra files. And don't forget to add the namespace to your Vault role's `bound_service_account_namespaces`.

## Common Pitfalls

Working through this setup for the first time, a few things caught me out.

### "permission denied" on login (403)

This almost always means Kubernetes auth isn't configured properly — or isn't enabled at all. Run `vault auth list` and check if `kubernetes/` appears. If it doesn't, enable it. If it does, verify the Kubernetes host is set correctly in the auth config.

One important debugging tip: **check the VSO controller logs directly**, not just the resource status. The `describe` output on a `VaultStaticSecret` often shows a generic `permission denied` on the secret read, which points you at the wrong thing. The actual VSO logs will tell you the real failure — for instance, `namespace not authorized` on the _login_ step, which is a completely different issue than a missing read policy. To get them:

```bash
kubectl logs -n vault-secrets-operator-system \
  deployment/vault-secrets-operator-controller-manager
```

### "invalid role name" (400)

You've enabled Kubernetes auth but haven't created the role yet. The auth method exists, but Vault doesn't know what `vso-role` is. Create the role via the UI (Access → kubernetes → Create role) or CLI.

### "VaultAuth not found"

The `VaultAuth` and `VaultConnection` resources must be in the **same namespace** as your `VaultStaticSecret`. They don't go in the Vault namespace or the VSO operator namespace.

### Can't reach Vault from the CLI

If `vault login` fails with a network error, you're probably trying to hit Vault over an external URL that isn't routable from your machine. Use port-forwarding:

```bash
kubectl port-forward svc/vault -n vault 8200:8200
export VAULT_ADDR="http://127.0.0.1:8200"
vault login
```

### Wildcard namespace binding silently fails

If your Vault role has `bound_service_account_namespaces` set to `"*"` (with quotes), no namespace will ever match. This can happen when configuring the role through the Vault UI — it stores a literal quoted string rather than the wildcard. Every VSO login attempt will return `namespace not authorized` even though the auth method and policy are correct.

Via the CLI:

```bash
vault read auth/kubernetes/role/vso-role
```

Check the `bound_service_account_namespaces` field. If you see `"*"` rather than `*`, update the role. This is exactly the kind of subtle drift that Terraform catches automatically — it would flag the difference in `terraform plan` before you ever apply.

### VSO caches auth failures aggressively

If you fix a Vault-side misconfiguration (wrong policy name, bad namespace binding, missing secret path) but the `VaultStaticSecret` still won't sync, the VSO controller may be caching the earlier failure and has stopped retrying. Restarting it clears the state:

```bash
kubectl rollout restart deployment -n vault-secrets-operator-system \
  vault-secrets-operator-controller-manager
```

### ClusterVaultConnection not found

If you try to use a `ClusterVaultConnection` and get a CRD not found error, your version of VSO doesn't support it. As of VSO 1.3.0, this CRD isn't available. Use namespace-scoped `VaultConnection` resources instead.

## Managing Vault Configuration with Terraform

Once you've been through the manual setup and understand how the pieces fit together, the natural next step is managing Vault's configuration declaratively with Terraform. Auth methods, policies, roles, and secret paths all become version-controlled — which is exactly where you want them in a GitOps setup.

The manual setup taught me an important lesson the hard way: the Vault UI introduces subtle bugs that are nearly impossible to spot. Setting `bound_service_account_namespaces` to `*` in the UI stored it as the literal string `"*"` — which means no namespace ever matches. Every VSO login failed with `namespace not authorized`, and the only way I found the issue was digging through the operator logs and then running `vault read auth/kubernetes/role/vso-role` to inspect the raw values. `terraform plan` would have flagged this immediately.

After that incident I moved the entire Vault configuration to Terraform. If you already have a manual setup, you can import it rather than recreating from scratch:

```bash
terraform import vault_mount.kv kv
terraform import vault_auth_backend.kubernetes kubernetes
terraform import vault_policy.rustfs_read rustfs-read
terraform import vault_kubernetes_auth_backend_role.vso_role auth/kubernetes/role/vso-role
terraform import vault_kubernetes_auth_backend_config.config auth/kubernetes/config
```

Then `terraform plan` will surface any drift between your actual Vault config and the desired state — wrong policy names, quoted wildcards, missing secrets — before it becomes a runtime problem.

### Provider Setup

```hcl
terraform {
  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.0"
    }
  }
}

provider "vault" {
  address = "http://127.0.0.1:8200"
  # Token supplied via VAULT_TOKEN env var
}
```

### Secrets Engine

```hcl
resource "vault_mount" "kv" {
  path        = "kv"
  type        = "kv"
  options     = { version = "2" }
  description = "KV v2 secrets engine"
}
```

### Kubernetes Auth

```hcl
resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}

resource "vault_kubernetes_auth_backend_config" "config" {
  backend         = vault_auth_backend.kubernetes.path
  kubernetes_host = "https://kubernetes.default.svc.cluster.local:443"
}
```

### Policies

```hcl
resource "vault_policy" "rustfs_read" {
  name   = "rustfs-read"
  policy = <<EOT
path "kv/data/rustfs/*" {
  capabilities = ["read"]
}
EOT
}
```

### Roles

```hcl
resource "vault_kubernetes_auth_backend_role" "vso_role" {
  backend                          = vault_auth_backend.kubernetes.path
  role_name                        = "vso-role"
  bound_service_account_names      = ["default"]
  bound_service_account_namespaces = ["cnpg", "rustfs", "default"]
  token_ttl                        = 3600
  token_policies                   = ["rustfs-read"]
}
```

### Secrets

```hcl
resource "vault_kv_secret_v2" "rustfs_cloudnativepg" {
  mount = vault_mount.kv.path
  name  = "rustfs/cloudnativepg"

  data_json = jsonencode({
    access_key        = var.cnpg_access_key
    access_secret_key = var.cnpg_secret_access_key
  })
}

variable "cnpg_access_key" {
  type      = string
  sensitive = true
}

variable "cnpg_secret_access_key" {
  type      = string
  sensitive = true
}
```

The actual values get supplied via environment variables or a `terraform.tfvars` file that stays out of Git:

```bash
export TF_VAR_cnpg_access_key="your-access-key"
export TF_VAR_cnpg_secret_access_key="your-secret-key"
export VAULT_TOKEN="your-root-token"

terraform apply
```

The entire Vault configuration — auth methods, policies, roles, secret paths — is now declarative and version-controlled. The only things not in Git are the actual secret values and the Vault token. As your homelab grows, adding a new application's secrets is just a few more Terraform resources.

## The End-to-End Flow

Putting it all together:

1. Create or update a secret in the Vault UI (or CLI, API, or Terraform)
2. Your Git repo contains the VaultConnection, VaultAuth, VaultStaticSecret, and Deployment manifests
3. Flux or ArgoCD syncs these manifests to the cluster
4. VSO picks up the VaultStaticSecret, authenticates to Vault via the Kubernetes auth method, and fetches the real values
5. VSO creates a native Kubernetes secret in the workload namespace
6. Your pods consume it like any other Kubernetes secret
7. If the secret changes in Vault, VSO detects it on the next refresh cycle, updates the Kubernetes secret, and restarts your pods if you've configured `rolloutRestartTargets`

Git remains the single source of truth for _what_ secrets your application needs and _where_ they come from. Vault remains the single source of truth for the secret _values_. Neither bleeds into the other.

## What's Next

Once this pattern is comfortable, there are natural next steps. Dynamic secrets let Vault generate short-lived database credentials on the fly using `VaultDynamicSecret` resources — no more long-lived passwords. Vault's PKI engine can act as your own certificate authority. Transit encryption lets your applications encrypt and decrypt data through Vault's API without ever handling encryption keys directly.

For getting secrets out of your Git repo and into your cluster safely though, VSO with static KV secrets is a solid foundation that scales well as your homelab grows.
