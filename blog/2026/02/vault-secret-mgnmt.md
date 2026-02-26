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

If you're running GitOps with something like ArgoCD or Flux, everything lives in Git — your manifests, Helm charts, configs, all of it. But there's one thing you absolutely do not want sitting in a Git repo, no matter how private it is: secrets. API keys, database passwords, S3 credentials — none of that belongs in version control.

<!-- truncate -->

I ran into this pretty quickly with my homelab. I had secrets scattered across sealed secrets and manually applied Kubernetes secrets, and it was a mess. So I started looking at HashiCorp Vault as an external source of truth for secret values, with something to bridge the gap between Vault and my cluster. That bridge turned out to be the Vault Secrets Operator (VSO).

## The tension

The fundamental problem is straightforward. GitOps says the desired state of your infrastructure lives in Git. Security says never put secrets in Git. You need to satisfy both at the same time.

The pattern that solves this is actually pretty simple. Git stores a *reference* to the secret (safe to commit), Vault stores the actual secret values, and an operator running in your cluster reads the reference, fetches from Vault, and creates a native Kubernetes secret that your pods consume normally.

## Why VSO over External Secrets Operator?

There are a few options for bridging Vault and Kubernetes. The External Secrets Operator (ESO) is the most popular and is provider-agnostic — it works with AWS Secrets Manager, GCP, Azure, and Vault alike. There's also the Vault Agent Injector which uses sidecar containers to inject secrets into pods at runtime.

VSO is HashiCorp's own Kubernetes-native operator, purpose-built for Vault. If Vault is your only secrets backend (which it is for me), VSO offers a tighter integration with fewer moving parts. The killer feature is automatic pod rollout restarts when secrets change — something you'd need to bolt on a tool like Reloader to achieve with ESO. VSO also has first-class support for Vault's dynamic secrets, where Vault generates short-lived credentials on the fly rather than storing long-lived passwords.

## Setting up Vault

### Deploying Vault

For a homelab or learning environment, the Helm chart with dev mode is the quickest path:

```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault --set "server.dev.enabled=true"
```

Dev mode means no unsealing ceremony and no TLS — it just works. For production you'd want HA mode with auto-unseal, but dev mode removes friction while you're learning the workflow.

### Enabling a secrets engine

Vault organises secrets into engines. For static key-value secrets (which covers most application config), you want the KV engine, version 2. Version 2 gives you versioning, soft delete, and metadata at no extra complexity.

```bash
vault secrets enable -path=kv kv-v2
```

You can also do this through the Vault UI at `http://your-vault-address:8200/ui` — navigate to Secrets Engines, click "Enable new engine", and select KV. Choose version 2 when prompted.

### Creating secrets

You don't need to shell into the Vault pod to create secrets. The UI is perfectly fine for this, and honestly it's the most intuitive way when you're getting started.

Navigate into your KV engine, click "Create secret", and you'll see two fields. The **path** defines a hierarchical location — think of it like a folder structure. Something like `myapp/config` or `rustfs/vault-test`. Below that, you add key-value pairs for the actual secret data.

For example, an S3 configuration secret at path `rustfs/vault-test` might contain:

- `AWS_ACCESS_KEY_ID` → your access key
- `AWS_SECRET_ACCESS_KEY` → your secret key
- `S3_BUCKET` → your bucket name

Grouping related secrets under a single path is a good practice. It means one VSO resource can pull all of them into a single Kubernetes secret, and your deployments can mount them all at once with `envFrom`.

Beyond the UI, you can manage secrets via the Vault CLI from your local machine (just set `VAULT_ADDR` and `VAULT_TOKEN`), the REST API with curl, or Terraform if you want secret *structure* managed as code.

### A quick note on cubbyhole

You'll notice Vault has a special engine called cubbyhole. This isn't where you store application secrets — that's what KV is for. Cubbyhole is scoped entirely to a single Vault token. Only that exact token can read its cubbyhole, and when the token expires, the cubbyhole is destroyed.

Its main use case is secure secret introduction via response wrapping — a one-time-use delivery mechanism. Think of KV as the filing cabinet and cubbyhole as a self-destructing envelope.

## Configuring Vault authentication

Before VSO can fetch secrets, Vault needs to trust your Kubernetes cluster. The Kubernetes auth method lets pods authenticate using their service accounts:

