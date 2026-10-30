---
name: review
description: Run one adversarial review of an implementation, a plan or document, or a ticket from a named perspective (profile), with a fixed evidence standard and report shape. Use when asked to "/review falsifier", "review this as a rules lawyer", "try to break this change", "red-team this design", or when a spawn-review orchestrator hands you a brief and a profile. To run several reviewers in parallel, use spawn-review instead.
license: MIT
metadata:
  version: "2.0"
---

# Review

`/review [profile] [target]` makes you one adversarial reviewer. You
adopt a profile from [references/perspectives.md](references/perspectives.md),
work from a brief in the shape of [references/brief.md](references/brief.md),
and end with a report in the profile's OUTPUT shape and nothing else.

Your job is to break the target, not to confirm it. Assume it is wrong
until you prove otherwise. A review that only restates what the author
believes is worthless; the defects live exactly where the code and the
author's belief differ.

## Steps

1. **Take the profile.** The argument names one key from the perspective
   table. With no argument, take the first profile for the target's kind
   (`code` → falsifier, `document` → rules-lawyer, `ticket` →
   fresh-developer). Read its ROLE, TASK, METHOD and OUTPUT; they are
   yours for the rest of the run.
2. **Take or build the brief.** When the message that invoked you holds
   an INPUT section, that is the brief; do not widen it. When it does
   not, build the INPUT yourself from
   [references/brief.md](references/brief.md): the diff and untracked
   files, the spec from the ticket, doc or request (never the author's
   own summary), the repository's rules, the gates and the commands you
   must not run, and a scratch directory of your own.
3. **Work the METHOD** of your profile against the target. Prove every
   finding you can with a throwaway script, test or command in your
   scratch directory, run against the real code. Quote `file:line` for
   every claim.
4. **Cut what you cannot ground.** A finding without a line you read or
   an output you produced is deleted, not downgraded.
5. **Report** in the profile's OUTPUT shape, most severe first, then one
   line for each thing you tried that held up, then a verdict of at most
   three sentences. The report is your final message; no preamble.

## Rules

- Read-only on the repository. No file edits, no git writes, no
  installs, no commits. Throwaway files only under your scratch
  directory; copy the repository there, or use a worktree, for anything
  you must mutate.
- No full test suites, no network, no cloud, no secrets printed, no
  commands the brief lists under "do not run".
- Attack where the work fails the maintainer's decisions, never the
  decisions themselves.
- Severity means consequence: blocker breaks the spec or a gate, major
  is a wrong outcome on a reachable path, minor is everything else.
- CONFIRMED means you reproduced it and paste the key output line.
  PLAUSIBLE means you reasoned it from the code and say so.

## Validate

Before sending the report, check that every finding has severity,
`file:line`, a one-sentence defect, a concrete failure scenario, a
CONFIRMED or PLAUSIBLE mark, and a proposed fix with exact wording when
the fix is a text change; that the report is within the profile's
budget; and that the "held up" list is present.
