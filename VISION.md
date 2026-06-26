# The Missing Layer: Coordination, Memory, and Reusable Workflows for Multi-Agent Orchestration

*Vision document — 2026-06*

---

## The Problem Is Not the Agents

Individual LLM agents have become capable. A well-scoped agent can analyze code, draft a specification, propose a test plan. The question is no longer "can the agent do that?" — it's "can we coordinate multiple agents so their combined work is coherent, traceable, and reproducible?"

Without coordination infrastructure, the answer is often no.

Not because agents fail. Because what surrounds them is blind. An agent dispatched without prior audit can receive an ambiguous prompt and produce exactly what it was asked for — which is the wrong thing, at scale. An agent that completes without a confirmation mechanism can declare a deliverable it never wrote. Two agents working in parallel can produce contradictory results without either knowing. And a session that compacts erases its dispatch history, forcing re-derivation of what was already done.

These problems are not solved by improving prompts. They are infrastructure gaps.

---

## What Uncoordinated Multi-Agent Orchestration Produces

When multiple agents are orchestrated without a coordination layer, three classes of problems appear systematically.

**Blind coordination.** You dispatch five agents in parallel. One stalls on a permission. Another completes but has written nothing to disk. A third produces a result you cannot reconcile with the first. By the time you notice, you've consumed an entire session's context budget on a run that needs redoing. The problem is not the agent — it's the lack of pre-dispatch audit and execution traceability.

**Implicit transitions.** In a multi-step workflow, one step's output becomes the next's input. But if that output is not contractually defined — if step N has no obligation to produce a specific format, and step N+1 has no way to verify it receives what it expects — the transition is blind. A gate that fails halts the entire workflow with no fallback. A gate that produces free text where the next expects JSON generates a silent error. Without dry-runs, you discover these problems after consuming tokens.

**Cross-session amnesia.** An LLM session's context window is transient. Decisions made during a session — which conventions are active, what constraints were established, which tasks are in progress — vanish at session close. The next session begins with no context. Reconstituting state from code and git history is possible but costly, and incomplete: code does not say *why* a decision was made, or what architectural constraints were active when it was made.

---

## What We Are Building

Our vision is a **composable coordination layer** for multi-agent orchestration in Claude Code. Not a framework that hides what's happening. Not an abstraction that replaces human judgment. Minimal infrastructure that makes visible, traceable, and reproducible what agents do together.

Three principles guide our design decisions.

**Roles are separated.** Coordination is a distinct role from production. An orchestrator that edits files itself conflates levels of responsibility. The coordination layer's role is to plan, dispatch, validate, and archive — not produce. This separation is not bureaucratic overhead: it's what makes the system auditable and each component's scope legible.

**Contracts are explicit.** Each step in a workflow must declare what it expects and what it produces. Without contracts, transitions between steps are acts of faith. With typed contracts, a transition can be validated statically, replayed in simulation, and audited post-hoc. This principle applies equally to agents, tools, and reusable subroutines.

**Composability is the value.** Each component must work alone and integrate naturally with others. Adding a component must not change existing components' behavior. And artifacts defined once — an agent, a tool, a sequence of gates — must be reusable across N workflows without duplication.

---

## The Three Dimensions

### Coordination and Traceability — `claude-conductor`

The central problem of multi-agent orchestration is not dispatch. It's what precedes dispatch and what follows it.

**Before dispatch**, a bad prompt sent to five agents costs five times more than a bad prompt sent to one. Systematic audit of a task before dispatch — by independent perspectives that examine the plan, identify its risks and ambiguities — is not bureaucracy. It's cost management. The cost of pre-dispatch audit is always lower than the cost of a re-run.

There is also a responsibility dimension. A system that dispatches without deliberation is a system that amplifies errors. Audit-before-dispatch is not just a cost optimization — it's a verification culture applied to every orchestration decision. In a context where agents can write files, execute commands, and push code, this culture is not optional.

**During dispatch**, the absence of a task registry forces state to be maintained in short-term memory or the context window. When context compacts, that state disappears. A persistent session registry — which agent works on what, since when, with what result — is the minimum requirement for a multi-agent session to stay coherent end-to-end.

**After dispatch**, confirming a deliverable cannot rest on the agent's claim. It must rest on the artifact's physical existence. The distinction between "the agent said it wrote the file" and "the file exists" is the distinction between coordination that masks failures and coordination that makes them visible.

`claude-conductor` is built as a native Claude Code plugin — it exploits the hooks system, session model, and plugin system permissions to integrate frictionlessly, without external dependencies or additional configuration layers.

