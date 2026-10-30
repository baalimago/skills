# The brief

One brief per run, in the six-section shape of the `prompting` skill.
`spawn-review` writes INPUT once and every reviewer receives it
unchanged except for the scratch directory; a reviewer started on its
own builds INPUT itself. ROLE, TASK, METHOD and OUTPUT come from the
profile; NOTES is the `review` skill's Rules section. Fill every
placeholder; a brief with a placeholder left in is not sent.

```
ROLE
<perspective ROLE>

TASK
<perspective TASK>

INPUT
Target: <kind> at <absolute path>; branch <name>; HEAD <sha>.
See the change with: git -C <path> diff; git -C <path> status --short.
Untracked files that are part of the change: <list, or "none">.
Read in full, not just the hunks: <files that carry the logic>.

Spec (the behaviour the target claims; validate against this, nothing else):
- <bullet from the ticket, doc or request>
- <bullet>

Decisions already made by the maintainer; attack where the work fails them,
never the decisions themselves:
- <decision>

House rules the author must follow; cite file:line when the work breaks one:
- <repo AGENTS.md / CLAUDE.md path>, in particular: <the rules that bite>
- <the user's standing feedback that applies, as rules>

Gates: <exact commands>. Do not run: <commands that crash the host, need
secrets, or touch shared environments>.

Known facts, do not re-derive: <facts the reviewer would otherwise spend
time rediscovering, e.g. "dev lacks feature X, so test Y is red there">.

Scratch directory, yours alone: <scratchpad>/review-<perspective-key>/.
Host quirks: <shell, aliases, blocked commands, "use absolute paths, no cd">.

METHOD
<perspective METHOD>

NOTES
- Read-only on the repository. No file edits, no git writes, no installs,
  no commits. Throwaway files only under your scratch directory; copy the
  repository there, or use a worktree, for anything you must mutate.
- No full test suites, no network, no cloud, no secrets printed.
- Every finding: severity, file:line, one-sentence defect, concrete failure
  scenario (inputs or state -> wrong outcome), CONFIRMED (you reproduced
  it; paste the key output line) or PLAUSIBLE (reasoned, not reproduced),
  proposed fix with exact wording when it is a text change.
- Drop anything you cannot ground in the code or in output you produced.
- Your final message is the report and nothing else. No preamble.

OUTPUT
<perspective OUTPUT>
Then one line each for what you tried that held up.
Then a verdict of at most three sentences.
```

## Checklist for the INPUT section

- The spec comes from the ticket, the design doc or the user's words.
  Never paste the implementer's own summary of what works.
- "Decisions already made" prevents the review from relitigating the
  design. Leave it empty only when there are none.
- "Known facts" saves every reviewer the same hour. Include environment
  state, expected-red tests, and anything a previous round established.
- "Do not run" is as important as the gates. Full suites that crash the
  host, commands that deploy real apps, and anything needing secrets go
  here.
- Host quirks are facts about this machine (shell functions that swallow
  output, aliased commands, denied git commands). They are not part of
  the skill; take them from the session's own context.
