---
name: worklog-plan
description: Design and write a phased implementation worklog, a README that holds the design and phase files that each implement one interface. Use when asked to plan, design, draft, or create a worklog or phased implementation plan, to revise one after validation, or to reset a design andon. Execution is worklog-work; checking is worklog-validate.
license: MIT
metadata:
  version: "2.1"
---

# Worklog plan

This skill is the author's half of the worklog system. It produces the README
and phase files that [[worklog-validate]] checks, [[worklog-work]] executes,
[[worklog-review]] audits, and [[worklog-fix]] repairs. It also defines the
terms, statuses, and records every other worklog skill uses.

A worklog states **what** the system will do, never how. The what is an
interface: a contract that can be met without naming an implementation. The
maintainer signs off the what; agents own the how and the proof. Stating what
is far shorter than proving it, so a worklog that specifies how has already
gone wrong.

Use a worklog for a substantial effort that spans phases, sessions, or
contributors. Keep one-off notes and investigations separate.

## The model

A worklog is a **package**. Each phase is a **module** that implements one
interface and owns that branch of the system.

- **Ownership is a tree.** The README is the root. A phase sits under the root
  or under a sub-package. A sub-package is a README section with no phase
  file; it holds what binds two or more of its children.
- **Dependencies are a DAG over the tree.** A phase consumes members declared
  by lower-numbered phases, or by imported packages: other worklogs and
  existing code, cited by their interface. There are no cycles.
- **The rule repeats when you zoom out.** A worklog exports an interface and
  imports others, the same way a phase does. Cite another worklog's ids with
  its name, `policy-engine:I3`, never bare.

Every invariant and parameter lives at the **lowest node that contains
everything it binds**: a phase file, a sub-package section, or the README root.

## Files

```
worklogs/<date>-<effort>/
  README.md             from templates/worklog-README.md
  phase-1-<slug>.md     from templates/phase.md
  phase-2-<slug>.md
  phase-2.1-<slug>.md   injected after phase 2
```

Use the repository's established worklog location, or `worklogs/` when none
exists. Start every file from the templates next to this skill. An empty
section says `None.` and is never removed. Do not rewrite older worklogs to
match a newer format.

## Interfaces

Prefer an interface over a struct or a function. A struct or a function is a
tool for reaching the goal and couples the design to one solution; an
interface states only the contract.

Follow Go's idioms in every language. Name an interface as a verb or as Go's
`-er` agent noun: a `Stringer` produces `String()`. Name a non-code interface
by the verb of its main action, such as `provision` or `serve`. Keep it small;
the bigger the interface, the weaker the abstraction. A phase implements
exactly one interface. When it needs several verbs, declare one interface
that embeds them, as Go's `ReadWriter` embeds `Reader` and `Writer`. Declare
the data types an interface passes next to it.

What counts as an interface is defined here and nowhere else:

| Kind                                           | Written as                                                                                  | Tests go through                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Code                                           | the language's construct: Go interface, Python `Protocol`, Rust trait, TypeScript interface | every implementation, fakes included             |
| HTTP API                                       | a route table: method, path, request fields, status per outcome                            | HTTP requests                                    |
| Tool or RPC schema                             | the schema                                                                                  | calls through the schema                         |
| CLI                                            | a usage synopsis: commands, flags, defaults, exit codes, output streams                    | running the command                              |
| Data contract (provisional)                    | DDL for tables that other code reads                                                        | queries                                          |
| Infra module (provisional)                     | variables and outputs, a values schema, environment variables                               | plan or template output                          |
| Build target, pipeline, or image (provisional) | inputs (arguments, environment), outputs, and the result per outcome                        | running the target or container, or the workflow |
| UI (provisional)                               | the route table plus `Element or state \| Shown when`                                       | HTTP requests and DOM assertions                 |

Provisional kinds are on trial. The maintainer adds, removes, or confirms a
kind by editing this table.

- **Data contracts.** The frozen surface is the columns and constraints a
  consumer names; other columns are body. A migration whose downgrade discards
  data needs a `Human required` section.
- **Generated interfaces.** When a generator produces the interface, the
  interface is the generator's source file, and the output is body. The
  Validation policy lists each generator and the gate that proves it is
  idempotent.

### Clauses

