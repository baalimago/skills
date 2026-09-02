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
| [`worklog-plan`](skills/worklog-plan/SKILL.md)         | Design and write a phased worklog: README, parameters, phase contracts. |
| [`worklog-validate`](skills/worklog-validate/SKILL.md) | Check worklog contracts, criteria, error coverage, and test evidence.    |
| [`worklog-work`](skills/worklog-work/SKILL.md)         | Execute the next eligible phase, or fix reopened findings.               |
| [`worklog-review`](skills/worklog-review/SKILL.md)     | Audit implementation phases against their contracts and record findings. |

The four are one lifecycle, one verb each: `plan → validate → work → review`.

## Worklog system

See [`docs/worklog-system.md`](docs/worklog-system.md) for the lifecycle,
phase contracts, review process, and `worklog-loop` usage.

Try the system with the editor-neutral
[worklog demo](examples/worklog-demo/worklog/README.md). It creates two small
text artifacts and does not require a language toolchain.

The loop and its portable `clai` profile are included in the repository:

```sh
git clone https://github.com/baalimago/skills.git
./skills/scripts/worklog-loop path/to/worklog/README.md
```

## License

MIT © Lorentz Kinde
