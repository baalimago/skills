---
name: worklog-system
description: Overview of the interface-based worklog system and router to its five lifecycle skills. Use to learn what a worklog is, or to choose between worklog-plan (design), worklog-validate (checking), worklog-work (execution), worklog-review (audit), and worklog-fix (repair).
license: MIT
metadata:
  version: "2.0"
---

# Worklog system

The worklog system turns a multi-phase change into a durable, reviewable queue
that people and coding agents share across sessions. A worklog is a package of
phases, and each phase implements one interface. The maintainer signs off
**what** the system will do; agents own **how** it is done and the proof that
it works.

Use the system when an effort spans phases, sessions, or contributors. Keep
one-off notes and investigations outside the worklog.

## One lifecycle, one skill per verb

| Step     | Skill                | Use when                                                                    |
| -------- | -------------------- | --------------------------------------------------------------------------- |
| plan     | [[worklog-plan]]     | No worklog exists, a finding needs a tree or signature change, or a design andon must be reset. |
| validate | [[worklog-validate]] | A planned worklog must be checked before its interfaces are signed off.     |
| work     | [[worklog-work]]     | The line is `running`, nothing is open for fix, and a phase can be selected. |
| review   | [[worklog-review]]   | A phase is `Complete`, or every phase is and the root needs its final sweep. |
| fix      | [[worklog-fix]]      | A phase is `Reopened`, or a finding owned by `fix` is open.                 |

This skill is the map. Load the skill for the current step before you act. Do
not plan, work, review, and fix in one pass.

A `[[skill-name]]` annotation, as used above, names a sibling skill in this
collection. It is a reading pointer, not a link; no tool resolves it. Load
that skill when its step applies.

## Where things are defined

[[worklog-plan]] is the single definition of the model, the file templates,
interface kinds and clauses, phase classes, the records (statuses, the `Line`
marker, findings, the journal, sign-offs), andon cords, and design-andon
resets. The other skills reference it; this skill repeats none of it.

Prefer the repository's existing worklog convention. Do not rewrite older
worklogs to match a newer format.
