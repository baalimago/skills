# Worklog demo

**Status:** Not Started

This small worklog is a safe smoke test for a coding agent. It asks the agent
to create two plain-text files under `examples/worklog-demo/project/`.

## Status board

| Phase                          | Status      | Contract                                |
| ------------------------------ | ----------- | --------------------------------------- |
| [Phase 1](phase-1-greeting.md) | Completed   | Create the greeting artifact.           |
| [Phase 2](phase-2-summary.md)  | Not Started | Create and verify the summary artifact. |

## Strategy

Complete phases in order. Change only files under
`examples/worklog-demo/project/` and this worklog. Do not alter the skills,
runner, or repository configuration. Use shell commands as the tests because
the artifacts are plain text.

## Decisions

| Date       | Decision                                       | Reason                                           |
| ---------- | ---------------------------------------------- | ------------------------------------------------ |
| 2026-08-07 | Use plain-text artifacts and shell assertions. | Keeps the demo editor- and language-independent. |

## Session journal

Agents append one short entry here after each phase. Include the phase, worker,
date, commands run, and result.

| Date       | Phase | Worker                                    | Commands                                                                                            | Result                                                                              |
| ---------- | ----- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-08-07 | 1     | clai (focused worker, session 2026-08-07) | `test -d examples/worklog-demo/project`, exact-content assertion, `wc -c`/`wc -l`/`tail -c 2 \| od` | PASS. `greeting.txt` created with exactly one line; all acceptance assertions pass. |

## Feedback index

No review findings.
