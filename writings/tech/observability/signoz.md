---
title: "OTel Collector"
description: ""
date: February 24, 2025
---

## Understanding SigNoz

**SigNoz** leverages the OTel collector to collect, process and export the system telemetry data.

Then the exported data is processed by SigNoz to render a beautiful UI and huge amount of
features, as listed in the [official docs](https://signoz.io/docs/introduction/#features-of-signoz).

When working with Kubernetes, OTel and SigNoz, Helm charts are used. There are two
important charts to understand when working with **SigNoz**.

- **[SigNoz chart](https://github.com/SigNoz/charts/tree/main/charts/signoz)** : Helm chart to deploy essential SigNoz components:

  - Query service (queries users data)
  - Frontend (the dashboard users see)
  - Collector (processes users data)
  - Alertmanager (sends alerts)
  - Clickhouse (stores users data)
  - Other essential parts

- **[k8s-infra](https://github.com/SigNoz/charts/tree/main/charts/k8s-infra)**: Helm chart to deploy [Otel collector](#collector) as an **Agent** and a **Deployment**
  as mentioned above.

The **k8s-infra** sets up Otel collector with default configurations which can be found
[here](https://github.com/SigNoz/charts/tree/main/charts/k8s-infra).

This is all the information needed to solve the problem defined above.