Each interface member carries its contract as comments around it, in the
language's own documentation form. A clause states one observable behaviour:
what the member returns, each error it raises, each invariant it upholds,
cited by id. A clause may name a member it consumes and the path or name it
is located by. It names no test, no source file of its own implementation,
and no step a caller cannot observe; the phase's Test cases table names the
tests that prove it. The path an interface is written to is part of the
interface, and a consumer may rely on it. Clauses are numbered in order within
each member, and `{member}.{n}` names one, such as `evaluate.2`.

```python
class PolicyEvaluator(Protocol):
    def evaluate(self, policies: PolicySnapshot, tags: AbstractSet[int],
                 facts: PolicyFacts) -> PolicyOutcome:
        """What the policy set asks for, given an app's tags and facts.

        - A policy matches when ALL conditions match; a condition when ANY term does.
        - Policies asking for the same action yield one key with every revision id. (I1)
        - A fact missing from `facts` raises.
        """
```

## Phase classes

Every phase belongs to exactly one class.

| Class       | Place in the tree                                                                     | Specified by                       | Proven by                                                               |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Contract    | a leaf                                                                                | its interface and clauses          | contract tests through the interface, run against every implementation |
| Composition | a child of the node whose interface it implements, wiring that node's other children | that node's interface and clauses  | scenarios with the real children wired in, and its golden diff         |
| Prune       | a leaf, after the composition that made its code dead                                | its Removes table                  | no golden changes, no removed name left outside its allowed hits       |

- **One composition per node.** A root or sub-package has at most one
  composition phase, and the root's implements the worklog's exported
  interface. A contract phase never wires a sibling; wiring is the composition
  under their shared parent.
- **Composition changes behaviour; prune must not.** Never mix the two in one
  phase.
- **Goldens.** A golden is a committed snapshot of observable output. A
  composition's golden diff is `Golden | Change`, one assertion per golden it
  changes, and no other golden may change. A prune changes no golden. A phase
  that needs a golden that does not exist creates it from the code as it
  stands, before making its own change; a row marked `new` is written after
  the change. The Validation policy names the command that regenerates the
  goldens.
- **Failure clauses of a composition** may be exercised with a stub child that
  breaks the child's contract only in the way the clause names.
- **Test scope follows the tree.** A leaf is tested alone through its
  interface, a composition with its real children, the root end to end.

There is no quality-gate phase. Every phase runs the full gates before and
after its work, and the review of the root is the final sweep.

## Design before writing

Do not write phases from a one-line request. Grill the maintainer until the
design is complete, one question at a time, indexed `Q1`, `Q2`, ... Each
question offers concrete options and names the option you recommend and
why. Question premises as well as choices; the goal is the best design, not
obedience. Ask where the interfaces are, not only what to build. Stop when a
further question would not change an interface.

Gather evidence before assuming: read the affected code, the architecture
notes, and any prior measurement. Measure a claim about an external system
that nobody has verified during planning. A measurement is never a phase:
record it as a dated note at the repository's notes location and cite it in
the fact it decides.

## Three steps, two sign-offs

1. **README.** Write the README with every phase `Not Started`. The maintainer
   signs it off, which fixes the tree: nodes, parents, classes, numbers, and
   Scope.
2. **Phase files.** Write each phase from the approved README. Root facts,
   sub-package facts, and Flows stay in flux until the interface sign-off;
   record each edit as a journal line. A phase may not add a node or move a
   member between nodes; if writing one reveals the need, stop and get the
   README signed again first.
3. **Interface sign-off.** Run [[worklog-validate]] until the verdict is
   `Ready`. Then extract every phase's Interface section, and every README
   edit made since the README sign-off, into one view and have the maintainer
   sign off the set. From then on the facts and flows are frozen with the
   interfaces.

A sign-off line is written only on the maintainer's explicit instruction in
that session, never on an agent's own judgement:
`date · maintainer · README signed`, `date · maintainer · interfaces 1–4 signed`.
An interface sign-off covers the phases it names, but only when it is written
after each one's latest `date · plan · phase N re-planned` line.
[[worklog-work]] executes only covered phases. Signed-off interfaces and their
clauses are frozen.

## Records

Every worklog skill, and the maintainer, reads and writes these records as
defined here.

- **Phase status** lives only on the README status board: `Not Started`,
  `In Progress`, `Complete`, or `Reopened (review N)`.
- **Line** is the marker above the board: `running`; `stopped by A01, A03`
  while any andon finding is open; `waiting on human: phase N` or
  `waiting on human: root`; or `done` after a clean root review. No skill acts
  on a `done` line.
