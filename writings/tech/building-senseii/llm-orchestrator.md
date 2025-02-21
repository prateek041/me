---
title: "LLM Driven Function Orchestrator"
description: "How I implemented Auth in Senseii"
date: November 24, 2024
status: WIP
---

Engineering is all about solving problems, and in the real world, a system
is supposed to just work, because that is all the User cares about. It's
hard to build such systems, I faced numerous issues while building [Senseii](https://www.senseii.in)
but I clawed my way out.

Building an **AI agent** driven system is much harder, LLMs hallucinate, they
are stochastic (probability based), hence the system itself should be
robust enough to handle those issues. One of the biggest issues is getting
the right data to save application state into a traditional SQL/NoSQL Database.

Let's say you have a schema of how a certain piece of information would look in the
database, what are it's properties, what are optional, what is the _type_ of a
specific property and so on. LLMs can miss out on any of those restraints, and the
entire system might crash. I found a cost effective fix for that. I am calling it
**LLM Driven Function Orchestrator** and it is fairly easy to build. Let's dive in.

---

## A brief summary of AI Agents

Imagine an AI Agent as an **LLM**, with access to special tools, which it can use
to perform specific actions. Tools capabilities can range from a simple **Calculator**
, reading from a **file**, running a piece of code in **Code Interpreter** and all
the way to **Function Calling**, that runs any function that you wrote. This is huge
and very generic.

The mental model is quite simple, you start by writing a function in your
preferred programming language, then describe it as a JSON object, along with
a _name_ and a _description_ telling when it would be nice to call this function.
Then, depending on the context and interaction with the user, the LLM decides
what function to call along with generating the arguments for that function.

> Agents don't actually call the function, they tell the system what function
> to call, using it's name, and what arguments to pass to the function, while running
> it. To read more on the implementation, refer the [OpenAI Official Documentation](https://platform.openai.com/docs/assistants/tools/function-calling)

## Problems

### Hallucination in Function Arguments

The arguments an LLM generates, while calling a function, is a **string**, that needs
to be parsed into JSON so that the system can execute the function. It should match
exactly with what the function itself is expecting. A simple type mismatch, missing
properties, etc. can crash the entire system.

### Speed

Another thing to work with is **Making the system fast**, there will be many
instances where one function call might not depend on another, it is better
if the LLM calls all of them, and the system is able to process them in parallel,
instead of executing them one after the other, making the system slow.

## Solution

### Fixing the hallucinations

Models like [GPT-4o mini](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/)
are quite cost efficient, and provide an amazing feature named [structured output](https://platform.openai.com/docs/guides/structured-outputs)
which is a game changer. What it does is straightforward, you define a JSON schema,
and it's the model's responsibility to extract information from chats with the user
that matches exactly with that schema. But there is another issue, these models are
not as good as stronger models like GPT-4o. Hence, we need to find a balance.

#### Use right model for right tasks

How about we split the entire workflow between two models. GPT-4o, for it's general
intelligence and gpt-4o-mini for smaller, cost effective action of generating correct
function arguments. It would be a pipeline that looks like this.

```md
---

| User | -> | GPT-4o | -> | GPT-4o-mini | -> | Running Actual function Code |
```

> Bonus point: You can instruct the GPT-4o mini model to respond with whatever
