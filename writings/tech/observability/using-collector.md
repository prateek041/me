---
title: "Working with OTel Collector"
description: ""
date: February 27, 2025
---

## Installing the Collector

The OTel Collector can be deployed on a variety of Operating Systems and architectures.
One of the official ways consist of, but not limited to:

- Docker
- Docker Compose
- Kubernetes

Since our use-case is **Kubernetes** related, so let's try to understand how to deploy
the Otel Collector in a kubernetes environment.

## Kubernetes Installation

> [Installation Docs](https://opentelemetry.io/docs/platforms/kubernetes/getting-started/)

OTel provides **Helm** charts, that are configurable for your use-case and are
**production ready** method of deploying OTel collector on Kubernetes.

To collect all of the telemetry data exposed by Kubernetes, we need two installations
of the collector:

> `Daemonsets` are Kubernetes resources just like `pods`, `deployments`
> etc. They are used to make sure an instance of your code is running on each node.
> This helps in deploying things like OTel collector, so it can be present on each
> node of a multi-node Kubernetes cluster.

- **Daemonset (Agent)** : used to collect the telemetry data emitted by each pod,
  container etc. on each node.
- **Deployment** : used to collect metrics for the cluster and **events**.
