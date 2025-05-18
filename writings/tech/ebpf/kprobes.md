---
title: "KProbes: Zero to Hero"
description: "Everything you need to know about writing kprobes"
date: September 24, 2024
---

## Goal

We want to monitor our server which is running on a Linux based machine, now we
have to figure out everything so that we can write a piece of software that checks
when our server starts, when a client connects to it etc.

## The Journey to the systems

So the first thing the system needs to know is differentiate my server from other
things running on my system. Because it turns out, for the system, everything running
looks the same.

This same thing is called a `process`, any running piece of code in the system is
called a process. So practically your offline game, or a downloaded movie that you
are playing using `VLC media player` as well as your server, everything looks the
same to your system, i.e. a `process`.

But just like your brain, which has different parts doing different work, the
kernel also has different parts doing different kind of works. You can think of
the kernel to contain pipes, where a certain kind of process follows a certain
type of pipe.

So, we can use this to differentiate between a normal process and a process that
uses the internet.

### BSD Sockets

Now, when we think of the internet enabled processes the machine now needs to be
aware of more internal knowledge of the system. For the process, it is just trying
to communicate with another process. The other process turns out to be running on
a different machine altogether, but it isn't aware of that.

We should think with the perspective of kernel developers. If I had to build a mechanism
that allows a process to connect to the internet, I would first think in terms of,
"what problem are we trying to really solve".

The problem we are trying to solve is, "how do I make sure that one process can talk
to another?". And then implement a solution that makes the process of communication
as simple as possible by `Abstracting` all the internal details.

That is what the Operating system does too. Let's role-play as a kernel engineer
and think of how we will implement this.

**One process needs to talk to another**.

For it, let's split the things into two categories:

- Processes on the same machine
- Processes on the different machines.

#### Same Machines

This is not relevant to us because we are going to implement a solution for enabling
processes running on different systems, via internet. But for a hint, you can think
that OS might allocate a shared memory space between two processes and make sure
that only one process can write to it at a time, while the other reads and then
vice versa.

#### Different Machines

This is different scenario now, because as far as I can recall, there are different
types of communication here. For example, my `bluetooth` keyboard doesn't use internet
to communicate with my computer. Similarly there is radio as well. So, I plan to
abstract more.

**What are the set of operations that are needed for any two processes to
communicate?**

**Well, I think they should be able to perform at-least these functions, even though
I am not sure how the actual code will look like**

- new_connection()
- accept()
- send()
- receive()
- Terminate()

This process of writing the idea of actions and capabilities of a system, without
actually writing implementation code for it, is called "writing Interfaces", and
it is a very famous and well known Computer Science concept.

This interface we just defined above actually exists inside the linux kernel and
it is called the `BSD socket API`.
