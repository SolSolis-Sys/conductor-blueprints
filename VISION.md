# The Missing Layer: Coordination, Memory, and Reusable Workflows for Multi-Agent Orchestration

*Vision document — SolSolis-Sys · 2026-06*

---

## The Problem Is Not in the Agents

Individual LLM agents have become capable. A well-targeted agent can analyze code, write a spec, propose a test plan.

The question is no longer "can the agent do that?" — it's "can we coordinate multiple agents so their combined work is coherent, traceable, and reproducible?"

The answer, without coordination infrastructure, is often no.

Not because agents fail. Because what surrounds them is blind.

An agent dispatched without prior audit can receive an ambiguous prompt and produce exactly what it was asked for — the wrong thing, at scale.

An agent that finishes without a confirmation mechanism can claim it delivered something it never wrote.

Two agents running in parallel can produce contradictory results without either knowing it.

And a session that compacts erases the dispatch history, forcing you to re-derive what was already done.

These problems don't resolve by improving prompts. They are infrastructure gaps.

---

## What Unequipped Orchestration Produces

When you orchestrate multiple agents without a coordination layer, three classes of problems appear systematically.

**Blind coordination.** You dispatch five agents in parallel. One stalls on a permission. Another finishes but wrote nothing to disk. A third produces a result incompatible with the first.

By the time you notice, you've consumed a full session's context budget on a run to redo.

The problem isn't the agent — it's the absence of pre-dispatch audit and execution traceability.

**Implicit transitions.** In a multi-step workflow, one step's output becomes the next step's input. But if that output isn't contractually defined, the transition is blind.

Step N has no obligation to produce a precise format. Step N+1 has no way to verify it receives what it expects.

A gate that fails stops the whole workflow with no alternative. A gate that produces free text where the next expects JSON generates a silent error.

Without dry-run, you discover these problems only after consuming tokens.

**Inter-session amnesia.** An LLM session's context window is transient. Decisions made in a session vanish when it closes.

The next session begins without that context: active conventions, established constraints, ongoing tasks — all erased.

Reconstructing state from code and git history is possible but costly and incomplete: the code doesn't say why a decision was made.

The architectural constraints active at decision time are not preserved.

---

## What We're Building

Our vision is a **composable coordination layer** for multi-agent orchestration in Claude Code.

It's not a framework that hides what's happening. It's not an abstraction that replaces human judgment. It's infrastructure that makes visible, traceable, and reproducible what agents do together.

Three principles guide design decisions.

**Roles are separated.** Coordination is a distinct role from production. An orchestrator that edits files itself conflates responsibility levels.

The coordination layer's role is to plan, dispatch, validate, and archive — not produce.

This separation makes the system auditable and each component's scope clear.

**Contracts are explicit.** Each workflow step must declare what it expects and what it produces. Without contracts, transitions are acts of faith.

With typed contracts, a transition can be validated statically, replayed in simulation, and audited after the fact.

This principle applies to agents, tools, and reusable subroutines.

**Composability is the value.** Each component works alone and integrates naturally with others.

Adding a component must not change the behavior of existing components.

Artifacts defined once — an agent, a tool, a sequence of gates — must be reusable across N workflows without duplication.

---

## Three Dimensions

### Coordination and Traceability — `claude-conductor`

The central problem of multi-agent orchestration is not dispatch. It's what precedes and follows it.

**Before dispatch**, a bad prompt sent to five agents costs five times more than one sent to a single agent. Systematic pre-dispatch audit of a task — by independent perspectives that examine the plan, identify risks and ambiguities — is not bureaucracy.

It's cost management. The cost of pre-audit is always less than the cost of re-dispatch.

There's also a responsibility dimension. A system that dispatches without thinking amplifies errors. Pre-dispatch audit is a verification culture that applies to each orchestration decision.

In a context where agents can write files, run commands, and push code, this culture is not optional.

**During dispatch**, the absence of a task registry forces you to hold state in your head or in the context window. When the context compacts, that state vanishes.

A persistent session registry — which agent works on what, since when, with what result — is the minimum condition for a multi-agent session to stay coherent end-to-end.

**After dispatch**, confirming a deliverable can't rest on the agent's claim. It must rest on the artifact's physical existence.

The distinction between "the agent said it wrote the file" and "the file exists" is the distinction between coordination that hides failures and coordination that makes them visible.

`claude-conductor` is built as a native Claude Code plugin — it exploits the hooks system, session model, and plugin system permissions to integrate without friction, without external dependencies, without extra configuration layers.

### Workflow Capitalization — `conductor-blueprints`

