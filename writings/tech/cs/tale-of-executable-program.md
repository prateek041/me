---
title: "Tale of Executable programs"
description: "How does a program that you write becomes an executable? and how it runs in the system?"
date: "April 18, 2025"
---

This article explains how a piece of code transforms from being written in your
code editor to being executed by the CPU, focusing on the journey up to memory loading.

## From Code to Executable

You start by writing **source code** in a human-readable programming language of
your choice. What happens next depends on whether you’re using a **compiled** or
**interpreted** language:

- **Compiled Language**: A compiler translates the source code into low-level
  **machine code** (sequences of 0s and 1s). This machine code, combined with data
  like initial values of global variables, memory offsets, and metadata, is
  packaged into an **executable file**, commonly an **ELF** file on Linux.
- **Interpreted Language**: An interpreter translates the source code into machine
  code dynamically, executing it one statement at a time.

Since this series is focused on Go, a compiled language, we’ll focus on the
compilation process.

### Executable File Sections

An executable file, such as an ELF file, is organized into distinct sections:

- **.text**: Contains the machine code instructions.
- **.data**: Stores initialized global and static variables.
- **.bss**: Holds uninitialized global and static variables.
- **Metadata**: Includes file information, symbols, and references to shared libraries.

For a deeper dive into ELF files, check out [this article](https://www.prateeksingh.tech/writings/tech/ebpf/elf).

## Launching the Program

Once the executable is ready, the operating system (OS) steps in to run it. Here’s
the process:

### 1. Request

You initiate execution by double-clicking the file or running it via the command
line.

### 2. Process Creation

The OS creates a **process**, assigning it a unique **Process ID (PID)**. A process
is an instance of the program in execution, managed by the OS to allocate resources
like memory and CPU time.

### 3. Virtual Address Space

The OS assigns the process a **private virtual address space**, a large, linear
range of _memory_ addresses starting at 0. These addresses are **virtual**—an
abstraction mapped to physical memory by the OS.

#### Why Virtual Address Space?

- **Isolation**: Ensures processes don’t interfere with each other’s memory,
  preventing errors or security issues.
- **Mapping**: The OS, aided by the CPU’s **Memory Management Unit (MMU)**,
  translates virtual addresses to physical ones for efficient memory use.

### 4. Loading

The OS **loader** reads the ELF file’s sections (e.g., `.text`, `.data`) and
places them into the process’s virtual address space, preparing them for CPU
access and execution.

### 5. Dynamic Linking

If you are working with a programming language like `C`, linking process becomes
very crucial. Whenever you write a software, you often rely on external libraries
and packages. For example, you use `#include<stdio.h>` pre-processor, that makes
sure your compiled software also includes the entire code present in the `stdio.h`
header file.

Then, while writing your code, you can use functions like `printf` which are
provided by the `stdio.h` header file. It is actually at the linking step, that
all the external libraries and dependencies are loaded into the virtual memory,
to make sure the actual implementation of the `printf` function is available when
it is used anywhere.

This concludes the life-cycle of a program all the way from being written to
being loaded into the memory.

Next articles in the series go more in-depth. They are about how the execution
works. This would involve understanding things like

- Threads and their execution flow.
  - Single Threaded vs Multi threaded applications
  - Thread components including _program counter_, _temporary storage_, _CPU
    registers_, _Stack_ etc.
  - Shared resources: How resources are shared between multiple threads running
    under the same process.
  - Multi-threading and Go Routines.
  - CPU scheduling algorithms, interrupts and time sharing.
- Execution Stack in detail.
  - Managing function calls, passing arguments and handling returns.
  - Application Binary Interface (ABI) of a language.
  - Stack Frame.
- The Heap in detail (Dynamic Memory).
