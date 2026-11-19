---
name: worklog-validate
description: Validate a planned worklog against a fixed set of structural and design checks before its interface set is signed off. Use when asked whether a worklog is complete, consistent, or ready to execute. Planning is worklog-plan; fixing findings is worklog-fix.
license: MIT
metadata:
  version: "2.2"
---

# Worklog validate

Validate a planned worklog against checks 1–10 below before its interfaces are
signed off. Checks 1–10 are the complete bar for the verdict; record any other
observation as a `note`. [[worklog-plan]] defines the worklog model and records.

## Procedure

1. **Read:** Read `<worklog>/README.md` and every phase file on the status board
   (or the specific re-planned/injected phases named in your brief).
2. **Determine the round:** Set `round` to 1 plus the highest `V` round in the
   Findings table or session journal.
   - On round 2+, first verify each prior `V` finding as resolved, open, or
     regressed (mark `Regressed` in the Findings table if regressed).
   - On round 2+, file a new `blocker` or `major` finding only if it quotes text
     changed since the previous round that fails a check as written; record
     anything else as a `note`. Keep closed findings and prior notes closed.
3. **Run checks 1–10:** Use automated tools and type checkers wherever possible
   and record the commands run.
4. **Record and return the verdict:** Under the README lock
   (`flock -w 30 <worklog>/README.md.lock -c '<edit>'`), write the findings and
   journal line in one edit, then state the verdict (`Ready` or `Not ready`). If
   round 3 ends `Not ready`, stop and hand the open findings to the maintainer.

## Structural checks (1–7)

1. **Tree:**
   - Every status-board row has a matching phase file, and every phase file has
     one row.
   - Each node's `Parent` exists (`root` or a `## <name> (sub-package)` README
     section).
   - Phase numbers are unique dotted integers, and any injected `L.k` follows
     `L`.
   - Each class is `contract`, `composition`, or `prune`.
   - Every phase file contains all template sections (empty sections say
     `None.`; worklogs created under an older template are checked against their
     original sections).
   - Every interface sign-off in the journal follows a `Ready` verdict covering
     those phases.
2. **Interfaces compile together:** Assemble all `Interface` blocks into one
   compilation unit (with signature-matching stubs for imported repository
   members) and run the language's type checker. If no type checker applies or
   is available, verify by inspection that every consumed member matches its
   provider's name and signature, and record `inspection` as the command.
3. **Dependencies:**
   - Every member in a phase's `Consumes` is declared with the same name and
     signature by a lower-numbered phase, repository code, or another worklog
     (excluding standard library, runtime, and shell tools).
   - Dependency graph is acyclic.
   - Only an injected phase extends a member declared by another phase, and does
     so without editing the original declaration.
4. **Clauses and tables:**
   - Every interface member has at least one clause.
   - Clauses state only caller-observable behaviour, errors, cited invariant
     IDs, and consumed members/paths.
   - Every clause is triggerable through the interface using real providers,
     contract-tested fakes, or allowed composition failure stubs.
   - Every cited invariant ID exists, and every invariant is cited by a clause
     on each member it binds.
   - Every clause, invariant, and acceptance criterion has at least one `Test
     cases` row, and every `Proves` entry references a declared clause,
     invariant, or criterion.
   - Every `Error management` row names a test or repeatable command.
5. **Placement:** Every invariant and parameter in `Root facts`, sub-package
   facts, or `Local facts` is defined once, at the lowest node containing all
   members it binds. Repeated literals in flows, golden diffs, or `Consumes`
   agree with that definition.
6. **Classes:**
   - `contract`: declares an interface with clauses.
   - `composition`: declares its parent node's interface (at most one
     composition per root or sub-package) and a `Golden diff`.
   - `prune`: carries a `Removes` table, follows the composition that made its
     code dead, and changes no golden.
7. **Naming:** Each phase implements a single cohesive interface named and sized
   according to [[worklog-plan]]'s Interfaces rules.

## Design checks (8–10)

8. **Flows:** Every README flow arrow targets a declared or consumed member, and
   every reply arrow returns from a call in the same flow.
9. **Provenance:** For every member, each runtime input it needs (beyond its own
   parameters and facts in the README/phase file) comes from a member in its
   `Consumes`, and every property its clauses rely on is guaranteed by a
   provider clause or interface path.
10. **Humans:** Any phase whose clauses, Scope, or text require credentials,
    paid runs, manual listening/inspection, machine-local assets, or a human
    decision carries a `Human required` section. Phases build nothing that
    `Scope` reserves for a human.

## Findings and verdict

Assign each finding an ID `V{round}-{nn}` (e.g. `V1-01`), the check number,
location, concrete failure scenario, and corrective action:

| Severity  | When to use                                                                 | Recorded in README Findings? |
| --------- | --------------------------------------------------------------------------- | ---------------------------- |
| `blocker` | A check fails and prevents an agent from selecting or completing a phase.   | Yes                          |
| `major`   | Any other failure of checks 1–6 or 8–10.                                    | Yes                          |
| `minor`   | Check 7 fails.                                                              | Yes                          |
| `note`    | Any other observation or non-blocking record omission.                      | No (counted in journal line) |

- **README Findings row:** `ID | Severity | Node | Owner | Open | check N · location · action`, where `Owner` is `plan` if the fix changes the tree or a signature, and `fix` otherwise.
- **README Session journal line:** `date · validate · V{round} <Ready|Not ready> · <command>: <result> · notes: <count>`
- **Verdict:** `Ready` when zero `blocker` or `major` findings are `Open` or
  `Regressed`; `Not ready` otherwise.
