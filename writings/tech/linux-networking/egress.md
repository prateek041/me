---
title: "Egress Path of an Internet Packet"
description: "When you create your HTTP server, what happens internally inside
the kernel"
date: November 19, 2024
---

## Egress Path

The path that network packets follow as they leave the system.

> Network Packet handlers within the kernel like queuing disciplines, XDP etc
> can modify packets in the egress path before they leave the Network Interface.

Some of the questions this article will answer:

- What happens in the kernel when you send or receive information from the
  Internet? (Egress and Ingress Path of a Packet).
- What path does it follow?
- What data structures are used by the Kernel?
- How is the **OSI/TCP-IP Model** implemented in the kernel?
- How does a Web Server work? (In the end as an Example)

The application running in the user space is a process, when it needs to
send or receive anything from the Internet, it happens through the
Kernel only. So what happens when you create a HTTP, Node JS server using
**Express** package.

## Packets journey from User Space to NIC

- User-space socket operation (Application Layer)
  - Web server in User space sends data using the `send()` or `write()`. // is this system call?
  - the call is initiated with three things, which socket to send data to.
    What is the size of the data and the data itself.
  - The data exists in the user space and hasn't entered the kernel space,
    where the networking stack will handle it.
- Transition to kernel Space (System Call Interface)
  - The application layer's `send()` or `recv()` triggers a system call,
    switching the process from user space to kernel space.
  - This involves saving application's context, executing kernel code to handle
    the socket system call.
  - Data is copied from user space buffer to kernel space buffer.
- TCP/UDP processing
  - Segmentation, adding TCP headers, sequence number and checksum. New
    connection establishment (if applicable).
  - UDP just adds the necessary headers and send the data.
- Network Layer
  - IP headers, time to live and protocol type information.

### User space vs Kernel Space buffers

#### User Space

When the server application wants to send data (e.g., "Hello, World!"), it
typically holds this data in a user-space buffer (a memory region managed by the
application).

#### Kernel Space

To move that data to network, the kernel must be able to access it, but this
can't be done directly for security and stability reasons.

Kernel buffer is also in RAM just like User Space buffer, but it is isolated
from user-space applications. When `send()` and `recv()` system calls are made,
the data is copied from user-space buffer to kernel-space buffer. Now the
networking stack can work with the data.

## Why is HTTP using sockets?

Sockets are foundational to networking and process communication in operating
systems.

### Why

Sockets are **abstractions for network communication**. // there is more here.

- HTTP is an application layer protocol, built on top of TCP.
- Sockets provide an interface to TCP, allowing HTTP to benefit from
  reliable data transfer, sequencing and error correction.

> [!IMPORTANT] When you make an HTTP request, it opens a TCP socket
> connection, allowing client and server to communicate by sending and
> receiving data over the socket.

### Are sockets optional?

No they are not. Any network based application like web-servers, mail clients etc.
Needs to use sockets. Sockets are the standard API provided by the kernel for
applications to communicate with each other.

The process in makes a
