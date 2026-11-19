---
name: worklog-system
description: Overview of the interface-based worklog system and router to its five lifecycle skills. Use to learn what a worklog is, or to choose between worklog-plan (design), worklog-validate (checking), worklog-work (execution), worklog-review (audit), and worklog-fix (repair).
license: MIT
metadata:
  version: "2.1"
---

# Worklog system

The worklog system turns a multi-phase change into a durable, reviewable queue
shared across sessions and coding agents. A worklog is a package of phases, and
each phase implements one interface. The maintainer signs off **what** the
system will do; agents own **how** it is built and verified.

## Lifecycle

Load the single skill for the current step:

| Step        | Skill                   | Use when                                                                                   |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| plan        | [[worklog-plan]]        | Designing a worklog, writing phases, changing the tree or a signature, or resetting a design andon. |
| validate    | [[worklog-validate]]    | Checking a planned worklog before the maintainer signs off its interfaces.                 |
| work        | [[worklog-work]]        | The line is `running`, all `fix`-owned findings are closed, and an eligible phase exists.  |
| review      | [[worklog-review]]      | Auditing a `Complete` phase, or running the final root review once all phases complete.    |
| fix         | [[worklog-fix]]         | Repairing a `Reopened` phase or closing an open/regressed finding owned by `fix`.          |
| orchestrate | [[worklog-orchestrate]] | Driving the whole lifecycle end-to-end by spawning one subagent worker per step.           |

`[[skill-name]]` names a sibling skill in this collection.

## Source of truth

[[worklog-plan]] defines the worklog model, file templates, interface kinds,
clauses, phase tables (`Acceptance criteria`, `Test cases`, `Error management`),
phase classes (`contract`, `composition`, `prune`), records (status board,
`**Line:**` marker, findings, session journal, sign-offs), andon cords, and
design-andon resets. Follow the repository's existing worklog convention for
older worklogs.
