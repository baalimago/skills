---
name: worklog-system
description: Overview of the worklog system and its four lifecycle skills. Use to learn the worklog layout, phase lifecycle, and contract rules, or to choose between worklog-plan (design), worklog-validate (checking), worklog-work (execution), and worklog-review (audit).
license: MIT
metadata:
  version: "1.1"
---

# Worklog system

The worklog system turns a multi-phase change into a durable, reviewable queue
that people and coding agents share across sessions. It separates design from
execution. An author writes the whole contract before work starts; an executor
reads the shared README and one phase only.

Use the system when an effort spans phases, sessions, or contributors. Keep
one-off notes and investigations outside the worklog.

## One lifecycle, one skill per verb

| Step     | Skill                | Use when                                                             |
| -------- | -------------------- | -------------------------------------------------------------------- |
| plan     | [[worklog-plan]]     | No worklog exists, or validation reopens the strategy.               |
| validate | [[worklog-validate]] | A worklog must be checked before execution or after a change.        |
| work     | [[worklog-work]]     | A phase is `Not Started` or `Reopened`.                              |
| review   | [[worklog-review]]   | A phase is claimed `Complete`, or an implementation must be audited. |

This skill is the map. Load the skill for the current step before you act. Do
not plan, work, and review in one pass.

A `[[skill-name]]` annotation, as used above, names a sibling skill in this
collection. It is a reading pointer, not a link; no tool resolves it. Load
that skill when its step applies.

## Layout

One directory per effort at the repository's established worklog location
(`worklogs/` when none exists):

```text
worklogs/<date>-<effort>/
├── README.md                — shared contract and router
├── phase-0-<gate>.md        — optional gate: spike, measurement, decision
├── phase-1-<name>.md        — one isolated contract
└── phase-2-<name>.md
```

A gate phase resolves one question first. Later phases start only when its
decision is `proceed`.

Prefer the repository's existing convention. Do not rewrite older worklogs to
match a newer format.

## Two documents, two readers

The README is the only document that spans phases. It holds the goal, glossary,
flows, API and data-model additions, status board, scope, shared interfaces,
invariants, parameters with owners, definition of success, validation policy,
readiness checklist, and session journal. Every rule and value that more than
one phase needs lives here, once.

A phase file is an isolated contract: goal, specification, integration
contract, acceptance criteria, error coverage, implementation notes, and review
findings. The executor reads the README and only its own phase, so a phase
must not depend on another phase's local detail. A dependency that appears
during execution is a planning defect: report it, do not read around it.

The author sees everything; the executor deliberately does not. This is why
planning is two steps: the maintainer signs off on the README before any phase
file exists.

## Phase lifecycle

```text
Not Started → In Progress → Complete
                    ↑             │
                    └─ Reopened ─┘
```

An agent selects the first `Not Started` or `Reopened` phase on the status
board, unless the README records a different order or a gate. It sets the
phase `In Progress`, does only that phase, records evidence, and updates the
board and the session journal in the same session. A `blocker` or `major`
review finding sets `Reopened (review N)` and keeps the phase open until the
finding is fixed and verified.

## Contracts and evidence

The specification is the promise. An acceptance criterion is complete only
when a named test or repeatable command proves it and that command ran. Prove
user-visible behavior at the real boundary the integration contract names;
prove internal error handling at the unit boundary. Never replace a
cross-component scenario with unit tests on both sides of a mocked seam.

## Rules that make rounds converge

- **One source of numbers.** Each default, limit, and threshold lives once,
  in its owner, with a test. Shared values are in the README; phase-local
  values are in the owning phase. Phases refer to a value by name and never
  copy it.
- **Invariants and limits are tables.** One row per bound actor or limit, with
  the mechanism, the injectable field, and the test. A path without a row does
  not exist.
- **Human required.** A phase that needs a person names the handoff artifact
  and the exact point where the agent stops.
- **Readiness checklist.** The README carries one check per defect class. The
  author runs it before validation; the validator runs it first.
- **Findings have stable IDs and severities, and live in place.** Validation
  uses `V{n}-{nn}`, review uses `R{n}-{nn}`. Severity is `blocker`, `major`,
  `minor`, or `note`; `blocker` and `major` reopen a phase. IDs never change,
  and a new round reports each earlier ID as resolved, open, or regressed.
- **Fix the class, not the line.** A revision converges only when it removes
  the class of the finding.

## Handoff

Planning hands the README to validation. Validation targets the verdict
`Conditionally ready`; zero findings is not the bar. Work executes one
eligible phase at a time. Review audits the code, reruns the gates, and files
findings in the affected phase and in the README feedback index. A `blocker`
or `major` finding reopens its phase; a validation or review that overturns
the shared design returns to [[worklog-plan]].
