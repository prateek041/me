---
title: "Path of an Internet Packet in the Linux Kernel: Part 1"
description: We will understand the transition of a message from the
  user space to the kernel space, specifically the Transport layer. The
  data structures involved in it along with the steps followed.
date: November 19, 2024
---

In order to modify, filter or monitor network packets using **eBPF**, we need
to understand how does a packet travel inside the kernel, how it reaches
from the user space application to the **NIC** and on the wire. We also
need to understand what data strucutres are involved and how they make
the implementation of Networking Stack in Linux so efficient.

In this article, we will understand the transition of a message from the user
space to the kernel space, specifically the Transport layer. The data structures
involved in it along with the steps followed.

## Summary of Linux Networking stack

In the previous articles we covered
[OSI Model](/writings/tech/linux-networking/OSI-model)
which gave us a general overview of how the internet works in a standard way. Then
we went onto understanding the Kernel layer that connects User space and Kernel Space,
i.e. [BSD Socket API](/writings/tech/linux-networking/BSD-socket-API).
Below is a brief summary of how it all works together.

                     +--------------------------+
                     |  User Space Application  |
                     +--------------------------+
                                   |
                  Passes/Receives Data via BSD Socket
                                   |
                     +---------------------------+
                     |  Transport Layer (TCP/UDP)|
                     +---------------------------+
                                   |
                            Routes to/from
                                   |
                     +---------------------------+
                     |     Network Layer (IP)    |
                     +---------------------------+
                                   |
        +------------ Applies Firewall Rules (Netfilter) ---------+
        |                         OR                              |
        +---------------- eBPF Hook for Filtering ----------------+
                                   |
                     +----------------------------+
                     | Data Link Layer (NIC RX/TX)|
                     +----------------------------+
                                   |
              +--------- eBPF Hook for XDP ---------+
              |                                     |
        Hardware Transmission                Packet Processing
                                   |
                     +--------------------------+
                     | Network Interface Card   |
                     |  (NIC with RX/TX Buffers)|
                     +--------------------------+
                                   |
                     +--------------------------+
                     |      Physical Layer      |
                     +--------------------------+

In the figure above, a BSD socket either passes a packet to the user space application,
or receives a packet from the _network-specific implementation_(TCP/UDP) and pass
it down the network stack till it reaches the wire.

Prominently **eBPF** works in almost all of these layers in different ways.
One of the most prominent is **XDP(Express Data Path)** which provides ultra
fast packet processing before the packet reaches the network stack. **XDP**
operates in the Kernel, at the driver level of the **NIC** which is slightly
above **Physical layer** and below the **Data Link Layer**.

## Socket Buffers

`sk_buff` is the C data structures that stores every Network packet in memory. They
are highly efficient due to the implementation using pointers.

We are not going too deep into what each property or field does, maybe later on
in some deep dive articles.

