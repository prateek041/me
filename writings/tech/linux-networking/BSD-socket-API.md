---
title: "Understanding BSD Sockets"
description: "Learn how the BSD Socket API powers network communication in Linux. This comprehensive guide covers socket types, address families, and essential system calls like bind, listen, and accept, helping you build robust and scalable applications."
date: November 16, 2024
---

In the process of understanding the entire **Egress** and **Ingress** path a network
packet follows in a Linux based machine, it is crucial to understand how the BSD
Sockets Interface works.

## Prerequisites

When we think about how computers communicate, it all boils down to process
exchaning information, which is known as **Inter Process Communication**.
Whether these processes are on the same machine or on different ones, they
need to follow a specific set of steps to successfully transfer data.

If the processes are on the same machine, they use local mechanisms like shared
memory or Unix domain Sockets. Examples include system services like Docker or
Systemd communicating internally. However when the processes are on different
machines- like when a web browser talks to a web server- the data has to travel
across networks, which is a different series of steps.

> Diagram for IPC here

In either case, all communication follows a specific route:

- **Ingress Path**: This is the path a packet takes as it enters a system from
the network.
- **Egress Path**: This is the path a packet takes when it leaves the system.

To manage this complexity, Linux provides various layers of abstraction,
starting from the BSD socket API- which serves as the interface for user
space applications- to the Network Interface Card (**NIC**), which handles
the actual transmission of data.

Understanding these layers is important, so let's start with the absolute basics,
Sockets.

### Sockets

Think of a socket as a virtual plug that allows data to flow between two
processes. It’s like a two-way pipe connecting applications, allowing them to
exchange information. These processes can either be on the same
machine or on different machines across a network.

Sockets act as communication endpoints. Each socket has a unique **address**
(such as an IP address) and a **port number**. This combination helps uniquely
identify the socket, ensuring that data reaches the correct destination.

Here’s a simple analogy: Imagine a phone call. Each person (process) has a
unique phone number (address), and the phone line (socket) connects them,
allowing conversation (data exchange) in both directions.

> Diagram here

Depending on how they operate, sockets can be:

- **Connection-oriented** (e.g., TCP): Establishes a reliable connection before
data is exchanged.
- **Connectionless** (e.g., UDP): Sends data without setting up a dedicated
connection, which have more data transfer speed but lack reliability.

Sockets provide an abstraction over the complexities of data transfer. They
provide a universal interface (API) for applications to talk to each other,
whether they are communicating locally or over the internet.

## BSD Socket API: A Unified Approach to Network Communication

When it comes to two processes communicating, it can happen via various means
i.e. Bluetooth, Internet, Local (processes running on the same machine) etc.

The way Bluetooth communication works is totally different from the internet
communication, but they overall do similar things. Things like **sending**,
**receiving** messages, **establishing connection** etc. This is where Interfaces
come very handy.

The **BSD Socket API** serves as a universal interface for network communication.
It abstracts the complexities of different protocols and provides a standard
and consistent way for applications to send and receive data, regardless of
the transport medium.

The actual implementation details of the interface
depend on the specific type of communication, which in turn depends on the
**Address Family**.

In the Linux world, implementation of these different communication types is
grouped into Address Families. Each address family related to a particular
protocol. For Example:

- **AF_INET**: Used for IPv4 internet communication.
- **AF_INET6**: Used for IPv6 internet communication.
- **AF_UNIX**: Used for local communicatoin between processes on the same
machine.

### Address Families

Address families define the type of addressing a socket can communicate
with. Each family has a different type of address representation and how the
socket communicates over the network.

Some common address families in the BSD socket API:

- **AF_INET**: IPv4 address family.
  - Example address: `192.168.1.1`.
- **AF_INET6**: IPv6 address family.
  - Example address: `fe80::1`.
- **AF_UNIX**: Used for processes on the same machine.

When creating a socket, you specify the address family along with the socket
type and protocol. This determines the socket’s behavior and the communication
rules for communication. For instance, an **AF_INET**  socket use **SOCK_STREAM**
for **TCP** and **SOCK_DGRAM** for UDP.

----

### Type of BSD Sockets

