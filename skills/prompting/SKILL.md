---
name: prompting
description: Author agent prompts to one standard — a six-section skeleton, shared style rules, and a strict template vocabulary. Use when writing or reviewing an agent prompt, or building a prompt renderer in any language.
license: MIT
metadata:
  version: "1.0"
---

# Prompting

Author every agent prompt to the same standard so all agents look and act the same. This skill is language-agnostic: it states the principles, and a host language implements them with its native template mechanism. Go is one conforming implementation — in Go, render through `internal/prompt`.

## The six-section skeleton

Every prompt has the same six sections in the same order:

`ROLE` → `TASK` → `INPUT` → `METHOD` → `NOTES` → `OUTPUT`

The delivery is split by what is stable and what is per-run:

- The **system prompt** carries `ROLE`, `TASK`, `METHOD`, `NOTES`, `OUTPUT` — who the agent is and how it does the job, stable across runs.
- The **`INPUT` section is authored as the user message** — the per-job data (the pair, the range, the document), rendered fresh per run. The system prompt is the stable "who I am and how I do the job"; the user message is the variable "this specific job".

- `ROLE` — who the agent is and the one question it answers. Agent-specific, short.
- `TASK` — the job in one or two sentences. Agent-specific, short.
- `INPUT` — what the agent is given: the pair, the range, or the document. Authored as the user message.
- `METHOD` — how to do the job: the loop or the steps, one bullet per step. Agent-specific, short.
- `NOTES` — the shared passage: what the shared notebook is and how to read and write it. Declared once, byte-identical across agents, included as a shared partial.
- `OUTPUT` — the final answer contract. Shared shape, per-agent field list: "End the run with a final answer: one JSON object … The JSON object is the last thing you write — no prose before or after it."

`ROLE`, `TASK`, `INPUT`, and `METHOD` are agent-specific and short. `NOTES` is the one shared passage. `OUTPUT` follows the shared shape; its JSON field list is per-agent prose.

## Style rules

- Write imperatively: "Explore", "Submit", "Record".
- Keep lines short; one idea per line.
- No prose essays. A prompt is a spec, not a letter.
- Name concrete conventions (paths, files, tools) by placeholder or by the code that owns them. Never make the agent guess.

## Separation of concerns

- Prompt = intent + method + output contract.
- Tool description = how to use a tool. Never restate tool mechanics in the prompt.
- Code = budgets, schemas, limits, lexicon values. These are data, not prose.
- Lexicon terms (what counts, what does not) render as a list from configuration, never hardcoded. A second locale is a config change, not a prompt edit.

## Template rules

Prefer the host language's native string or template mechanism over ad-hoc `Replace` or `printf` placeholders.

- Bind placeholders to a typed data model, not loose key/value maps, so a missing field fails at build time or render time rather than shipping unsubstituted text.
- Allow only three template features: field injection, shared partials (includes or fragments), and list iteration (`for`/`range`/`each`) for listing a set of items.
- Forbid conditionals (`if`/`else`/`switch`/`with`) and custom template functions. A prompt that "needs" a conditional signals a wrong data model, not a reason to add one.
- List iteration must not carry an else or empty branch.

## Review checklist

Check every prompt and every renderer against this list:

1. The system prompt carries `ROLE`, `TASK`, `METHOD`, `NOTES`, `OUTPUT` in order, and the `INPUT` section is rendered as the user message.
2. `ROLE`, `TASK`, `INPUT`, and `METHOD` are short and agent-specific.
3. `NOTES` is the shared passage, included as a partial — not restated.
4. `OUTPUT` ends with the final-answer shape; the JSON object is the last thing the agent writes.
5. Style: imperative, short lines, one idea per line, no essays.
6. No tool mechanics in the prompt; budgets, schemas, limits, and lexicon values come from code or configuration.
7. Placeholders bind to a typed data model; a missing field fails loudly, never ships unsubstituted.
8. Templates use only field injection, shared partials, and list iteration. No conditionals, no else branches, no custom functions.
9. Lexicon terms render as data from the configured locale; nothing is hardcoded.
10. `INPUT` is rendered as the user message, never the system prompt.
