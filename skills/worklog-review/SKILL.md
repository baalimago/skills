---
name: worklog-review
description: Review a worklog phase's implementation against its signed-off interface and critique it in place; reviewing the root is the final sweep that closes the worklog. Use when reviewing a completed phase, auditing an implementation against its interface, or filing review feedback into a worklog. Complements worklog-plan (design), worklog-validate (checking), worklog-work (execution), and worklog-fix (fixing).
license: MIT
metadata:
  version: "2.2"
---

# Worklog review

Audit a `Complete` worklog phase (or `root` when all phases are `Complete`)
against its signed-off interface and record findings in place. [[worklog-plan]]
defines the phase classes and records.

## 1. Verify independently

1. **Determine the round:** Set `round` to 1 plus the highest `R` round in the
   README Findings table or session journal. On round 2+, first verify whether
   each prior finding on this node is resolved, still open, or regressed (mark
   `Regressed` in the Findings table if regressed), and file new findings only
   for regressions or code changed since the previous round.
2. **Run all gates twice:** Run every gate in the Validation policy twice (in
   random order with a fresh seed where supported). If any test differs between
   runs or fails outside a known finding, file a `quality andon` finding `A{nn}`
   and add `A{nn}` to `**Line:**`, then complete the review.
3. **Inspect the code and trace invariants:** Open every file the phase touched.
   For each invariant a clause cites:
   - Locate every function where the invariant must hold.
   - Trace every conditional branch, early return, error path, timeout, retry,
     and loop iteration — starting with failure paths where resources, tokens,
     locks, or state most often leak.
   - Follow captured values all the way to their sink (event, response, or
     storage).

## 2. Check by target

In every class, confirm documentation describing changed behaviour was updated
in the same phase, and check every row of `Acceptance criteria`, `Test cases`,
and `Error management` against its live test or repeatable command.

- **Contract phase:**
  - The written interface matches the phase's `Interface` block token-for-token
    after formatting, and the implementation exposes only declared public
    members.
  - Every clause has a test naming its ID through the interface.
  - Every fake passes the same contract suite (except a stub child used strictly
    for a composition failure clause).
- **Composition phase:**
  - Scenarios run with the real children wired in.
  - Every golden change satisfies its `Golden diff` row and all other goldens
    are untouched.
- **Prune phase:**
  - All goldens are untouched, every listed consumer is re-pointed, and searches
    for removed names return only allowed hits.
- **Root review (once all phases are `Complete`):**
  - Sweep the entire tree: run all gates across all levels, verify end-to-end
    scenarios for every README flow, check all updated documentation, and verify
    that every `Human checks` command has a journal record. If a human check
    record is missing, file a finding owned by `maintainer` and set
    `**Line:** waiting on human: root`.
  - Compare the product against the README Goal, Flows, Scope, and user request.

## 3. Classify findings

Assign each finding a stable ID `R{round}-{nn}` (e.g. `R1-01`), `file:line`, the
unmet clause, a concrete failure scenario (input/state and wrong outcome), and
an actionable checkbox item:

| Severity  | Meaning                                                                                 | Recorded in                            |
| --------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| `blocker` | Enacts, loses, or leaks something forbidden. Reopens the phase.                         | Phase file + README Findings & board   |
| `major`   | Leaves a clause unmet with a reachable wrong result. Reopens the phase.                 | Phase file + README Findings & board   |
| `minor`   | Behaviour is right, but evidence or documentation disagrees.                            | Phase file + README Findings           |
| `note`    | Verified-good invariant or caveat for future contributors.                              | Phase file only                        |

- If an interface itself is missing a clause or cannot carry what a consumer
  needs, file a `design andon` (`A{nn}`, owner `maintainer`) instead of an `R`
  finding.
- If a clause admits two readings, hold the code to the stricter reading and
  file an `R` finding.

## 4. Record in place

Record all results directly in the worklog:

1. **Phase file (`## Review findings`):** Replace `None.` in round 1, or append
   `### Review N, <date>` in later rounds, listing all findings and verified-good
   notes for that phase.
2. **README (`flock -w 30 <worklog>/README.md.lock -c '<edit command>'`):** In a
   single locked read-modify-write:
   - **Status board:** Set `Reopened (review N)` on every phase with a `blocker`
     or `major` finding.
   - **Findings table:** Add one row per `blocker`, `major`, or `minor` finding
     (owner `fix`, or `plan` for cross-phase rules).
   - **Line marker (root review only):** Set `**Line:** done` only when the line
     is `running` and the Findings table has zero `Open` or `Regressed` rows.
   - **Session journal:** Append `date · review · <node> round N <Ready|Not ready> · <commands>: <results>` (or `date · review · done · <commands>: <results>` on a clean root review).