![Linux Networking Stack](https://i.imgur.com/P06x5XM.png)

The major takeaways from the diagram above is that, two different `sk_buff` structures
point to the same packet buffer, representing different layer packets. `sk_buff 1`
represents a **Datagram (Data Link Layer Packet)** since `data` is pointing to
the Ethernet headers. Which means **IP** layer headers are being processed.

Similarly, `sk_buff 2` represents the same packet as a **Segment (TCP layer
packet)** since **data** is pointing to the **TCP** headers.

This is how `sk_buff` makes network packet processing efficient, as the
processing completes and the packet moves to the lower layers, kernel
only modifies what these pointers point to.

## Packet Flow

Before we start going deep into this, we need to understand that the implementation
of the kernel is fairly complex to make it more modular, shared and independent.

### Egress Path

#### User space to Kernel Space

BSD socket interface is the User space API that acts as the bridge between user
and kernel space. A more brief and in-depth explanation is in the [previous article](/writings/tech/linux-networking/BSD-socket-API).

This is done through multiple data structures, some of the most prominent ones
being:

- **struct socket**
- **struct sock**

##### **Struct Socket**

The BSD API is protocol agnostic, it doesn't care if it's a TCP or a UDP connection,
it is Kernel's role to use the right implementation of the API.

The BSD socket is represented in the Kernel space through `struct socket`, that looks
like

```c
/**
 *  struct socket - general BSD socket
 *  @state: socket state (%SS_CONNECTED, etc)
 *  @type: socket type (%SOCK_STREAM, etc)
 *  @flags: socket flags (%SOCK_NOSPACE, etc)
 *  @ops: protocol specific socket operations
 *  @file: File back pointer for gc
 *  @sk: internal networking protocol agnostic socket representation
 *  @wq: wait queue for several uses
 */
struct socket {
      socket_state            state;

      short                   type;

      unsigned long           flags;

      struct socket_wq __rcu  *wq;

      struct file             *file;
      struct sock             *sk;
      const struct proto_ops  *ops;
};
```

Two very important fields above are:

- **ops**: A pointer to a table of protocol-specific implementations for
  methods defined by the BSD interface.(e.g., TCP's `sendmsg`, `recvmsg`).
- **sk** : The actual (kernel representation) INET socket associated with the connection.
  This holds the actual state and logic for managing the connection.

When the User space application sends the message to kernel via the BSD socket API,
it is processed via the methods pointed by the `proto_ops` field. This field is populated
during the Socket creation.

The process looks like this:

- **User Space**: the user application calls `socket()` to create a socket, specifying
  the domain (e.g., `AF_INET`), type (e.g., `SOCK_STREAM`), and protocol (e.g. `TCP`).

- **Kernel Space**: Based on the information provided
  - Kernel allocates a `struct socket`.
  - Fills the `proto_ops` pointer in `struct socket` to point to the appropriate
    implementation (e.g. `tcp_proto_ops` for TCP).
  - creates the associated `struct sock` to manage the actual transport level
    connection.

##### **Struct Sock**

This is the kernel's internal representation of the actual socket for a specific
protocol. `struct socket` is generic, but `struct sock` is protocol specific and
implements the transport layer specific logic (e.g., TCP state management,
retransmission etc.).

This socket is the one directly interacting with protocol implementation (`tcp.c`,
`udp.c` etc.) and Kernel networking mechanisms (e.g., `sk_buff`).

It looks like this

```c
struct sock {
      //...
      unsigned int            sk_padding : 1,
                              sk_no_check_tx : 1,
                              sk_no_check_rx : 1,
                              sk_userlocks : 4,
                              sk_protocol  : 8,
                              sk_type      : 16;
      //...
      struct socket           *sk_socket;
      //...
      struct sk_buff          *sk_send_head;
      //...
      void                    (*sk_state_change)(struct sock *sk);
      void                    (*sk_data_ready)(struct sock *sk);
      void                    (*sk_write_space)(struct sock *sk);
      void                    (*sk_error_report)(struct sock *sk);
      int                     (*sk_backlog_rcv)(struct sock *sk,
                                                struct sk_buff *skb);
      void                    (*sk_destruct)(struct sock *sk);
};
```

As you can see, it has more fields as compared to the generic `struct socket`. A
few of the fields do the following.

- `sk_protocol`: is the type of protocol used by the socket.
- `sk_type`: is the socket type (SOCK_STREAM, SOCK_DGRAM, etc.).
- `sk_socket`: back reference to the generic `socket struct` that holds it.
- `sk_send_head`: is the list of `struct sk_buff` which is the actual network
  packets for transmission.
- `sk_receive_queue`: Queue for incoming packets.
- `sk_write_queue`: Queue for outgoing packets.

Now the question you might be asking, why are there two separate structs?
i.e., `struct socket` and `struct sock`.

| Aspect                  | `struct socket`                             | `struct sock`                           |
| ----------------------- | ------------------------------------------- | --------------------------------------- |
| **Layer**               | User-space abstraction                      | Kernel-space implementation             |
| **Role**                | High-level socket interface for user-space  | Low-level protocol-specific operations  |
| **Scope**               | Application-facing                          | protocol-facing                         |
| **Connection**          | Has pointer to the associated `struct sock` | Has a back-reference to `struct socket` |
| **Protocol Dependency** | Protocol-agnostic                           | Protoco-specific (e.g., TCP, UDP, etc.) |

`struct sock` is protocol specific. It will look different for different protocols.
It contains all the extra properties needed to implement that specific domain.

Let's take an example:

- **User Space**: the user space application calls `send()` or `recv()` on the socket.
- **Kernel Space**:
  - The system call is routed to `proto_ops` table in the associated `struct socket`.
  - `send()` calls the `sendmsg` function in `proto_ops`, which points to `tcp_sendmsg`
    for TCP and `udp_sendmsg` for UDP.
  - Inside `tcp_sendmsg`, the kernel uses the `struct sock` for the connection to:
    - Access protocol specific state (e.g., sequence numbers, congestion windows
      etc.).
    - Manage TCP-specific logic like retransmission and acknowledgement.

Above, we moved from User space (`send()`), to Kernel space, specifically the BSD
socket layer (`sendmsg()`), to finally the Transport layer (`tcp_sendmsg()`) implementation.
These transitions are comparatively complex. It involves understanding
Linux's _Everything is a file system_ philosophy which we will talk separately about.

In the next article, we will talk about the packet going from Transport Layer to
the Network Layer and beyong.

This article is based on the [**The Path of a Packet Through Linux Kernel**](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_16.pdf)
which gives an overview of the path a network packet follows when it goes to/from
wire.
