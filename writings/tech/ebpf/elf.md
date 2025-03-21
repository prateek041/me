---
title: "ELF and eBPF"
description: "Understanding working of ELF files in-depth to properly understand some core functionalities of how eBPF programs are compiled and loaded into the kernel"
date: March 21, 2025
---

You must have written eBPF programs in C before, but I am sure very few people are
aware of these small, but crucial details. Before an eBPF program can run in the
Linux kernel, it needs to be loaded from user space. The ELF (Executable and
Linkable Format) plays a key role in this process. eBPF programs are stored in
ELF files, allowing the kernel and user-space tools to parse and extract bytecode
(compiled eBPF code), maps, and other metadata efficiently.

You must have come across things like `SEC("tracepoint/syscalls/sys_enter_write")`
but do you know why we even need to put things in certain sections? There is a
little description on how to use them in the [official documentation](https://docs.kernel.org/bpf/libbpf/program_types.html),
but it does not explain things in-depth. It comes down to understanding ELF
files, and how does the Operating system runs a binary using them.

In this article, we’ll explore what are ELF files, how they work and how to
get better with understanding them. In the next article, we will tie this knowledge
to specific use-cases of eBPF.

There are a few things when it comes to working with eBPF:

- **Custom Sections in eBPF**: `eBPF` programs use ELF files with special
  sections to organise different parts of the program.

  - `SEC(".maps")`: Defines `eBPF` maps section, which are like shared storage spaces
    between the kernel and the user-space code. If the kernel needs access to a map,
    it knows which section to look into.
  - Tools like `bpftool` or `libbpf` read these sections to load the program
    and set up maps correctly.

- **Specifying `Tracepoints` and System Calls with `SEC`**: In `eBPF`, the `SEC`
  macro isn't just for generic programs, it lets you hook into specific kernel
  events like `tracepoints` or `system calls`. For example:
  - `SEC("tp/syscalls/sys_enter_write")`: This attaches your `eBPF` program to
    the `sys_enter_write` `tracepoint`. Which triggers every time the `write` system
    call is invoked.

As you can see, sections in ELF are a pretty big deal already when it comes to
working with `eBPF`. So, If you have questions like "Why do we need sections",
"what are ELF files" etc. in your mind, this article dives deep into answering
those questions. In fact, it is the only article you need to wrap your head
around these concepts.

## What is ELF

The `Executable and Linkable Format(ELF)` is a standard file format used in Unix
like operating systems, such as Linux, to store

- **executables** (programs you can run)
- **object** files (compiled code)
- **shared files** (reusable code shared by programs)

We are talking about times when the hardware was not so readily available as it
it today, you could not load the entire program in memory all at once to compile
and execute it. You had to compile them separately and link them together while
actually executing.

Think of an ELF program file as a neatly organized box that holds everything a
program needs i.e. code, data and the instructions for how to put it all together.

Imagine you’re baking a cake from a recipe. The ELF file is like a cookbook: it
has the ingredients (data), the steps (code), and notes on how to assemble it
(metadata). This structure helps the computer turn your code into a running
program, whether it’s a simple "Hello, World!" or a complex application.

## ELF Sections

Sections in ELF file are like labeled containers that organise different types
of data in a program. Each section has a specific job, making it easier for tools
like compilers, linkers, and debuggers to find and use what they need.

Here are some common sections:

- `.text`: The machine code (instructions) your program executes. For example,
  this is where the steps to print "Hello world!" live.
- `.data`: Initialised global or static variables. Example: `int x = 10;` goes
  here because it has a starting value.
- `.bss`: Uninitialised global or static variables. Example: `int y;` ends up
  here and gets set to zero (default null) when the program starts.
- `.rodata`: Read-only data, like string literals. Example: `"Hello World!"` is
  stored here since it doesn't change.
- `.symtab`: A symbol table listing functions and variables with their addresses.
  Think of it as a directory for finding `main` and `prinf`.
- `.rela.text`: Relocation entries for the `.text` section. These are like
  "fix me later" notes for addresses the compiler doesn't know yet.
- `.strtab`: A string table with names of symbols, such as `"main"` or `"printf`,
  so tools can read them as text.

## Why do we need them

Sections aren't just random, they're essential for making programs work
smoothly:

- **Organization**: Sections group related data (e.g., code in `.text` or
  variables in `.data`), so tools know where to look.
- **Efficiency**: Each section has attributes, like "executable" for `.text`
  or "writable" for `.data`. This tells the operating system how to load them into
  memory with the right permissions.
- **Flexibility**: When linking multiple files, sections can be merged or
  rearranged. For example, `.text` sections from different `.o` files combine
  into one big `.text` in the final program.

**Example**: When you use a debugger like `gdb`, it reads `.symtab` to show you
function names and line numbers, linking the machine code back to your original
code.

## Different types of ELF files

The ELF header’s **type field** tells us what the file is for. Each type plays
a unique role in turning code into a running program. Here are the main types
with examples:

- **REL (Relocatable File, value 1)**:
  - What: An object file (`.o`) from the compiler, not ready to run yet.
  - Use: Contains code and data with relocations "to be filled", waiting to be
    linked.
  - Example: `gcc -c myfile.c -o myfile.o` creates a `REL` file with your compiled
    code.
- **EXEC (Executable File, value 2)**:
  - What: A fully linked program you can run directly.
  - Use: Ready to be loaded into the memory and executed.
  - Example: `gcc myfile.c -o myprogram` creates an `EXEC` file you can run with
    `./myprogram`.
- **DYN (Shared Object File, value 3)**:
  - What: A shared library (`.so`) for dynamic linking.
  - Use: Provides reusable code that programs load at runtime. Multiple
    programs can share it, saving space..
  - Example: `libc.so` (the C standard library) is a `DYN` file used by many
    programs for functions like `printf`.
- **CORE** (value 4):
  - What: A core dump file from a crashed program.
  - Use: Captures the program’s state (memory, variables) when it crashes,
    helping you debug.
  - Example: If `myprogram` crashes, the kernel might save a `core` file for analysis.

### Why Different Types?

Relocations are placeholders in an ELF file that mark where addresses need
to be filled in later. They’re crucial because the compiler doesn’t always
know where things (like external functions or variables) will end up in memory
when it first compiles your code.

#### How They Work

Say your program calls `printf` from the C library (`libc`). In the object
file (`.o`):

- The `.text` section has a placeholder for `printf`’s address (e.g., a temporary
  `0x0`).
- The `.rela.text` section adds a note: "At this spot, insert `printf`’s real address."
- During linking:
  - Static linking: The linker fills in `printf`’s address from a library included
    in the executable.
  - Dynamic linking: The address stays unresolved until runtime, when the dynamic
    linker (`ld.so`) finds `printf` in `libc.so`.

**Example**: If you write `fprintf(stderr, "Error");`, the compiler leaves a
relocation entry for `fprintf`. The linker (or dynamic linker) later connects it
to the real `fprintf` in `libc`.

Relocations let you build programs from multiple files or libraries, even when
their final locations aren’t known yet.

### The Process: From Compilation to Execution

Here’s how a C program goes from source code to running in memory, focusing
on what happens after compilation, this will help you understand the overall
importance of ELF files:

- **Step 1: Compilation**

  - **What Happens**: When you compile a `.c` file with `gcc -c myfile.c -o myfile.o`).
    You get a `.o` file, which is an ELF REL (relocatable) file.

  - **What’s Inside**: Sections like `.text` (code), `.data` (variables), `.bss`,
    and `.rela.text` (relocations). No segments yet, since it’s not executable.
  - **Purpose**: This file has your code but with unresolved references (e.g.,
    to `printf`) unresolved.

