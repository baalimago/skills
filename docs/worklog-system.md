# Worklog system

The worklog system turns a multi-step change into a durable, reviewable queue
for people and coding agents. A worklog is a package of phases, each
implementing one interface. The maintainer signs off **what** the system will
do; agents own **how** it is done and the proof that it works.

[`worklog-plan`](../skills/worklog-plan/SKILL.md) is the single definition of
the model, the files and their templates, interface kinds, clauses, phase
classes, records, andon cords, and how a design andon is reset. This page is
an overview.

## Lifecycle

The five lifecycle skills cover one verb each; `worklog-orchestrate` drives
them and spawns a worker per step:

| Step     | Skill              | Reads                                     | Writes                                   |
| -------- | ------------------ | ----------------------------------------- | ---------------------------------------- |
| plan     | `worklog-plan`     | code, architecture, maintainer            | README and phase files                   |
| validate | `worklog-validate` | the whole worklog                         | `V{n}-{nn}` findings, verdict            |
| work     | `worklog-work`     | README, one phase, consumed code          | code, implementation notes, status board |
| review   | `worklog-review`   | README, phases, code                      | `R{n}-{nn}` findings in place            |
| fix      | `worklog-fix`      | README, owning and consuming phases, code | fixes, closed findings                   |
| orchestrate | `worklog-orchestrate` | the whole worklog                  | README records, spawned phase workers   |

The maintainer signs off the README, which fixes the tree, then the interface
set once validation returns `Ready`. Facts and flows stay in flux until that
second sign-off, which freezes them with the interfaces. Every phase runs the full
gates before and after its work, and there is no quality-gate phase.

Each phase file carries its interface, the members it consumes, acceptance
criteria, the expected test cases, and an error-management table. The plan
skill defines each table's shape, and validation and review check that every
row has its evidence.

```text
Not Started → In Progress → Complete ⇄ Reopened (review N)
                  │
                  └─→ Not Started   (design andon re-plan)
```

Two andon cords stop the whole line: **quality**, when a gate fails (flaky
tests included, and they are fixed, never retried), and **design**, when a
signed-off interface would have to change. A clean root review sets the line
to `done`. Rationale belongs in commit messages, not in the worklog.

## Concurrent agents

Parallel workers are the exception. They run only when the conflict risk is
very low: the phases touch disjoint files, and share no gate, fixture, or
golden. One phase at a time is the default.

Every edit of the worklog README, by any skill or worker, holds an exclusive
lock on `<worklog>/README.md.lock` for the whole read-modify-write:

```sh
flock -w 30 worklogs/2026-01-01-example/README.md.lock -c '<edit command>'
```

The lock covers the line marker, the status board, findings, and the journal.
Hold it for the edit only. A writer that skips the lock defeats it.

## Orchestration

`worklog-orchestrate` runs the skills; the worklog system ships no runner of
its own. The orchestrator selects the verb from the records: `worklog-fix`
when a phase is reopened or a finding owned by fix is open,
`worklog-review` on the root once every phase is complete, and `worklog-work`
otherwise. A line that is `done`, waiting on a human, or stopped only by the
maintainer's andons reports why and stops.

Install the skills once in the repository that holds the worklog:

```sh
npx skills@latest add baalimago/skills
```

Then hand the worklog to the agent. The prompt is the whole protocol; there
is no wrapper to keep in step with the skills.

```sh
clai q "Run the worklog-work skill on worklogs/2026-01-01-example/README.md"
```

## Smoke test

The repository includes an editor-neutral demo:

```sh
clai q "Run the worklog-work skill on examples/worklog-demo/worklog/README.md"
```

It creates two small shell commands and their tests under
`examples/worklog-demo/project/`, which git ignores, so implementation notes
record the repository `HEAD` with `+wip`. Copy the repository to a temporary
directory before running the demo.
