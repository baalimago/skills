---
name: worklog-plan
description: Design and write a phased implementation worklog, a README that holds the design and phase files that each implement one interface. Use when asked to plan, design, draft, or create a worklog or phased implementation plan, to revise one after validation, or to reset a design andon. Execution is worklog-work; checking is worklog-validate.
license: MIT
metadata:
  version: "2.2"
---

# Worklog plan

Design and author the `README.md` and phase files for a worklog, or revise them
to resolve `plan`-owned findings and design andons. This skill also defines the
model and records shared by [[worklog-validate]], [[worklog-work]],
[[worklog-review]], and [[worklog-fix]].

A worklog specifies **what** the system will do through interfaces and clauses;
executing agents decide **how** to implement and verify it.

## Model and files

A worklog is a **package** (`worklogs/<date>-<effort>/`, or the repository's
established location). Each phase is a **module** implementing one interface:

```text
worklogs/<date>-<effort>/
  README.md             from templates/worklog-README.md
  phase-1-<slug>.md     from templates/phase.md
  phase-2-<slug>.md
  phase-2.1-<slug>.md   injected after phase 2
```

- **Ownership tree:** `README.md` is `root`. Each phase sits under `root` or a
  sub-package (`## <name> (sub-package)` in `README.md`, holding facts shared by
  two or more children). Place every invariant and parameter at the lowest node
  that contains all members it binds.
- **Dependency DAG:** A phase consumes only members declared by lower-numbered
  phases, repository code, or imported worklogs (cited as `<worklog>:<id>`, e.g.
  `policy-engine:I3`).
- **Templates:** Author every file from the templates in `templates/`. Write
  `None.` in any unused section so every template heading stays present.

## Interfaces and clauses

Design interfaces around small contracts, named as a verb or Go-style `-er` noun
(embedding smaller interfaces when multiple verbs belong together), and declare
passed data types alongside the interface.

| Kind                                           | Written as                                                                                  | Tests go through                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Code                                           | Language construct: Go interface, Python `Protocol`, Rust trait, TypeScript interface       | Every implementation, fakes included     |
| HTTP API                                       | Route table: method, path, request fields, status per outcome                               | HTTP requests                            |
| Tool or RPC schema                             | The schema                                                                                  | Calls through the schema                 |
| CLI                                            | Usage synopsis: commands, flags, defaults, exit codes, output streams                       | Running the command                      |
| Data contract (provisional)                    | DDL for tables that other code reads (consumer-named columns/constraints form the contract) | Queries                                  |
| Infra module (provisional)                     | Variables and outputs, values schema, environment variables                                 | Plan or template output                  |
| Build target, pipeline, or image (provisional) | Inputs (arguments, environment), outputs, result per outcome                                | Running the target, container, or workflow |
| UI (provisional)                               | Route table plus `Element or state \| Shown when`                                           | HTTP requests and DOM assertions         |

- **Data migrations:** If a migration downgrade discards data, include a
  `Human required` section.
- **Generated interfaces:** Treat the generator's source file as the interface
  and list the idempotency gate for the generator in the Validation policy.
- **Clauses:** Document each interface member's contract in comments around the
  member (`{member}.{n}`, e.g. `evaluate.2`). State one caller-observable
  behaviour per clause: return values, raised errors, upheld invariant IDs, and
  any consumed member/path. Keep implementation details and test names out of
  clauses. The target file path of the interface is part of the contract.

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

| Class         | Place in the tree                                                                     | Specified by                      | Proven by                                                             |
| ------------- | ------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `contract`    | A leaf                                                                                | Its interface and clauses         | A single parametrised contract test suite run against all implementations and fakes |
| `composition` | A child of the node whose interface it implements (at most one per root/sub-package)  | That parent node's interface      | Integration scenarios with real children wired in, plus `Golden diff` |
| `prune`       | A leaf placed after the composition that made its code dead                           | Its `Removes` table               | Unchanged goldens, and zero hits for removed names outside `Allowed hits` |

- **Goldens:** A composition phase specifies `Golden | Change` for every
  snapshot it alters (capturing pre-existing goldens before changing code, or
  marking new snapshots `new`). List the golden regeneration command in the
  Validation policy.
- **Composition failure clauses:** May use a stub child that breaks the child's
  contract solely in the way the failure clause specifies.

## Planning procedure

When invoked interactively by a user, interview the user one question at a time
(`Q1`, `Q2`, …) with concrete options and a recommended choice until further
questions would not change an interface. Inspect affected code and existing
architecture before writing; record any external-system measurement in the
repository's notes directory and cite it in the fact it decides.

When spawned by an orchestrator for an already-signed `README.md`, go directly
to step 2.

1. **Draft and sign off `README.md`:**
   - **Flows:** One diagram per trigger; every call arrow targets a declared or
     consumed member and every reply returns from a drawn call.
   - **Facts:** Invariants (`ID`: statement + bound members) and parameters
     (`Parameter | Default | Decided by`).
   - **Scope:** What the effort leaves out or reserves for human authoring.
   - **Validation policy:** **Gates** (hermetic commands run once at phase start
     and twice at phase end) and **Human checks** (commands requiring
     credentials, spend, or live cloud state, naming the node they certify).
   - **Status board:** Every phase set to `Not Started`.
   - Ask the maintainer to sign off `README.md` (`date · maintainer · README
     signed`), which freezes the tree (nodes, parents, classes, numbers, Scope).
