---
title: "Dapr"
description: ""
date: "October 19, 2024"
---

## [:link:Dapr](https://github.com/dapr/dapr)

Dapr is an event-driven, distributed runtime that makes it easy for developers
to develop applications that are resilient, stateless/stateful (without being an
expert in distributed systems) that can run on cloud as well as edge.

Dapr follows the sidecar pattern and provides APIs that implemented keeping best
practices in mind for building micro-services in form of **Building Blocks**

Microservice building for cloud and edge are shown below (and growing :))

![Image of Building Blocks of Dapr](https://docs.dapr.io/images/building_blocks.png)

## My work

## TLDR

I wrote metrics for [Dapr Workflow Building Block :arrow_upper_right:](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/).

- [:link:**Issue link**](https://github.com/dapr/dapr/issues/7109)
- [:link:**Pull Request**](https://github.com/dapr/dapr/pull/7152)

## The Issue

I worked on implementing metrics for the
[Dapr Workflow Building Block](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-overview/)
.This helped Dapr users to track the overall traffic and health of their applications
(workflows).

To fully understand the issue I worked on, check this [Issue link](https://github.com/dapr/dapr/issues/7109).

I am very proud of this contribution since I got to be one of the enablers for
making **Dapr** more stable.

## The Solution

For the solution, I wrote custom metrics using [Open Census](https://opencensus.io/).
To be precise, I implemented the following metrics:

- **Workflow Operations count** : records total number of successful/failed workflow
operations requests.
- **Workflow Operation Latency**: records the latency for the workflow operations
requests.
- **Workflow execution count**: records total number of Successful/Failed/
Recoverable workflow executions.
- **Activity Execution count**: records total number of Successful/Failed/
Recoverable workflow execution.
- **Activity Execution Latency**: records latency for Successful/Failed/
Recoverable workflow execution.

To deliver a complete solution, I also wrote tests for the implementation that
had 92% coverage in the initial implementation.

## Things I learnt about

Here is the Link to the [**Pull Request**](https://github.com/dapr/dapr/pull/7152)

### Actor Model

The [:link:Dapr](https://github.com/dapr/dapr) project has the
[:link:Actor Model](https://en.wikipedia.org/wiki/Actor_model)
at it's core. I got to learn the implementation of the Actor pattern, how it works
and how to implement it. I came across amazing resources from senior engineers at
**Microsoft** that explained the conceptual knowledge perfectly. One of them is this
[YouTube Video](https://www.youtube.com/watch?v=7erJ1DV_Tlo&t=2s)

### Workflow Engine

This is the internal implementation that manages the overall execution of a **Dapr
workflow** analysing the events, status updates and even emitting metrics.

It also performs the task of scheduling the execution and re-scheduling in case of
the event of a failure.

The in-depth explanation of the workflow engine will be in a different section.

I leant in depth how to work with **concurrency** in **Go**. I learnt how to work
with **time**, **sync**, **Marshalling/Un-Marshalling** data and **Durable tasks**
etc.
