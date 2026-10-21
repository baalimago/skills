# Phase 1 — greeting

**Parent:** root · **Class:** contract · [README](README.md)

## Goal

Provide the greeting the rest of the demo depends on.

## Interface

Written as the usage comment at the top of
`examples/worklog-demo/project/greet`.

```text
greet
  greet.1  Prints the greeting followed by one newline to stdout, and exits 0.
  greet.2  Given any argument, prints "usage: greet" to stderr, prints nothing
           to stdout, and exits 2.
```

Consumes: None.

## Acceptance criteria

| #   | Criterion                                                                                  | Proves    | Proof                                                     |
| --- | ------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------- |
| 1   | `greet` prints the greeting and one newline, and exits 0.                                  | `greet.1` | `sh examples/worklog-demo/project/tests/greet.sh`         |
| 2   | `greet` given an argument prints `usage: greet` on stderr, nothing on stdout, and exits 2. | `greet.2` | `sh examples/worklog-demo/project/tests/greet-refusal.sh` |

## Test cases

| Test                     | Level                | Proves    | Given                         | Then                                                        | Must not           |
| ------------------------ | -------------------- | --------- | ----------------------------- | ----------------------------------------------------------- | ------------------ |
| `tests/greet.sh`         | integration scenario | `greet.1` | `greet` run with no arguments | stdout is the greeting and one newline; exit status is 0    | write to stderr    |
| `tests/greet-refusal.sh` | integration scenario | `greet.2` | `greet` run with one argument | stderr is `usage: greet`; stdout is empty; exit status is 2 | print the greeting |

## Error management

| Failure                      | Expected outcome                                                   | Test                     |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------ |
| `greet` run with an argument | prints `usage: greet` on stderr, prints nothing on stdout, exits 2 | `tests/greet-refusal.sh` |

## Golden diff

None.

## Removes

None.

## Local facts

None.

## Human required

None.

## Implementation notes

Not started.

## Review findings

None.