2. **Write phase files:** Author each `phase-<N>-<slug>.md` from the signed
   README (recording any adjustments to facts or flows in the session journal):
   - **Interface & Consumes:** Target path, verbatim code block, and consumed
     members (`member (phase N)` or `package:member (import)`). Include fixture
     sources for external systems.
   - **Acceptance criteria:** `# | Criterion | Proves | Proof` (at least one row
     per promised outcome; `Proof` names the test or command).
   - **Test cases:** `Test | Level | Proves | Given | Then | Must not` (`Level`
     is contract suite, integration scenario, unit, or command; cover every
     clause, invariant, and acceptance criterion).
   - **Error management:** `Failure | Expected outcome | Test` (exact error
     code/reason/action or refusal for each failure clause, or `None.`).
   - **Golden diff** (`composition`), **Removes** (`prune`: `Member | Consumers |
     Re-pointed to | Allowed hits`), **Local facts**, and **Human required**
     (artifact produced, exact stopping point, pre/post agent steps).
3. **Validate and sign off interfaces:** Hand off to [[worklog-validate]]. Once
   validation returns `Ready`, present the phase interfaces and any README updates
   to the maintainer for the interface sign-off (`date · maintainer · interfaces
   <range> signed`). This freezes all covered interfaces, clauses, facts, and
   flows.

Write a `maintainer` sign-off line only when the maintainer explicitly approves
in the current session.

## Records and locking

Hold an exclusive lock for every read-modify-write to `README.md` and release it
before running commands or waiting:

    flock -w 30 <worklog>/README.md.lock -c '<edit command>'

- **Phase status (status board only):** `Not Started`, `In Progress`,
  `Complete`, or `Reopened (review N)`.
- **Line marker (`**Line:**` above the board):** `running`,
  `stopped by A01, A03`, `waiting on human: <phase N|root>`, or `done`.
- **Findings table (`ID | Severity | Node | Owner | Status | Summary`):**
  - **ID:** `V{round}-{nn}` (validation), `R{round}-{nn}` (review), or `A{nn}`
    (andon). Increment from the highest existing ID of that kind.
  - **Severity:** `blocker`, `major`, `minor`, `quality andon`, or `design
    andon`. (`note` findings stay in phase files only.)
  - **Node:** Phase number, sub-package name, or `root`.
  - **Owner:** `fix`, `plan`, or `maintainer`.
  - **Status:** `Open`, `Closed <commit>` (add `+wip` if uncommitted), or
    `Regressed` (treated as open for fixes, verdicts, and reopening phases).
  - **Closing a finding:** Set `Closed <commit>`, remove any closed andon ID
    from `**Line:**` (restoring `running` when none remain), and append a
    journal line.
- **Session journal formats:**
  - `date · maintainer · README signed` | `interfaces <range> signed`
  - `date · validate · V{round} <verdict> · <command>: <result> · notes: <count>`
  - `date · work · phase N Complete` | `phase N · A{nn}` | `phase N waiting on human`
  - `date · fix · <ids> closed · <commands>: <results>`
  - `date · review · <node> round N <verdict> · <commands>: <results>` | `done · <commands>: <results>`
  - `date · plan · phase N re-planned` | `README amended: <section>`
  - `date · maintainer · A{nn} closed · <patch|minor|major|re-plan> · missed by check N` | `phase N handoff done` | `human check <node> · <result>`

## Andon cords and design-andon resets

An open andon finding stops the entire worklog line until closed. Keep all gate
commands, flags, timeouts, and test suites intact when diagnosing or fixing
andons.

| Cord              | Pulled when                                                                                                                      | Cause / Owner                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `quality andon`   | A gate fails at phase start, or at phase end outside the phase's changes, or results differ across runs. Summary: `<cause> · <gate> · <failing tests> · <commit>` | `own`, `foreign`, or `unknown` → owned by `fix`; `environment` (toolchain/network/creds) → owned by `maintainer` |
| `design andon`    | A phase cannot finish without changing a signed interface, clause, or tree node, or lacks a required input.                      | Always owned by `maintainer` and reset using the rules below                                                    |

### Resetting a design andon

Phase numbers are dotted integers (`2.10` follows `2.9`). An injected phase is
numbered `L.k` after the highest phase `L` it depends on, and goes through
validation and interface sign-off.

To **re-plan a phase in place**: revert only uncommitted changes from its own
`work` runs, append a `replan` row to its Implementation notes, set its status
to `Not Started`, log `date · plan · phase N re-planned`, re-validate, and get
the maintainer's interface sign-off (and README sign-off first if the tree
changed). Close the design andon only after the new sign-off, naming the
[[worklog-validate]] check that missed it.

- **Raising phase is `Not Started` or `In Progress`:** Re-plan it in place.
- **Target interface belongs to a `Complete` or `Reopened` phase:** Reset by
  semver level:
  - **Patch (body-only):** Close the andon, file an `R` finding owned by `fix`,
    and set the phase `Reopened` if `blocker` or `major`.
  - **Minor ( purely additive — all existing clauses hold for all inputs):**
    Inject phase `L.k` to extend the interface without editing the original; test
    both original and extended clauses.
  - **Major (breaking change):** Re-plan the owning phase and every consuming
    phase in place (or start a follow-up worklog if too large).
- **Raising phase consumes another phase's interface:** Reset the owner by
  semver level and re-plan the raising phase to consume the updated or injected
  member.
