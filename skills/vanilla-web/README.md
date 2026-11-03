# vanilla-web

A styleguide skill for building web apps with HTML, CSS and JavaScript
only: no framework, no bundler, no server logic. It targets coding agents,
but the conventions are the same ones a human team would adopt.

**This skill was developed agentically.** A coordinating agent ran five
parallel research agents, a report writer, and five reference writers,
with a human reviewing and steering between rounds. The chain of evidence
is kept: every rule in `references/` carries the link it was derived from.

It was manually reviewed though. Look here is a speling error as proof.

## How it was made

1. **Research.** Five agents each took one subtopic: semantic HTML and
   accessibility, custom elements, module architecture, lazy loading and
   fetching, and state, events, routing and security. They wrote notes
   with inline citations and flagged gaps and conflicting sources
   instead of resolving them silently.
2. **Synthesis.** One agent merged the notes into a report, keeping only
   sourced claims. The human read a summary and challenged it.
3. **Decisions.** The human set the premises below. The coordinating
   agent recorded them so later drafting could not re-argue them.
4. **Style study.** The coordinator read the Agent Skills specification,
   Anthropic's skill-authoring guide and this repository's `prompting`
   standard. It distilled them into rules: one imperative rule per line
   with its reason, one term per concept, a default plus an escape
   hatch, no dates in the body, and references one level deep.
5. **Writing.** The coordinator wrote `SKILL.md`, this README and the
   document-head reference. Five agents wrote the other references from
   the notes, under a shared terms table.
6. **Verification.** The coordinator built the example app and ran every
   gate the skill prescribes: both HTML validators, ESLint, Prettier,
   tsc, the shell test, and axe plus element tests in Chromium, Firefox
   and WebKit. The run found defects in the first draft, and the skill
   was corrected:
   - Island sheets shipped with lazy modules shifted layout.
   - An inline `<style>` in a declared root broke the strict CSP.
   - A full list re-render dropped keyboard focus.
   - A form submitted before upgrade lost its input in 4 of 16 runs.
   - `@scope` broke the skill's own widely-available rule.
   - A throttled benchmark showed an `@import` chain costing a round
     trip before first paint; stylesheets are now linked in parallel.

## Decisions

- **Document-first, not server-rendered.** The initial HTML is a static
  file on any host. The host's only contract is MIME types, HTTP/2,
  compression and cache headers. Per-request personalisation, if ever
  needed, is an additive layer.
- **Multi-document, not single-page.** One `.html` per purpose, with its
  own head as a manifest of that purpose. HTML has no include mechanism
  after four attempts since 2011; the skill leans into that instead of
  fighting it.
- **HTML may repeat; code may not.** Markup is content and may be
  duplicated, guarded by an equality test. Behaviour and presentation
  live once in referenced files.
- **HTML-first components.** Custom elements wrap existing markup in
  light DOM by default. Shadow DOM is reserved for self-contained widgets.
- **Baseline as the dependency line.** Widely available APIs are
  dependencies; newly available ones are feature-tested enhancements.
  The one dated file, `references/platform-status.md`, says which is which.

## Mentality

The browser is the framework. Every convention here exists to keep the
pieces the platform already provides composable: a document that reads
before scripts run, an element that cleans up after itself, a store that
is the only writer, a head that says what the page is for. When the
platform lacks a primitive, the skill prescribes one hand-written idiom
rather than a library, and says what it costs.

## Sources

The research notes and report are not shipped with the skill. Primary
sources the references cite most:

- [HTML Living Standard](https://html.spec.whatwg.org/multipage/) and
  [MDN Web Docs](https://developer.mozilla.org/)
- [web-features explorer](https://web-platform-dx.github.io/web-features-explorer/)
  for Baseline status
- [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/),
  [ARIA in HTML](https://www.w3.org/TR/html-aria/),
  [WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [web.dev custom element best practices](https://web.dev/articles/custom-elements-best-practices)
  and [declarative shadow DOM](https://web.dev/articles/declarative-shadow-dom)
- [open-wc](https://open-wc.org/guides/) and
  [Modern Web buildless guides](https://modern-web.dev/guides/going-buildless/)
- HTML web components writing by
  [Jeremy Keith](https://adactio.com/journal/20618),
  [Jim Nielsen](https://blog.jim-nielsen.com/2023/html-web-components/),
  [Eric Meyer](https://meyerweb.com/eric/thoughts/2023/11/01/blinded-by-the-light-dom/),
  [Chris Ferdinandi](https://gomakethings.com/html-web-components/),
  [Zach Leatherman](https://www.zachleat.com/web/a-taxonomy-of-web-component-types/),
  [Lea Verou](https://lea.verou.me/blog/2024/wcs-vs-frameworks/)
- [Nolan Lawson on shadow DOM and ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)
- [whatwg/html#2791](https://github.com/whatwg/html/issues/2791) and
  [WICG declarative partial updates](https://github.com/WICG/declarative-partial-updates)
  for the state of HTML includes
- [Agent Skills specification](https://agentskills.io/specification) and
  [Anthropic skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
  for the skill's own form

## Adopting it

Install with the repository's other skills, or copy the `vanilla-web`
directory into your agent's skills location. Read `SKILL.md` first; it
is under 200 lines. Open a reference only when a task touches its topic.
The example app under `assets/example-app` is a runnable three-document
tree you can serve with any static file server.
