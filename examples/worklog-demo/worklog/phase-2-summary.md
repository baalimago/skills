# Phase 2 — summary

**Status:** Not Started

[Back to the worklog](README.md)

## Goal

Create a second artifact that proves the first phase completed.

## Specification

Create `examples/worklog-demo/project/summary.txt` with exactly these two
lines:

```text
Worklog demo complete.
Greeting artifact verified.
```

Before marking this phase complete, verify that `greeting.txt` still contains
the exact Phase 1 content.

## Integration contract

| Trigger         | Observable result                                    | Required side effect                  | Prohibited side effect                          |
| --------------- | ---------------------------------------------------- | ------------------------------------- | ----------------------------------------------- |
| Phase execution | Both demo artifacts contain their specified content. | Create or replace only `summary.txt`. | Do not rewrite the greeting or unrelated files. |

## Acceptance criteria

- [ ] Phase 1's greeting assertion passes.
- [ ] `summary.txt` contains exactly the two specified lines.
- [ ] `git diff -- examples/worklog-demo/project` shows only the two demo artifacts.

## Error coverage

| Failure                              | Expected outcome                             | Test                                   |
| ------------------------------------ | -------------------------------------------- | -------------------------------------- |
| Greeting artifact is absent or wrong | Stop and report the unmet Phase 1 contract.  | Phase 1 exact-content shell assertion. |
| Summary content differs              | Replace it with the exact specified content. | Exact-content shell assertion.         |

## Implementation notes

<!-- Record only decisions, deviations, and verification commands here. -->
