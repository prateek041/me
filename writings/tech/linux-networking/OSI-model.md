---
title: "OSI Model"
description: ""
date: 11 November, 2024
---

### Host (or end device)

These are the devices which are either sending or receiving data. This can be
your Phone, laptop or the Server of Google serving your web search request.

### Non Host (or in-between devices)

These are the devices that neither generating or reading data, they are just
responsible for enabling the flow of information. It will rarely happen that two
Hosts are connected directly, therefore all the devices that are part of the
internet except the host devices are the in-between devices.

They receive a piece of data, read only the information that is necessary to
"give right direction" to it, and move it in that direction. How is that direction
decided? That is something we will cover later on.

There are multiple non-host devices like Router, Switch, Hub etc. we will touch
on them later on.

### Bits information

The moment data being sent or received leaves a host or in-between devices, it
is converted into contiguous stream of bytes, that are transferred in different
formats, depending on the medium. So if the two devices are physically connected
through an Ethernet cable, the bits are transferred in the form of electric pulses.
Similarly if the two devices are communicating through WiFi, the bits are
transferred through radio waves.

### Network

Network has many components, namely

- Internet
- Intranet
- LAN
- WAN

### NIC (Network interface Card)

These are the devices that connect a Host or an in-between device to the internet,
They are responsible for taking the information from the Devices and convert them
into bits, and send them to the next device. They are the interface between the Devices
and the Physical medium itself.

These NICs have their unique address to be recognised, these addresses are set in
by the manufacturer.

### Why not just MAC addresses instead of building a system for IP addresses

- Hierarchy: They are flat, internet is so big that if using mac addresses there
needs to be global mapping telling the physical location of each device. With IP,
there is hierarchy, the entire internet is divided into smaller chunks called LAN,
with this hierarchy, the in-between devices don't need to know the exact location
where the data needs to be going, they just need to know where that LAN
(Local Area Network) lies and route the information in that area.

Other in-between devices will handle the process of routing the information to that
specific device that needed that data.

- Not Routable:

- **Mobility, Efficiency and Scaling**: The whole system that stores mapping MAC
addresses to the physical location of the device will need to be constantly updated
if the user is moving their device physically. That is millions of devices constantly
updating the global state.

IP are dynamic, they change depending on what is your LAN, it will be different when
you connect to your office WiFi and different when you are on your home network.
But your Physical address (MAC address will remain same).

All that changes is that the in-between device (let's say your router B) would
have to create a new IP address, assign it to your device, and add that new IP
in it's local register. Everything else remains same, so the in-between device
just before it (let's say router B) would not even know if anything changed,
it still sends the data to B when it sees that specific pattern, not it's
responsibility of the router B to make sure that the data reaches the Device.

Every device would have to be physically connected to each other, without any
in-between device. Or, every in-between device would need to have the Global
MAC-to-location mapping, which is a big issue and a very big overhead.

- Security and Traffic Isolation:

- Scalability: Internet is so big, that the
- Flexibility
- Layer Separation

## Scope of the Article

To help you build a mental model that you can always remember when working with
Computer Networks. There is too much to remember and so less human brain can remember
at surface level, this article includes all the information you need to remember,
for the rest, Internet is your friend.

There are multiple layers when it comes to implementation of Networking Stack,
if we go in a top to bottom order in the OSI model the layers are:

- Application Layer (Layer 7)
- Presentation Layer (Layer 6)
- Session Layer (Layer 5)
- Transport Layer (Layer 4)
- Network Layer (Layer 3)
- Data Link Layer (Layer 2)
- Physical Layer (Layer 1)

## Why multiple layers

Computer networks are hard to implement, there are many overlapping concepts
and the entire implementation could have been done in comparatively lesser layers,
but there are some principles at play here, namely

- Separation of concerns (Every layer is responsible for specific tasks)
- Upper layers confident that lower layers do their tasks properly and don't need
to care about how they are doing it.
- Computer networks involve many different moving parts, the information needed to
send a message from a mobile phone to the router, is different from the information
needed to send it from router to the receiver's phone.

We will understand what these individually mean, and there are multiple amazing
resources that you can read to have an even better understanding of each individual
part.

Since we are talking about Computer networks with the perspective of low level
engineering, we will only talk about Layer 1 to Layer 4.

## What each layer does

### Physical Layer (Layer 1)

This is the layer where your information is present in the form of 0s and 1s,
and they are travelling through mediums like Ethernet cables, Wi-Fi routers etc.

Don't be confused by the name "Physical" layer, because the medium of transport
doesn't specifically have to be Physical. The OSI model was created in the olden
days, and the devices working on this layer at that time were using Physical mediums
to transfer data. But this not the case anymore, Wifi is readily available, and does
the same thing. i.e. Transferring the Bytes of information.

TO BE DONE
