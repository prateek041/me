---
title: "How HTTP server works at kernel level"
description: "When you create your HTTP server, what happens internally inside the kernel"
date: 11 October, 2024
---

Questions:

- You mentioned that eBPF can be used for egress processing, we can manipulate,
filter or redirect the packets data right before it's sent, where on the Egress
path does this step work?
  - Socket Layer what is this.
  - Network device layer, what is this.
- Explain the process of traffic control (Queuing and Scheduling) a little better.

The problem statement is, we want two applications (client and Server) to talk to
each other, the applications are running on different machines and they need to
communicate through the Internet.

If we think on the Operating System level, it is just Inter Process communication
(IPC) for it, and certain steps need to be followed to make it happen. If the
communicating processes are present on the same machine, they follow different *steps*
to communicate, similarly, if they are on different machines, they follow some other
steps.

## BSD Socket Interface

In the Linux Kernel, these are called **Domains**. IPC on same machine is part of
**Unix** domain and for different machines, it's part of **TCP/IP**.

Now, for each domain, the series of steps to be followed are different, but the
overall work that we want to do is similar. If there are two processes, let's say A
and B. We want to support the following operations.

- Process B should know a way to tell process A that it wants to communicate.
- Process A should be able to accept the connection requests from B, so the exchange
of information of information can begin.
- Process A should still be able to listen to other processes trying to communicate
with it.
- There should be a way to **send** or **receive** information between both processes.
- And finally, there should be a way for both of the processes to close the
connection.

So, if we think of these operations as functions, they will have following use-cases
and names.

- Process A gets a unique **address**, on which it is listening for any incoming
connections. Let's have a function named **Address()** creates this unique address,
and **Listen()** that enables the listening on that address.
- When Process B tries to make a connection with A, A should have a way of **accepting**
the request. This should create a new unique address specifically for process A and
B to communicate, so that A can keep listening on it's previous address for other
processes. Let the function be **Accept()**
- For sending and receiving messages we have **Send()** and **Recv()**.
- Finally, to close the connection we have **Close()**.

If I write this in terms of Go code, this can be done through a Go interface. Let's
call it **Communication** Interface. Why interface you ask? So that we don't have
to think about the implementation right now. Depending on our use-case, we can change
the implementation of each of these methods.

```Go
type Communication interface {
  Address() string // Creates a unique string address
  Listen(addr string) boolean // Starts listening on the address
  Accept() string // Creates a new address and returns it
  Send() // Sends the message.
  Recv() // Receives the message.
}
```

This is exactly what happens at the Kernel level. There is an interface called
**BSD socket Interface**  that is a collection of methods that need to be
implemented for network Communication between any two processes (Devices).

### Sockets

They are like a virtual Plug that allow data to flow in and out. They allow
data flow between two processes, either running on the same computer or
different.

Imagine them as **Pipes**  that connect two processes, from with information
flows in both directions.

These kind of applications are called **Network Applications** because they rely
on the internet to make the communication possible, and to understand how this
works, understanding the concept of **sockets** is extremely important.

## Sockets

When you establish a server, using something like `app.listen()`, it internally
calls the `socket()` system call

HTTP is an application layer protocol, that follows the principle of request/response
cycles. This is usually the protocol that Developers use to implement web based
products. But, internally, at the Kernel level, HTTP leverages **TCP/IP** for all
it's features like Reliable Delivery, Segmentation etc.

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
**Express**  package.

## Basic Concepts in BSD Sockets

BSD socket interface is a collection of methods that need to be implemented
for Network communication between any two devices that want to talk to each
other.

This is an Interface that has a collection of common methods, including

- socket(): Create a Socket
  - This function initializes a new socket, specifying the communication domain
  (IF_INET, for IPv4), socket type (eg SOCK_STREAM for TCP) and the protocol.
  It returns a socket descriptor, which is like a file handle and represents
  the socket in subsequent operations.
  - Example: `int sockfd = socket(AF_INET, SOCKET_STREAM, 0)` // check what 0 is this for.
- bind(): Bind the Socket to an Address (Server Side)
  - bind() function associates with a specific IP address and Port number.
  Client makes connection request on this socket to establish connection.
  - Example: `bind(sockfd, (struct sockaddr*)&server_addr` // understand what this line is doing.
- listen(): Listen for Incoming Connections (Server Side)
  - Once bound, a server socket can listen for incoming client connections.
  The Listen() function takes a backlog parameter, which is the max number
  of pending connections allowed. // check out what is the meaning of pending connections.
  - Example: `listen(sockfd, 5)`
- accept(): Accept a Client Connection(Server Side)
  - When a client attempts to connect, the server calls accept() to
  establish the connection. This call creates a new socket specifically for the client
  connection, allowing server to still listen on the original socket for other
  connections.
  - Example: `int client_sock = accept(sockfd, (struct sockaddr*) &server_addr, sizeof(server_addr))`
- send() and recv(): Data Transfer
  - After a connection with the client is established, both the client and the server can send
  and receive data using `send()` and `recv()`.
  Example: `send(sockfd, buffer, strlen(buffer), 0)` and `recv(socffd, buffer, sizeof(buffer), 0)`
- close(): Close the socket
  - when the communication is complete, the socket is closed using `close()`

There are multiple types of Sockets:

- **Stream Sockets (SOCK_STREAM)**
- **Datagram Sockets (SOCK_DGRAM)**

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
