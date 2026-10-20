---
name: worklog-validate
description: Validate a planned worklog against a fixed set of structural and design checks before its interface set is signed off. Use when asked whether a worklog is complete, consistent, or ready to execute. Planning is worklog-plan; fixing findings is worklog-fix.
license: MIT
metadata:
  version: "2.0"
---

# Worklog validate

Check a worklog's documents against checks 1–10 below, before the maintainer
signs off its interfaces. [[worklog-plan]] defines the terms and records the
checks use; it adds no further checks. Do not implement phases; that is
[[worklog-work]]. Do not fix findings; that is [[worklog-fix]] or
[[worklog-plan]].

Checks 1–10 are the whole bar, and only they decide the verdict. Anything else
is a note, however important it looks.

## Procedure

1. Read the README and every phase file on its status board.
2. The round is one more than the highest `V` round in the Findings table or
   the journal. From round 2 on, first report each prior finding as resolved,
   open, or regressed, and set `Regressed` on any that regressed.
3. Run the checks in order and record the commands you run.
4. File the findings, then give the verdict.

## Rounds

- From round 2 on, a new blocker or major must quote text changed since the
  previous round and show that the changed text fails a check as written. A
  check that a prior fix now fails counts only when that fix, as filed, causes
  the failure. Anything else is a note.
- Never raise a closed finding or an earlier note again under a new ID.
- If round 3 ends `Not ready`, stop and hand the open findings to the
  maintainer.
- After a `Ready` verdict no further round runs, unless phases are re-planned
  or injected; then only those phases are validated.

## Structural checks

These need no judgement. Run them with tools wherever possible.

1. **Tree.** Every phase file has exactly one status-board row, and every row
   a file. Each node's parent exists. Numbers are unique, and an injected
   `L.k` follows `L`. Each class is contract, composition, or prune. Each
   sub-package has a README section. Every interface sign-off in the journal
   follows a `Ready` verdict that covers the phases it names.
2. **Interfaces compile together.** Assemble every Interface block into one
   unit, with stubs that copy the real signatures of imported members from the
   code, and run the language's type checker over it. When a kind has no
   checker, or the Validation policy says the checker is unavailable, confirm
   instead that every consumed member is declared by its provider under the
   same name and signature, and record `inspection` as the command.
3. **Dependencies.** Every member in a phase's `Consumes` is declared by a
   lower-numbered phase or by an import listed under the status board. The
   language runtime, the shell, and standard tools are not members. There is
   no cycle. No phase changes a member that another phase declares, except an
   injected phase that extends it without editing it.
4. **Clauses.** Every member has at least one clause. No clause names a test,
   a source file of its own implementation, or a step a caller cannot
   observe; a clause may name a consumed member and the path or name it is
   located by, and nothing else of the caller's environment. Each clause can be
   triggered through the interface, with real providers, fakes that pass the
   provider's contract tests, or the stub children [[worklog-plan]] allows.
   Every cited invariant id exists, and every invariant is cited by a clause
   of each member it binds.
5. **Placement.** Each invariant and parameter in a Root facts, Local facts,
   or sub-package section sits at the lowest node that contains everything it
   binds, and is defined only there. A literal that two nodes each state is a
   finding: declare it once at their lowest common node. A flow label,
   golden-diff row, or `Consumes` line may repeat a defined value; it is a
   finding only when it disagrees with the definition.
6. **Classes.** A contract phase declares an interface with clauses. A
   composition phase declares the interface of its parent node, which no other
   node declares, and a golden diff. A root or sub-package has at most one
   composition. A prune phase has a Removes table, follows the composition
   that made its code dead, and changes no golden. No phase mixes composition
   and prune.
7. **Naming.** Each phase implements one interface, named and sized as
   [[worklog-plan]]'s Interfaces section says.

## Design checks

These need judgement. Spend most of the effort here: a miss here becomes a
design andon during execution.

8. **Flows.** Every flow obeys [[worklog-plan]]'s Flows rule.
9. **Provenance.** For each member, list each input its implementation needs
   at run time, other than its own parameters and the values the README or
   its own phase file defines. Each such input comes from a member in its
   `Consumes`, and every property of that input its clauses rely on is
   guaranteed by a clause of that provider or by the path its interface is
   written to.
10. **Humans.** A phase has a `Human required` section when its clauses, its
    Scope, or its text require a credential, a paid run, listening, a
    machine-local asset, or a decision the README assigns to a person. The
    sign-offs are not phase steps. No phase creates what the Scope reserves
    for a human.

## Findings

Each finding has:

- A stable ID, `V{round}-{nn}`, e.g. `V1-03`.
- A severity:
  - `blocker`: a check fails, and because of it an agent cannot select or
    complete a phase.
  - `major`: any other failure of checks 1–6 or 8–10.
  - `minor`: check 7 fails.
  - `note`: everything else. A missing record field, such as a checker
    command, is a note unless its absence hides a check failure.
- The location, the failed check by number, a concrete failure scenario, and
  a corrective action.

Add one row per blocker, major, or minor finding to the README Findings
table, with the summary `check N · location · action`. Owner is `plan` when
the fix changes the tree or a signature, and `fix` otherwise. Notes get no
row. Add one journal line in the shape [[worklog-plan]]'s Records defines,
with the checker command, its result, and the number of notes.

## Verdict

End with one of:

- **Ready:** no blocker or major finding is open or regressed. The maintainer
  may sign off the interface set.
- **Not ready:** a blocker or major finding is open or regressed.
