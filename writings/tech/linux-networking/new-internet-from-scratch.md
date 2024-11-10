---
title: "Building the New Internet from Scratch"
description: "If we build the internet from scratch, how different will it be from what we already have?"
date: 11 November, 2024
---

In order to write **eBPF** programs that interact with the Linux Networking stack,
we need to understand how the internet works. What is better than building
something from scratch and understand how it works.

If we design our own internet from scratch, solving one problem at a time,
improvising, how do you think it will unfold? How different will it be
from what we already have?

In this article we are at the core, no big words, just you encountering
problems, and implementing solutions for them. Let's get started

## Ground Rules

Before we even start, let's set some ground rules to begin with.

Our internet should be:

- Fast
- Scalable
- Efficient
- Dynamic

Why? Because the Old internet has all of these things, and the new Internet
won't be of any use if it is not as good or better than the old one.

### What we want

We want to send the data from one device to another in a Fast, efficient and
scalable way. So, how do we do that? Let's design our own internet, which would be
"interconnection of multiple devices" talking to each other.

## Basic Communication and Need of addresses

### Physical World vs Digital World

Let's say you want to send a message to your friend, who lives two houses away
from you. You would need their address, so that you can write the information
on let's say a piece of paper and tell your younger brother to give that piece
of paper to the people living in that house.

You would also attach the name of the person on top of it, because you wouldn't
want someone other than your friend to read your messages right? But let's think
about this later, we just want the message to somehow reach your friend's house.

This is the physical way of sharing information, but since we are creating our
own internet, we would need a "digital way". Luckily you and your friend both
have a computer to work with.

In the **Physical world**, your younger brother is the messenger who carries
your message. But in the **Digital World** we need a **medium** that can carry
information in a way computers understand. This medium could be a wire, like an
Ethernet cable, or even wireless signals like Wi-Fi.

Similarly, computers can't read handwritten notes. They need the message in a
special format (binary). Think of it as translating your note into a secret code
that only computers can understand. This code is called "binary", made up of 0s
and 1s.

So, you and your friend decided to buy an Ethernet cable as your medium,
that carries binary information in the form of Electrical pulses, these pulses
travel from your computer to your friend's. As for converting your messages into
**binary**, let's say for simplicity's sake, your computer has a **messenger** built
in-a *magical* helper called a **driver**. This driver knows how to convert your
messages into bits and pass it to the Ethernet Cable.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261309509/0f30cf36-4141-494f-ad99-6bf21b8e6345.png?auto=compress,format&format=webp)

> diagram here :check

### Comparison with Old internet

In our **Old Internet** , the work of converting your messages into bits
is done by **NIC(Network Interface Card)**, we will touch upon it in later sections.

### Need of Addresses

This was working amazing for a few weeks, but turns out, your other 2 friends
(C and D) found out about this new mode of communication you and your friend
came up with. They want in on this.

So, you decided that the task is fairly easy, just buy more Ethernet Cables,
connect it to each other's computers and start sharing messages.
But there are a few problems.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261373376/fa861057-5d78-47d1-9591-e3c6bdf1ca9a.png?auto=compress,format&format=webp)

- There are too many cables now! Each computer has 3 cables connected to it,
which is causing clutter and your Mom is not liking it. Also your computer has
limited Ethernet sockets. Less than the number of friends you have.

- Since there are 4 computers now (A, B, C and D) and if A wants to send
messages to B, how would A uniquely identify which cable is connected to B?

Let's solve the problems one at a time.

#### Too many Cables

To solve this problem, one of your friend came up with a solution. He had
an extra computer (let's call it X) sitting idle at home, so he thought instead
of computers being directly connected to each other, let's have X has the common
connection between all the other computers, so now each computer
(A, B, C and D) have just one cable connected to them, which connects them to X.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261416168/eb308cf5-6003-4d6f-b54b-7b904c3769e9.png?auto=compress,format&format=webp)

If A wants to send a message to B, the message goes from A -> X and X sends the
message from X -> B.

But this has one common problem as the previous solution.

#### How to uniquely identify each computer

Our last solution made sure that irrespective of who is sending message to who,
they just have one Ethernet cable connected to them, which takes message to X.
But now X has 4 cables attached to it, connecting it to (A, B, C and D) respectively.
On receiving a message how does X know which cable to write that message on? We
need Unique addresses!

