---
name: vanilla-web
description: Write library-free HTML5, CSS and JavaScript web apps as static multi-page documents with custom elements, ES modules and lazy islands, accessible before JavaScript runs. Use whenever the user asks for vanilla JS, no-framework, no-build or buildless web UI, web components, custom elements, or a static site with interactivity, even if they do not say "vanilla".
license: MIT
metadata:
  version: "1.0"
---

# Vanilla web

Build the app as a set of static HTML documents that custom elements
enhance. No framework, no bundler, no server logic. The browser supplies
modules, components, routing between documents and lazy loading; this
skill supplies the conventions that keep those pieces composable and
accessible.

## Principles

- Ship static documents. The initial HTML is a file on any host and
  JavaScript enhances it after paint. The host's only contract is MIME
  types, HTTP/2, compression and cache headers.
- Give every document one purpose. The head declares it: title,
  description, social preview, preloads. `<main>` holds the content.
- Let HTML repeat; never let code repeat. Markup is content, so the nav
  links appear in every document. Behaviour and presentation live once,
  in the `.js` and `.css` files every document references.
- Work before upgrade. Links, forms, labels and headings exist in the
  markup before any script runs; elements add behaviour, not content.
- Prefer the native element. Reach for ARIA only when no element has the
  semantics; a role is a promise to implement its keyboard model.
- Depend only on widely available APIs. Treat newly available ones as
  enhancements behind a feature check; see
  [platform status](references/platform-status.md).

## Terms

| Term           | Meaning                                                   |
| -------------- | --------------------------------------------------------- |
| document       | one `.html` file with one purpose                         |
| verbatim block | head and body markup that is byte-identical in every document |
| purpose block  | head markup that differs per document                     |
| island         | a custom element whose module loads on demand             |
| element        | a custom element class                                    |
| sheet          | an element's `tag.css`, linked by its document or its shadow root |
| store          | an `EventTarget` subclass that owns one slice of state     |

## Layout

```
app/
├── index.html  todo.html  profile.html   one document per purpose
├── css/
│   ├── main.css                          layer order only, no @import
│   └── reset.css tokens.css base.css …   each wraps itself in @layer
├── js/
│   ├── main.js                           eager defines + lazy islands
│   ├── lib/                              store.js fetch.js dom.js lazy-define.js
│   ├── stores/                           one store per concern
│   └── components/<tag>/                 Tag.js tag.js tag.css tag.test.js
├── data/                                 static JSON, a path contract
├── assets/                               images, icons, og previews
└── test/shell-equality.test.js           verbatim blocks identical
```

`Tag.js` exports the class and has no side effects. `tag.js` imports it
and calls `customElements.define`. Tests and scoped registries import the
class file. A complete example is in [assets/example-app](assets/example-app).

## Add a document

1. Copy the verbatim blocks from an existing document: the head block
   from charset to manifest, and the body blocks for skip link, header
   and footer. Change only `aria-current` on the nav.
2. Write the purpose block: `<title>` (page first, site last),
   description, canonical, Open Graph with `og:image:alt`, structured
   data if the page is an entity, `theme-color`. Field list in
   [document head](references/document-head.md).
3. Declare what the page loads: the sheet of every light-DOM island it
   contains, `preload` for the LCP image, `modulepreload` for every module
   its islands import, speculation rules for the likely next document.
4. Write `<main>` with the content complete and usable without scripts.
   Wrap the interactive region in its island tag.
5. Run the equality test and the validators in Validate.

## Add an element

1. Confirm the markup needs behaviour. Markup without behaviour stays
   plain HTML and CSS; an element that only renders is cost without gain.
2. Decide the root. Wrap existing markup in light DOM by default. Use
   shadow DOM only for a self-contained widget with private structure and
   no ARIA relation to outside elements; declare it in the document with
   `<template shadowrootmode>`. Rules in [elements](references/elements.md).
3. Create `components/<tag>/` with the class file, the registration file
   and the sheet. Register the tag in `main.js`: eagerly when every
   document needs it, through `lazyDefine` for islands.