- **Step 2: Linking**

- **What Happens**: The linker (`ld`) combines one or more `.o` files and libraries
  into an executable with `gcc myfile.o -o myprogram`).

- **Process**:
  - Combines sections (e.g., merges all `.text` sections into one).
  - **Resolves relocations**:
    - Static linking: Fills in all addresses (e.g., `printf`’s location in the executable).
    - Dynamic linking: Leaves some for runtime (e.g., `printf` from `libc.so`).
  - Adds segments (program headers) to tell the program how to load the file into
    the memory.

**Output**: An ELF EXEC file (`myprogram`) with sections and segments.

- **Step 3: Loading and Execution**

  - **What Happens** : When you run `./myprogram`, the OS loads it into memory.

  - **Loading**:
    - The OS reads the ELF file’s segments ( from program headers).
    - For each `LOAD` segment:
      - Allocates memory with the right permissions (e.g., executable for
        `.text`).
      - Copies data from the file.
      - Zeroes out `.bss` (since it’s uninitialized and takes no file space).
    - If dynamically linked:
      - The dynamic linker (`ld.so`) loads libraries (e.g., `libc.so`).
      - Resolves remaining relocations, updating addresses in memory.
  - **Execution**: The OS jumps to the program’s entry point (e.g., `_start`),
    which calls `main`.

