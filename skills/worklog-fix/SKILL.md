---
name: worklog-fix
description: Fix open findings in a worklog, whether validation findings in its documents, review findings in its code, or quality andons that stopped its line. Use when asked to fix, close, or resolve worklog findings, to restart a stopped line, or to fix a flaky test a worklog surfaced. Changes to interfaces or the tree are worklog-plan.
license: MIT
metadata:
  version: "1.2"
---

# Worklog fix

Close open or regressed findings owned by `fix` (`V` validation findings, `R`
review findings, and `A` quality andons). [[worklog-plan]] defines the records.

## Scope and escalations

Fix implementation bodies, tests, and worklog documents while keeping the
signed-off design and verification bar intact:

- Keep the worklog tree (nodes, parents, classes, phase numbers), interface
  signatures, signed-off clauses, invariants, parameters, Scope items, gates,
  test assertions, and phase table rows at their full strength.
- You may add `Acceptance criteria`, `Test cases`, or `Error management` rows
  that prove what the interface already declares, or update a written interface
  to match its latest signed text verbatim.
- If closing a finding requires changing a tree node, signature, or signed-off
  interface/clause, or weakening a criterion/row:
  - Before the interface sign-off: reassign the finding's owner to `plan` and
    stop.
  - After the interface sign-off: file a `design andon` (`A{nn}`, owner
    `maintainer`), add `A{nn}` to `**Line:**`, and stop.

## Procedure

1. **Select target findings:** If your brief names specific findings and a node,
   work on those. Otherwise check `<worklog>/README.md`:
   - If `**Line:**` is stopped only by `maintainer`-owned andons, report why and
     stop.
   - Take `fix`-owned quality andons first, then `Open` or `Regressed` findings
     on `Reopened` phases, then remaining `fix`-owned findings (`blocker` →
     `major` → `minor`), one node at a time.
2. **Read across phases:** Read `<worklog>/README.md`, the target node's phase
   file, every phase file whose `Consumes` names a member you will touch, and
   the source code. Search for every other occurrence of the same defect class
   across the codebase and fix all of them together.
3. **Run baseline gates:** Run every gate in the Validation policy before making
   changes. Every gate must pass except tests specifically named by the findings
   you are fixing. If any other test fails, file a new `quality andon` (`A{nn}`)
   and either fix it first (if owned by `fix`) or stop (if owned by
   `maintainer`).
4. **Apply fixes by kind:**
   - **`V` findings:** Edit the worklog markdown documents to satisfy the failed
     validation check.
   - **`R` findings:** Fix the implementation and add or update tests through
     the interface that reproduce and prevent the defect.
   - **Quality andons (`A`):** Identify and remove the root cause (correcting
     the cause in the finding summary if misclassified). For flaky tests, fix
     the source of nondeterminism while preserving all assertions, and prove the
     fix by running the test repeatedly (in random order where supported). When
     fixing a `foreign` cause (code outside the worklog), commit it separately
     if commits are enabled, or list the modified files in the closing journal
     line.
5. **Verify and close:**
   - Run every gate in the Validation policy; all must pass.
   - Record `fix-start` and `fix-end` rows in the node's `## Implementation
     notes` table (creating the table if it still says `Not started.`; for
     `root`, record the runs in the journal line instead).
   - Under the README lock (`flock -w 30 <worklog>/README.md.lock -c '<edit>'`):
     1. Set each resolved finding's status to `Closed <commit>` (with `+wip` if
        uncommitted).
     2. Remove closed andon IDs from `**Line:**` (setting `**Line:** running`
        when none remain).
     3. Set a `Reopened` phase back to `Complete` once all findings that
        reopened it are closed.
     4. Append `date · fix · <ids> closed · <commands>: <results>` to the
        session journal.
