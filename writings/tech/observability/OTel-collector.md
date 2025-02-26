---
title: "OTel Collector"
description: "Open Telemetry collector is the biggest"
date: February 25, 2025
---

OTel Collector is the core of [OTel Framework](/writings/tech/observability/observability-101)
It is a binary, that can be configured using a `YAML` file. It is community maintained,
supports a lot of configurations and plugins.

## Why we need a Collector

When it comes to telemetry data processing, it's better to think of it as **pipelines**.
There can be different stages in the pipeline, performing different tasks, but there
are four major steps.

- **Data Emission**: making sure the system emits all the telemetry data we care
  about.
- **Data collection**: collecting data emitted by the **system**.
- **Data processing**: modifying collected data to suit our needs.
- **Data export**: exporting it to a tool like [signoz](https://signoz.io), that
  can help us make sense of all the data.

OTel separates our concerns. **Data Emission** is handled through **instrumentation**,
for which it provides [code](https://opentelemetry.io/docs/languages/) and
[zero code](https://opentelemetry.io/docs/zero-code/) methods. And the remaining
steps i.e. **collection**, **processing** and **export** are handled
by the **OTel Collector**.

## How the Open Telemetry Collector works

Collector runs telemetry data processing pipelines, as defined by a `config.yaml`
file. The `config` file consists of two major sections:

- **Configuration section**: For defining individual components of the pipeline.
  Things like:
  - different places collector can **receive** data from.
  - different ways the collector can **process** the received data.
  - different places the collector can send (**export**) processed data.
- **Service section**: For defining pipelines, to define which of
  the _configured_ components are enabled and in what order
  do they run.

An example collector config would looks like this:

```yaml
# Configuration section
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
processors:
  batch:

exporters:
  otlp:
    endpoint: otelcol:4317

extensions:
  health_check:
  pprof:
  zpages:

# Service section.
service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

### Presets

If you are new to OTel, the above configuration might feel confusing and complex.
In fact, the overall process of setting up the collector for different infrastructure
and environments (like Kubernetes) is comparatively harder.

OTel provides presets to simplify collector configuration by offering pre-configured
settings for commonly used environments. All you have to do is enable a preset, all
the configuration settings will be **injected** into the configuration file on runtime.

These presets reduce the complexity of setting up telemetry collection by bundling
receivers, processors, and exporters with sensible defaults (which can be configured
and extended). Here is an example of some presets provided for [monitoring Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#presets).

### Configuration Section

Configuration section usually contains 4 components:

- Receivers
- Processors
- Exporters
- Connectors

There is an entire list of a variety for each component, present in two repositories,
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main)
and
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main).

Let's understand each individual component.

#### Receivers

A receiver is how data gets into the OTel collector. Below is an example receiver
configuration.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
```

This setup allows the collector to receive telemetry data in `otlp` format
from applications, agents, or SDKs that support OpenTelemetry and are emitting
data. The collector receives the data over **gRPC** (port 4317) or
**HTTP** (port 4318).

To know more about how `otlp receiver` works checkout the [official docs](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md).
The [Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
repository contains a long list of receivers, which you can configure on the basis
of your requirements.

#### Processors

Processors take the data collected by the **receivers** and modify/transform it before
sending it to the **exporters**. Some of the most common actions performed here includes,
but not limited to:

- Filtering
- Dropping
- Renaming
- Recalculating

A sample processor would look like this:

```yaml
k8sattributes:
  extract:
    labels:
      - tag_name: service.name
        key: app.kubernetes.io/component
        from: pod
```

The above processor is used to interact with **kubernetes attributes**, it's current
configuration takes the value of a Pod label, with key `app.kubernetes.io/component`
and puts it as an attribute in each _signal_ with the tag name of `service.name`.

It is actually extending the default configurations provided by the [k8sAttributes
processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/k8sattributesprocessor/README.md#extracting-attributes-from-pod-labels-and-annotations)
component. It also comes with a [preset](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset),
that is being extended using the following [configuration](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/k8sattributesprocessor/README.md#extracting-attributes-from-pod-labels-and-annotations).

#### Exporters

Exporters send data to one or more **Back-ends**. An exporter used to send data to
SigNoz would look like this.

```yaml
otlp:
  endpoint: ingest.{region}.signoz.cloud:443
  headers:
    signoz-access-token: <signoz access token>
```

> Signoz provides pre-configured file for this, which can be found [here](https://signoz.io/docs/tutorial/kubernetes-infra-metrics/#install-k8s-infra-chart)

### Service section

As mentioned earlier, the `service` section is used to configure what
above configured components are enabled and in what order will they run in a pipeline.
The components need to be properly defined and configured in the
`receiver`, `processors`, `extensions` and `exporters` before being used in the
service section.

Service section consists of 3 sub-sections:

- **Extensions** : List of enabled [extensions](https://opentelemetry.io/docs/zero-code/java/agent/extensions/).
- **Pipelines**: Configuration for data processing pipeline for each type
  of signal (traces, metrics and logs).
- **Telemetry**: To setup observability for the Collector itself.

#### **Pipelines**

A sample pipeline configuration in the service section would look like:

```yaml
service:
  pipelines:
    logs:
      receivers: [otlp, filelog/k8s]
      processors: [batch]
      exporters: [otlp]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

The above configuration defines two telemetry data pipelines,

- **logs**: logs are received from `otlp` and `filelog/k8s` (used
  to process logs generated by Kuberenetes) components. **Batch** processor
  is used to groups logs into batches before exporting them using **OTLP**.
- **traces**: traces are received from `otlp`, `batch` processed and
  exported through `otlp`.

### Conclusion

Through this article you get a mental model of how the configuration of OTel collector
works, how different components work, what components are provided by the
community and how to incorporate it in your observability solutions.

In the next article we will go deeper, talk about how to install the OTel collector
on a kubernetes cluster, process the telemetry data and make sense of it using a
backend tool.
