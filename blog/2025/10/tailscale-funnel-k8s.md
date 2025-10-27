---
slug: exposing-with-tailscale-funnel-k8s
title: Exposing Kubernetes Services with Tailscale Funnel
authors: [me]
tags: [kubernetes]
date: 2025-10-27T16:19
---

I have been learning Go lately and wanted to try and expose a microservice using a Tailscale Funnel. I had a project inmind to build a small Go application that would build and deploy a Docker image to a private registry using a webhook. Therefore, I needed to figure out how to expose the application using Tailscale Funnel.

<!-- truncate -->

## The application

Although this is not the project in mind, this is the package I created to test. A simple HTTP server that prints "Hello, World!" when accessed.

```go
// main.go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	log.Println("Starting server on port 8080")
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})
	http.ListenAndServe(":8080", nil)
}
```

Along with the following Docker image. Simply build it using the following Dockerfile then push it to a private registry.

```Dockerfile
# Use the official Go image as the base image
FROM golang:1.25.2-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY main.go ./

# Build the application
RUN go build -o webserver main.go

# Use a minimal alpine image for the final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests (if needed)
RUN apk --no-cache add ca-certificates

# Set working directory
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/webserver .

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./webserver"]
```
## Setting up Tailscale in Kubernetes

Since I have a single [k3s](https://k3s.io/) node cluster running on a Raspberry Pi 5 currently (I will be overhauling my homelab very soon...keep your eyes on my blog for updates). I would have to run the [Kubernetes Tailscale Operator](https://tailscale.com/kb/1236/kubernetes-operator) to manage the Funnel. I won't go into too much detail here but you can find the [prerequisites](https://tailscale.com/kb/1236/kubernetes-operator#prerequisites) here. After you have set that up it's time to deploy the operator with helm.

```bash showLineNumbers
helm repo add tailscale https://pkgs.tailscale.com/helmcharts

helm repo update

helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId="<OAauth client ID>" \
  --set-string oauth.clientSecret="<OAuth client secret>" \
  --wait
```
For the funnel feature to work you will need to add a [node attribute](https://tailscale.com/kb/1223/funnel#requirements-and-limitations) to allow nodes created by the Kubernetes operator to use Funnel:

```jsonc
"nodeAttrs": [
  {
    "target": ["tag:k8s"], // tag that Tailscale Operator uses to tag proxies; defaults to 'tag:k8s'
    "attr":   ["funnel"],
  },
]
```
:::note
Note that even if your policy has the funnel attribute assigned to `autogroup:member` (the default), you still need to add it to the tag used by proxies because `autogroup:member` does not include tagged devices.

Once the Operator is deployed and you have your policy set up configured, it's time to deploy the application.

## Deploying the Application

As this is a simple application, the manifests are pretty straight forward. Here's an example of how you can deploy it:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: websvrgo
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: websvrgo-deployment
  namespace: websvrgo
spec:
  selector:
    matchLabels:
      app: websvrgo
  template:
    metadata:
      labels:
        app: websvrgo
    spec:
      containers:
      - name: websvrgo
        image: 192.168.7.2:5000/websvrgo:0.0.2
        resources:
          requests:
            memory: "32Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: websvrgo-service
  namespace: websvrgo
  annotations:
   metallb.io/loadBalancerIPs: 192.168.7.60
spec:
  type: LoadBalancer
  selector:
    app: websvrgo
  ports:
  - port: 8080
    targetPort: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: funnel
  namespace: websvrgo
  annotations:
    tailscale.com/funnel: "true"
spec:
  ingressClassName: tailscale
  tls:
    - hosts:
        - websvrgo
  rules:
    - host: websvrgo
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: websvrgo-service
                port:
                  number: 8080
```
The important manifest here is the ingress where we're exposing the host `websvrgo` to the internet. The two things to note is that we're using the `annotation` of `tailscale.com/funnel: "true"` and the `IngressClassName` of `tailscale`. This unsures we're exposing the ingress service with the tailnet.

This would deploy our application to the internet on the following:

```txt
https://websvrgo.<tailnet>.ts.net
```

So when I get round to things, I can set something similar to this up and have a webhook send `POST` requests to the url exposed by my tailnet.
