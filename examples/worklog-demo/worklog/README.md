# Worklog demo

## Goal

Ship `summarize`, a command that confirms the demo's `greet` command works.
This small worklog is a safe smoke test for a coding agent: it changes only
files under `examples/worklog-demo/project/` and this worklog, and needs
nothing beyond a POSIX shell.

## Glossary

| Term     | Meaning                                         |
| -------- | ----------------------------------------------- |
| Greeting | The exact line `Hello from the worklog demo.`   |

## Flows

```text
user          summarize                 greet
 │  summarize     │                        │
 ├───────────────>│  greet                 │
 │                ├───────────────────────>│
 │                │<───────────────────────┤ the greeting
 │<───────────────┤ "Worklog demo complete." / "Greeting verified."
```

## Status board

**Line:** running

| #   | Node                            | Parent | Class       | Interface   | Status      |
| --- | ------------------------------- | ------ | ----------- | ----------- | ----------- |
| 1   | [greeting](phase-1-greeting.md) | root   | contract    | `greet`     | Not Started |
| 2   | [summary](phase-2-summary.md)   | root   | composition | `summarize` | Not Started |

## Scope

Builds `greet` and `summarize` with their tests. Does not change the skills,
the runner, or the repository configuration.

## Root facts

None.

## Validation policy

### Gates

```sh
sh examples/worklog-demo/check.sh
```

The gate runs every `sh` test script under
`examples/worklog-demo/project/tests/`; each script exits non-zero on failure.
Goldens are regenerated with
`sh examples/worklog-demo/project/summarize > examples/worklog-demo/project/tests/summarize.out`.

### Human checks

None.

## Findings

| ID  | Severity | Node | Owner | Status | Summary |
| --- | -------- | ---- | ----- | ------ | ------- |

## Session journal

- 2026-10-20 · maintainer · README signed
- 2026-10-20 · validate · V1 Ready · inspection: every consumed member declared · notes: 0
- 2026-10-20 · maintainer · interfaces 1–2 signed
