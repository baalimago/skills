---
name: worklog-work
description: Execute the next eligible phase of a signed-off worklog, bracketed by full gate runs that stop the line on any failure. Use when asked to implement, continue, or pick up a worklog phase. Designing is worklog-plan; checking is worklog-validate; auditing is worklog-review; fixing findings is worklog-fix.
license: MIT
metadata:
  version: "3.1"
---

# Worklog work

This skill is the executor's half of the worklog system. [[worklog-plan]]
defines the phase classes and the records (statuses, the `Line` marker,
findings, the journal); read it when they are unfamiliar. This skill selects
one phase, does exactly that phase, and records the result. Fixing findings
is [[worklog-fix]].

## Reading contract

Read the README, your phase file, and the code of every member your phase
consumes. Earlier phases have already written those interfaces, so the code
is the source of truth. Never read another phase file. A need that the
README, your phase, and that code do not answer is a design andon. When a
gate fails, you may also read the failing test, the code it runs, and its
history, only to classify the cause.

## Selecting

1. **Line.** If the line is not `running`, do nothing. Report why and stop.
2. **Open work for fix.** If any phase is `Reopened`, or any finding owned by
   `fix` is open or regressed, stop: [[worklog-fix]] runs first.
3. **Resume.** If a phase is `In Progress`, resume it from the last row of its
   Implementation notes.
4. **Next.** Otherwise take the lowest-numbered `Not Started` phase that an
   interface sign-off covers and whose consumed phases are all `Complete`.
5. **None.** If every phase is `Complete`, the next step is the root review
   by [[worklog-review]]. Otherwise report what blocks selection and stop.

## Start gates

Run every gate in the Validation policy, the full set, and write a `start`
row whatever the result; a resumed phase runs them again and adds another. If
any fails, pull the quality cord: add an `A{nn}` finding with severity
`quality andon` and the summary [[worklog-plan]]'s Records defines, owned by
`maintainer` when the cause is environment and by `fix` otherwise. Add its ID
to the `Line` marker and stop. Fix nothing. Otherwise set the phase
`In Progress`.

## Execute by class

**Contract.**

1. Write the interface, its data types, and its clauses verbatim to the path
   the phase names. Verbatim means token-identical after the repository's
   formatter.
2. Write the phase's Test cases rows through the interface only. The contract
   suite is one suite, parametrised over every implementation including any
   fake, with at least one test per clause, and each test names the id of the
   clause it proves. Reach every Acceptance criteria and Error management row
   by its named test; a row the phase cannot satisfy is a design andon.
3. Implement until the tests pass.

**Composition.** Capture any golden the phase needs that does not exist yet,
from the code as it stands. Wire the children to meet the interface and run
the scenarios in the phase's Test cases table with the real children; a
failure clause may use the stub child [[worklog-plan]] allows. Reach every
Acceptance criteria row. Regenerate the goldens: every change must satisfy its
golden-diff row, and no other golden may change.

**Prune.** Remove each member in the Removes table and re-point each
consumer. No golden changes, and a search for each removed name finds nothing
outside its allowed hits. Reach every Acceptance criteria row.

In every class, edit the documents that describe the behaviour you change,
in this phase. Never edit a test another phase wrote. Commit only when the
maintainer or the repository's guidance asks you to.

## Design andon

Stop if the phase cannot be completed without changing a signed-off
interface, a clause, or the tree, or needs something the README, your phase,
and the consumed code do not provide. Add an `A{nn}` finding with severity
`design andon`, owner `maintainer`, naming the member and what it lacks; add
its ID to the `Line` marker; leave the phase `In Progress`; and stop.

Never edit an interface to make progress, and never work around one with an
undeclared member.

## Human required

Do everything before the point the `Human required` section names, then hand
off as [[worklog-plan]] describes and stop. Never fabricate the artifact or
skip the step.

## Finishing

Walk the phase's Acceptance criteria, Test cases, and Error management tables
and confirm every row against its named test or repeatable command. A row the
phase cannot satisfy, or a test the plan named that cannot be written, is a
design andon.

Run every gate twice, in random order with a fresh seed where the runner
allows. When a test this phase added fails, or a failure traces to code this
phase changed, fix it and run both again. Any other failure, or a test whose
result differs between the two runs, is a quality andon: pull the cord as in
Start gates. Never tamper with a gate; [[worklog-plan]]'s
Andon cords section lists what that means.

When every gate passes and the line is still `running`, set the phase
`Complete` and add a journal line: `date · work · phase N Complete`.

## Implementation notes

Replace `Not started.` with this shape and no other, or append to the table
when one exists:

```markdown
| Run   | Commit      | Command                      | Result                |
| ----- | ----------- | ---------------------------- | --------------------- |
| start | abc1234     | make check-lint && make test | 2145 passed, 0 failed |
| end   | abc1234+wip | make check-lint && make test | 2151 passed, 0 failed |
| end   | abc1234+wip | make check-lint && make test | 2151 passed, 0 failed |

Andon: none.
Surprises:
- `alembic` autogenerate misses the composite index; written by hand.
```

Run is `start`, `end`, `fix-start`, `fix-end`, or `replan`. Add `+wip` to the
commit when the working tree has uncommitted changes. `Andon:` lists every
cord pulled at this node, or `none`. Omit `Surprises` when there are none, and
keep each to one line. Do not restate the interface or narrate the work.
