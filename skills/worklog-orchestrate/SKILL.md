---
name: worklog-orchestrate
description: Drive a whole worklog from a signed README to a reviewed, user-accepted implementation by spawning one cheap worker per lifecycle step. Use when asked to run, orchestrate, or automate an entire worklog, to take a worklog to done, or to send its phases to subagents. Planning is worklog-plan, one phase is worklog-work, checking is worklog-validate, auditing is worklog-review, repair is worklog-fix.
license: MIT
metadata:
  version: "1.2"
---

# Worklog orchestrate

## Goal

Drive a worklog from a signed README to a user-accepted implementation by
spawning one subagent worker per lifecycle step.

- **Stay in this skill.** Each worker loads its own step skill; the glossary
  below defines every record you need to route work.
- **Lock `README.md` for every edit:**
  `flock -w 30 <worklog>/README.md.lock -c '<edit command>'`
- **Talk to the user in plain words.** Ask one question at a time with concrete
  options and a recommendation. Contact the user for the three sign-offs
  (README, interfaces, feature), human checks, and design andons. Write a
  `maintainer` journal line only after the user answers.

## Glossary

| Term           | Meaning                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Worklog        | A directory with `README.md` (status board, findings, journal, flows, facts) and one phase file per phase.      |
| Node           | A phase, a sub-package, or `root`.                                                                              |
| Line           | The `**Line:**` marker above the status board (`running`, `done`, `waiting on human: <node>`, or `stopped by …`). |
| Gate           | A command in the README Validation policy. Workers run all gates at the start and end of every step.            |
| Finding        | A row in the Findings table: ID (`V` validation, `R` review, `A` andon), severity, node, owner, and status.     |
| Andon          | A `quality andon` or `design andon` finding that stops the line until closed.                                   |
| Sign-off       | A `date · maintainer · <stage> signed` journal line for the README, the interfaces, or the feature.             |
| Eligible phase | A `Not Started` phase covered by the interface sign-off whose `Consumes` phases are all `Complete`.             |
| Fleet          | Up to 4 concurrent executors running on eligible phases that touch disjoint files and share no gate or fixture. |

## Roles and briefs

Each worker starts from a clean slate and sees only the brief you send it.
Include in every brief:
1. Goal (two sentences) and target (`<worklog>/README.md` and node).
2. Skill to load.
3. Paths the worker may read and edit.
4. The items from `Worker reports back` below (ask for a concise reply containing only these items).

| Role          | Skill & Model                | Brief instructions                                                                                                         | Worker reports back                                                            |
| ------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| planner       | [[worklog-plan]] (cheap)     | Write missing phases for `<worklog>/README.md`. Edit worklog markdown files only.                                          | Phases written, any andon pulled.                                              |
| checker       | [[worklog-validate]] (cheap) | Validate the named phases in `<worklog>/README.md`.                                                                        | Round number, `Ready` or `Not ready`, finding IDs filed.                       |
| executor      | [[worklog-work]] (cheap)     | Resume `In Progress` phase N. Edit only `<paths>`.                                                                         | Phase status, gate commands and results, any andon, ≤5 lines of surprises.     |
| reviewer      | [[worklog-review]] (cheap)   | Review node N. Hold the README lock for board, findings, and journal edits.                                                | Verdict (`Ready` or `Not ready`), gate results, each finding (`id`, severity, `file:line`, summary). |
| fixer         | [[worklog-fix]] (cheap)      | Close `<ids>` on node N.                                                                                                   | Closed finding IDs, gate commands and results.                                 |
| root reviewer | [[worklog-review]] (strong)  | Run the root review on `<worklog>/README.md`. Compare the product against the README Goal, Flows, Scope, and user request. | Verdict, gate results, any gaps between the product and the spec/user request. |

If an executor, reviewer, or fixer replies without its gate results, respawn it
once with a clearer brief.

## Procedure

1. **Read and sign off the README.** Read `<worklog>/README.md` (read phase
   files only to check `Consumes`, interface path, and class for routing). If
   `date · maintainer · README signed` is absent from the journal, ask the user
   to review the README and approve before writing the line.
2. **Plan and validate phases.** Every status-board row needs a phase file and
   a covering `Ready` verdict.
   - If phase files are missing, spawn a **planner**.
   - Spawn a **checker**.
   - While the verdict is `Not ready` (up to 3 rounds): spawn one **fixer** per
     node for `fix`-owned findings, or a **planner** for `plan`-owned findings,
     then re-run the **checker**. After 3 failed rounds, stop and explain each
     open finding to the user in 100–200 plain words.
3. **Sign off the interfaces.** Tell the user the interfaces are validated.
   Offer to let them read the phases first or sign off now, then record
   `date · maintainer · interfaces <range> signed` in the journal.
4. **Loop until all phases are `Complete` and no finding is open:**
   - **Fix first:** If any phase is `Reopened` or any `fix`-owned finding is
     open or regressed, spawn one **fixer** per affected node. Wait for them,
     then repeat step 4.
   - **Dispatch fleet:** Select up to 4 eligible phases that touch disjoint
     files, share no gate, fixture, or golden, and neither read nor write each
     other's members. In one locked `README.md` edit, set them to `In Progress`.
     Spawn their **executors** in a single message and wait for all to return.
   - **Review round:** Spawn one **reviewer** per newly completed phase in a
     single message. When all return, re-read the status board and spot-check
     one claim per reviewer against the code before continuing.
5. **Run human checks.** List any commands under `Human checks` in the
   Validation policy and ask the user to run them and report the results. Record
   `date · maintainer · human check <node> · <result>`.
6. **Review the root.** Spawn the **root reviewer**. If it files findings or
   reopens phases, return to step 4 and re-run step 6 once closed. It sets
   `**Line:** done` when the tree is clean.
7. **Sign off the feature.** Once the line is `done`, report what changed, the
   gate evidence, the human check results, and any open notes, then ask the user
   for the feature sign-off.

## Stop conditions

Stop immediately and report to the user when:

- The line is `done`, `waiting on human`, or stopped only by `maintainer`-owned
  andons.
- Any worker returns a `design andon` (only the maintainer can approve a reset).
- The same node fails twice, or three rounds close no finding.