There are two types of BSD sockets, depending on the type of communication
between two processes.

- **SOCK_STREAM**: This is a type that is used to specify that the socket is
**TCP** type, hence reliable, connection-oriented communication will happen
through it. **HTTP** internally uses **TCP** therefore every time you create
a server using HTTP, remember that your server is talking to Kernel through a
**SOCK_STREAM** type of BSD socket.
- **SOCK_DGRAM**: Used with the UDP (User Datagram Protocol) for fast,
connectionless communication.

----

### How does it Work

The API operates by defining a **socket**- an endpoint for communication.
Through this interface, applications interact with the **Transport** and
**Network** layers of the Networking stack (OSI model).

The BSD Socket API looks something like this, along with an overview of
what each method is supposed to do, with an example in *C*:

- **socket()**: Creates a Socket
  - This method initializes a new socket, specifying the communication "Address
  Family" (AF_INET, for IPv4), socket type (eg SOCK_STREAM for TCP) and the
  protocol. It returns a socket descriptor, which is like a file (linux :D) handle
  that represents the socket in subsequent operations.
  - Example: `int sockfd = socket(AF_INET, SOCKET_STREAM, 0)`
- **bind()**: Bind the Socket to an Address (IP + Port) (Server Side)
  - bind() function associates with a specific IP address and Port number.
  Client makes connection request on this socket to establish connection.
  - Example: `bind(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr))`
- **listen()**: Listen for Incoming Connections (Server Side)
  The Listen() function takes a backlog parameter, which is the max number
  of pending connections allowed.
  - Example: `listen(sockfd, 5)`
- **accept()**: Accept a Client Connection(Server Side)
  - When a client attempts to connect, the server calls accept() to
  establish the connection. This call creates a new socket specifically for the client
  connection, allowing server to still listen on the original socket for other
  connections.
  - Example: `int client_sock = accept(sockfd, (struct sockaddr*) &server_addr,
  sizeof(server_addr))`
- **send()** and **recv()**: Data Transfer
  - After a connection with the client is established, both the client and the
  server can send and receive data using `send()` and `recv()`.
  Example: `send(sockfd, buffer, strlen(buffer), 0)` and `recv(socffd, buffer,
  sizeof(buffer), 0)`
- **close()**: Close the socket
  - when the communication is complete, the socket is closed using `close()`

When you create a socket using the BSD socket API, you specify the address
family to define the kind of protocol and addressing system that socket will
use.

Example:

```c
int sockfd = socket(AF_INET, SOCK_STREAM, 0)
```

- **`AF_INET`** specifies we're using IPv4 protocol family.
- **`SOCK_STREAM`** specifies that the socket is for a TCP connection.
- **`0`** Indicates the system should automatically select the default
protocol for the given combination of address family and socket type.

In the above example, we are creating a TCP socket for IPv4. Some of the
common combinations are as follows.

- `AF_INET` + `SOCK_STREAM`: Default protocol is TCP (Transmission Control
Protocol).
- `AF_INET` + `SOCK_DGRAM`: Default protocol is UDP (User Datagram
Protocol).
- `AF_UNIX` + `SOCK_STREAM`: Default protocol is a Unix domain stream
socket.

## Conclusion: Why Understanding BSD sockets is Crucial

Understanding the BSD socket interface is foundational for anyone working with
network applications and systems. Many user-space libraries/frameworks interact
directly with this API.

For Example: When you do `app.listen(:8080, callback)` on an express server, internally
it triggers the **listen()** system call.

This knowledge becomes essential in scenarios like:

- **Building scalable network services**, such as web servers or chat applications.
- **Optimizing data flow**, between processes for high-performance systems.
- **Understanding the complete packet lifecycle**, from user space to the **NIC**
and beyond, which is crucial for understanding how **XDP** and **eBPF** works.

Ultimately, mastering these concepts bridges the gap between theory and practice,
empowering you to design robust, efficient, and scalable networked applications and
understanding how to interact with the networking stack using **eBPF**. Whether
you're working on low-level optimizations or developing high-level APIs,
understanding this foundational layer ensures you have the tools to succeed.

Next we will be looking into the **Egress** and **Ingress** path implementation.
