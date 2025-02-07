---
title: "Machine Learning Fundamentals"
description: "These are all the fundamentals and basics you need to know for a solid mental model of what
we are doing and why we choose one step over the other."
date: January 25, 2025
---

**TLDR:**\
Training Large Language Models is majorly an **Optimisation Problem**. LLM(s) take
your input, _process_ them and predict the next _likely_ **word**, we want to
make that prediction as _accurate_ as possible. Therefore, during training we want
to minimise the **loss**, where loss is just the difference between **expected**
prediction vs **actual** prediction done by the model.

Each word in the above passage, which is either _italicised_ or **bolded**, has
entire books written on them. But if you think you almost understand what that passage
means, you can skip to the next article in the series.

## Optimisation? what do you mean

- Unserstanding the meaning of each word written above.
- How it is called optimisation.

## How ML systems work

- Input -> Model (Processign) -> Prediction -> Loss calculation -> Optimisation.

## Optimisation algorithms

- Gradient Descent
- Stochastic Gradient Descent

## Final Project

- A Linear Regression model that predicts the Properties price? like the example
  mentioned in ORielly book about machine learning?
