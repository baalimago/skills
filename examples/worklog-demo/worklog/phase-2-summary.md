# Phase 2 — summary

**Parent:** root · **Class:** composition · [README](README.md)

## Goal

Implement the demo's exported interface by wiring in the real `greet`.

## Interface

Written as the usage comment at the top of
`examples/worklog-demo/project/summarize`.

```text
summarize
  summarize.1  Runs the greet in its own directory. When greet exits 0 and its
               stdout is exactly the greeting followed by one newline, prints
               "Worklog demo complete." and "Greeting verified." on two lines,
               and exits 0.
  summarize.2  When greet is missing, exits non-zero, or prints anything else,
               prints "greeting check failed" to stderr, prints nothing to
               stdout, and exits 1.
```

Consumes: `greet` (phase 1).

## Acceptance criteria

| #   | Criterion                                                                            | Proves        | Proof                                                         |
| --- | ------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------- |
| 1   | When the greet verifies, `summarize` prints both lines and exits 0.                  | `summarize.1` | `sh examples/worklog-demo/project/tests/summarize.sh`         |
| 2   | When the greeting check fails, `summarize` prints the failure on stderr and exits 1. | `summarize.2` | `sh examples/worklog-demo/project/tests/summarize-failure.sh` |

## Test cases

| Test                         | Level                | Proves        | Given                                                        | Then                                                                 | Must not                  |
| ---------------------------- | -------------------- | ------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------- |
| `tests/summarize.sh`         | integration scenario | `summarize.1` | the real `greet` in the same directory                       | stdout is exactly `tests/summarize.out`; exit status is 0            | change any other golden   |
| `tests/summarize-failure.sh` | integration scenario | `summarize.2` | `greet` exits non-zero, is missing, or prints something else | stderr is `greeting check failed`; stdout is empty; exit status is 1 | print either success line |

## Error management

| Failure                                                     | Expected outcome                                                            | Test                         |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| `greet` is missing, exits non-zero, or prints anything else | prints `greeting check failed` on stderr, prints nothing on stdout, exits 1 | `tests/summarize-failure.sh` |

## Golden diff

| Golden                                               | Change                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `examples/worklog-demo/project/tests/summarize.out`  | new; holds exactly `Worklog demo complete.` and `Greeting verified.` |

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
