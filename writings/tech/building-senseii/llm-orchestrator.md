---
title: "LLM Driven Function Orchestrator"
description: "Learn about my LLM-driven function orchestrator, which makes AI Agent driven systems Fast, Autonomous, Robust and Self Correcting"
date: November 24, 2024
status: WIP
---

Engineering is all about solving problems, and in the real world, a system
is supposed to just work, because that is all the User cares about. It's
hard to build such systems, I faced numerous issues while building [Senseii](https://www.senseii.in)
but, there is always a solution.

Building an **AI agent** driven system is much harder, LLMs hallucinate, they
are stochastic (probability based), hence the system itself should be
robust enough to handle those issues. Some of the biggest use cases include

- Getting the right data to save application state into a traditional
  **SQL/NoSQL Database**.
- Making sure the system is following the **proper flow** of the Business Logic.
  You wouldn't want to go to the payment step before adding items to the cart
  right?
- LLMs are mostly hosted by their providers, and your own system makes API calls
  to them, we want the entire system to be **As Fast As Possible**.

I built a **cost effective**, **fast**, **autonomous** and **self correcting** system.
I am calling it **LLM Driven Function Orchestrator** and it is fairly easy to
build. Let's dive in.

---

## A brief summary of AI Agents

Imagine an AI Agent as an **LLM**, with access to special tools, which it can use
to perform specific actions. Tools capabilities can range from a simple **Calculator**
, reading from a **file**, running a piece of code in **Code Interpreter** and all
the way to **Function Calling**, that runs any function you wrote using a
programming language of your choice.

The mental model is quite simple, you start by writing a function in your
preferred programming language, then describe it as a **JSON** object, along with
a _name_ and a _description_ telling when it would be nice to call this function.
Then, depending on the context and interaction with the user, the LLM decides
what function to call along with generating the arguments for that function.

> Agents don't actually call the function, they tell the system what function
> to call, using it's name, and what arguments to pass to the function, while running
> it. To read more on the implementation, refer the [OpenAI Official Documentation](https://platform.openai.com/docs/assistants/tools/function-calling)

## Problems

### Hallucination in Function Arguments

The arguments an LLM generates while calling a function is a **string**, that needs
to be parsed into JSON so that the system can execute the function. It should match
exactly with what the function itself is expecting. A simple type mismatch, missing
properties, etc. can crash the entire system. The system should make sure that
the functions are being called with **Correct Arguments**.

### Following the proper flow of the application

In any Software, there is a certain flow that needs to be followed. For example,
in **Senseii**, whenever user defined their goal, the AI Agent picks their intent
and classifies the goal in one of the many flows that the application supports.

Currently Senseii only supports **Weight Gain**, **Weight Loss** and **Maintain**
Workflows where each flow has certain steps to follow. So, if the user
mentions that they want to loose weight. The weight loss flow looks like this:

- **Collect** user information like Current weight, height, gender (and a lot more).
- **Save** that information in the database **in that order**.
- **Calculate** Health Metrics like **BMI**, **BMR**, **TDEE** etc. using the
  information the user provided.
- **Generate/Re-Generate** Plans for them using their Health metrics, preferences
  etc.

If this flow is not followed, the system can crash. If the AI Agent tries to
calculate Health Metrics before saving user information and preferences in the database,
the actual function calculating Health Metrics will not get any information and the
**Math will Fail**. So, we need to make a system that makes sure the proper
flow is being followed.

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
| User | ----> | GPT-4o | ----> | GPT-4o-mini | ----> | Running Actual Function Code |
```

This makes sure user is getting access to one of the finest models, while smaller,
cost effective models are making sure that the system itself does not crash.

> Bonus point: You can instruct the GPT-4o-mini model to respond with whatever information
> is missing from the chats, so that the main model, GPT-4o can know about it, and
> get that information from the user itself.

### Self Correcting System

An Agentic system can have a lot of functions, that do different things. For example,
**Senseii** majorly has 14 functions attached to different agents, which is not huge,
but still, very important to speed up the process. An AI agent can call multiple
functions at the same time, but all of those functions cannot be called in
parallel, and all the functions shouldn't be called in series either as it will
slow down the system.

Let's continue from the example I gave in the problem section above, when calculating
**Health Metrics** for the user. The entire flow mainly consists of two function
calls.

- Save User Information in the database after asking them right questions (**save_user_info**).
- Calculate Health Metrics (**calculate_health_metrics**).

**calculate_health_metrics** is a function, that explicitly picks user data from
the database, run mathematical formulae for calculating **BMI**, **BMR**
and **TDEE** and saves it in the database (for next steps). What if the user
information is missing from the database? What if the agent forgot to call the
**save_user_info** function and directly tried to calculate the Health Metrics?
Normally, the system will fail. But, the solution is extremely straightforward.

The function simply returns a string, that looks like

> User Basic Information not
> found in the Database, either extract it from the user or if already extracted,
> save them in the database, and then try again.

This simple string response can recalibrate the flow of the system, and make sure
that proper flow is being followed. This approach scales infinitely! Any function
that depends on pre-existing information from the database, to process and generate
something new out of it, can tell the system to **_"Think again, I need this information
which does not exist, maybe you missed a step"_**.

Senseii does this, here is an [example](https://github.com/Senseii-ai/senseii-backend/blob/main/src/services/scientific/metrics.calculator.ts#L56)

### Parallel function dispatcher

AI Agents can use multiple tools at the same time, they do not care if the functions
need to be run in a specific sequence, they just tell the system _"I need outputs
of these functions, tell me as fast as you can"_. It is the system's responsibility
to make sure the entire thing is fast.

There can be two types of functions in an AI Agent driven system

- Dependent on some previous steps
- Totally Independent

There is no point in running the independent functions in series. In fact, the implemented
system in **Senseii** treats all the functions as independent and calls them all
in parallel, hence the name, **Parallel Function Dispatcher**.

#### Why Parallel function dispatcher works

Internally, the system has a Map, that contains all the functions supported by an
agent, here is the [TypeScript Object](https://github.com/Senseii-ai/senseii-backend/blob/05b534098a4e00e31cea39d9b1eb7fbc41d5e821/src/services/openai/assistants/functions.ts#L10)
holding functions supported by **Senseii**. When the Agent decides to run functions,
it dispatches all the functions in parallel, waits for all the responses and then
proceeds with the submitted function outputs.

For a language like **TypeScript** it can be as simple as executing all the functions
asynchronously, and resolving all the **Promises** through `promise.all`
([example from Senseii](https://github.com/Senseii-ai/senseii-backend/blob/05b534098a4e00e31cea39d9b1eb7fbc41d5e821/src/services/openai/utils.ts#L197))

Functions that ran successfully, return a response, notifying their successful run,
failed functions respond with the errors, telling the agent where it failed, and
how to fix it, just like our above example, where the **calculate_health_metrics**
function told the agent about missing user information and instructions to run the
**save_user_info** function.

This makes the system truly **intelligent**, **autonomous**, **fast** and **self
correcting**.

### Conclusion

**LLM Driven Function Orchestrator** is at the core of **Senseii**, it makes the
system truly

- **Intelligent**, by making it aware of what things failed, and how to correct them.
- **Autonomous**, no need of human interaction, the AI Agent decides the best
  course of action for the user.
- **Fast**, processing all the tools in parallel makes the entire system faster.
- **Self Correcting**, It corrects itself, any missed steps, API errors,
  internal system errors rely on **model intelligence** to self correct and
  also give the user necessary information of **what went wrong**.

I did not go too much in the code implementation since it is publically
available in the [Senseii Github Repo](https://github.com/Senseii-ai/senseii-backend),
I am open to discussions and testing the edges of this orchestrator, so please
feel free to reach out to me.