```bash
vault auth enable kubernetes

vault write auth/kubernetes/config \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443"
```

Then create a role that binds a service account to a policy:

```bash
vault write auth/kubernetes/role/vso-role \
  bound_service_account_names=default \
  bound_service_account_namespaces=rustfs \
  policies=rustfs-read \
  ttl=1h
```

And a policy that grants read access to the relevant paths:

```bash
vault policy write rustfs-read - <<EOF
path "kv/data/rustfs/*" {
  capabilities = ["read"]
}
EOF
```

## Installing VSO

VSO installs into its own namespace and watches across the cluster for its custom resources:

```bash
helm install vault-secrets-operator hashicorp/vault-secrets-operator \
  -n vault-secrets-operator-system --create-namespace
```

## The GitOps manifests

This is where it all comes together. You need three custom resources, and they all go in your **workload namespace** — not the Vault namespace, not the VSO namespace. VSO watches across namespaces, just like how Flux runs in `flux-system` but manages resources everywhere.

### VaultConnection — where is Vault?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultConnection
metadata:
  name: vault-connection
  namespace: rustfs
spec:
  address: http://vault.vault.svc.cluster.local:8200
```

### VaultAuth — how do I authenticate?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultAuth
metadata:
  name: vault-auth
  namespace: rustfs
spec:
  method: kubernetes
  mount: kubernetes
  kubernetes:
    role: vso-role
    serviceAccount: default
  vaultConnectionRef: vault-connection
```

### VaultStaticSecret — what do I fetch and where do I put it?

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: rustfs-secrets
  namespace: rustfs
spec:
  vaultAuthRef: vault-auth
  mount: kv
  type: kv-v2
  path: rustfs/vault-test
  refreshAfter: 60s
  destination:
    name: rustfs-k8s-secret
    create: true
  rolloutRestartTargets:
    - kind: Deployment
      name: rustfs
```

The `rolloutRestartTargets` field is one of VSO's standout features. When the secret changes in Vault, VSO updates the Kubernetes secret and automatically triggers a rolling restart of the specified deployment. No need for Reloader or any additional tooling.

### Using the secret in your deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rustfs
  namespace: rustfs
spec:
  template:
    spec:
      containers:
        - name: rustfs
          envFrom:
            - secretRef:
                name: rustfs-k8s-secret
```

All of these manifests live in your Git repository and get synced to the cluster by Flux or ArgoCD. The actual secret values never touch Git.

## Reducing boilerplate

Three resources per application sounds like a lot, but in practice you share the connection and auth resources across apps in the same namespace.

For the `VaultConnection`, you can go one step further and use a `ClusterVaultConnection` — a cluster-scoped resource defined once and referenced from any namespace:

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: ClusterVaultConnection
metadata:
  name: vault-connection
spec:
  address: http://vault.vault.svc.cluster.local:8200
```

With that in place, the per-namespace overhead is just a `VaultAuth` (because auth should be scoped per namespace for least-privilege) and a `VaultStaticSecret` per secret. Adding a second app to the same namespace? That's just one more `VaultStaticSecret` file.

## How it all flows

Putting it all together:

1. You create or update a secret in the Vault UI (or CLI, or API, or Terraform)
2. Your Git repo contains the VaultConnection, VaultAuth, VaultStaticSecret, and Deployment manifests
3. Flux or ArgoCD syncs these manifests to the cluster
4. VSO picks up the VaultStaticSecret, authenticates to Vault, and fetches the real values
5. VSO creates a native Kubernetes secret in the workload namespace
6. Your pods consume it like any other Kubernetes secret
7. If the secret changes in Vault, VSO detects it on the next refresh cycle, updates the Kubernetes secret, and restarts your pods

The key insight is that Git remains the single source of truth for *what* secrets your application needs and *where* they come from, while Vault remains the single source of truth for the secret *values* themselves. Neither responsibility bleeds into the other.

Once you're comfortable with this pattern, there are natural next steps. Dynamic secrets let Vault generate short-lived database credentials on the fly. Vault's PKI engine can act as your own certificate authority. And transit encryption lets your applications encrypt and decrypt data through Vault's API without ever handling encryption keys directly. But for getting secrets out of your Git repo and into your cluster safely, VSO with static KV secrets is a solid foundation.
