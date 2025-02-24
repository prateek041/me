---
title: "Observability 101"
description: "A brief introduction to Observability"
date: February 24, 2025
---

This article is all you need to understand the importance of observability,
why we need it, it's history, current standards (Open Telemetry) and a brief
overview of how it all fits together. This is for people who are starting
their journey into **Observability**.

## What is Observability

To fully understand **observability** and it's importance, let's try to
understand things step by step, starting from understanding "system".

**System** is a collective term, given to the combination of everything
you have to manage and handle while running your applications. It
includes the infrastructure, networking, business logic, Production/
Dev/QA environment etc. This is where you applications run, and your
customers access them.

**Observable** refers to a system's ability to expose its internal state in a way
that allows engineers to understand and troubleshoot it effectively. A system
is observable when all the crucial information about it's working, which
includes the following, but not limited to:

- Memory Usage.
- Error Rates.
- CPU Consumption.
- Active Users.
- Request Latency.
- Application logs.
- A user request's route inside the system.

are exposed, collected, processed and made sense of.

---

In the context of **Observability**, this crucial information is called **Telemetry
Data**.

While a system being observable means that it exposes _Telemetry Data_,
**Observability** is the _broader_ practice of **collecting**, **analyzing**, and
**using** this data to gain deep insights into system behavior.

### Where the Telemetry data comes from

The telemetry data comes from the applications and the infrastructure running our
systems. Your application must be properly **Instrumented**, i.e. there should
be written logic, that makes sure telemetry data is properly **collected**,
**structured** and **exported** from the system.

Observability goes beyond just monitoring predefined telemetry data. It enables
engineers to ask any question about the system’s state. Even those they did not
anticipate when designing it. This flexibility is especially critical in complex,
distributed architectures like **microservices** and **cloud-native** applications,
where unexpected issues arise frequently.

### Brief history of Observability

Initially there were no **Global Standards** for instrumenting systems to process
telemetry data. As systems grew in complexity, different teams and organisations
implemented their own observability solutions. Focusing on different telemetry data
depending on their in-house needs. This lead to:

- **Inconsistencies**: Different teams used different strategies, formats, tools,
  making it hard to **correlate telemetry data**.
- **Fragmentation** : Different type of telemetry data lived in separate silos, requiring
  multiple tools to get a full picture of the system.
- **Lack of Knowledge transfer** : Since there was no standardization, one organisation's
  works could not be directly carried over to the other, leading to **re-inventing
  the wheel** again and again.

---

## Open Telemetry

To solve these issues, the industry moved towards a standardized approach, leading
to the creation of [OpenTelemetry (OTel)](https://opentelemetry.io/docs/what-is-opentelemetry/).
OpenTelemetry provides a common framework
for generating, collecting, and exporting telemetry data.

It standardized three major sections in a **vendor neutral** way:

1. **API, SDK and Data**:

- Defining what the data would look like (structure of telemetry data, what
  properties they would have etc. making sure they are serializable. **Data**),
- How they can be correlated (how to connect one type of data with other i.e. **API**).
- How different languages implement the above standard specifications (**SDK**).

They divided the telemetry data in three major sections and collectively called
them **Signals**:

- **Metrics**: Quantitative measurements like CPU usage, request latency, and error
  rates.
- **Traces**: End-to-end tracking of a request as it flows through multiple services.
- **Logs**: Timestamped records of system events, errors, and debugging information.

2. **Instrumentation**: Provided two standard ways to instrument a system:

- [Zero-code](https://opentelemetry.io/docs/zero-code/): The libraries you use to
  build your application have instrumentation logic in them.
- **Code-based**: OTel provides [APIs and SDKs](https://opentelemetry.io/docs/languages/)
  for most languages,
  which can be used to instrument your code, this can be used to
  cover any use-case that might not be implemented by the Zero-code way.

3. [Collector](https://opentelemetry.io/docs/collector/): A single, standard,
   vendor-agnostic place (binary) to **receive**, **process** and **export** the
   telemetry data. This collector is _configurable_ and can fit all of your
   system's needs.

Using the above standards, the telemetry data can be collected in a standard way,
so any tool, that uses OTel standards, can use that data to draw
insights, **This is where [SigNoz](https://signoz.io) shines**.

## Collector

> Collector is not a requirement with OTel, the telemetry signals can directly be
> sent to a **backend**, [read this to know more](https://opentelemetry.io/docs/collector/deployment/no-collector/).

It is the most crucial part of the OTel framework. It is a binary, that is configurable
using a `YAML` file, through which we can modify every aspect of a **telemetry data
pipeline** i.e. from collecting the data, processing it and all the way to exporting
it to a backend of your choice (signoz, prometheus, etc.).

It provides a lot of features out of the box, which includes but not limited to:

- **Configurable**: Combinations of different ways to collect, process and export
  signals.
- **Performant**: Stability and Performance under varying loads and configurations
  (community has optimised the implementation).
- **Extensible**: Customizable without touching the business logic code.
- **Unified**: A single piece of code (collector binary), deployable in different
  **platforms** (Kubernetes, Virtual Machines etc.) and **patterns** (Agent, Deployment
  etc.)

In the next article, we will try to understand the working of the **Open Telemetry
Collector**. That will help us better understand observability and how to make
our own systems observable.

Next -> **Otel Collector** (to be continued)
