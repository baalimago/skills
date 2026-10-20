# Phase 2 — summary

**Parent:** root · **Class:** composition · [README](README.md)

## Goal

Implement the demo's exported interface by wiring in the real `greet`.

## Interface

Written as the usage comment at the top of
`examples/worklog-demo/project/summarize`.

```text
summarize
  Runs the greet in its own directory. When greet exits 0 and its stdout is
  exactly the greeting followed by one newline, prints
  "Worklog demo complete." and "Greeting verified." on two lines, and
  exits 0.
  When greet is missing, exits non-zero, or prints anything else, prints
  "greeting check failed" to stderr, prints nothing to stdout, and exits 1.
```

Consumes: `greet` (phase 1).

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
