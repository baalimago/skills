---
name: spawn-review
description: Fan out N parallel adversarial reviewers, each running the review skill with a different profile, against an implementation, a plan or document, or a ticket; then verify, merge and fix their findings. Use for "/spawn-review 3", "spawn adversarial reviewers", "validate the impl with a few agents", or any request for independent parallel review before shipping. For a single reviewer, use review directly.
license: MIT
metadata:
  version: "1.0"
---

# Spawn review

`/spawn-review [N] [target]` runs N reviewers in parallel, each a fresh
agent executing the `review` skill with its own profile, then verifies
what they found and fixes what holds. Default N is 3. With no target,
the target is this session's own work: every repository this session
changed, uncommitted, with the spec taken from what the user asked for
in this conversation. A named target is a branch, a PR, a path, a
document, or a ticket.

Diversity is the point. One reviewer finds what its stance makes
visible; three stances find three defect classes, and a defect two of
them reproduce independently is almost never a false positive.

## What made past reviews good

The runs worth repeating shared these properties; every brief must have
them.

- **The spec, not the author's conclusions.** The brief restates the
  intended behaviour as bullets from the ticket, the doc or the user's
  words. Reviewers never see the implementer's own summary of what works.
- **Decisions that are not up for debate.** List the maintainer's
  decisions so reviewers attack where the work fails them, not the
  decisions.
- **Known facts.** Environment state, expected-red tests, and what a
  previous round established, so no reviewer spends the same hour.
- **Evidence or it is dropped, and what held up.** The `review` skill
  enforces both; the brief gives each reviewer a scratch directory so it
  can.
- **The orchestrator verifies before applying.** Reviewers get details
  wrong (an error string, a count, a version). Load-bearing findings are
  re-checked against the code or live evidence before a fix lands.

## Steps

1. **Resolve the target and the spec.** With no target, list every
   repository this session edited and read each one's `git status
   --short` and `git diff`, untracked files by name; the spec is the
   user's requests in this conversation, quoted, never your own summary
   of what you built. With a named target, read the diff, the document
   or the ticket and take the spec from its ticket, doc or request.
   Collect the house rules (the repository's `AGENTS.md`/`CLAUDE.md`,
   the relevant skill, the user's standing feedback that applies), the
   gates with their exact commands, and the commands that must not be
   run (full suites that crash the host, anything needing secrets or
   touching shared environments).
2. **Choose the profiles from the change, not from a list.** Read what
   the diff touches and match it against the signal table in
   `review/references/perspectives.md`: logic gets a falsifier, a
   frontend change gets ux-design, infrastructure or auth gets security,
   a migration gets data-safety, tests get a mutation-tester, a plan gets
   a principal-engineer. Pick the N distinct profiles with the strongest
   signals, falsifier among them unless the change is documentation
   only, and tell the user why each was chosen. Fall back to the default
   order table only when the signals tie.
3. **Write the INPUT brief once** from `review/references/brief.md`.
   It is identical for every reviewer except the scratch directory.
4. **Spawn all N in one message** with the Agent tool: fresh context
   (never a fork, which inherits the author's reasoning and anchors on
   it), one profile each. Each prompt is:

   ```
   Load the `review` skill (Skill tool, skill: review, args: <profile>)
   and follow it. If the Skill tool is unavailable, read
   <absolute path>/review/SKILL.md and its references and follow them.
   The INPUT section below is your brief; do not widen it.

   INPUT
   <the brief, with this reviewer's scratch directory>
   ```

   Vary the model only when the user asked for model diversity;
   `literal-junior` wants the smallest model on purpose. Show the user a
   table of reviewer, profile, method.
5. **Wait.** Do not review in parallel yourself; that wastes the
   independence you paid for. Relay each report's headline findings as
   it lands.
6. **Merge.** Dedupe across reports. Count independent confirmations per
   finding. Re-verify every blocker and major yourself against the code
   or by running the reviewer's repro. Reject findings that attack a
   decision the user already made, and say which.
7. **Fix, then re-gate.** When the target is this session's own work or
   the user asked for fixes, apply the confirmed findings in the working
   tree, run the gates, and run the reviewers' repros again. Otherwise
   stop at the report. Never file tickets for findings.
8. **Report.** A table `Problem (confirmed by N) | Fix` for applied
   findings, the rejected findings with reasons, the gate commands with
   their outcomes, and what every reviewer found held up. If blockers
   were found, offer one more round with fresh reviewers on the fixed
   tree, with round-1 findings listed as "already found; look elsewhere".

## Validate

- Every reviewer prompt names its profile and carries the same INPUT.
- Each chosen profile is justified by a signal in the diff, and no two
  chosen profiles share more than one hunt-list item.
- The final report cites a confirmation count per applied finding and
  the gate commands with their outcomes.

## Edge cases

- **No toolchain on the host.** Say so in the brief; reviewers read and
  trace instead of compiling and mark everything PLAUSIBLE; the report
  says the gates ran in CI or not at all.
- **The change is someone else's.** Report only; do not edit.
- **A reviewer stalls** far past the others. Stop it, run its decisive
  check yourself, and say the profile was cut short.
