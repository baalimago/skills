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
| [`prompting`](skills/prompting/SKILL.md)               | Author agent prompts to one standard: skeleton, style, template rules.   |
| [`review`](skills/review/SKILL.md)                     | Be one adversarial reviewer with a named profile and evidence standard. |
| [`spawn-review`](skills/spawn-review/SKILL.md)         | Fan out N parallel reviewers running `review`, then verify and fix.     |

`worklog-system` is the map. The five lifecycle skills are one verb each: `plan → validate → work → review → fix`.

## Worklog system

See [`docs/worklog-system.md`](docs/worklog-system.md) for the model,
interfaces, phase classes, andon cords, and `worklog-loop` usage.

Try the system with the editor-neutral
[worklog demo](examples/worklog-demo/worklog/README.md). It creates two small
shell commands and does not require a language toolchain.

The loop and its portable `clai` profile are included in the repository:

```sh
git clone https://github.com/baalimago/skills.git
./skills/scripts/worklog-loop path/to/worklog/README.md
```

## License

MIT © Lorentz Kinde
