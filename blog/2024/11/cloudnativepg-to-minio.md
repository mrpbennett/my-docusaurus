---
slug: backing-up-cloudnativepg-to-minio
title: Backing up CloudnativePG to Minio
authors: [me]
tags: [kubernetes, databases]
date: 2024-11-14T00:00
---

I have spent some time setting up my own instance of CloudnativePG inside my Kubernetes cluster. I have two instances a dev instance, and a "prod" instance. Normally I would use `pg_dump` to backup the databases, but I wanted to try something different.

<!-- truncate -->

Therefore I spun up my own instance of Minio and decided to use that as all backups, this includes CloudnativePG as well as applications such as Longhorn but this will be about setting up CloudnativePG.

## Setting up backup to Minio Gateway

MinIO Gateway as a common interface which relays backup objects to other cloud storage solutions, like S3. Specifically, the CloudNativePG cluster can directly point to a local [MinIO Gateway](https://cloudnative-pg.io/documentation/1.24/appendixes/object_stores/#minio-gateway) as an endpoint. If you read through the CNPG docs, you will be informed about creating a Minio service. For my setup, that isn't needed as I don't have Minio hosted in my Kubernetes cluster mine is hosted on a VM, which you can read about [here](https://www.mrpbennett.dev/posts/adding-minio-to-my-homelab)

First step is to create a secret manifest as MinIO secrets will be used by both the PostgreSQL cluster and the MinIO instance. Therefore, you must create them in the same namespace below is how I created my secret and deployed it within the same directory as my cluster manifests.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cnpg-prod-minio
  namespace: cnpg-prod
type: Opaque
data:
  MINIO_ACCESS_KEY: <access-key>
  MINIO_SECRET_KEY: <secret-key>
```

Once you have your secret manifest created it is now time to add your backup config to your `Cluster` manifest. Below is how I have laid mine out.

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: cnpg-prod
  namespace: cnpg-prod
spec:
  description: "Homelab Prod Cluster"
  ...

  backup:
    retentionPolicy: "10d"
    barmanObjectStore:
      destinationPath: s3://cnpg-backups/
      endpointURL: http://192.168.6.69:9000
      s3Credentials:
        accessKeyId:
          name: cnpg-prod-minio
          key: MINIO_ACCESS_KEY
        secretAccessKey:
          name: cnpg-prod-minio
          key: MINIO_SECRET_KEY

  ...
```

Once that has been added it's time to either set up a scheduled backup in a separate manifest like I have below:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: weekly-backup
spec:
  schedule: "@weekly"
  backupOwnerReference: self
  cluster:
    name: cnpg-prod
```

Or set up a on-demand backup as stated in the [docs](https://cloudnative-pg.io/documentation/1.24/backup/). Once the backup manifest has been created, the operator will create a backup to your Minio instance.

Now I have backups of my databases in object storage, instead of the drive that hosts the database.
