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

Five skills cover the lifecycle, one verb each:

| Step     | Skill              | Reads                                     | Writes                                   |
| -------- | ------------------ | ----------------------------------------- | ---------------------------------------- |
| plan     | `worklog-plan`     | code, architecture, maintainer            | README and phase files                   |
| validate | `worklog-validate` | the whole worklog                         | `V{n}-{nn}` findings, verdict            |
| work     | `worklog-work`     | README, one phase, consumed code          | code, implementation notes, status board |
| review   | `worklog-review`   | README, phases, code                      | `R{n}-{nn}` findings in place            |
| fix      | `worklog-fix`      | README, owning and consuming phases, code | fixes, closed findings                   |

The maintainer signs off the README, which fixes the tree, then the interface
set once validation returns `Ready`. Facts and flows stay in flux until that
second sign-off, which freezes them with the interfaces. Every phase runs the full
gates before and after its work, and there is no quality-gate phase.

```text
Not Started → In Progress → Complete ⇄ Reopened (review N)
                  │
                  └─→ Not Started   (design andon re-plan)
```

Two andon cords stop the whole line: **quality**, when a gate fails (flaky
tests included, and they are fixed, never retried), and **design**, when a
signed-off interface would have to change. A clean root review sets the line
to `done`. Rationale belongs in commit messages, not in the worklog.

## Running phases repeatedly

From the repository containing the worklog, run:

```sh
npx skills@latest add baalimago/skills
worklog-loop worklogs/2026-01-01-example/README.md 3
```

Each iteration runs one skill: `worklog-fix` when a phase is reopened or a
finding owned by fix is open, `worklog-review` on the root once every phase is
complete, and `worklog-work` otherwise. A line that is `done`, waiting on a
human, or stopped only by the maintainer's andons makes each remaining
iteration report and exit. The bundled wrapper uses `go run` to fetch and
execute `repeater`, then invokes `clai` with the profile stored next to the
wrapper. Go is the only loop dependency.

To use another agent binary, place it after `--`. The command receives the
generated prompt as its final argument:

```sh
worklog-loop worklogs/2026-01-01-example/README.md 3 -- claude --print
```

The runner must be available on `PATH` and must accept a prompt argument.

## Smoke test

The repository includes an editor-neutral demo:

```sh
./scripts/worklog-loop examples/worklog-demo/worklog/README.md 3
```

It creates two small shell commands and their tests under
`examples/worklog-demo/project/`, which git ignores, so implementation notes
record the repository `HEAD` with `+wip`. Copy the repository to a temporary
directory before running the demo.