So, you decided to give each computer a **hard-coded** number, A:1, B:2, C:3
and D:4. And you added a table (let's call it **lookup table** ) in the
computer X, that has a mapping of which cable sends message to which unique
address.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261469889/9f563b4f-7055-4851-b9e1-805e64b21a0a.png?auto=compress,format&format=webp)

Now if A wants to send message to B, it wraps the message into something like an
envelope, with B's unique address on it and sends it to X. Then X reads that
envelope and knows that this message needs to be sent to B, therefore it checks
the lookup table to know which out of the 4 cables connects X to B, and send the
message on it.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261505815/0d37548b-a0c2-4b79-b287-b881594437c5.png?auto=compress,format&format=webp)

### Comparison with Old internet

In Old Internet, this unique address assigned to each computer is called
**MAC Addrress**, which is assigned to each **NIC** by the Manufacturer.
It is also considered the Physical address of the Device.

This lookup table is called **MAC address lookup table** and we have multiple
protocols like **ARP** that make it possible . This common device X is
a **Hub/Switch**, Finally, this interconnection of 4 computers you just built is
called a **LAN(Local Area Network)** .

## From Local to Global

This section is about understanding how you would send messages over longer
distances, efficiently.

You and your friends are enjoying the new internet you built, your parents are
amazed and therefore telling your distant relatives about it. Your favorite
cousin heard and wants to be a part of it.

You realize that this is something that would keep growing, because then your
cousin's friends would want to use it as well, even though they might want to
have an **isolated** part of it. After all, they are not your friends and would
want their own separate LAN.

So, if we break down the problem, here is what we want:

- Your cousin's group should have a separate Local Area Network (LAN) where they
can talk about their personal things.
- Your cousin wants to talk to you as well, so you need to figure out a way to
make these two LANs talk to each other.

### Setting Up a New LAN

The first problem is fairly easy to solve: just setting up a new Local Area
Network of interconnected devices that have their own unique addresses and names.
Let’s say your cousin sets up a network with devices labeled **E**, **F**, and
so on, just like you set up for you and your friends. The common computer’s
(Switch) name here is **Y**.

### Making Two LANs Talk to Each Other

For simplicity, let's say Ethernet cables are free and abundant. You take a cable
long enough to connect your LAN's **switch** (Computer X) to your cousin's
**switch** (Computer Y).

Now, by adding the entries of all the computers and their unique addresses in both
**X** and **Y**, we can ensure that communication between the computers happen.

When your brother sends a message to you, your computer's address is attached on
top. It goes from his computer to Y, from Y to X and from X to your computer.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261733597/7df6b92a-93b8-4a4b-a141-0b1a90c37221.png?auto=compress,format&format=webp)

But, there are still many problems.

- Both X and Y need to constantly be aware of every computer’s physical location
(which cable connects to which computer). What if there are tens of thousands of
Computers? X and Y both store the same information and every time anyone new joins
the Network, the entire table in both X and Y needs to be updated.
**System is not Scalable enough**.
- Another problem is the current process of addressing is based on **physical presence**
instead of a logical hierarchy i.e. Switch X needs to know exact address and path
of every computer in the world. So if there are multiple **Switch** between you and
your brother's computer, still each Switch needs to know the exact path to be followed
in order for the message to reach from one place to another. Longer the distance,
larger the path to remember.

You need a way to make the system scalable. Instead of having **Switch X** and
**Switch Y** know about every device and always needing updates, you want a
system where **X** only needs to know, “If I send this message on this cable,
it will eventually reach **Y** and then **Y** can handle the logic of sending the
information to computer.

#### Scalable Addressing Scheme

Let's imagine a new system. What if there could be a device (let's call it R)
on top of every LAN. With an address attached to itself, this device is responsible
only for sending messages between two LANs, and can guess the direction of other
**R** type devices.

Also, each devices connected to R will have a new type of address as well, which
is dynamic and logical, not hard coded in the system, so it can keep changing.
This address is assigned to computers in a specific way. If 2 computers are connected
to **R1**, they will have address **1.1** and **1.2**. Similarly computers connected
to **R3** will have addresses in **3.x** format.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261873089/9d7a71a5-e455-4499-9e67-49b4df587be3.png?auto=compress,format&format=webp)

