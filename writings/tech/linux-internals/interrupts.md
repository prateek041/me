---
title: "Interrupts"
description: "Everything you need to know about writing kprobes"
date: September 24, 2024
---

Hardware connected to the machine are order of magnitude slower than the CPU.
So it is impractical for the CPU to make a hardware access request and then
wait indefinitely until the request is completed. Therefore, a more asynchronous
approach is necessary.

Polling is a failed approach because it adds overhead to the overall working
and performance of the system. The other way is to enable hardware devices
to notify the CPU that it needs some attention.

## Interrupt

An interrupt is physically produced by electronic signals originating from the
hardware devices and directed into input pins on an **interrupt controller**.
