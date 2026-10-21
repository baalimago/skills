---
name: worklog-review
description: Review a worklog phase's implementation against its signed-off interface and critique it in place; reviewing the root is the final sweep that closes the worklog. Use when reviewing a completed phase, auditing an implementation against its interface, or filing review feedback into a worklog. Complements worklog-plan (design), worklog-validate (checking), worklog-work (execution), and worklog-fix (fixing).
license: MIT
metadata:
  version: "2.1"
---

# Worklog review

Review the code an executing agent produced against the interfaces the
worklog promised, and record the critique **in the worklog itself**, so the
next contributor routes off it. [[worklog-plan]] owns the layout, the phase
classes, and the records; [[worklog-work]] owns execution; [[worklog-fix]]
closes what you find. Review only `Complete` phases, or the root.

The review is worthless if it only reads the implementation notes. Notes
report what the author believes they did. A review establishes what the code
actually does. The two differ exactly where defects live.

## Stance: verify independently

- **Re-run every gate yourself**, exactly as the Validation policy names
  them. A claimed "all pass" is a hypothesis until you reproduce it. Cite the
  commands and their outcomes in the verdict.
- **Hunt flaky tests.** Run the full suite twice, in random order with a
  fresh seed where the runner allows, otherwise twice in its default order. A
  test whose result differs between the runs is a quality andon: pull the cord
  as [[worklog-work]] describes, then finish the review.
- **Read the code, not the summary.** Open every file the phase touched and
  trace the real call paths.
- **Record verified-good, not just faults.** "I confirmed X holds on every
  path" is information the next reviewer should not have to re-derive.

## Check by class

- **Contract.** The written interface matches the phase's Interface block,
  token for token after formatting. Every clause has a test that names its id
  and goes through the interface. Every fake used anywhere passes the same
  contract suite, except a stub child that exercises a composition failure
  clause, which breaks the child's contract only in the way that clause
  names. The implementation exposes no public member the interface lacks.
- **Composition.** The scenarios run with the real children wired in. Every
  golden change satisfies its golden-diff row, and no other golden changed.
- **Prune.** No golden changed. No removed name remains outside its allowed
  hits. Every listed consumer is re-pointed.
- **Evidence.** Every Acceptance criteria row has a passing test or repeatable
  command. Every Test cases row exists at its stated level and proves its
  clause or criterion. Every Error management row produces its named outcome.

In every class, the documents that describe the changed behaviour were
edited in the same phase.

## Technique: trace the invariant through every branch

Most missed defects are not wrong lines. They are correct lines on a path
nobody enumerated. For each invariant a clause cites ("X is captured on every
path", "Y is always released", "Z is idempotent"):

1. Name the functions where X must hold.
2. Enumerate **every** conditional branch, early return, error path, retry,
   and loop iteration in them.
3. Confirm X holds on each, especially the failure, empty-result, timeout,
   and retry branches. Guarantees are dropped there far more often than on
   the happy path, and those branches are usually the least tested.
4. Follow the value to its destination. Capturing a value is not recording
   it: a field set at the source but discarded by the event, response, or
   writer that carries it is still a leak. Chase it to the sink.

When a resource is costly or safety-critical (spend, tokens, locks, money,
PII), assume the failure branches are where it leaks and start there.

## The root review

When every phase is `Complete`, review the root. Reviewing a node covers its
whole subtree, so the root review is the final sweep of the effort: every
gate at every test level, the end-to-end scenarios of every README flow,
every document the effort changed, and the journal record of every Human
check. A Human check with no record is a finding owned by `maintainer`; set
`**Line:** waiting on human: root`.

A root review sets `**Line:** done` and adds its done journal line only when
the line is `running` and the Findings table holds no open or regressed
finding of any severity. Otherwise the open findings are fixed and the root
is reviewed again.

## Findings

- A stable ID per finding, `R{round}-{nn}`, e.g. `R1-07`.
- A severity:
  - `blocker`: enacts, loses, or leaks something it must not.
  - `major`: a clause is unmet, with a reachable wrong result.
  - `minor`: the behaviour is right, but the evidence or documentation
    disagrees.
  - `note`: verified good, with a caveat the next contributor must not
    re-derive. Notes stay in the phase file and get no Findings row.
- A precise reference: `file:line`, and the clause left unmet.
- Actionable work with a checkbox, so the fixer can close it directly.
- A concrete failure scenario: the input or state, and the wrong result or
  cost it produces. "Undercounts on retry" beats "retry looks fragile".

A finding whose root cause is the interface itself is not an `R` finding.
When a clause is missing, or a member cannot carry what a consumer needs,
file a design andon as [[worklog-work]] describes. When a clause admits two
readings, hold the code to the stricter one and file an `R` finding.

## Record it in place

Never write a standalone review document; it becomes a second source of
truth the next agent will not read. Everything lands in the worklog, in the
same change:

1. **Affected phase file:** under `## Review findings`, replace `None.` in the
   first round, or add `### Review N, date` in later rounds, with the
   findings for that phase and what you verified good.
2. **README status board:** set `Reopened (review N)` on every phase with a
   `blocker` or `major` finding. A stale completion status is how defects
   survive.
3. **README Findings table:** one row per blocker, major, or minor finding,
   owned by `fix`, or by `plan` for a rule that spans phases.
4. **README journal:** one line with the commands you re-ran and the verdict.

## Verdict

State plainly whether the work is ready; green gates are not a verdict. If it
is not ready, the findings carry the reasons.

## Rounds

The round is one more than the highest `R` round in the Findings table or the
journal; an `R` finding filed outside a review, such as a patch reset, opens
round 1 when none exists. A later round first records whether each earlier
finding is resolved, still open, or regressed, and sets `Regressed` on those
that regressed. A re-review of a node files only regressions and findings in
code changed since the previous round. The first root review always sweeps
the whole tree.
