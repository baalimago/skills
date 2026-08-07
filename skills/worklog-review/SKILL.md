---
name: worklog-review
description: Review a phased worklog implementation against its contract and critique it in place. Use when reviewing a completed or in-progress phase, auditing an implementation against its spec, or filing review feedback into a worklog. Complements worklog-work, which owns planning, execution, and fixing.
license: Proprietary
metadata:
  version: "1.0"
---

# Worklog review

Review the code an executing agent produced against the contract the worklog
promised, and record the critique **in the worklog itself** — the README and the
affected phase files — so the next contributor routes off it. This skill is the
review half of [[worklog-system]]; that skill owns layout, lifecycle, phase-file
shape, and fixing. Read it first if the structure is unfamiliar.

The review is worthless if it only reads the implementation notes. Notes report
what the author believes they did. A review establishes what the code actually
does. Those differ precisely where defects live.

## Stance: verify independently

- **Re-run the gates yourself.** Formatter, linter, static analysis, build, unit
  tests, integration tests — whatever the repository requires. A claimed "all
  pass" is a hypothesis until you reproduce it. Cite the commands you ran and
  their outcomes in the verdict.
- **Read the code, not the summary.** Open every file the phase touched. Trace
  the real call paths. Confirm each acceptance criterion against a citable test
  that exercises the real boundary, not a mock that could pass on both sides of a
  severed seam.
- **Record verified-good, not just faults.** "I confirmed X holds on every path"
  is information the next reviewer should not have to re-derive.

## Technique: trace the invariant through every branch

Most missed defects are not wrong lines — they are correct lines on a path
nobody enumerated. For each invariant the worklog asserts ("X is captured on
every path", "Y is always released", "Z is idempotent"):

1. Name the functions where X must hold.
2. Enumerate **every** conditional branch, early return, error path, retry, and
   loop iteration in them.
3. Confirm X holds on each — especially the failure, empty-result, timeout, and
   retry branches. Guarantees are dropped there far more often than on the happy
   path, and those branches are usually the least tested.
4. Follow the value to its destination. Capturing a value is not recording it: a
   field set at the source but discarded by the event/response/writer that
   carries it is still a leak. Chase it to the sink.

This is what separates a real review from a skim. When a resource is costly or
safety-critical (spend, tokens, locks, money, PII), assume the failure branches
are where it leaks and start there.

## Findings

- Stable ID per finding: `R{round}-{nn}` (e.g. `R1-07`). IDs never get reused or
  renumbered across rounds.
- Severity from the repository's taxonomy (define one in the README if absent).
  State which severities reopen a phase — normally everything but a minor,
  non-blocking note.
- Precise reference: `file:line`, and the exact contract clause or acceptance
  criterion left unmet.
- Phrase as actionable work with a checkbox, so the fixer can close it directly.
- Give a concrete failure scenario: the input or state, and the wrong result or
  cost it produces. "Undercounts on retry" beats "retry looks fragile".

## Record it in place

Never write a standalone review document — a second source of truth the next
agent will not read. Everything lands in the worklog, in the same change:

1. **Affected phase file** — append `## Review findings (review N, date)` with
   the findings that concern that phase, plus what you verified good. If the
   phase was specced with a task it did not fully meet, say so there: the phase's
   own Goal/AC missed the branch.
2. **README status board** — reflect the true status of each reviewed phase. A
   phase whose contract is unmet is no longer done; annotate the row (or set
   `Reopened (review N)`) and point to where the fix is tracked. A stale
   completion status is how defects survive.
3. **README feedback index** — one row per finding: ID, severity, phase link,
   one-line summary. This is the review's table of contents.
4. **README decisions log** — a `Review N` entry: the commands you re-ran and
   their results, the overall verdict, and cross-cutting observations that are
   not themselves single findings.
5. **Elevate new cross-phase invariants.** When the review discovers a rule that
   spans phases (often the root cause behind several findings), promote it into
   the README Strategy section so future phases inherit it — do not leave it
   buried in one phase's findings.

## Verdict

State plainly whether the work is ready. "Ships clean through the gates" and
"correct" are different claims; do not let green gates stand in for a verdict.
If it is not ready, say so and let the findings carry the reasons.

## Consolidating the fix: reopen vs. addendum

Two ways to route the fixes; the choice is the maintainer's:

- **Reopen the affected phases** when each fix is local to its phase and an agent
  can resolve it within that phase's reading contract.
- **Add a single addendum phase** (e.g. a new final phase) when the fixes are
  many, small, and cross-cutting, or share a design decision. This keeps the
  executing agent's two-file reading contract clean — they read the README and
  the addendum phase, which references the originals — instead of juggling
  several reopened phases at once. Annotate the original board rows to point at
  the addendum.

Either way the feedback index points at where the work now lives, and the
executing agent picks up the first non-complete phase off the board.

## Rounds

Reviews are numbered. A later review that revisits earlier findings uses the
next round number and its own `R{n}-*` IDs; it also records whether prior
findings were resolved, still open, or regressed. The worklog thus carries the
full review history in one place.
