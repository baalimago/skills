# Elements

## Contents

- Lifecycle contract
- Light DOM or shadow DOM
- Declarative shadow DOM
- Form-associated elements
- Attributes and properties
- Events
- Styling
- Naming and registration
- Testing

## Lifecycle contract

- In the constructor call `super()`, set field defaults, call
  `attachInternals()` and attach or keep the shadow root, nothing more.
  Attributes and children do not exist yet for `createElement`, and a
  violating constructor can make creation fail
  ([HTML Living Standard](https://html.spec.whatwg.org/multipage/custom-elements.html)).
- Treat `connectedCallback` as repeatable; it "can run more than once"
  (same source). Guard one-time rendering with a private flag, give each
  connect one `AbortController` for every listener, store subscription
  and observer, and only `abort()` in `disconnectedCallback`, keeping DOM
  and state so a reinserted element resumes intact.
- Return early from `attributeChangedCallback` until the first render;
  it fires for initial attributes before `connectedCallback` (same source).
- Expect no children when the definition precedes the start tag: "the
  `querySelectorAll()` calls will not find any items"
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)).
  Define only from module scripts, which run after parsing, and watch
  later children with a `MutationObserver`, or `slotchange` on a slot.
- Define an empty `connectedMoveCallback()` so a feature-tested
  `moveBefore()` keeps state ([platform status](platform-status.md)).

```js
connectedCallback() {
  this.#controller = new AbortController();
  const { signal } = this.#controller;
  todos.addEventListener('change', () => this.#render(), { signal });
  const observer = new MutationObserver(() => this.#readChildren());
  observer.observe(this, { childList: true });
  signal.addEventListener('abort', () => observer.disconnect());
  this.#readChildren();
  this.#render();
}
disconnectedCallback() { this.#controller.abort(); }
```

## Light DOM or shadow DOM

- Write no element for markup without behaviour; the site nav is plain
  HTML and CSS, and an element would only add a failure mode.
- Default to light DOM: wrap markup that already works and augment it,
  because "If your custom element is empty, it's not an HTML web
  component" ([Jeremy Keith](https://adactio.com/journal/20618)).
- Use shadow DOM only for a widget with private structure, no server
  fallback content and no ID reference across its boundary. IDs are
  scoped per root, so `for`, `aria-labelledby`, `aria-controls` and
  `aria-activedescendant` cannot cross; such a widget belongs in light DOM
  ([Nolan Lawson](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)).
- Treat Reference Target as an enhancement: `shadowrootreferencetarget`
  points references to the host at one inner element
  ([HTMHell](https://htmhell.dev/adventcalendar/2025/4/)); feature-test
  it ([platform status](platform-status.md)) and work without it.
- Attach roots `open`; closed is not a security mechanism
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM))
  and Playwright cannot enter it ([Playwright](https://playwright.dev/docs/locators)).
- Set host semantics through `ElementInternals` (`role`, `ariaChecked`)
  so author attributes still override them
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)).

## Declarative shadow DOM

