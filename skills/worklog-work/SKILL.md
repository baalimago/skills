---
name: worklog-work
description: Execute the next eligible phase of a signed-off worklog, bracketed by full gate runs that stop the line on any failure. Use when asked to implement, continue, or pick up a worklog phase. Designing is worklog-plan; checking is worklog-validate; auditing is worklog-review; fixing findings is worklog-fix.
license: MIT
metadata:
  version: "3.2"
---

# Worklog work

Execute one eligible phase of a signed-off worklog and record the result.
[[worklog-plan]] defines the phase classes and records.

## Reading scope and locking

Read only `<worklog>/README.md`, your assigned phase file, and the source code
of the members listed in your phase's `Consumes` section. Treat consumed source
code as the source of truth for earlier phases. If a gate fails, read the
failing test, the code it runs, and its git history to classify the cause.

Hold an exclusive lock for every edit to `README.md` (status board, findings,
journal, and `**Line:**` marker), and release it before running gates or tests:

    flock -w 30 <worklog>/README.md.lock -c '<edit command>'

## 1. Select the phase

If your brief names an `In Progress` phase, resume it from the last row of its
Implementation notes. Otherwise check `README.md` in order:

1. **Line:** Require `**Line:** running`; otherwise report the line status and stop.
2. **Clean queue:** If any phase is `Reopened` or any `fix`-owned finding is
   `Open` or `Regressed`, stop and report that [[worklog-fix]] must run first.
3. **Resume or pick next:** Resume an `In Progress` phase, or select the
   lowest-numbered `Not Started` phase covered by an interface sign-off whose
   `Consumes` phases are all `Complete`.
4. **Done:** If all phases are `Complete`, stop and report that the root review
   is next.

## 2. Run start gates

Run every gate in the README Validation policy and append a `start` row to the
phase's Implementation notes table (including on resume).

- **All pass:** Set the phase to `In Progress` on the status board if not
  already set.
- **Any fails:** Pull the quality andon cord:
  1. Add finding `A{nn}` with severity `quality andon`, summary
     `<cause> · <gate> · <failing tests> · <commit>`, and owner `maintainer`
     (for environment causes) or `fix` (all other causes).
  2. Set `**Line:** stopped by A{nn}` (appending to any existing IDs) and stop.

## 3. Execute by class

Update any documentation that describes the behaviour you change in this phase.
Keep tests written by earlier phases intact. Commit only if requested by the
brief or repository rules.

IMPORTANT: Before starting, be sure to read follow AGENTS.md.

- **Contract:**
  1. Write the phase's `Interface` block (interface, data types, and doc
     clauses) verbatim to its target path (token-identical after formatting).
  2. Write a single parametrised contract test suite that runs against every
     implementation (including fakes), with at least one test per clause naming
     the clause ID it proves. Cover every `Acceptance criteria` and `Error
management` row with its named test.
  3. Implement the interface until the suite passes.
- **Composition:**
  1. Capture any pre-existing golden the phase needs that is not yet on disk.
  2. Wire the real child implementations to satisfy the parent interface and run
     the scenarios in `Test cases` (using a contract-breaking stub child only
     where a failure clause specifies one). Cover every `Acceptance criteria`
     row.
  3. Regenerate goldens: confirm every changed golden matches its `Golden diff`
     row and all other goldens remain unchanged.
- **Prune:**
  1. Delete every member in the `Removes` table and re-point every listed
     consumer.
  2. Cover every `Acceptance criteria` row, confirm all goldens remain
     unchanged, and verify a search for each removed name returns only its
     allowed hits.

### Exceptions during execution

- **Human required:** If the phase has a `Human required` section, complete all
  work up to the named handoff point, record `date · work · phase N waiting on
human` in the journal, set `**Line:** waiting on human: phase N`, and stop.
- **Design andon:** If completing the phase or any table row requires changing a
  signed-off interface, clause, or tree node, or requires an input absent from
  the README, phase file, and consumed code, pull the design andon cord: file
  `A{nn}` with severity `design andon` and owner `maintainer` naming the member
  and missing requirement, add `A{nn}` to `**Line:**`, leave the phase `In
Progress`, and stop.

## 4. Finish and record

1. Verify every row in `Acceptance criteria`, `Test cases`, and `Error
management` passes its named test or repeatable command.
2. Run the full gate suite **twice** (in random order with a fresh seed where
   supported).
   - If a test added by this phase fails, or a failure traces to code this phase
     changed, fix it and re-run both passes.
   - If any other test fails or results differ between the two passes, pull the
     quality andon cord as in step 2 and stop.
3. Update `## Implementation notes` in the phase file (append `+wip` to the
   commit hash when the working tree is dirty; omit `Surprises` when empty):

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

4. Under the README lock, set the phase to `Complete` on the status board and
   append `date · work · phase N Complete` to the session journal.
