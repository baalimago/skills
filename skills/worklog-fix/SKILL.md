---
name: worklog-fix
description: Fix open findings in a worklog, whether validation findings in its documents, review findings in its code, or quality andons that stopped its line. Use when asked to fix, close, or resolve worklog findings, to restart a stopped line, or to fix a flaky test a worklog surfaced. Changes to interfaces or the tree are worklog-plan.
license: MIT
metadata:
  version: "1.0"
---

# Worklog fix

Close findings owned by `fix`. [[worklog-validate]] files `V` findings
against the documents, [[worklog-review]] files `R` findings against the
code, and [[worklog-work]] or [[worklog-review]] files `A` findings when the
line stops. [[worklog-plan]] defines these records. Unlike an executor, a
fixer reads across phases, because a defect rarely stays inside one.

## Scope

A fix changes bodies, never the design or the bar:

- Never change the tree: nodes, parents, classes, or numbers.
- Never change a signature: member names, parameters, or types.
- After the interface sign-off, never change an interface or a clause, except
  to make the written interface match the latest signed text verbatim.
- Never delete or weaken an invariant, a parameter, a Scope item, or a gate
  in the Validation policy.
- Never weaken a test's assertions. A flaky test keeps its assertions; its
  cause is fixed.

A finding that needs any of these is owned by `plan`. After the interface
sign-off it is a design andon: file it as [[worklog-work]] describes and
stop.

## Selecting

1. If the line is stopped only by andons owned by `maintainer`, do nothing.
2. If the line is stopped by a quality andon owned by `fix`, fix that first.
3. Otherwise take the open and regressed findings owned by `fix`: those of
   `Reopened` phases first, then blockers, majors, and minors, one node at a
   time.

## Reading

Read the README, the phase file of the finding's node, every phase file
whose `Consumes` names a member you will touch, and the code. Fix the class,
not the cited line: search for every other occurrence of the same defect and
fix those as well.

## Baseline

Before changing anything, run every gate. Everything must pass except the
tests the findings you are fixing name. Any other failure is a new quality
andon: file it, then fix it first, or stop if its owner is `maintainer`.

## Fixing by kind

- **`V` findings:** edit the documents. When every blocker and major `V`
  finding owned by `fix` is closed, hand the worklog back to
  [[worklog-validate]] for the next round.
- **`R` findings:** fix the code, and add or correct the tests through the
  interface that should have caught the defect. A `Reopened` phase returns to
  `Complete` only when every finding that reopened it is closed.
- **Quality andons:** find the cause and remove it, as [[worklog-plan]]'s
  Andon cords describes for its cause; when the recorded cause is wrong,
  correct it in the summary before closing. A flaky test is a defect: find
  why it is nondeterministic and fix that. Prove the fix by running the test
  repeatedly, in random order where the runner allows, and record the runs.

## Closing

Run every gate. All must pass. Then close each finding as [[worklog-plan]]'s
Records describes, and add `fix-start` and `fix-end` rows to the node's
Implementation notes in the shape [[worklog-work]] defines. When the notes
still say `Not started.`, start the table; when the node is `root`, put the
two runs in the journal line instead:
`date · fix · V2-03, R1-01 closed · <commands>: <results>`.
