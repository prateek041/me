---
title: "OSI Model"
description: "Understanding the What, Why and How of different layers of the OSI model."
date: November 11, 2024
---

## What is OSI Model

OSI stands of **Open Systems Interconnection**, is a conceptual model that helps
people understand how different systems can communicate with each other.
It introduces various concepts like _multiple layers_, _separation of
concerns_ etc. so that it is easier to understand how a device, which is
connected to the internet is sending and receiving information.

The actual implementation of the networking stack follows something like
the **TCP/IP** model which is a subset of the **OSI** model. So you can
say that once you understand how this model works, you understand
how any two computers in the world talk to each other.

It consists of the following layers:

- Application Layer (Layer 7)
- Presentation Layer (Layer 6)
- Session Layer (Layer 5)
- Transport Layer (Layer 4)
- Network Layer (Layer 3)
- Data Link Layer (Layer 2)
- Physical Layer (Layer 1)

---

## Why OSI model

Standardization, it provides a universal language for network communication,
ensuing devices from different manufacturers can work together seamlessly.
By following the same conceptual framework, developers can design hardware and
software that are compatible across a diverse system.

Next up, let's try to understand why so many layers?

### Why multiple layers

Computer networks are hard to implement, there are many overlapping concepts
and the entire implementation could have been done in comparatively lesser layers,
but having separate layer helps us with:

#### Complexity Management