- **Findings** are rows of `ID | Severity | Node | Owner | Status | Summary`.
  - IDs are `V{round}-{nn}` from validation, `R{round}-{nn}` from review, and
    `A{nn}` for andons. A new ID is the highest of its kind plus one; IDs are
    never reused.
  - Severity is `blocker`, `major`, or `minor`, or `quality andon` or
    `design andon`. Notes never get a row.
  - Node is a phase number, a sub-package name, or `root`. An andon's node is
    the phase that raised it, or `root` when no phase was selected. An andon's
    summary is `<cause> · <gate> · <failing tests> · <commit>`.
  - Owner is `fix`, `plan`, or `maintainer`.
  - Status is `Open`, `Closed <commit>`, or `Regressed`. `Regressed` counts as
    open everywhere: it is fixed, it counts in verdicts, and it reopens its
    phase like a new finding of its severity.
- **Closing a finding**, by whoever owns it: set `Closed <commit>`, with `+wip`
  when the change is uncommitted; remove an andon's ID from `Line`, and set
  `running` when none remains; add a journal line.
- **Session journal** is one line per skill run or maintainer action, in one
  of these shapes:
  - `date · maintainer · README signed` or `interfaces 1–4 signed`
  - `date · validate · V{round} <verdict> · <command>: <result> · notes: <count>`
  - `date · work · phase N Complete`, `phase N · A{nn}`, or `phase N waiting on human`
  - `date · fix · <ids> closed · <commands>: <results>`
  - `date · review · <node> round N <verdict> · <commands>: <results>`, or
    `date · review · done · <commands>: <results>`
  - `date · plan · phase N re-planned`, or `README amended: <section>`
  - `date · maintainer · A{nn} closed · <patch|minor|major|re-plan> · missed by check N`,
    `phase N handoff done`, or `human check <node> · <result>`
- **One agent works on a worklog at a time.**

## README rules

The README states the finished design, not the argument that produced it.
Keep investigations, measurements and rejected alternatives out.

- **Flows** are diagrams, one per trigger. Participants may include external
  actors. Every call arrow targets a declared member or a consumed one; every
  reply arrow returns from a call drawn in the same flow.
- **Facts** live in Root facts, Local facts, and sub-package sections. An
  invariant is a statement and the members it binds; its proof lives in the
  clauses that cite its id. A parameter is `Parameter | Default | Decided by`,
  where Decided by is the maintainer or a cited source, such as a ticket or a
  measurement note.
- **Scope** names what the effort does not build, especially anything a human
  must author. No phase creates it, and no test asserts that it exists.
- **Validation policy** has two lists. **Gates** are commands an agent runs
  hermetically: all of them once at the start of every phase, and twice at
  its end, in random order where the runner allows. **Human checks** need
  credentials, money, or live cloud state; each names its exact command and
  the node it certifies. They are never gates. Once every phase is
  `Complete`, the maintainer runs each and records the result in the journal.

## Phase file rules

- **Interface**: written verbatim to the named path. A composition declares
  the interface of the node it implements.
- **Consumes**: one line per member, `member (phase N)` or
  `package:member (import)`. The language runtime, the shell, and standard
  tools are not members. Anything a phase needs from elsewhere arrives
  through a consumed member. A fake of a consumed system that cannot run in
  the gates is a recorded fixture; name its source in `Consumes`.
- **Acceptance criteria**: a table `# | Criterion | Proves | Proof`, one row
  per observable outcome the phase promises. `Proves` names the clause or
  invariant it derives from, and `Proof` names the test or repeatable command
  that proves it. A criterion without citable evidence is not a criterion.
- **Test cases**: a table `Test | Level | Proves | Given | Then | Must not`,
  one row per test the phase expects. `Level` is contract suite, integration
  scenario, unit, or repeatable command. `Proves` names a clause, an
  invariant, or an acceptance criterion. `Must not` names a side effect the
  test forbids. Every clause and every acceptance criterion has at least one
  row.
- **Error management**: a table `Failure | Expected outcome | Test`, one row
  per meaningful failure the interface can produce. `Expected outcome` names
  the code, reason, and action tokens, or the exact refusal, that the phase's
  clauses specify. A phase with no failure path writes `None.` in the section.
