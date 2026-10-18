---
name: worklog-plan
description: Design and write a phased implementation worklog (README plus phase files) for a multi-phase effort. Use when asked to plan, design, draft, or create a worklog or phased implementation plan, or to revise a worklog's strategy after validation.
license: MIT
metadata:
  version: "1.2"
---

# Worklog plan

This skill is the author's half of the worklog system. It produces the README
and phase files that [[worklog-validate]] checks, [[worklog-work]] executes
one phase at a time, and [[worklog-review]] audits. The author sees the whole
picture; the executor deliberately does not. Everything an executor must know
that spans phases therefore has to be written down here, in the README.

Use a worklog for a substantial effort that spans phases, sessions, or
contributors. Keep one-off notes and investigations separate.

## Directory layout

One directory per effort at the repository's established worklog location
(or `worklogs/` when none exists):

```
worklogs/<date>-<effort-name>/
  README.md                — shared contract, system diagrams, status board,
                             cross-phase interfaces and readiness checklist
  phase-0-<slug>.md        — optional gate (spike, measurement, decision)
  phase-1-<slug>.md        — contract, acceptance criteria, error coverage
  phase-2-<slug>.md
  ...
```

A gate phase resolves one question before later phases start. Its decision
must be `proceed` before an executor selects a later phase.

Prefer the repository's existing convention. Do not rewrite older worklogs
to match a newer format.

## Design before writing

Do not write phases from a one-line request. Grill the maintainer until the
design is complete, one question at a time, indexed `Q1`, `Q2`, ... Each
question offers concrete options and names the option you recommend and
why. Question premises as well as choices; the goal is the best design, not
obedience. Stop when a further question would not change a phase. Write settled
decisions into the shared contract or owning phase; keep a decisions log only
while the design is actively changing.

Gather evidence before assuming: read the affected code, the existing
architecture notes, and any prior measurement. A claim about an external
system (provider limits, library behavior) that nobody has verified becomes
a gating phase 0 that measures it, not a paragraph that assumes it.

## Two steps, one sign-off between them

Write the worklog in two steps and do not start the second without the
maintainer's explicit approval of the first.

1. **README first.** Write the shared README described below, with every
   phase status `Not Started`. Present it and ask for sign-off. The README
   establishes the whole-system context and rules shared by phases; it is not
   a repository for every phase's implementation detail.
2. **Phases second.** Only after the maintainer signs off, write the phase
   files. Each phase owns its detailed behavior, flows, API/schema details,
   parameters, limits, errors and tests. If a phase reveals a new rule that
   affects several phases, stop and propose that shared contract for the
   README before proceeding. Do not move phase-local details into the README.

Record the sign-off as a session-journal entry with the date. A README
revised after sign-off (a validation `redesign`, a strategy change) is
signed off again before phases are rewritten.

## README contents

The README states the finished design, not the argument that produced it. A
reader should finish it without a second thought about what the system does;
if a sentence invites one, the sentence is wrong. Keep investigations,
measurements and rejected alternatives out — they belong in the session
journal at most, and usually nowhere.

In this order:

1. **Goal** — one paragraph. What changes, and what must stay true.
2. **Glossary** — every term the document leans on, defined once, including
   the ones a reader could look up elsewhere. Executing agents and reviewers
   arrive with no context; a term first used in a diagram and defined three
   sections later has already cost a misreading.
3. **Flows** — the end-to-end sequences, as diagrams, in the repository's
   existing diagram style. These come before any schema or contract because
   they are what a reader needs first: what happens, in what order, between
   which actors. One diagram per distinct trigger — setup, configuration,
   execution — rather than one diagram with branches.
4. **API additions** — every route or public entry point the effort adds:
   method, path, purpose, request fields, and the status or error for each
   outcome. Name the full path everywhere it appears; a path given on one
   call and omitted on the next reads as two different interfaces. Do not
   invent a path segment whose meaning a reader has to guess.
5. **Data model additions** — every table, column, key and index the effort
   adds, and the fate of anything it supersedes. State which field carries
   mutability and which rows are immutable once written.
6. **Status board** — one row per phase: number, link, status, one-line
   outcome. Below it the router sentence: complete in order, plus any gate.
7. **Scope** — what the effort builds and, explicitly, what it does not.
   Name anything an executing agent might otherwise create on its own
   initiative, especially configuration or content a human is meant to
   author. "No phase creates an X" belongs here and in the checklist.
8. **Shared interfaces** — the types and signatures phases hand each other.
   Every type a signature mentions is defined here or in the glossary; a
   function must be able to reach everything it needs through its arguments.
9. **Invariants** — see below. Tables, never prose.
10. **Parameters and owners** — see below.
11. **Definition of success** — measurable, with the evidence that proves it.
12. **Validation policy** — the repository's gates and any explicit
    exception (a manual measurement, a build-tagged acceptance test).
13. **Readiness checklist** — see below.
14. **Session journal** — one dated entry per session, cross-phase narration
    lives only here.