### Runtime Use Case for Sections

Even after loading, sections can be useful:

- A debugger like `gdb` uses `.symtab` and `.debug_*` sections to show you
  variable values and source code lines while the program runs.

## An ELF File and Inspecting it

Let's say we have this example C program:

```c
#include <stdio.h>
int main(){
  printf("Hello, World!\n");
  return 0;
}
```

We will compile this in two stages:

- `gcc -c main.c -o main.o`: Creates a **REL (relocatable)** ELF file.
- `gcc main.o -o main`: Links it into an **EXEC (executable)** ELF file.

### Inspecting REL File

Running `readelf -a main.o` reveals a few things:

#### ELF Headers

```bash
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              REL (Relocatable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x0
  Start of program headers:          0 (bytes into file)
  Start of section headers:          600 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           0 (bytes)
  Number of program headers:         0
  Size of section headers:           64 (bytes)
  Number of section headers:         14
  Section header string table index: 13
```

- **ELF Header**:
  - Magic: `7f 45 4c 46 ...` (confirms it as an ELF file `45`:`E`, `4c`: `L`,
    `46`: `F`).
  - Type: `REL` (relocatable, not ready to run yet).
  - Machine: `x86_64` (or your system's architecture).
  - Entry Point: None (not applicable for REL files).
  - Section Header Offset: Points to where sections are listed.
  - Program Header Offset: 0 (no segments yet).

#### Section Headers

```txt
Section Headers:
[Nr] Name              Type             Address           Offset
     Size              EntSize          Flags  Link  Info  Align
[ 0]                   NULL             0000000000000000  00000000
     0000000000000000  0000000000000000           0     0     0
[ 1] .text             PROGBITS         0000000000000000  00000040
     000000000000001a  0000000000000000  AX       0     0     1
[ 2] .rela.text        RELA             0000000000000000  00000198
     0000000000000030  0000000000000018   I      11     1     8
[ 3] .data             PROGBITS         0000000000000000  0000005a
     0000000000000000  0000000000000000  WA       0     0     1
[ 4] .bss              NOBITS           0000000000000000  0000005a
     0000000000000000  0000000000000000  WA       0     0     1
[ 5] .rodata           PROGBITS         0000000000000000  0000005a
     000000000000000d  0000000000000000   A       0     0     1
[ 6] .comment          PROGBITS         0000000000000000  00000067
     000000000000001c  0000000000000001  MS       0     0     1
[ 7] .note.GNU-stack   PROGBITS         0000000000000000  00000083
     0000000000000000  0000000000000000           0     0     1
[ 8] .note.gnu.pr[...] NOTE             0000000000000000  00000088
     0000000000000030  0000000000000000   A       0     0     8
[ 9] .eh_frame         PROGBITS         0000000000000000  000000b8
     0000000000000038  0000000000000000   A       0     0     8
[10] .rela.eh_frame    RELA             0000000000000000  000001c8
     0000000000000018  0000000000000018   I      11     9     8
[11] .symtab           SYMTAB           0000000000000000  000000f0
     0000000000000090  0000000000000018          12     4     8
[12] .strtab           STRTAB           0000000000000000  00000180
     0000000000000012  0000000000000000           0     0     1
[13] .shstrtab         STRTAB           0000000000000000  000001e0
     0000000000000074  0000000000000000           0     0     1
```

- `.text`: The machine code for `main`, including a call to `printf` (placeholder
  address).
- `.rela.text`: Relocation entries for unresolved references.
  - Example: “At offset 0x5, fix the call to `printf`.”
- `.rodata`: Read-only data, like the string `"Hello, World!\n"`.
- `.data`: Initialized global variables (none here).
- `.bss`: Uninitialized global variables (none here).
- `.symtab`: Symbol table.
  - `main`: Defined, local, in `.text`.
  - `printf`: Undefined (needs linking).
- `.strtab`: String table for symbol names.

### Inspecting EXEC File

#### ELF Headers

```txt
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x1040
  Start of program headers:          64 (bytes into file)
  Start of section headers:          13496 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         14
  Size of section headers:           64 (bytes)
  Number of section headers:         30
  Section header string table index: 29
```

Headers are similar, except there is a starting point along with file type
being executable.

#### Section Headers

```txt
Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .note.gnu.pr[...] NOTE             0000000000000350  00000350
       0000000000000040  0000000000000000   A       0     0     8
  [ 2] .note.gnu.bu[...] NOTE             0000000000000390  00000390
       0000000000000024  0000000000000000   A       0     0     4
  [ 3] .interp           PROGBITS         00000000000003b4  000003b4
       000000000000001c  0000000000000000   A       0     0     1
  [ 4] .gnu.hash         GNU_HASH         00000000000003d0  000003d0
       000000000000001c  0000000000000000   A       5     0     8
  [ 5] .dynsym           DYNSYM           00000000000003f0  000003f0
       00000000000000a8  0000000000000018   A       6     1     8
  [ 6] .dynstr           STRTAB           0000000000000498  00000498
       000000000000008d  0000000000000000   A       0     0     1
  [ 7] .gnu.version      VERSYM           0000000000000526  00000526
       000000000000000e  0000000000000002   A       5     0     2
  [ 8] .gnu.version_r    VERNEED          0000000000000538  00000538
       0000000000000030  0000000000000000   A       6     1     8
  [ 9] .rela.dyn         RELA             0000000000000568  00000568
       00000000000000c0  0000000000000018   A       5     0     8
  [10] .rela.plt         RELA             0000000000000628  00000628
       0000000000000018  0000000000000018  AI       5    23     8
  [11] .init             PROGBITS         0000000000001000  00001000
       000000000000001b  0000000000000000  AX       0     0     4
  [12] .plt              PROGBITS         0000000000001020  00001020
       0000000000000020  0000000000000010  AX       0     0     16
  [13] .text             PROGBITS         0000000000001040  00001040
       0000000000000113  0000000000000000  AX       0     0     16
  [14] .fini             PROGBITS         0000000000001154  00001154
       000000000000000d  0000000000000000  AX       0     0     4
  [15] .rodata           PROGBITS         0000000000002000  00002000
       0000000000000011  0000000000000000   A       0     0     4
  [16] .eh_frame_hdr     PROGBITS         0000000000002014  00002014
       0000000000000024  0000000000000000   A       0     0     4
  [17] .eh_frame         PROGBITS         0000000000002038  00002038
       000000000000007c  0000000000000000   A       0     0     8
  [18] .note.ABI-tag     NOTE             00000000000020b4  000020b4
       0000000000000020  0000000000000000   A       0     0     4
  [19] .init_array       INIT_ARRAY       0000000000003dd0  00002dd0
       0000000000000008  0000000000000008  WA       0     0     8
  [20] .fini_array       FINI_ARRAY       0000000000003dd8  00002dd8
       0000000000000008  0000000000000008  WA       0     0     8
  [21] .dynamic          DYNAMIC          0000000000003de0  00002de0
       00000000000001e0  0000000000000010  WA       6     0     8
  [22] .got              PROGBITS         0000000000003fc0  00002fc0
       0000000000000028  0000000000000008  WA       0     0     8
  [23] .got.plt          PROGBITS         0000000000003fe8  00002fe8
       0000000000000020  0000000000000008  WA       0     0     8
  [24] .data             PROGBITS         0000000000004008  00003008
       0000000000000010  0000000000000000  WA       0     0     8
  [25] .bss              NOBITS           0000000000004018  00003018
       0000000000000008  0000000000000000  WA       0     0     1
  [26] .comment          PROGBITS         0000000000000000  00003018
       000000000000001b  0000000000000001  MS       0     0     1
  [27] .symtab           SYMTAB           0000000000000000  00003038
       0000000000000240  0000000000000018          28     6     8
  [28] .strtab           STRTAB           0000000000000000  00003278
       0000000000000126  0000000000000000           0     0     1
  [29] .shstrtab         STRTAB           0000000000000000  0000339e
       0000000000000116  0000000000000000           0     0     1
```

- **Sections**

  - `.text`: Now includes `main` plus startup code from `libc`.
  - `.rodata`: Still has `"Hello, World!\n"`.
  - `.plt`: Procedure Linkage Table for dynamic calls (e.g., to `printf`).
  - `.got`: Global Offset Table for dynamic addresses.
  - `.data`, `.bss`: As before, plus any from linked libraries.
  - `.dynamic`: Dynamic linking info (e.g., needed libraries like `libc.so`).
  - `.symtab`: Symbols, though often stripped in release builds.

  To read in depth description of each section, read [this](https://www.muppetlabs.com/~breadbox/software/ELF.txt).

In short, ELF is the backbone of how `eBPF` programs are packaged and loaded.
Understanding it makes you better at writing, debugging, and deploying `eBPF` code.