### Workflow Capitalization — `conductor-blueprints`

Multi-agent coordination patterns are largely generic. The structure of a TDD cycle, a security audit, a brainstorming session, an adversarial review — these forms are stable across projects. Re-deriving them each session wastes accumulated value. Every team that solves the coordination problem for its specific use case does so in isolation, without benefiting from others' iterations.

The value of a shared workflow registry is not just time savings. It is collective capitalization on what works: which agent sequences converge, which audit structures produce reliable results, which exit-condition patterns avoid infinite loops.

But for this capitalization to be reliable, workflows must have **explicit contracts between their steps**. This is why a blueprint is not just an agent configuration file — it is a sequence of typed gates, where each step declares its type (agent, tool, subroutine), its output contract, and its failure behavior. A tool-type gate executes deterministically without consuming tokens. An agent-type gate produces output in a declared format. The next step knows exactly what it receives.

This architecture enables another benefit: **static simulation**. Before executing a workflow, you can validate its coherence — resolve all variables, verify contracts between steps, detect circular references — without consuming a single token. You discover the blueprint is misconfigured before execution, not during it.

The hierarchy Gate → Blueprint → Cookbook reflects increasing levels of composition: the indivisible unit, the atomic task with explicit input/output, the complete workflow from idea to deliverable. Each level can be tested, shared, and reused independently.

`conductor-blueprints` is the public registry of these patterns. It serves two purposes: provide a library of tested workflows, and document the expected structure so contributors can add theirs. It's a commons, not a product — value grows with the number of converging patterns.

### Decisional Memory — `conductor-memory`

An LLM session's context window is a workspace, not storage. What enters it disappears when the session closes. For work spanning multiple sessions — a migration, incremental refactoring, system construction — this volatility forces permanent re-derivation of state.

Code says what was done. Git history says the order. Neither says *why* a decision was made, what constraints were active then, what alternatives were rejected. This decisional context exists only in the session where it was established. Without persistence, it is lost.

`conductor-memory` is a structured persistence layer for this decisional context. Its model is intentionally limited: it does not store agent outputs or execution logs. It stores **decisional episodes** — moments when a convention was established, a constraint actioned, a direction chosen. This limitation is a design choice: substituting memory for code reading would be an error. Memory complements code; it does not replace it.

Persistence is hook-driven: each session, recent episodic context is injected automatically. The next session begins with the thread of past decisions, not a blank page.

*This component is in active development. Its public API will be stabilized before release.*

---

## A Note on Claude Code Grounding

These components are not generic LLM frameworks. They are designed specifically for Claude Code's affordances: the hooks system (SessionStart, Stop, PostToolUse), the plugin model, permission management, the skills and agents system. This specificity is deliberate.

A generic framework should abstract these mechanisms. These components exploit them directly. The reason: Claude Code's affordances — particularly how hooks respond to session events and how plugins integrate without a build step — are sufficiently expressive primitives to build a complete coordination layer without additional abstraction.

There is also a practical consequence to this grounding: these tools were built by using them. `conductor-blueprints` contains blueprints that helped construct `conductor-blueprints`. `conductor-memory` was designed in sessions whose amnesia it needed to solve. This dogfooding signal — a tool robust enough to serve its own construction — is, we believe, the most direct form of validation.

---

## What Composition Enables

Each component addresses a distinct gap. This is not a monolithic framework because there is no single problem: blind coordination, implicit transitions, and cross-session amnesia are three independent problems deserving independent, composable solutions.

Composition produces a property no single component can: an orchestration session that knows what it does, why it does it, and what it costs. `conductor` coordinates and validates. `blueprints` provides proven patterns with their contracts. `memory` maintains decisional continuity across sessions. `token-watch` instruments cost in real time so dispatch decisions are informed by budget state, not made in darkness.

Integration is direct: `token-watch` writes metrics after every stop hook. `conductor` reads them before dispatch to verify available context suffices for the selected blueprint. Dispatch becomes an informed decision, not a gamble.

---

## This Document

This text is both an external vision document — for anyone seeking to understand why these components exist — and an internal reminder of the principles that guided their design. The choices we made (composability over monolithic design, explicit contracts over implicit conventions, decisional memory over complete logs, native grounding over generic abstraction) must remain legible in the final architecture, even as implementation details evolve.

---

*Source repos:*
- *[github.com/SolSolis-Sys/claude-conductor](https://github.com/SolSolis-Sys/claude-conductor)*
- *[github.com/SolSolis-Sys/conductor-blueprints](https://github.com/SolSolis-Sys/conductor-blueprints)*
- *`conductor-memory` — publication planned (active development)*