4. Link the sheet where the markup is, so it is styled before upgrade.
   A light-DOM sheet nests its rules under the tag inside
   `@layer components`, and each document that contains the element
   links it. A shadow sheet
   uses `:host` and is linked by a `<link>` inside the root, because a
   strict CSP blocks an inline `<style>` there.
5. In `connectedCallback` create one `AbortController`, add every
   listener, observer and store subscription with its signal, read the
   existing children, then render. Abort it in `disconnectedCallback`.
6. Expose primitives as attributes and properties that reflect; expose
   rich data as properties only. Keep `attributeChangedCallback` free of
   side effects beyond re-render.
7. Communicate upward with `CustomEvent` named `tag:verb`, bubbling only
   when a parent listens, never composed. Communicate downward with
   attributes, properties and method calls.
8. Write `tag.test.js` against the element in a real browser.

## Rules

- Head order is fixed: meta, CSP, stylesheets, import map, `main.js`,
  then the purpose block. The import map is inline and precedes every
  module. The CSP carries the hash of every inline script and enforces
  Trusted Types; the equality test checks the hashes.
- Import by path with the extension; prefix bare specifiers through the
  import map. No barrel files; import graph depth at most three.
- Never chain stylesheets with `@import`. Link every sheet from the head
  so all download at once; each file wraps itself in its `@layer`, and
  `main.css`, linked first, only declares the order. Module scripts wait
  for stylesheets, so a chain delays both paint and every island.
- One store per concern. The store is the only writer; elements call its
  methods and re-render on its `change` event. Children emit intent, never
  mutate shared state.
- Render fixed structure once, then mutate targets. Key list rows by id:
  stamp new rows from a `<template>` with `importNode`, remove departed
  rows, update kept rows in place. Removing a focused node drops focus.
- Never lose input given before upgrade. An island's form has a real
  `action` and `method`; the island adopts an early native submission
  when it upgrades.
- Never lazy-load the LCP candidate. Use `:not(:defined)` only to
  reserve space for what upgrade changes. Prefer a "Load more" button to
  infinite scroll.
- Untrusted strings go through `textContent` or `setHTML` with a text
  fallback, never `innerHTML`.
- Style through `@layer` for file priority and one level of nesting
  under the element's tag for structure. Adopt `@scope` once it is
  widely available; a browser without it drops the whole block. Custom
  properties are the only styling channel that crosses a shadow boundary.
  Never load a sheet with the module that upgrades its markup; the markup
  paints first and would shift.
- Keep the escalation ladder explicit. Duplicate the shell and test
  equality. Past five documents or a churning shell, generate documents
  from one layout file. Only a cross-section app state justifies a single
  document with the Navigation API; that is a different architecture.

## Validate

Run every gate before finishing:

- `html-validate` with the `standard`, `a11y` and `document` presets and
  the Nu checker on every document.
- axe-core through Playwright on every document twice: after islands
  upgrade, and with every module blocked to prove the pre-upgrade state.
- The shell-equality test: verbatim blocks, CSP hashes, the
  `package.json` `imports` mirror, one purpose per document, and
  `modulepreload` lists against the import graph.
- ESLint flat config with `@eslint/js` only, Prettier run separately,
  `tsc --noEmit` with `checkJs` over JSDoc types.
- Element tests in Chromium, Firefox and WebKit through Playwright
  `getByRole` or Web Test Runner. Include a test that delays the
  island's module, so pre-upgrade behaviour stays covered.

## References

- [document head](references/document-head.md): verbatim blocks, CSP,
  purpose block fields, equality test.
- [elements](references/elements.md): lifecycle contract, light versus
  shadow DOM, reflection, events, form association, styling.
- [modules](references/modules.md): import maps, preloading, file split,
  CSS layers and nesting, typing, when a build step is justified.
- [loading](references/loading.md): islands, lazy define, fetch, service
  worker strategies, observers, Core Web Vitals.
- [accessibility](references/accessibility.md): native element catalogue,
  focus and keyboard, live regions, forms, WCAG 2.2 deltas.
- [platform status](references/platform-status.md): dated Baseline table
  and per-engine blockers. Check it before relying on anything newer than
  widely available.