Multi-agent coordination patterns are largely generic. The structure of a TDD cycle, a security audit, a brainstorming session, an adversarial review — these forms are stable across projects.

Re-deriving them each session is a loss of accumulated value. Each team that solves the coordination problem for its use case does so in isolation, without benefiting from others' iterations.

The value of a shared workflow registry isn't just time savings. It's capitalizing collective experience on what works: which agent sequences converge, which audit structures produce reliable results, which exit-condition patterns avoid infinite loops.

But for this capitalization to be reliable, workflows must have **explicit contracts between steps**. A blueprint is not a simple agent configuration file.

It's a sequence of typed gates, where each step declares its type (agent, tool, subroutine), its output contract, and its failure behavior.

A tool-type gate executes deterministically without consuming tokens. An agent-type gate produces output in a declared format. The next gate knows exactly what it gets.

This architecture yields another benefit: **static simulation**. Before running a workflow, you can validate its coherence — resolve all variables, verify contracts between steps, detect circular references — without consuming a single token.

You discover the blueprint is misconfigured before execution, not during.

The Gate → Blueprint → Cookbook hierarchy reflects increasing composition levels: the irreducible unit, the atomic task with explicit input/output, the complete workflow from idea to deliverable.

Each level can be tested, shared, and reused independently.

`conductor-blueprints` is the public registry of these patterns. It provides a library of tested workflows and documents the expected structure so each contributor can add theirs.

It's a commons, not a product — value grows with the number of patterns that converge there.

### Decision Memory — `conductor-memory`

An LLM session's context window is a workspace, not storage. What enters it vanishes when the session closes.

For work spanning multiple sessions — a migration, progressive refactoring, system building — this volatility forces permanent state re-derivation.

Code says what was done. Git history says in what order. But neither says why a decision was made, what constraints were active, what alternatives were rejected.

This decision context exists only in the session where it was established. Without persistence, it's lost.

`conductor-memory` is a structured persistence layer for this decision context. Its model is intentionally limited: it doesn't store agent outputs or execution logs.

It stores **decision episodes** — moments when a convention was set, a constraint enacted, a direction chosen.

This limitation is a design choice: substituting memory for code reading would be wrong. Memory complements code; it doesn't replace it.

Persistence is hook-driven: each session, recent episode context is injected automatically. The next session begins with the thread of past decisions, not a blank page.

---

## A Note on Claude Code Grounding

These components are not generic LLM frameworks. They're designed specifically for Claude Code affordances: the hooks system (SessionStart, Stop, PostToolUse), the plugin model, permission management, skills and agents systems.

This specificity is a deliberate choice.

A generic framework should abstract these mechanisms. These components exploit them directly. Claude Code's affordances — especially how hooks execute in response to session events, and how plugins integrate without a build step — are primitives expressive enough to build a complete coordination layer without extra abstraction.

There's also a practical consequence to this grounding: these tools were built by using them.

`conductor-blueprints` contains blueprints that served to build `conductor-blueprints`. `conductor-memory` was designed in sessions it needed to solve amnesia for.

This dogfooding signal — a tool solid enough to serve its own construction — is the most direct validation form.

---

## What Composition Makes Possible

Each component addresses a distinct gap. It's not a unitary framework because there isn't a unitary problem.

Blind coordination, implicit transitions, and inter-session amnesia are three independent problems deserving independent, composable solutions.

Composition yields a property no single component can: an orchestration session that knows what it does, why it does it, and what it costs.

`conductor` coordinates and validates. `blueprints` provides proven patterns with their contracts. `memory` maintains decision continuity across sessions.

`token-watch` instruments cost in real time so dispatch decisions are informed by budget state, not made in the dark.

Integration is direct: `token-watch` writes metrics after each stop hook. `conductor` reads them before each dispatch to check if available context suffices for the chosen blueprint.

The dispatch decision becomes an informed decision, not a bet.

---

## This Document

This text is both an external vision document — for anyone seeking to understand why these components exist — and an internal reminder of the principles that guided their design.

The choices we made must remain legible in the final architecture, even as implementation details evolve: composability over monolithism, explicit contracts over implicit conventions, decision memory over complete logs, native grounding over generic abstraction.

---

*Source repos:*
- *[github.com/SolSolis-Sys/claude-conductor](https://github.com/SolSolis-Sys/claude-conductor)*
- *[github.com/SolSolis-Sys/conductor-blueprints](https://github.com/SolSolis-Sys/conductor-blueprints)*
- *[github.com/SolSolis-Sys/conductor-memory](https://github.com/SolSolis-Sys/conductor-memory)*
