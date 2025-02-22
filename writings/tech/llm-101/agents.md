---
title: "AI Agents"
description: "How I implemented Auth in Senseii"
date: November 24, 2024
status: WIP
---

AI Agents have access to tools, these tools perform specific actions that
includes using a calculator, getting data from a specific API (like the
weather API), run a specific piece of code through **Code Interpreter**
etc. But there is something quite generic, it's called **Function
Calling**, that let's you execute any function you have written.

The mental model is quite simple, you start by writing a function in your
preferred programming language, then describe it as a JSON object, along with
a _name_ and a _description_ telling when it would be nice to call this function.
Then, depending on the context and interaction with the user, the LLM decides
what function to call along with generating the arguments for that function.

> To read more about the actual implementation, reference
> the official OpenAI documentation on [Function Calling](https://platform.openai.com/docs/assistants/tools/function-calling).

To see some of the functions we used in [Senseii](https://www.senseii.in), check
out this [file](https://github.com/Senseii-ai/senseii-backend/blob/05b534098a4e00e31cea39d9b1eb7fbc41d5e821/src/services/openai/assistants/core/constants.ts#L6).

The thing we are trying to build is more complex and robust, because
LLMs do not work great out of the box, and they are stochastic, which means
they are not going to work/think the same always, hence the system itself needs
to be robust enough to prevent things from failing, otherwise a small piece of
invalid data can crash the entire system. For example.

The arguments LLM generates, while calling a function, is a **string**, that needs
to be parsed into JSON and it should match exactly with what the function itself
is expecting. A simple type mismatch in the arguments can crash the system.

Another thing to work with is **Making the system fast**, there will be many
instances where one function call might not depend on another, it is better
if the LLM calls all of them, and the system is able to process them in parallel,
instead of executing them one after the other, making the system slow.