This forms a *hierarchy* telling which computer is within the LAN and which one is
out of it. For **R1**, computer **1.1** is internal since it's address starts
with 1. And **2.1** (but internal for R2) is external.

**R1** has two types of tables now, one for addresses outside it's LAN and other
for internal devices. If the destination address of a message is internal, our
older system still works. **R1** just has to send the message to the
**Physical Address** (MAC address) of the destination device.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261928960/55f74947-8669-42a3-b171-fa6d8ea17383.png?auto=compress,format&format=webp)

If the destination is external let's say **3.1** , **R1**  doesn't have to know
the exact path the message has to follow to reach **3.1**, it just needs
to know which direction should I pass the message so it eventually reaches **R3**.
So it passes the message to the next closest device to it, **R2** and **R2** does
the same thing and passes it to **R3**. Since the destination addresses
**3.x** are internal for **R3**, therefore our previous system will work again.

You might be thinking, why? What are the benefits of this? Let's try to
understand that.

- The older system doesn't change, it is still responsible for sending message
from one device to it's immediate neighbour another. We just built a higher
level system so that the older one still works, but the new one makes it
**dynamic**

##### **Dynamic**

Initially if a new device joined your internet, the entire Physical address
lookup table of every device in the entire internet needed to be updated,
which is a massive overhead if the system is huge (Old internet is huge).

This new mechanism doesn't update the entire system. If a new device gets
connected to **R1**, it will just increase entries in the two (Physical and Logical)
tables of **R1**, the Physical address table will store the **MAC** address of
the new device and similarly the Logical address table will assign a new address
(Logical address) to it in the format of **1.x** and save it. The entire system is
unaware of this change.

Now let's say our system looks like the diagram below.
![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731261991050/54c8fcb3-b323-4a1c-9cdc-e3bab6c0143b.png?auto=compress,format&format=webp)

If **R2** has to send a message with destination address of format **1.x**,
it just knows that it is a local address for the device **R1**. **R2** doesn't
know the exact path to be followed by this message to reach **R1**. It just knows
that addresses of the format **1.x** and **5.x**  are somewhere to the left and **4.x**
are somewhere to the right (how? We will check it out later) .

It checks the Physical address table to get the Physical address of the device
to it's immediate left, which in our example case is **R5**, and just sends the
message to **R5**. On receiving the message, **R5** does the same, but turns out
the immediate left of **R5** is the address family **1.x**. **R5** gives the
message to **R1**.

Since **1.1** format is internal for **R1**, there is no need of logical addresses
anymore. It just get's the Physical address of the computer whose *Logical*
address is **1.1** which is unique for the LAN. Finally sends the message
to that Physical address and message is delivered to the right destination computer.

**In case your brother came to visit you in summer vacations.**

