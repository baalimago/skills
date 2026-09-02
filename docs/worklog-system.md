# Worklog system

The worklog system turns a multi-step change into a durable, reviewable queue
for people and coding agents.

## Structure

Each effort lives in one directory:

```text
worklogs/<date>-<effort>/
├── README.md
├── phase-1-<name>.md
└── phase-2-<name>.md
```

The README is the router. It contains the status board, shared strategy,
parameters with owners, decisions, readiness checklist, session history, and
feedback index. Each phase file is an isolated contract with a goal,
specification, integration scenarios, acceptance criteria, error coverage,
and implementation notes.

Four skills cover the lifecycle, one verb each:

| Step     | Skill              | Reads                          | Writes                                  |
| -------- | ------------------ | ------------------------------ | --------------------------------------- |
| plan     | `worklog-plan`     | code, architecture, maintainer | README and phase files                  |
| validate | `worklog-validate` | the whole worklog              | `V{n}-{nn}` findings, verdict           |
| work     | `worklog-work`     | README plus one phase          | code, implementation notes, status board |
| review   | `worklog-review`   | README, phases, code           | `R{n}-{nn}` findings in place           |

The author sees everything; the executor deliberately sees the README and one
phase. Whatever spans phases must therefore be in the README, which is why
planning is two steps: the maintainer signs off on the README before any
phase file is written.

## Phase lifecycle

Phases move through:

```text
Not Started → In Progress → Complete
                    ↑             │
                    └─ Reopened ─┘
```

An agent selects the first incomplete or reopened phase from the README. It
implements only that phase, updates its notes and evidence, and then updates
the README status board. A material review finding reopens the phase until the
finding is fixed and verified.

## Contracts and evidence

The phase specification is the promise. Acceptance criteria must be
independently checkable, and each completed criterion must cite a test or a
repeatable verification command. Integration scenarios prove behavior at the
real boundary; unit tests cover internal error handling. Error coverage maps
meaningful failures to their expected result and test.

Implementation notes record only deltas from the plan: decisions, surprises,
deviations, and commands that were actually run. Do not use them as a second
specification.

## Convergence rules

Validation and review rounds converge only when a revision removes the class
of a finding, not the cited line. Four rules make the worklog self-checking:

- **One source of numbers.** Every default, limit, and threshold lives once
  in a README parameters table with an `Owner` column; phases refer to rows
  by name. The only numerals in a phase file are oracle data inside scenario
  rows.
- **Invariants and limits are tables.** One row per bound actor or per limit,
  with the mechanism, the injectable field, and the test. A path that is not
  a row does not exist; a limit no test can reach is not specified.
- **Human required.** A phase that needs a person declares the handoff
  artifact and the exact point where the agent stops.
- **Readiness checklist.** The README carries one line per defect class with
  the command or table that checks it. The author runs it before requesting
  validation; the validator runs it first and holds findings outside it to
  `note` unless an invariant is broken. `Conditionally ready` is the target
  verdict.

Validation findings use `V{round}-{nn}` IDs; a later round records each
prior ID as resolved, open, or regressed before raising new ones.

## Review

Review reads the code and reruns the gates; it does not trust implementation
summaries. Findings use stable IDs such as `R1-01`, include severity, a precise
location, the unmet contract, and a concrete failure scenario. Findings belong
in the affected phase and in the README feedback index. The verdict must say
whether the work is ready, independently of whether the tests are green.

## Running phases repeatedly

From the repository containing the worklog, run:

```sh
npx skills@latest add baalimago/skills --skill worklog-work
worklog-loop worklogs/2026-01-01-example/README.md 3
```

The loop runs the next eligible phase once per iteration. The bundled wrapper
uses `go run` to fetch and execute `repeater`, then invokes `clai` with the
profile stored next to the wrapper. Go is the only loop dependency.

To use another agent binary, place it after `--`. The command receives the
generated work prompt as its final argument:

```sh
worklog-loop worklogs/2026-01-01-example/README.md 3 -- claude --print
```

The runner must be available on `PATH` and must accept a prompt argument.

## Smoke test

The repository includes an editor-neutral demo:

```sh
./scripts/worklog-loop examples/worklog-demo/worklog/README.md 2
```

This creates two text files under `examples/worklog-demo/project/`. To keep
the repository clean, copy or clone the repository to a temporary directory
before running it. The same worklog can be opened in Claude Code, Codex,
Cursor, or another editor; ask the editor to read the worklog README and
complete only the next eligible phase.