As mentioned earlier, Networking is inherently complex,
even in the [previous article](https://www.prateeksingh.tech/writings/tech/linux-networking/new-internet-from-scratch)
of this series where we talked about building a new internet from
scratch, we came across various processes, including but not limited to:

- Assigning different types of addresses (logical/physical).
- Putting messages in an envelop.
- Encoding messages in bits.

Dividing the entire process into layers simplifies the development and
management of network systems by focusing on one thing at a time.

Example: Think of building a car. The engine, transmissions, breaks etc.
They are all complex systems, but by focusing on each system individually,
the engineers can ensure they work perfectly when combined.

#### Specialization and Abstraction

Each layer has a well defined purpose, things like error checking, data formatting,
routing etc. This Specialization allows network engineers and developers to
specialize in specific functions, without needing to understand every details
of the system.

Example: Application developers don't need to know how many layers your message
is getting enclosed in, how is it being converted to bits etc. They focus on Layer
5 to 7, ensuring a smooth user experience, while network engineers handle data
transfer, routing and hardware connections (below layers).

> Not sure if the article is up yet, but I will write how Networking stack is
> implemented in the Linux based Systems. It should be present [here](https://prateeksigh.tech/writings/tech/linx-networking/ingress-and-egress-path)

#### Interoperability

The layered approach makes sure that devices and software from different sellers
can work together, it standardizes the implementation. It is due to this, your
iPhone can send messages to your PC and Mac as well.

#### Troubleshooting

If something breaks, it gets easier to find out the problem by breaking the system
into smaller pieces. If there is error in converting data into bits, it is due to
a specific layer. If error is in transmitting data, a specific layer is responsible
for it.

There are many more use-cases and benefits in following a layered approach, we
will appreciate them more with time.

---

## How it works

Before we get into how each layer works and what is it's **responsibility**, there
are some key terms in the **networking** world, we should understand.

### Key terms in Networking

#### Host (or end device)

These are the devices which are either sending or receiving data. This can be
your Phone, laptop or the Server of Google serving your web search request.

#### Packets

When we send a message from one device to another over the internet, additional
information gets attached to the message itself. This information enables the
flow of data over the internet. The entire thing, Data + Network specific
information together is called a packet.

Also, as you will see later on, each layer in the OSI model attaches a specific
kind of information, that only the devices of that layer process.

#### Non Host (or in-between devices)

These are the devices that neither generate or read data, they are just
responsible for enabling the flow of packets. They read the destination
(specific to their layer) and forward the entire packet in the right
direction. Just like the **Routers** and **Switches** in our
[previous article](https://www.prateeksingh.tech/writings/tech/linux-networking/new-internet-from-scratch)

#### Bits of information

The moment data being sent or received leaves a host or in-between devices, it
is converted into contiguous stream of bytes, that are transferred in different
formats, depending on the medium. So if the two devices are physically connected
through an Ethernet cable, the bits are transferred in the form of electric pulses.
Similarly if the two devices are communicating through WiFi, the bits are
transferred through radio waves.

#### Network

- LAN
- WAN

#### NIC (Network interface Card)

These are the devices that connect a Host/Non-Host device to the internet,
They are responsible for taking the information from the device, convert them
into bits, and send them to the next device. They are the interface between the Devices
and the Physical medium itself.

These **NICs** have their unique address to be recognised, these addresses are set
in by the manufacturer.

### What each layer does

We will start from the top to bottom, imagine you are sending a message to your friend
through the "WhatsApp" web app.

Since this is purely a Networking focused article, we will not be going deep in the
working of the upper layers.

#### Application Layer (Layer 7)

This is the interface you directly interact with. The section of the app where you
manage contacts, compose messages and send them.

##### **What happens here**

- Message Composition: You type your message into the WhatsApp app.
- Protocol: Application layer protocol like HTTP or WebSocket is used
  at this level to communicate with the WhatsApp servers.
- Data encoding: Once you press **Send**, WhatsApp formats the message into a
  data format suitable for transmission at this layer. This is typically JSON.

One common misconception people might have at this moment is that the app is
interacting with the WhatsApp servers directly at this layer. It is actually
just **preparing** your message, by attaching necessary information and converting
it into the right format, so that when it reaches the server, or your friend's
computer, his WhatsApp application is able to process it.

This gives the illusion that Application Layer (or any of the seven layers) on the
sender's computer is talking directly with the Application Layer (or any of the
seven layers) of the receiver's computer.

#### Presentation Layer (Layer 6)

The **Presentation layer** is where the data is formatted for transmission and, in
case of WhatsApp, **encrypted** to ensure privacy. The upper layers (Layer 7 to
Layer 5) are more inclined towards application developers therefore there is some
flexibility of which each layer does.

##### What happens here

- **Encryption**: You must have seen the _end-to-end encrypted_ box over every
  chat you have on WhatsApp. This is because the message is encrypted before it
  leaves the computer. This ensures that no-one other than the receiver can see
  the messages.
- **Compression**: If you are sending images or videos it will get compressed here.

Send the data to the Session layer.

#### Session Layer (Layer 5)

Here we yet again have a Application developer's related use-case.
**Managing sessions**. All you need to know is that makes sure that your
computer, WhatsApp server and your friend's computer can keep talking.

Every time two computers connect, there are several steps that need to be
followed to make it possible. In the modern days, these can be enclosed in
PKI (Public Key Infrastructure). To know more about it, check out this
[Article](https://www.prateeksingh.tech/writings/tech/kubernetes-the-hard-way/pki-what-how-and-why/pki-what-how-and-why).

#### Transport Layer (Layer 4)

This layer is all about breaking down your messages into smaller parts called
**Segments** and deciding **How reliable we want the data transmission to be**.

In simpler words, when you send a message to your friend over the internet,
do you want to make sure it reaches them? Internet is a massive body, consisting
of thousands and thousand of **Routers**, **Switches** etc. It happens that the
data packet might get lost and not delivered. But, your friend always receives
all the messages you send him on WhatsApp.

This happens because this layer is responsible of keeping track of how
many of these **segments** are delivered and if any of them failed to be
delivered, it will resend them. This is done through acknowledgement system.

But you might be thinking, "Every communication should be reliable right?",
actually No. On the same WhatsApp App, you do video calls as well, and you
must noticed that when the internet connection is not strong enough, the video
quality gets degraded.

This is because the video is being transmitted over the internet, and it might
happen that some of those segments get lost or delayed. Still the video call
keeps going. In this case you don't have to have "Every piece" of information,
as long as it is "good enough", it doesn't bother you.

So there are two types of transmissions, **Reliable** and **No Reliable**.

- **Reliable**: For reliable transmission, Layer 4 uses **TCP** (Transmission
  Control Protocol). This ensured reliable transmission of data between the Hosts.
- **Unreliable**: For this, Layer 4 uses **UDP**(User Datagram Protocol).

You can read more about how they work internally on the internet.

Also, **TCP/UDP** headers are attached to your messages on this layer, which we are
not going to talk about in this article. Just in case you are familiar with Port
numbers, these port numbers are attached to your message here. So the message
itself contains the information about which app this message is being sent
to. You wouldn't want your WhatsApp messages to appear on Slack right?

To summarise, this layer does **Segmentation**, **Reliable/Unreliable** message
delivery and telling which app on the receiver's end should the message be
forwarded to.

> Segmentation is the process of breaking down a bigger message into smaller
> parts and assigning them sequence numbers. So that when the
> segments are received on the receiver's side, they can be re-assembled in the right
> order.

#### Network Layer (Layer 3)

The **Network Layer** is responsible for determining the best path for the data
to travel from the source to the destination. It deals with routing the data
packets across multiple devices (routers) and networks to get to the destination
device.

**IP (Internet Protocol)** is used here to route the data across the internet based
on the IP addresses.

##### **What happens here**

**Packetization**: At this layer, the transport layer segments are further
encapsulated into packets. Each packet contains:

**Source IP Address**: Your device's public IP address (or the address of the
WhatsApp server, if applicable).
**Destination IP Address**: The recipient’s device or server's public IP address.
Routing:

The packets are passed from one router to the next, each router deciding the
best path based on its routing table.

For instance, if the WhatsApp server is far away geographically, the packets
might traverse multiple routers and networks before reaching it.

As you can see, this layer deals with IP addresses, and that is also Source and
destination IP, it only cares about **end-to-end** deliver. At this layer
it appears that the message you sent reached the receiver directly, but in
case, it went through the entire web of routers between you and your friend.

#### Data Link Layer (Layer 2)

The **Data Link Layer** is responsible for the physical transmission of data
over the link (whether wired or wireless). It ensures that data is transferred
correctly and handles error checking at a lower level. It deals with frames, which
are the packets with added control information for transmission.

The process here is called **Hop to Hop** delivery, since here the MAC Addresses
of the immediate neighbor are attached to the data. So it can directly go from
one device to the other through the Physical medium (Ethernet/Wi-Fi) connecting
the two.

##### **What happens here**

**Frame Creation**: The packets from the Network Layer are encapsulated into frames
by the Data Link Layer. This process is done by NIC present in each devices.

Each frame contains:

- **Source MAC Address**: The Media Access Control (MAC) address of your device’s
  network interface card (NIC).
- **Destination MAC Address**: The MAC address of the next hop (router or device).
- **Frame Check Sequence (FCS)**: An error detection mechanism (like CRC) to ensure
  data integrity at the link layer.
- **Error Detection**: The Data Link Layer performs error detection to ensure the
  integrity of the data at the hardware level. If an error is detected in the frame,
  it is discarded, and the packet is sent again by the Transport Layer.

So, when your message goes from your computer to WhatsApp servers, the **Source
MAC address** is yours and the **Destination MAC address** is WhatsApp Server's.
This is one **Hop**. The Layer 2 headers will change in the next Hop i.e.
From WhatsApp Server to Your friend's computer.

#### Physical Layer (Layer 1)

This is the layer where your information is present in the form of pulses of electricity,
or radio waves etc. depending on what medium is being used. In case of Ethernet cables,
we have pulses of electricity, in Wi-Fi we have radio waves. We have many other mediums
in the modern day, including Fiber optics and so on.

Don't be confused by the name "Physical" here, because the medium of transport
doesn't specifically have to be Physical. The OSI model was created in the olden
days, and the devices working on this layer at that time were using Physical mediums
to transfer data. But this not the case anymore, Wifi is readily available, and does
the same thing. i.e. Transferring the bits of information in form of signals.

The frames coming from the **Data Link Layer** are converted into **Raw binary**
format and then into medium specific signals by the NIC.

## Key Takeaways

- **OSI Model Simplifies Networking**: By breaking down complex networking tasks
  into seven layers, the OSI model makes it easier to design, implement, and
  troubleshoot network systems.

- **Layered Approach Enables Modularity**: Each layer focuses on a specific function
  like data routing, error detection, or encryption, allowing developers to specialize
  and work independently on different parts of the networking stack.

- **Interoperability Across Systems**: The standardized framework ensures that devices
  and applications from different vendors can communicate seamlessly, promoting
  global connectivity.

- **Enhanced Troubleshooting**: Isolating issues becomes more straightforward when
  errors can be traced to a specific layer, reducing downtime and improving reliability.

- **Foundation for Networking Standards**: Understanding the OSI model provides a
  solid foundation for grasping real-world implementations like the TCP/IP stack,
  aiding in the development and maintenance of networked applications.

## What next

We will be understanding how this is implemented in the Linux networking stack,
What happens in each layer, how the code looks in C and how data in each layer looks
like.

We will follow the entire [**Egress** and **Ingress** path](/writings/tech/linux-networking/Egress-path-part-1.md) of data from and to
a Linux based machine.

Stay Tuned.
