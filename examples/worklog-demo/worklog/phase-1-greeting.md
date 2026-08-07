# Phase 1 — greeting

**Status:** Completed

[Back to the worklog](README.md)

## Goal

Create a deterministic greeting artifact in the demo project.

## Specification

Create `examples/worklog-demo/project/greeting.txt` with exactly this one line:

```text
Hello from the worklog demo.
```

Do not add a trailing blank line or other content.

## Integration contract

| Trigger         | Observable result                                      | Required side effect              | Prohibited side effect             |
| --------------- | ------------------------------------------------------ | --------------------------------- | ---------------------------------- |
| Phase execution | `greeting.txt` exists with the exact expected content. | Create or replace only that file. | Do not change other project files. |

## Acceptance criteria

- [x] `greeting.txt` contains exactly the specified line.
- [x] `test "$(cat examples/worklog-demo/project/greeting.txt)" = "Hello from the worklog demo."` passes.
- [x] `git diff -- examples/worklog-demo/project/greeting.txt` shows only the intended file.

## Error coverage

| Failure                     | Expected outcome                             | Test                                    |
| --------------------------- | -------------------------------------------- | --------------------------------------- |
| Target directory is missing | Create the directory before writing.         | `test -d examples/worklog-demo/project` |
| Content differs             | Replace it with the exact specified content. | Exact-content shell assertion above.    |

## Implementation notes

Completed 2026-08-07 by clai (focused worker, session 2026-08-07).

Decisions:

- The file ends with a single newline terminator (29 bytes, `2e 0a` tail). This is the canonical one-line text form; the contract forbids a trailing blank line, not the line terminator.
- The git diff acceptance check is vacuous in this repository state because the whole tree is untracked (`git status` shows `?? examples/`). Verified instead by directory listing that no other project files were created or changed.

Verification commands and results (all PASS):

- `test -d examples/worklog-demo/project`
- `test "$(cat examples/worklog-demo/project/greeting.txt)" = "Hello from the worklog demo."`
- `wc -c < examples/worklog-demo/project/greeting.txt` -> 29
- `wc -l < examples/worklog-demo/project/greeting.txt` -> 1
- `tail -c 2 examples/worklog-demo/project/greeting.txt | od -An -tx1` -> `2e 0a`
