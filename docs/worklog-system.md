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
decisions, session history, and review index. Each phase file is an isolated
contract with a goal, specification, integration scenarios, acceptance
criteria, error coverage, and implementation notes.

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