A **decisions log** (`ID | Date | Decision | Rationale | Replaces`) is
optional and worth keeping only while the design is still moving. Once the
design is settled it duplicates the body and ages badly: fold what it still
carries into the sections above and delete it. Never renumber a decision —
reference it by id from elsewhere in the document, and explain any gap left
by one that was absorbed.

A **feedback index** maps each validation or review finding to its closing
edit. Create it with the first finding and keep it while any finding is open.

Ancestor worklogs number their decisions and invariants from one too. Cite
theirs as _ancestor Dn_ and _ancestor In_, never bare, or the ids collide.

## Phase files

Each phase file contains, in order:

1. Title, `**Status:**`, link to the README.
2. **Goal** — one sentence.
3. **Specification** — phase-owned behavior, flows, paths, API/schema details,
   parameters, constraints, invariant and limit tables; a `Human required`
   subsection when needed.
4. **Integration contract** — scenario table: trigger, collaborators or
   fakes, observable result, required side effects, prohibited side
   effects. State `unit-test-only` when there is none.
5. **Acceptance criteria** — table of observable outcomes, each naming the
   test or repeatable command that proves it.
6. **Error coverage** — table from meaningful failure to expected outcome
   and the test for each row.
7. **Implementation notes** — `Not started.` The executor writes here.
8. **Review findings** — `None.` Reviewers append here.

An executing agent reads the README and its phase. The phase must contain
what it needs to implement its work; it must not depend on another phase's local
details. Promote only genuinely shared interfaces and rules to the README.

## Single source of numbers and owners

Every phase-owned default, limit, threshold and tunable lives once in its
owning phase, with a clear name, value and test. The README lists a parameter
only when several phases share it; identify its owner there and have phases
refer to it rather than copy its value. Do not move phase-local evidence or
limits into the README merely because another phase may be interested. The
owning phase also identifies who introduces each config field, flag and
injectable field. Shared interface values belong in the README only when
multiple phases must use them.

## Invariants and limits are tables

An invariant that binds several actors ("every mutation holds the lock",
"every request counts", "every artifact is removed") is a table in the
owning phase: one row per bound actor, the mechanism, the test. Put a
cross-phase invariant in the README only when it constrains multiple phases;
include its proof or point to the owning phase tests. A path that is not a
row does not exist; an executor that needs a new path adds a row first.

Limits and budgets follow the same rule: one row per phase-owned limit naming
the injectable field, its phase-local parameter, and how the test triggers
it. If several phases share a limit, define it once in the README and name
its owner. A limit that no test can reach with an injected value is
untestable and must not be specified.

## Human-required steps

A phase that needs a person (listening, a paid run, credentials, a
judgment call, a machine-local asset) declares a `Human required`
subsection under Specification: the artifact the person produces, the
exact point where the agent stops, and what the agent does before and
after. Any phase whose text mentions listening, manual, or paid without
this subsection is incomplete.

## Verification doctrine

Prove user- or system-visible behavior at the narrowest level that exercises
the real boundary: integration, end-to-end, or contract tests. Prove internal
error handling at the unit boundary. Never replace a specified cross-component
scenario with unit tests on both sides of a mocked seam.

Every acceptance criterion and every error row names its test. A criterion
without citable evidence is not a criterion. Use the repository's own test
tools and gates; do not prescribe a toolchain in the worklog.

Make the final phase a quality-gate sweep: formatter, linter, static
analysis, build, all test levels, and any security or packaging checks.
Honor repository maintenance contracts (docs, generated artifacts, config
references, diagrams) inside the phase that changes the affected code.

## Readiness checklist

The README carries a `Readiness checklist` section: one line per defect
class, each phrased as a check with the command or table that verifies it.
The author runs it before requesting validation and records the outcome in
the session journal. [[worklog-validate]] runs it first and holds findings
outside it to `note` unless an invariant is broken. Minimum lines:

1. Shared diagrams explain the overall system; phase-local sequences and
   measurements appear only in their owning phase.
2. Every test has one owning phase and file list; cross-phase references name
   the owner rather than redeclaring the test.
3. Every phase-local parameter, config field, flag, injectable field, invariant
   and limit has one owner and a test; shared values appear once in the README.
4. Every phase mentioning listening, manual, paid, credentials or a
   machine-local artifact has `Human required`.
5. No phase depends on local detail from another phase or on text scheduled
   for deletion.
6. No phase creates human-owned configuration or content reserved by Scope.
7. New conventions do not contradict existing code conventions (cite the
   file checked).

## Handoff

When the phases are written and the checklist passes: record the run in
the session journal, leave every phase `Not Started`, and hand the README
to [[worklog-validate]]. The
target verdict is `Conditionally ready`. After validation, execution starts
with [[worklog-work]]. A validation or review that reopens the strategy
returns here; fix the class of each finding, not the cited line, and map
every finding ID to its closing edit in the feedback index.
