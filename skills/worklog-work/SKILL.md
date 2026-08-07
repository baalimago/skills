---
name: worklog-work
description: Create, execute and update phased implementation worklogs. Use for multi-phase work planning, and phase execution. For review, see worklog-review.
license: MIT
metadata:
  version: "1.1"
---

# Worklog system

Use an implementation worklog for a substantial effort that spans phases,
sessions, or contributors. It is the durable source of truth for the plan,
current state, verification evidence, and review feedback.

Keep unrelated investigations or one-off notes separate from implementation
worklogs; they do not share this lifecycle.

## Directory layout

Create one directory per effort at the repository's established worklog
location (or `worklogs/` when none exists):

```
worklogs/<date>-<effort-name>/
  README.md                — status board, strategy, decisions, session journal,
                             and feedback index
  phase-1-<slug>.md        — contract, acceptance criteria, implementation notes,
                             and review findings
  phase-2-<slug>.md
  ...
```

Prefer the repository's existing naming convention and template. Do not
silently convert or rewrite older worklogs merely to match a newer format.

## Reading contract

**An executing agent reads the README and only the phase file it is working
on.** It does not need to read other phase files. Shared invariants, ordering
constraints, dependencies, and decisions belong in the README's Strategy
section. If a phase requires details from another phase, promote those details
to the README instead of normalizing broad context loading.

A reviewer reads the README, the phase files being reviewed, and the relevant
code and tests.

## Lifecycle

Phase statuses are `Not Started` → `In Progress` → `Complete`. A review that
finds a material unmet contract changes the status to `Reopened (review N)`.

The README status board mirrors every phase's status and a one-line summary.
It is the router for the next contributor: select the first incomplete or
reopened phase unless the strategy records a different dependency order. Keep
it truthful; a stale completion status hides defects.

Define the severity taxonomy in the README when the repository does not
already have one. State which severities reopen a phase; normally every finding
except a minor, non-blocking one reopens it.

## Phase files

Each phase file contains, in order:

1. Title, `**Status:**`, and a link to the README.
2. **Goal** — one sentence.
3. **Specification** — concrete behavior, affected paths or components,
   interfaces, constraints, and evidence behind important decisions.
4. **Integration contract** — scenario table covering inputs or triggers,
   collaborators or fakes, externally observable results, required side
   effects, and prohibited side effects. If the phase has no integration
   behavior, explicitly state `unit-test-only`.
5. **Acceptance criteria** — independently checkable outcomes.
6. **Error coverage** — a matrix from meaningful failure conditions to the
   expected error, recovery, or externally visible failure outcome, with a
   test for each row.
7. **Implementation notes** — written by the executing agent.
8. **Review findings (review N, date)** — appended by reviewers.

Tailor the contract to the system: API responses, messages, files, database
state, UI behavior, command output, and metrics are all valid observable
outcomes.

## Verification doctrine

Prove user- or system-visible behavior with the narrowest test level that can
exercise the real boundary, normally an integration, end-to-end, or contract
test. Prove internal error handling at the appropriate unit or component
boundary. Do not replace a specified cross-component scenario with unit tests:
mocked seams can let both sides pass while the real integration is broken.

Every checked acceptance criterion cites the test or other repeatable evidence
that proves it. A checked criterion without citable evidence is not complete.
Use the repository's established test tools, commands, and quality gates; do
not prescribe a language or toolchain in this skill.

## Implementation notes are deltas

Record only deviations from the specification, surprises, decisions made while
implementing, and verification commands actually run with their results. Do
not restate completed specification items. Start with session identity and a
timestamp. Put cross-session narration in the README session journal once,
rather than duplicating it across phases.

## Fixing findings

Work one reopened phase at a time. Implement the fix, check its finding,
record an implementation-notes delta, and return the phase to `Complete` only
when all findings that require reopening are resolved and verified. Update the
README status board and feedback index in the same session.

## Project maintenance and quality gates

Honor repository-specific maintenance contracts in the same change as the
affected code, such as documentation, generated artifacts, configuration
references, migration records, or architectural diagrams. Discover these from
the repository guidance and affected files; record applicable obligations in
the phase specification.

Make the final phase a quality-gate sweep. Run the repository's formatter,
linter, static analysis, build, unit tests, integration tests, and any required
security or packaging checks that apply to the change. Record the exact
commands and outcomes in the implementation notes.
