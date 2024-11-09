---
title: "Building New Internet from Scratch"
description: "A Quick introduction to OSI Model for Computer Networks"
date: 11 November 2024
---

Understanding how internet works.

If we design our own internet, it won't be so different from what we already have.

# Ground Rules

We want to send the data from one device to another in a Fast, efficient and scalable way. So, how do we do that? That is how we design our own internet, which would be "interconnection of multiple devices" talking to each other.

## Basic Communication and Need of addresses

### Physical World vs Digital World

Let's say you want to send a message to your friend, who lives two houses away from you. You would need their address, so that you can write the information on let's say a piece of paper and tell your younger brother to give that piece of paper to the people living in that house.

You would also attach the name of the person on top of it, because you wouldn't want someone other than your friend to read your messages right? But let's think about this later, we just want the message to somehow reach your friend's house.

This is the physical way of sharing information, but since we are creating our own internet, we would need "digital world". Luckily you and your friend both have a computer to work with.

In the **Physical world**, your younger brother is the messenger who carries your message. But in the **Digital World** we need a medium that can carry information in a way computers understand. This medium could be a wire, like an Ethernet cable, or even wireless signals like Wi-Fi.

Similarly, computers can't read handwritten notes. They need the message in a special format (binary). Think of it as translating your note into a secret code that only computers can understand. This code is called "binary", made up of 0s and 1s.

So, you and your friend decided to buy an Ethernet cable, that carries binary information in the form of Electrical impulses, these impulses travel from your computer to your friend's. As for converting your messages into **binary**, let's say for simplicity's sake, your computer has a **messenger** built in--a magical helper called a **driver**. This driver knows how to convert your messages into bits and pass it to the Ethernet Cable.

> In our **Old Internet** , this work is done by **NIC(Network Interface Card)** but we will touch upon it in later sections.

### Need of Addresses

This was working amazing for a few weeks, but turns out, your other 2 friends (C and D) found out about this new mode of communication you and your friend came up with. They want in on this.

So, you decided that the task is fairly easy, just buy more Ethernet Cables, connect it to each other's computers and start sharing messages. But there are a few problems.

- There are too many cables now! Each computer has 3 cables connected to it, which is causing clutter and your Mom is not liking it.

- Since there are 4 computers now (A, B, C and D) and if A wants to send messages to B, how would A uniquely identify which cable is connected to B?

Let's solve the problems one at a time.

#### Too many Cables

