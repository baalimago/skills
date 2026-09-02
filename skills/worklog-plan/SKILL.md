---
name: worklog-plan
description: Design and write a phased implementation worklog (README plus phase files) for a multi-phase effort. Use when asked to plan, design, draft, or create a worklog or phased implementation plan, or to revise a worklog's strategy after validation. Execution is worklog-work; checking is worklog-validate.
license: MIT
metadata:
  version: "1.1"
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
  README.md                — router: status board, strategy, parameters,
                             decisions, readiness checklist, journal, feedback
  phase-0-<slug>.md        — optional gate (spike, measurement, decision)
  phase-1-<slug>.md        — contract, acceptance criteria, error coverage
  phase-2-<slug>.md
  ...
```

Prefer the repository's existing convention. Do not rewrite older worklogs
to match a newer format.

## Design before writing

Do not write phases from a one-line request. Grill the maintainer until the
design is complete, one question at a time, indexed `Q1`, `Q2`, ... Each
question offers concrete options and names the option you recommend and
why. Question premises as well as choices; the goal is the best design, not
obedience. Stop when a further question would not change a phase. Record
every answer that shapes the plan as a decisions-log row.

Gather evidence before assuming: read the affected code, the existing
architecture notes, and any prior measurement. A claim about an external
system (provider limits, library behavior) that nobody has verified becomes
a gating phase 0 that measures it, not a paragraph that assumes it.

## Two steps, one sign-off between them

Write the worklog in two steps and do not start the second without the
maintainer's explicit approval of the first.

1. **README first.** Write the complete README: goal, status board with
   phase names and one-line outcomes but every status `Not Started`,
   strategy, parameters and owners, decisions log, definition of success,
   readiness checklist. Present it and ask for sign-off. Everything that
   spans phases is decided here, so a README the maintainer disagrees with
   would invalidate every phase written from it.
2. **Phases second.** Only after the maintainer signs off, write the phase
   files from the approved README. A phase may not introduce a parameter,
   invariant, or decision the README lacks; if writing a phase reveals one,
   stop, propose the README change, and get it approved before continuing.

Record the sign-off as a session-journal entry with the date. A README
revised after sign-off (a validation `redesign`, a strategy change) is
signed off again before phases are rewritten.

## README contents

In this order:

1. **Goal** — one paragraph.
2. **Status board** — one row per phase: number, link, status, one-line
   outcome. Below it the router sentence: complete in order, plus any gate.
3. **Strategy** — evidence the design rests on; the non-negotiable
   invariants; the reference evidence (a recording, dataset, fixture)
   identified by content such as a hash and format, never by a machine
   path; shared interfaces between phases; the severity taxonomy.
4. **Parameters and owners** — see below.
5. **Readiness checklist** — see below.
6. **Decisions log** — `ID | Date | Decision | Rationale | Replaces`.
7. **Definition of success** — measurable, with the evidence that proves it.
8. **Validation policy** — the repository's gates and any explicit
   exception (a manual paid measurement, a build-tagged acceptance test).
9. **Feedback index** — one entry per validation or review round mapping
   each finding ID to the edit or decision that closed it.
10. **Session journal** — one dated entry per session, cross-phase
    narration lives only here.

## Phase files

Each phase file contains, in order:

1. Title, `**Status:**`, link to the README.
2. **Goal** — one sentence.
3. **Specification** — concrete behavior, paths, interfaces, constraints;
   invariant and limit tables; a `Human required` subsection when needed.
4. **Integration contract** — scenario table: trigger, collaborators or
   fakes, observable result, required side effects, prohibited side
   effects. State `unit-test-only` when there is none.
5. **Acceptance criteria** — table of observable outcomes, each naming the
   test or repeatable command that proves it.
6. **Error coverage** — table from meaningful failure to expected outcome
   and the test for each row.
7. **Implementation notes** — `Not started.` The executor writes here.
8. **Review findings** — `None.` Reviewers append here.

An executing agent reads the README and only its phase. Anything a phase
needs from another phase is promoted to the README, never cross-referenced.

## Single source of numbers and owners

Every default, limit, threshold, and tunable lives once, in the README
parameters table: `Parameter | Default | Owner`. Phase files refer to rows
by name and never restate a value. The only numerals allowed in a phase
file are oracle data inside an integration-contract row. The Owner column
also names, for every config field, flag, and injectable field, the single
phase that introduces it.

Numbers stated twice drift; a validator that finds one value in two places
has found a defect.

## Invariants and limits are tables

An invariant that binds several actors ("every mutation holds the lock",
"every request counts", "every artifact is removed") is a table in the
owning phase: one row per bound actor, the mechanism, the test. A path that
is not a row does not exist; an executor that needs a new path adds a row
first. Prose invariants are how one branch silently escapes.

Limits and budgets follow the same rule: one row per limit naming the
injectable field, the README parameter, and how the test triggers it. A
limit that no test can reach with an injected value is untestable and must
not be specified.

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

1. No numerals in phase files outside oracle rows. Reference command,
   tuned to the repository's units:
   `grep -nE '(^|[^=])\b[0-9]+([.,][0-9]+)? ?(s|ms|MB|%)\b' phase-*.md`
2. Every test name is declared in exactly one phase and one file list.
3. Every config field, flag, and injectable field has one owner.
4. Every invariant and limit is a table with a test per row.
5. Every phase mentioning listening, manual, or paid has `Human required`.
6. No phase references text scheduled for deletion.
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