- Declare each root in the document with `<template shadowrootmode>` as
  the host's first child; the parser attaches it, so the widget paints
  before its module loads. Widely available
  ([web.dev](https://web.dev/articles/declarative-shadow-dom)).
- Hydrate in the constructor: keep `internals.shadowRoot` if present,
  else attach and stamp the same markup. `attachShadow()` on a declared
  root empties it, wiping the server markup, and `innerHTML` never
  declares one (same source).

```js
// template: the declared root's markup, <link> to the sheet included
export class SignaturePad extends HTMLElement {
  #internals = this.attachInternals();
  constructor() {
    super();
    if (this.#internals.shadowRoot) return; // declared: keep it
    const root = this.attachShadow({ mode: 'open' });
    root.append(template.content.cloneNode(true));
  }
}
```

## Form-associated elements

- Prefer a light-DOM wrapper around native controls; they work before
  upgrade, and Chrome shows no validation message for custom controls
  ([web.dev](https://web.dev/articles/more-capable-form-controls)).
- When no native control fits, as for `signature-pad`, set
  `static formAssociated = true`, call `setFormValue()` and
  `setValidity()` on every committed change, and implement the reset,
  disabled and state-restore callbacks; a stale value submits silently.
- Expose internal state with `internals.states` and `:state()`, never a
  self-applied class, since `class` belongs to the author
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:state));
  feature-test it ([platform status](platform-status.md)).

## Attributes and properties

- Give each primitive option an attribute and a property, reflected both
  ways with the attribute as source of truth, so markup, script and CSS
  agree ([web.dev](https://web.dev/articles/custom-elements-best-practices)).
- Name attributes kebab-case and properties camelCase (`max-items`,
  `maxItems`); HTML lowercases names, so camelCase attributes break
  ([Chris Ferdinandi](https://gomakethings.com/custom-event-naming-conventions-in-vanilla-js/)).
- Accept arrays, objects and nodes as properties only; reflection would
  serialize them and lose references (web.dev, above).
- Keep `attributeChangedCallback` to re-rendering; if it set the
  property, setter and callback would loop forever.
- Run the lazy-upgrade idiom first in `connectedCallback`: a property set
  before an island's module loads shadows the setter.

```js
for (const prop of ['filter', 'items']) {
  if (!Object.hasOwn(this, prop)) continue;
  const value = this[prop];
  delete this[prop];
  this[prop] = value;
}
```

## Events

- Name events `tag:verb` in lowercase (`todo-item:toggle`); the tag
  namespaces it and camelCase is unreliable (Ferdinandi, above).
- Dispatch on the host and leave `composed` false; composed events lead
  "to event pollution" ([open-wc](https://open-wc.org/guides/knowledge/events/)).
- Set `bubbles: true` only when an ancestor listens, so nothing leaks.
- Never dispatch for a property the host set; it can loop (web.dev, above).
- Send data down with attributes, properties and methods, and intent up
  with events ([LWC](https://developer.salesforce.com/docs/platform/lwc/guide/events.html)).
  Keep `detail` plain; the container, not the child, calls the store.

```js
this.dispatchEvent(new CustomEvent('todo-item:toggle', {
  bubbles: true, detail: { id: this.dataset.id },
}));
```

## Styling

- Expose a shadow widget's styling surface as documented `--tag-*`
  custom properties with `var()` fallbacks, `part` names and `:state()`;
  custom properties are the only channel that crosses the root.
- Name parts for their role and re-expose nested ones with `exportparts`.
  `::part()` rejects structural pseudo-classes and never chains
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)).
- Style slotted content's insides from outside the root; `::slotted()` reaches
  only top-level slotted elements
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted)).
- Start shadow sheets with `:host { display: block }` and
  `:host([hidden]) { display: none }`; otherwise the host is inline and
  `hidden` stops working (web.dev, above).
- Never use `:host-context()`; the CSS WG dropped it
  ([csswg](https://lists.w3.org/Archives/Public/public-css-archive/2025Mar/0859.html)).
- Keep each element's styles in one sheet, `components/<tag>/<tag>.css`.
- Nest a light-DOM sheet one level under its tag in `@layer components`
  and link it from the purpose block of each document holding the
  element. The markup exists before upgrade, so its styles must too; a
  sheet arriving with the lazy module paints unstyled, then shifts.
- Link a shadow sheet with `<link rel="stylesheet">` in the declared
  template and the stamped one, using `:host` and no `@layer` or nesting
  since the root scopes it. It styles the root before upgrade and passes
  a strict `style-src 'self'` CSP, which inline `<style>` would not.
- Reserve space with `&:not(:defined)` or `:host(:not(:defined))`
  in the element's sheet; linked before upgrade, it holds the box from
  first paint ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:defined)).
- Escape hatch: many shadow instances may share one `CSSStyleSheet`
  from `tag.css.js`, built with `replaceSync` and adopted per root
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets)).
  It is an optimisation: adopted rules arrive with the module.

## Naming and registration

- Name tags lowercase with a hyphen, avoiding reserved names such as
  `font-face` (HTML Living Standard, above), and give a child-only
  element its container's noun: `todo-item` inside `todo-list`.
- Split `Tag.js` (class, no side effects), `tag.js` (registration),
  `tag.css` and `tag.test.js`; tests and scoped registries need the class
  without the `define` side effect
  ([open-wc](https://open-wc.org/guides/developing-components/publishing/)).
- Guard `define()` with `customElements.get()`, since it throws on a
  taken name, and never import a `tag.js` from a class file; `main.js`
  alone decides eager or lazy.
- Never use customized built-ins (`is=""`), which WebKit closed WONTFIX
  ([WebKit](https://bugs.webkit.org/show_bug.cgi?id=182671)); wrap the
  native element instead: `<todo-list><ul>…</ul></todo-list>`.
- Use the global registry. Escape hatch: define a colliding third-party
  tag in a scoped registry
  ([Chrome](https://developer.chrome.com/blog/scoped-registries)) after
  a feature test; see [platform status](platform-status.md).

## Testing

- Test in a real browser through Web Test Runner or Playwright; upgrade,
  focus and form association are engine behaviour
  ([Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)).
- Query with `getByRole`, the closest match to how assistive technology
  perceives the page ([Playwright](https://playwright.dev/docs/locators)).
- Assert the contract: reflection both ways, a pre-upgrade property
  survives (define a fresh `class extends Tag {}` after creating the
  element), re-appending leaves one listener, `FormData` has the value.
- In a pinned test browser, snapshot declared roots with
  `getHTML({ serializableShadowRoots: true })`
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getHTML)).