To solve this problem, one of your friend came up with a solution. He had an extra computer (let's call it X) sitting idle at home, so he thought instead of computers being directly connected to each other, let's have X has the common connection between all the other computers, so now each computer (A, B, C and D) have just one cable connected to them, which connects them to X.

If A wants to send a message to B, the message goes from A -> X and X sends the message from X -> B.

But this has one common problem as the previous solution.

#### How to uniquely identify each computer

Our last solution made sure that irrespective of who is sending message to who, they just have one Ethernet cable connected to them, which takes message to X. But now X has 4 cables attached, connecting it to (A, B, C and D) respectively. On receiving a message how does X know which cable to write that message on? We need Unique addresses!

So, you decided to give each computer a **hard-coded** number, A->1, B->2, C->3 and D->4. And you added a table (let's call it **lookup table** ) in the computer X, that has a mapping of which cable sends message to which unique address.

Now if A wants to send message to B, it wraps the message into something like an envelope, with B's unique address on it and sends it to X. Then X reads that envelope and knows that this messages needs to be sent to B, therefore it checks the lookup table for to know which out of 4 cables connects X to B, and send the message on it.

> In our Old Internet, this unique address is called **MAC address**, which is assigned to each **NIC**, and this lookup table is called "MAC address lookup table". This common device X is a **Hub/Switch**, Finally, this interconnection of 4 computers you just built is called a **LAN(Local Area Network)** .

## From Local to Global

This section is about understanding how you would send messages over longer distances, efficiently.

You and your friends are enjoying the new internet you built, your parents are amazed and therefore telling your distant relatives about it. Your favorite cousin heard and wants to be a part of it.

You realize that this is something that would keep growing, because then your cousin's friends would want to use it as well, even though they might want to have an **isolated** part of it. After all, they are not your friends and would want their own separate LAN.

So, if we break down the problem, here is what we want:

- Your cousin's group should have a separate Local Area Network (LAN) where they can talk about their personal things.
- Your cousin wants to talk to you as well, so you need to figure out a way to make these two LANs talk to each other.

### Setting Up a New LAN

The first problem is fairly easy to solve: just setting up a new Local Area Network of interconnected devices that have their own unique addresses and names. Let’s say your cousin sets up a network with devices labeled **E**, **F**, and so on, just like you set up for yourself. The common computer’s name here is **Y**.

### Making Two LANs Talk to Each Other

For simplicity, let's say Ethernet cables are free and abundant. You take a cable long enough to connect your LAN's **switch** (Computer X) to your cousin's **switch** (Computer Y).

Now, by adding the entries of all the computers and their unique addresses in both **X** and **Y**, we can ensure that communication between the computers happens. But, there are still a lot of problems.

- **Both X and Y need to constantly be aware of every computer’s physical location** (which cable connects to which computer). If a new computer joins, both **X** and **Y** need to be updated again. This system is not scalable at all.
- Another problem is the current process of addressing is based on **physical presence** instead of a logical hierarchy i.e. Switch X needs to know exact address of your brother's computer. If this new internet has to work at any level near the old one, this will result in a HUGE table of MAC addresses which need to be constantly know about every device in the world. This is very inefficient.

You need a way to make the system scalable. Instead of having **Switch X** and **Switch Y** know about every device and always needing updates, you want a system where **X** only needs to know, “If I send this message on this cable, it will eventually reach **Y** and then **Y** can handle the logic of sending the information to your computer.

#### Scalable Addressing Scheme

What if there could be a device with an address attached to itself, and then every device connected to it would have a randomly generated (but unique) address? When the device disconnects, the address entry is removed. Forget the old addressing process—let’s come up with something from scratch.

Let’s think about this:

Your cousin takes the switch Y and gives it a new address **1** (from now let's call it **R1**). You do the same: take your Switch X, give it an address **2** (from now let's call it **R2**) and connect it to **R1**. Now, each device connected to R1, which will be your cousin and his friends, will have addresses like **1.x**.

For example, if there are 4 computers in your cousin's LAN, they would have addresses _1.1_, _1.2_, _1.3_ and _1.4_. Similarly your LAN's devices have addresses _2.1_, _2.2_ and so on.

This way, R1 and R2 doesn’t need to keep track of every device individually. Instead, It just needs to check the destination address, if it starts with "2" it just forwards it to R2, when the message reaches R2, it will be sent to the right computer (more on it later).

Here are the Pros of this:

- If your cousin travels to your House in summer, he can still talk to his friends, because now his computer's address changed from let's say _1.1_ to _2.5_ and therefore nothing changes for R1, when your cousin's friend sends a message to him, all R1 sees is destination address for that message starts with 2, therefore send it to R2 and rest will be handled by it.

- There is a separation of concerns now, R1 and R2 only need to care about the devices directly connected to it, any new devices will be given a new address.

- This addressing scheme is scalable, if there are 2 more Local Area Networks (let's say R3 and R4) between your and your cousin's LANs, nothing changes, R1 will know "This message starts with 2, I have to send to the right", R3 will do the same, pass it to it's right, to R4. Similarly R4 will pass it onto R2. R1 had no idea how many internal LANs are there between it and R2, it just knows a direction to pass the message onto.

### Comparison with Old internet

In Old internet, this logical addressing is called **IP Addressing**, these new devices R1 and R2 are called **Routers**.

Each router knows which direction to pass the message in through Router protocols like OSPF, BPG etc. that keep the routing tables updated, mapping specific IP ranges to neighboring routers.

Similarly, I mentioned that Devices connected to Router with address 1.x will have addresses like 1.1, 1.2 etc. This is done through address assigning protocols like DHCP (can also be done manually).

This article would not touch these topics because it would become a book.

Through the approaches we have tried so far, we can see that even the new implementation of the internet brings us to similar solutions as the older internet.

## Finding the path to your destination

In the previous section we came up with a new addressing format, that gives logical addresses to computers and devices. Now let's try to figure out how the messages actually reach from Source to Destination. Also, how does a Router eventually sends the message to individual computer.

In the last section we did not completely ditch the Physical addressing scheme of MAC Addresses, instead we adopted both for different use-cases. We use IP addressing when sending messages from one LAN to another LAN, and still use MAC addresses when sending messages within the same LAN.

IP addressing is purely logical, they tell the direction to forward the message to, but messages go from one MAC address to the closest Physically connected Mac address. Even when message is going from R1 to R2 (let's say they are next to each other), destination IP address only tells the right direction, the message actually goes from MAC address of R1 to MAC address of R2.

This is called "Hop to Hop" delivery. IP addressing enables "Sender to Receiver" deliver.

### Hop to Hop delivery

This is the process of sending the message from one MAC address to another MAC address, i.e. one physical (or wifi) connection to another.

Let's say device A is sending message to device B who are on different LANs, here is the process that is going to be followed.

- Your device will send the message to the router of it's LAN, how? From device A's MAC address to Router's MAC address.
- Router will see the destination address of this message is not in this LAN, therefore it needs to be sent to the next LAN.
- Through Routing protocols it would know which direction to send the message to, which is the next router (Hop) and what is it's address. Using that MAC address the router sends message to it.
- This cycle repeats till the message finally reaches the right LAN.
- Now the Router (or similar devices) will the send the message to the recipient device, the right MAC address, this will be the last hop.
- Now the message has reached the right IP address.
