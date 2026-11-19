# imago / skills

> Small, opinionated skills for capable coding agents.

## Install

```sh
npx skills@latest add baalimago/skills
```

Install one skill instead:

```sh
npx skills@latest add baalimago/skills --skill worklog-work
```

## Skills

| Skill                                                  | Use it for                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`worklog-system`](skills/worklog-system/SKILL.md)     | Learn what a worklog is and choose the right lifecycle skill.            |
| [`worklog-plan`](skills/worklog-plan/SKILL.md)         | Design a phased worklog: a README and one interface per phase.           |
| [`worklog-validate`](skills/worklog-validate/SKILL.md) | Check a planned worklog against a fixed set of checks before sign-off.   |
| [`worklog-work`](skills/worklog-work/SKILL.md)         | Execute the next phase between full gate runs; stop the line on red.     |
| [`worklog-review`](skills/worklog-review/SKILL.md)     | Audit implementation phases against their interfaces and record findings. |
| [`worklog-fix`](skills/worklog-fix/SKILL.md)           | Close validation and review findings, and restart a stopped line.        |
| [`worklog-orchestrate`](skills/worklog-orchestrate/SKILL.md) | Run a whole worklog to done, spawning one cheap worker per phase.  |
| [`prompting`](skills/prompting/SKILL.md)               | Author agent prompts to one standard: skeleton, style, template rules.   |
| [`review`](skills/review/SKILL.md)                     | Be one adversarial reviewer with a named profile and evidence standard. |
| [`spawn-review`](skills/spawn-review/SKILL.md)         | Fan out N parallel reviewers running `review`, then verify and fix.     |
| [`vanilla-web`](skills/vanilla-web/SKILL.md)           | Build library-free HTML/CSS/JS apps as static documents with islands.   |

`worklog-system` is the map. `worklog-orchestrate` drives the whole lifecycle;
the five step skills are one verb each: `plan → validate → work → review → fix`.

## Worklog system

See [`docs/worklog-system.md`](docs/worklog-system.md) for the model,
interfaces, phase classes, and andon cords.

Try the system with the editor-neutral
[worklog demo](examples/worklog-demo/worklog/README.md). It creates two small
shell commands and does not require a language toolchain.

The orchestrator drives the skills; the repository ships no runner. Point your
agent at the worklog and it picks the verb:

```sh
clai q "Run the worklog-work skill on path/to/worklog/README.md"
```

## License

MIT © Lorentz Kinde