- **Removes** (prune): `Member | Consumers | Re-pointed to | Allowed hits`. No
  hit outside its row is allowed.
- **Local facts**: invariants and parameters that bind only this phase.

The three tables follow the phase's class. A contract phase traces its
clauses; a composition phase traces the flows it implements and every
golden-diff row; a prune phase traces its Removes rows. An empty section says
`None.`

## Human-required steps

A phase that needs a person (a credential, a paid run, listening, a judgement
call, a machine-local asset) has a `Human required` section: the artifact
the person produces, the exact point where the agent stops, and what the
agent does before and after.

At the handoff the agent writes its journal line and sets
`**Line:** waiting on human: phase N`. When the artifact exists, the
maintainer writes the handoff-done line and sets the line `running`, and the
phase resumes.

## Verification

Prove behaviour through the interface. The contract tests of an interface are
one suite, parametrised over its implementations and placed by the
repository's test convention next to the interface; each test names the id
of the clause it proves. A later phase that fakes the interface runs that suite
against its fake. Never unit-test both sides of a mocked seam. Use the
repository's own test tools; do not prescribe a toolchain. Documents that
describe changed behaviour are edited in the phase that changes it.

## Andon cords

Two conditions stop the line, the whole worklog rather than one phase. The
line stays stopped while any andon finding is open.

| Cord    | Pulled when                                                                                                                                                  | Reset by                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Quality | a gate fails at the start of a phase, or at its end outside the phase's own changes; flakes included                                                        | depends on the cause, below     |
| Design  | a phase cannot be finished without changing a signed-off interface, clause, or node, or needs something its README, phase, and consumed code do not provide | the maintainer, with this skill |

A quality andon records its cause. **Own**: code this worklog changed;
[[worklog-fix]] fixes it. **Foreign**: repository code the worklog did not
change; [[worklog-fix]] fixes it as a separate commit when commits are
allowed, and otherwise lists the files it changed in its closing journal line.
**Environment**: toolchain, containers, network, or credentials; the
maintainer fixes it and closes the finding. **Unknown**: the cause is unclear;
[[worklog-fix]] owns it and corrects the cause in the summary when it finds
it.

Never retry, skip, quarantine, delete, or exclude a gate or test, and never
alter its timeout, count, or race flags. Rerun only to diagnose.

A design andon means planning missed something. The maintainer's closing
journal line names the [[worklog-validate]] check that should have caught it.
A sharpened check applies to the next worklog, never to this one.

## Resetting a design andon

**Re-planning a phase in place** means: revert only the uncommitted changes
its own work runs made, never a fix another skill made; append a `replan` row to its
Implementation notes and keep the rest; set it `Not Started`; write its
re-planned journal line; validate it; and have the maintainer sign off its
interface again. The andon closes only after that sign-off. A reset that
changes the tree has the maintainer sign the README again first; edits to
facts and flows are covered by the interface sign-off.

- **The raising phase is `Not Started` or `In Progress`:** re-plan it in place.
- **The interface belongs to a `Complete` or `Reopened` phase:** reset by
  semver level.
  - **Patch**, a body-only change: the maintainer closes the andon, files an
    `R` finding owned by `fix`, and sets the phase `Reopened` when the finding
    is a blocker or major.
  - **Minor**, an additive change: every clause of the signed interface stays
    true for every input, including inputs the extension gives meaning to. An
    argument, flag, or value that an existing clause maps to an error makes
    the change Major. Inject a phase that extends the interface without
    editing it; its suite asserts each original clause on its new inputs, and
    the original suite passes unchanged.
  - **Major**, a breaking change: re-plan the owner and every consumer in
    place, whatever their status; [[worklog-work]] then executes them in
    order. When that is too large, start a new worklog that imports this one
    instead.
- **The raising phase consumes the interface another phase owns:** do both.
  Re-plan the raising phase so it consumes the changed or injected member, and
  reset the owner by semver level.

Phase numbers are dotted integers, compared part by part, so `2.10` follows
`2.9`. An injected phase is `L.k`, where `L` is the highest phase it depends
on. Never renumber. Injected phases go through validation and interface
sign-off like any other.

## Handoff

When the phases are written, leave every phase `Not Started`, add a journal
line, and hand the worklog to [[worklog-validate]]. Close each finding you
resolve as Records describes. After a `Ready` verdict and the interface
sign-off, execution starts with [[worklog-work]].
