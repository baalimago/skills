---
name: worklog-validate
description: Validate a worklog and its phases for complete contracts, acceptance criteria, error coverage, and test evidence before implementation or review.
license: MIT
metadata:
  version: "1.0"
---

# Worklog validate

Use this skill when a user asks whether a worklog is complete, consistent, or
ready for an agent to execute. Validate the worklog itself. Do not implement
its phases unless the user asks for that separately.

## Validation procedure

1. Read the worklog README and identify every phase and its status.
2. Read every phase file listed by the status board.
3. Confirm that each phase has these sections:
   - Goal
   - Specification
   - Integration contract
   - Acceptance criteria
   - Error coverage
   - Implementation notes
4. Confirm that the README contains a truthful status board, shared strategy,
   decisions log, session journal, and feedback index.
5. Check that acceptance criteria are observable and independently checkable.
   Each criterion must name a test or repeatable verification command.
6. Check that error coverage names meaningful failures, expected outcomes, and
   a test for each failure.
7. Check that integration scenarios identify triggers, observable results,
   required side effects, and prohibited side effects.
8. Check phase ordering, links, status values, and references to files or
   commands. Report broken references.
9. Run the repository's relevant quality gates when validating an implemented
   worklog. Do not treat a green test suite as proof that the contract is
   complete.

## Findings

Report findings in priority order. For every finding include:

- A stable ID: `V1-01`, `V1-02`, and so on.
- Severity: blocker, major, minor, or note.
- The exact file and line or section.
- The unmet contract.
- A concrete failure scenario.
- A specific corrective action.

Use `blocker` when an agent cannot safely select or complete a phase, `major`
when a required contract or test evidence is missing, `minor` for a limited
clarity or consistency problem, and `note` for an optional improvement.

## Verdict

End with one of these verdicts:

- **Ready:** every required contract is present and actionable.
- **Conditionally ready:** only minor findings or notes remain.
- **Not ready:** a blocker or major finding remains.

Do not mark a worklog ready only because its Markdown headings exist. A phase
without testable acceptance criteria or error-case tests is incomplete.