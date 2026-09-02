---
name: worklog-work
description: Execute the next eligible phase of an existing phased worklog, or fix reopened findings in one. Use when asked to implement, continue, pick up, or fix a worklog phase. Designing a worklog is worklog-plan; checking it is worklog-validate; auditing the result is worklog-review.
license: MIT
metadata:
  version: "2.0"
---

# Worklog work

This skill is the executor's half of the worklog system. [[worklog-plan]]
owns the layout, the README contents, and the phase-file shape; read it only
when the structure is unfamiliar. This skill owns selecting a phase, doing
exactly that phase, recording evidence, and fixing findings.

## Reading contract

**Read the README and only the phase file you are working on.** Shared
invariants, parameters, ordering, and decisions live in the README's
Strategy and Parameters sections. If your phase needs something from another
phase, that is a planning defect: record it in the session journal and
promote the detail to the README rather than reading around it.

A reviewer reads the README, the phase files under review, and the code.

## Router and lifecycle

Phase statuses are `Not Started` → `In Progress` → `Complete`. A review that
finds a material unmet contract sets `Reopened (review N)`.

Select the first `Not Started` or `Reopened` phase on the README status board
unless the README records a different order or a gate (a phase 0 whose
decision must be `proceed`). Set the phase `In Progress` at the start and
update the board at the end of the session; a stale status hides defects.

Do not re-plan. A phase is executed as specified; a specification that turns
out to be wrong or incomplete is reported, not silently improved. Record the
gap in the session journal, leave the phase `In Progress`, and stop.

## Human required

A phase may carry a `Human required` subsection naming an artifact a person
must produce and the exact point where the agent stops. Do everything before
that point, record the handoff in the session journal, and stop there. Never
fabricate the artifact or skip the gate.

## Evidence

Every acceptance criterion you check cites the test or repeatable command
that proves it, and that test ran. A checked criterion without citable
evidence is not complete. Prove visible behavior at the real boundary named
by the integration contract; do not substitute unit tests on both sides of a
mocked seam. Invariant and limit tables in the phase are executed row by
row: every row's test exists and passes before the phase is complete.

Use the repository's own test tools and gates exactly as configured. Do not
alter timeouts, counts, race flags, or add skips to make a gate pass.

## Implementation notes are deltas

Start with session identity and a timestamp. Record only deviations from
the specification, surprises, decisions made while implementing, and the
verification commands actually run with their results. Do not restate the
specification. Cross-session narration goes in the README session journal
once.

## Fixing findings

Work one reopened phase at a time. Implement the fix, check its finding,
record an implementation-notes delta, and return the phase to `Complete`
only when every finding that reopened it is resolved and verified. Update
the README status board and feedback index in the same session. When a
finding exposes a cross-phase rule, promote the rule to the README Strategy
section rather than fixing it locally.

## Project maintenance and quality gates

Honor repository maintenance contracts in the same change as the affected
code: documentation, generated artifacts, configuration references,
migration records, diagrams. The phase specification lists the ones known
at planning time; discover the rest from repository guidance.

When the selected phase is the quality-gate sweep, run the repository's
formatter, linter, static analysis, build, every test level, and any
security or packaging checks. Record the exact commands and outcomes in the
implementation notes.