Nothing changes. All addresses related to him (Physical and Logical) are removed
from his **R level device**(let's say R1).

When he comes to your home, he just connects his device to your LAN's
**R level device** (let's say R2). **R2** stores the physical address of your
brother's computer and also assigns it a logical address of the format **2.x**.
The *routing* process still remains the same. And the entire system except **R1**
and **R2** is unaware of any changes.

#### Comparison to the Old Internet

This **R** level device is called **Router**. This device is responsible to
**route** message between any two LANs. The *Logical* addresses assigned by
the Routers is called **IP addresses**.

The process of assigning logical addresses to newly connected devices, is called
*IP address assignment* and the protocol that does this is called **DHCP**.

Routers don't *guess* the right direction to pass the message to, there are many
router protocols like **OSPF**, **BPG** etc. that keep the *logical* address table
of routers updated. Mapping specific IP ranges to neighbouring routers. Hence
routers can tell which IP range is on the right and which one is on the Left.

The process of sending message from one device to it's immediate neighbour using
**MAC** (Physical) addresses  is called **Hop to Hop** delivery.

The process of sending message from sending device's IP address to receiving device's
IP address is called **End to End Delivery**.

This process of building a *higher level system* like IP addressing over
*lower level systems* like MAC addressing is called **Abstraction**.
Here the higher level system relies on lower level system for *Hop to Hop* delivery
while ensuring *End to End delivery* through it's own addressing system.

There is a pattern now, even if we are trying to build a new internet from scratch,
it still looks extremely like the older one! I guess the "forefathers" knew what
they were doing.

## I can't remember the computer addresses

Your **new internet** idea has sky-rocketed, almost everyone in your family is
using it, even their friends, turns out that there are more than thousands of
people, currently actively using the internet you just created. But that has
raised a new issue, there are too many computer addresses to remember, Because
the sender is the one who is deciding who to send the message to so they are the
people who is putting in the destination address. There are only so many addresses
a human can remember right?

Now there is a need of a system that can turn these computer addresses into
something easy to remember. But internally your routes and switches will need an
address to finally get the message to it's destination.

In the old internet, you just type in *google.com* and it takes you to the right
place, it's easy to remember names as compared to computer addresses, and as
mentioned earlier, these computer addresses keep changing right? Your cousin's
computer has a different address when he is at his home, and a different one
when he comes to your home for vacation.

Let's get back to imagining a solution for this. What if there was a system, that
can take the name of your friend and convert it to the current IP address of his
computer? This system needs to be real-time, so doesn't matter from where your
brother connects to the internet, your messages should reach him and the system needs
to know the "current" IP address of his computer.

You just ask, "what is the current IP address of my Bother's computer" and the system
responds with it, extremely fast. Then you put that address as "destination address"
and send it off to the internet for it to Sail.

This article is long enough to begin with, and adding this section will be too
much to read. This system I am talking about already exists, it's name is DNS
(Domain Name System). Therefore we will continue this journey of making our
own internet in the upcoming articles, but the current system works as it is,
now we are trying to make it User friendly.

## Key Takeaways

- **We started with basic communication**: Just like sending a letter in the physical
world, we explored how computers can send messages to each other through a digital
"medium" (like Ethernet cables or Wi-Fi) and how that message is translated into
binary.

- **The need for unique addresses**: As more devices join the network, we faced
the problem of how to uniquely identify each device. The solution? Assigning
unique hard-coded physical addresses (MAC addresses) to each device, allowing
switches to know where to send data.

- **The first network expansion**: To manage multiple devices, we set up a LAN with
one central switch connecting all computers. However, we quickly realized that
as the network grows, each device can't know about every other device. This led
us to a more scalable approach.

- **The move to routers and IP addresses**: As the network expands globally,
we need a system that scales beyond a single LAN. We introduced routers to
route data between LANs, and IP addresses to uniquely identify devices in
a hierarchical, dynamic way—allowing us to manage large networks without
excessive overhead.

- **Dynamic addressing**: Instead of updating every device on the Internet
when a new one joins, we adopted a dynamic addressing system. Routers update
only their own tables, so the rest of the Internet doesn't need to be aware of
every change.

- **Comparison with the old Internet**: The design of our new Internet mirrors
key concepts from the old one, such as MAC addresses for local communication
and IP addresses for global communication. We also explored how routing protocols
(like OSPF and BGP) help manage data across networks.

- **The problem of remembering addresses**: As more devices join the network,
remembering IP addresses becomes impractical. This is where the Domain Name System
(DNS) comes in—translating easy-to-remember names like "google.com" into the current
IP addresses of devices, making the system user-friendly.
- **Scalable and dynamic design**: We’ve created a system where new devices can
join without disrupting the entire network, and where the routing system remains
efficient even as the Internet continues to grow.

## Future Scope

In the upcoming articles we will talk about how to make this new internet we built,
user friendly. In the old internet (the one you are using right now), everything
is already very convenient. Your just have to click a few times, connect to your
closest router and everything works. There are many systems working in the
background to make this possible.

Every message you send from your devices, follow a large number of steps to reach
their destination and all of it happens in a few seconds. Hard to imagine right?
Everything you work with today, listening to music, watching videos online,
talking to your friends, playing games (real time) while voice chatting, doing
video calls etc. It all happens through this marvel, named **Internet** which we
humans built from thin air.

In the future we will talk about how every moving part of this system works.
Topics including OSI/TCP-IP model, how this **Networking System** is built into
the Linux kernel. We will go as deep as it goes, from kernel buffers to C
structs handling each packet (your message). Eventually we will even write
those **Magical Drivers** we talked about above.

So, keep an eye on this and if there are any questions, please reach out.
