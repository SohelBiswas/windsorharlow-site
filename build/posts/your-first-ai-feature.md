---
title: Your first AI feature: pick one task, ground it in your data, measure it
date: 2026-11-01
order: 2
category: AI & ML
cover: ai
service: ai
summary: A practical way to get from "we should use AI" to a feature people trust, in about four weeks, without betting the quarter on it.
---
Most companies want to "do something with AI". Far fewer have a clear first project. The usual result is a chatbot demo that impresses in a meeting, then quietly gets switched off because nobody trusts its answers.

There is a more reliable way to start. Pick one task, ground the AI in your own documents, and decide in advance how you'll measure whether it works. This post walks through that approach.

## 1. Pick one task, not a platform

A good first task has four things going for it:

- **It happens often.** Dozens or hundreds of times a week, so small savings add up.
- **It's mostly reading and writing text.** Answering policy questions, summarising tickets, pulling fields out of invoices, drafting replies.
- **A person can check the result quickly.** If checking takes as long as doing the work, you've saved nothing.
- **A wrong answer is annoying, not dangerous.** Start where mistakes are cheap and easy to catch.

"Help our support team answer delivery and returns questions from our policies" is a good first task. "An AI that runs customer service" is not; it's ten projects pretending to be one.

## 2. Ground it in your own documents

Language models are fluent, and fluent is not the same as correct. Ask one about your returns policy and it will produce a confident answer based on what returns policies usually say, which may not be yours.

The standard fix is called **retrieval-augmented generation**, or RAG. It works in two steps:

1. **Retrieve.** When a question comes in, search your own documents for the few passages most likely to contain the answer.
2. **Generate.** Give the model the question *and* those passages, and instruct it to answer only from them, cite them, and say so when they don't contain the answer.

The second instruction matters as much as the first. An assistant that says "I can't find that in our documents" is one people learn to trust. One that always has an answer is one they learn to double-check, which defeats the point.

> You can see the retrieval step working on our [AI & ML page](../services/ai.html#demo). Ask the sample handbook a question and it shows which passages it found, how relevant each one is, and when it refuses to answer.

## 3. Write the test before you build

Before writing any code, collect 30 to 50 real questions with the answers a good employee would give. Include a few questions the documents *can't* answer. This set becomes your scorecard.

For every question, check three things:

- **Correct**: does the answer match what a good employee would say?
- **Grounded**: does it cite the passage the answer actually came from?
- **Honest**: when the documents don't cover it, does it decline instead of guessing?

Run the whole set after every change: a new prompt, a different model, a change to how documents are split. Without it, every tweak is a guess. With it, you can say "we went from 31 to 44 out of 50" and mean it.

## 4. Handle privacy, access and cost from day one

These are easier to design in than to bolt on later:

- **Keep data in your own accounts** where you can, and choose providers and settings that don't use your data to train their models.
- **Respect permissions.** If an employee can't open a document, the assistant shouldn't quote it to them. Apply access rules at the retrieval step.
- **Log questions and answers**, with sources, so you can review failures and improve the test set.
- **Measure cost per answer.** Smaller, cheaper models are often good enough for classification and extraction; save the large ones for writing.

## 5. A four-week pilot

This is roughly how we run a first AI project:

1. **Week 1: pick and prepare.** Agree on the task, gather the documents, write the test set.
2. **Week 2: build a working prototype.** Retrieval over your documents and answers with sources, running in your own cloud account.
3. **Week 3: measure and harden.** Run the test set, fix the failures, add guardrails for refusals, privacy and cost.
4. **Week 4: real users, real decision.** Put it in front of a small group, review what happened, and decide whether to scale it, change it or stop.

At the end you have a working prototype, a test set you own, measured results and a cost per answer. That's enough to make a real decision, which a demo never gives you.

## Where to go from here

If you have a task in mind, the fastest next step is to write down twenty questions people ask about it and where the answers live today. That's already half of week one.

When you're ready, [tell us about it](../contact.html) and we'll help you shape the pilot.
