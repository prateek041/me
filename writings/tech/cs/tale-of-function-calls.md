---
title: "Tale of Function Calls"
description: "What happens at the kernel level, when function in your program calls another."
date: "April 13, 2025"
---

Have you ever wondered what happens at the kernel level when a function `caller`
calls another function `callee(arg1, arg2)`? How does `callee` actually receive
the arguments passed to it, and how does it return the result to `caller`?
This article is all about it.

## Prerequisites

This article assumes that you have familiarity with how a program executes in
your system. Which includes understanding of the following concepts:

- The Journey from source code to executable binary.
- Executable files and their sections (e.g. ELF format).
- Private Virtual Address Space and its growth.
  If the topics are unfamiliar, I recommend reading [Tale of an Executable](https://www.prateeksingh.tech/writings/tech/cs/tale-of-executable-program)
  along with [ELF](https://www.prateeksingh.tech/writings/tech/ebpf/elf).

## How Information is Passed Between Functions

When a function calls another, information such as arguments and return values
must be transferred efficiently. There are two primary mechanisms for this:

- **CPU Registers**: These are small, extremely fast storage locations directly
  accessible by the CPU. However limited number (e.g., 16 general purpose registers
  in `x86x64`) restricts how much data they can hold.
- **Memory (The Stack)**: Each running process has a stack, which is a region of
  main memory (RAM) that is slower to access than registers but offers significantly
  more space. The stack grows and shrinks as functions are called and return.

These mechanisms work together, guided by a critical set of rules known as the
**Application Binary Interface (ABI)**.

## Application Binary Interface (ABI)

The **ABI** is a strict contract that defines how compiled code interacts at the
binary level. It’s the glue that ensures functions can communicate without needing
to know each other’s internal details. Each programming language and platform
has its own ABI, for example, you can explore [Go's ABI here](https://go.googlesource.com/go/+/refs/heads/dev.regabi/src/cmd/compile/internal-abi.md#amd64-architecture).

Each language has its `ABI` defined, and it follows **strict contract** and
**protocol** that defines exactly how compiled code interacts at the Binary Level.
You can see `Go`'s `ABI` [here](https://go.googlesource.com/go/+/refs/heads/dev.regabi/src/cmd/compile/internal-abi.md#amd64-architecture).

## The Function Call Process

Let’s break down what happens when one function calls another:

1. **Caller Prepares Arguments**: The caller places arguments in registers or on
   the stack, as dictated by the ABI.
2. **Call Instruction**: The `call` instruction pushes the return address (the
   next instruction to execute after the callee finishes) onto the stack and jumps
   to the callee’s address.
3. **Callee Sets Up**: The callee creates a stack frame, retrieves the arguments,
   and begins execution.
4. **Callee Computes**: It performs its task using the arguments.
5. **Callee Returns**: The result is placed in a designated register or stack
   location, and the `ret` instruction pops the return address from the stack,
   jumping back to the caller.
6. **Caller Resumes**: The caller retrieves the return value and continues execution.

### Example: Adding Two Numbers

To make this concrete, let’s consider a simple C program where `main` calls a
function `add` to sum two integers:

```c
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(3, 4);
    return result;
}
```

We’ll examine how this works on an `x86-64` system using the System V ABI (common
on Linux and macOS).

#### Assembly Breakdown

Here’s a simplified assembly representation of the function call:

```assembly
; Caller: main
main:
    mov edi, 3        ; First argument (3) into RDI
    mov esi, 4        ; Second argument (4) into RSI
    call add          ; Call add function
    mov eax, eax      ; Result already in EAX, ready to return
    ret               ; Return from main

; Callee: add
add:
    mov eax, edi      ; Move a (RDI) to EAX
    add eax, esi      ; Add b (RSI) to EAX
    ret               ; Return result in EAX to caller
```

#### Step-by-Step Explanation

1. **Preparing Arguments**:

   - The System V ABI specifies that the first six integer arguments are passed
     in registers `RDI`, `RSI`, `RDX`, `RCX`, `R8`, and `R9`. Here, `3` goes into
     `RDI`, and `4` into `RSI`.

2. **Calling the Function**:

   - The `call add` instruction pushes the return address onto the stack and
     transfers control to `add`.

3. **Receiving Arguments**:

   - `add` finds its arguments in `RDI` (a = 3) and `RSI` (b = 4).

4. **Computing the Result**:

   - `add` moves `RDI` to `EAX`, adds `RSI` to it, and now `EAX` holds `7`.

5. **Returning the Result**:

   - The ABI designates `RAX` (or its 32-bit subset `EAX`) for integer return
     values. The `ret` instruction pops the return address and jumps back to `main`.

6. **Using the Result**:
   - `main` finds the result (`7`) in `EAX` and can use it as needed.

### What About More Arguments?

The obvious follow up questions would be, what if your function takes more arguments
than the registers available?

If `add` took seven arguments, the first six would use `RDI`, `RSI`, `RDX`, `RCX`
, `R8`, and `R9`, and the seventh would be pushed onto the stack. The caller adjusts
the stack pointer (`RSP`) accordingly, ensuring proper alignment (typically 16 bytes
in x86-64).

## Digging Deeper: Stack Frames and Data Types

### Stack Frames

Every function call creates a **stack frame**, a structured region on the stack containing:

- **Return Address**: Where to resume execution in the caller.
- **Saved Registers**: Values of registers (e.g., `RBP`) that the callee must preserve.
- **Local Variables**: Space for the function’s temporary data.

The stack grows downward (lower addresses) as frames are pushed and shrinks upward
as functions return. (now you must guess where "stack overflow" as a platform got
it's name :D)

### Handling Different Data Types

The ABI also governs how various data types are passed:

- **Integers and Pointers**: Passed in general-purpose registers like `RDI` or `RAX`.
- **Floating-Point Numbers**: Use dedicated registers (e.g., `XMM0`–`XMM7` in x86-64).
- **Structs**: Small structs might fit in registers; larger ones are passed on the
  stack or by reference (a pointer).

## Why This Matters

Understanding function calls at this level is invaluable for:

- **Observability**: When writing `uprobes` eBPF programs to monitor a user space
  function, understanding the language specific ABI is crucial to get access to
  the arguments being passed to or returned from the function.
- **Debugging**: Tracing assembly code reveals where things go wrong.
- **Optimization**: Knowing register vs. stack trade-offs can boost performance.
- **Systems Programming**: Writing kernels or compilers requires mastering the ABI.

## Conclusion

This makes us thing, something as trivial as calling a function from another can
be so complex in it's implementation. Function calls are complex at the binary
level. Arguments can be either in registers or land on the stack, guided by the
ABI’s strict rules.

Returning values is as crucial as calling functions, they also follow specifications
so the return values land precisely where the caller expects them. The ABI is the
interface that makes all of it possible, ensuring every step, from argument placement
to stack management, is executed perfectly across functions, languages, and platforms.

Now we have all the fundamental knowledge we needed to understand **ABI** of any
programming language and hence, we can write `uprobes` for any user space function
now.
