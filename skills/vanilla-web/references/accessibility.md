# Accessibility

## Contents

- ARIA rules
- Native element catalogue
- Keyboard and focus
- Live regions
- Document structure
- User preferences
- Forms
- WCAG 2.2 deltas
- Security floor
- Validation tooling

## ARIA rules

- Use the native element whenever one has the semantics you need; it
  brings focus, keyboard and state that ARIA never adds
  ([Using ARIA](https://www.w3.org/TR/using-aria/)).
- Never re-role a native element: `<ul role="navigation">` erases the
  list; wrap it in an element that carries the role instead
  ([APG](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)).
- Never restate an implicit role, as in `<nav role="navigation">`; the one
  exception is a list whose markers were removed and lost its role
  ([ARIA in HTML](https://www.w3.org/TR/html-aria/)).
- Never set ARIA state on a native control; native wins, so `aria-checked`
  on a checkbox is ignored ([ARIA in HTML](https://www.w3.org/TR/html-aria/)).
- Treat a role as a promise: `role="button"` adds no focus, Enter or
  Space, so build all three or use `<button>`
  ([APG](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)).
- Never put `aria-hidden="true"` or `role="presentation"` on a focusable
  element or its ancestor; keyboard focus would land on silence
  ([Using ARIA](https://www.w3.org/TR/using-aria/)).
- Never use abstract roles, `role="generic"`, `role="button"` on
  `<summary>`, or `aria-hidden` on `<body>`; each fights the browser
  ([ARIA in HTML](https://www.w3.org/TR/html-aria/)).

## Native element catalogue

Look up the need before writing any `role`. Rows marked "feature-test
this" are enhancements; see [platform status](platform-status.md).

| Need | Use | Rule and pitfall |
| --- | --- | --- |
| Modal window | `<dialog>` opened with `command="show-modal"` or `showModal()` | Sets `aria-modal="true"` and makes the rest of the document inert; a custom dialog must rebuild Esc, focus and inertness by hand. Add no `role` and no focus trap ([MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)) |
| Disclosure, accordion | `<details>` with `<summary>` | No `role` allowed; the `<summary>` content is the name. A shared `name` makes the group exclusive; feature-test this, though unsupported engines merely open panels independently ([MDN details](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)) |
| Menu, listbox, tooltip, non-modal panel | `popover` on the panel, `commandfor` with `command="toggle-popover"` on a `<button>` | Always non-modal ([MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)). It adds behaviour but no role: set `role="menu"`, `"listbox"`, `"dialog"`, or `"tooltip"` for plain text only, and place the panel right after the invoker in the DOM so reading order matches tab order ([Hidde de Vries](https://hidde.blog/popover-semantics/)). Feature-test both; see [interaction](interaction.md) |
| Search form | `<search>` around the `<form>` | Replaces `role="search"`; never wrap results in it ([MDN search](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search)) |
| Expandable detail that find-in-page must reach | `<details>`, or `hidden="until-found"` when its control lives elsewhere | Hidden content stays searchable only this way; `display: none` and `hidden` remove it from find-in-page and from the accessibility tree. Reveal `hidden="until-found"` content by listening for `beforematch` ([Chrome](https://developer.chrome.com/blog/hidden-until-found)) |
| Result of a calculation or action | `<output for="a b">` | Implicit `status` role, but VoiceOver with Safari and NVDA with Firefox drop its name, so put the whole message in its content ([Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)) |
| Task progress | `<progress value max>` | Label it with `<label>` or `aria-labelledby`; inner text is a fallback, not a name; no `value` means indeterminate ([MDN progress](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress)) |
| Value in a known range | `<meter>` | Fixed role, no `role` allowed; label it like `<progress>` ([MDN meter](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter)) |
| Suggestions | `<datalist>` via `<input list>` | Enhancement of a labelled text input only: not a `<select>`, unstylable, does not scale with zoom, silent in NVDA with Firefox ([MDN datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist)) |
| Date or time | `<time datetime>` | `datetime` holds the machine value; without it the text must be one ([MDN time](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time)) |
| Action on this document | `<button type="button">` | Inside a form a button defaults to `submit` ([MDN button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)) |
| Go to a URL or anchor | `<a href>` | Never `href="#"` and never `role="button"`: Enter follows a link, Space scrolls the document ([Adrian Roselli](https://adrianroselli.com/2016/01/links-buttons-submits-and-divs-oh-hell.html)). Disable by removing `href`, not with `aria-disabled` ([ARIA in HTML](https://www.w3.org/TR/html-aria/)) |
| Related controls | `<fieldset>` with `<legend>` | The legend names the group for every control inside ([WAI forms](https://www.w3.org/WAI/tutorials/forms/)) |
| Video with speech | `<video controls>` with `width`, `height`, `poster` and `<track kind="captions">` | Silence is not an exemption; the caption track carries the words. Omit `autoplay` unless the video is muted, and then offer a pause control ([WCAG 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)) |
| Decorative background video | `<video muted>` with no `controls` and `role="none"` | Valid only while the element holds no focusable content; `aria-hidden` on a control "violates core accessibility" ([MDN video](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)) |

## Keyboard and focus

- Use only `tabindex="0"` and `tabindex="-1"`; a positive value pulls the
  tab order away from the DOM, so fix the DOM order instead
  ([APG keyboard](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- Give each composite widget one tab stop by roving tabindex: on an arrow
  key set `-1` on the old item and `0` on the new, then `focus()` it. Use
  `aria-activedescendant` only when focus must stay in a text input
  ([APG keyboard](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- Never let focus fall to `<body>` when a dialog closes or an item is
  deleted; move it to the invoker or the neighbouring item
  ([APG keyboard](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)).
- Keep the browser focus ring; restyle it only through `:focus-visible`
  at 3:1 contrast (SC 1.4.11), the one place `outline: none` may appear
  ([MDN :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)).
- Make `<a href="#main">Skip to main content</a>` the first focusable
  item of the body verbatim block and give `<main>` that id; landmarks
  meet 2.4.1, yet sighted keyboard users need the link
  ([WebAIM](https://webaim.org/techniques/skipnav/)).
- Hide it off-screen until focused, never by `display: none`, `hidden`,
  zero size or matching colours; each drops it from tab order or from
  sight ([WebAIM](https://webaim.org/techniques/skipnav/)).
- Put `inert` on whole subtrees such as off-screen panels and `disabled`
  on single controls; add a visual cue, since `inert` shows none
  ([MDN inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)).
- Open modals with `showModal()`: it inerts the rest, escapes an inert
  ancestor and closes on Esc. Put `autofocus` on the likeliest control,
  never `tabindex` on `<dialog>`, and always show a close button
  ([MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)).
- Do not pass `focus({ preventScroll: true })` without checking the
  result; it can leave the focused element off-screen. Put
  `scroll-padding` on `html` instead, so the browser scrolls it clear of
  sticky bars.
- Feature-test `"closedBy" in HTMLDialogElement.prototype` before relying
  on light dismiss; Esc and the close button remain the contract.
- Stop the page scrolling under a modal with one rule on the root,
  `html:has(dialog:modal) { overflow: hidden }`, after
  `scrollbar-gutter: stable`; the gutter keeps the layout still, while
  `overscroll-behavior` alone leaves the page scrolling outside Chromium.
  Rules in [interaction](interaction.md).

## Live regions

- Write each live region into the markup, empty, before the first change
  it announces; fill it with plain text, and a task later if made by script
  ([MDN live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)).
- Default to `role="status"` with a redundant `aria-live="polite"`, which
  waits for idle; `role="alert"` interrupts, so reserve it for urgent
  news and never add `aria-live="assertive"`, which iOS VoiceOver doubles
  ([MDN live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)).
- Never rely on `aria-atomic`, `aria-relevant` or `aria-busy`; they
  "can't be relied on yet"
  ([Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)).
- Show each message where it persists too, since speech is transient,
  and move focus instead when the update changes context
  ([Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/)).
- Hide a region by clipping, never `display: none` or `hidden`.

## Document structure

- Give each document one `<h1>` naming its purpose; extra nested `<h1>`
  are non-conforming, and no level is picked for its size
  ([MDN headings](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements)).
- Never skip a level going down; closing back up is fine. Keep repeated
  regions at one rank in every document
  ([WAI headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)).
- Write one `<main>`; `<header>` and `<footer>` are `banner` and
  `contentinfo` only outside `<article>` and `<section>`. Label each
  `<nav>` once there are two, as in `aria-label="Primary"`
  ([WAI regions](https://www.w3.org/WAI/tutorials/page-structure/regions/)).
- Title order, `lang` and zoom are in [document head](document-head.md).
- Choose alt text by the first branch that fits
  ([WAI alt tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)):
  1. Contains text: `alt=""` if the same text is adjacent, else the text.
  2. In a link or button with no other name: the destination or action.
  3. Adds meaning: a short description; chart data goes in the body.
  4. Decorative or repeating nearby text: `alt=""`, allowing only role
     `none` ([ARIA in HTML](https://www.w3.org/TR/html-aria/)).
- Name icon-only buttons with visually hidden text, never `display: none`
  ([MDN button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)).

## User preferences

- Write motion inside `@media (prefers-reduced-motion: no-preference)` so
  static is the default; large scaling and panning can trigger vestibular
  disorders
  ([MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
- Set `color-scheme: light dark` on `:root` so controls and scrollbars
  follow the user; its `<meta>` twin is in the verbatim block
  ([MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)).
- Override colour tokens in `@media (prefers-color-scheme: dark)`; switch
  to `light-dark()` once [platform status](platform-status.md) allows.

## Forms

```html
<label for="email">Email</label>
<p id="email-hint">We send the receipt here.</p>
<input id="email" name="email" type="email" autocomplete="email"
       required aria-describedby="email-hint" data-error="email-error">
<p id="email-error" class="field-error"></p>
```

- Match `for` to the control `id` exactly; wrap the control in its label
  only when ids are unavailable, and hide a label only by clipping
  ([WAI labels](https://www.w3.org/WAI/tutorials/forms/labels/)).
- Keep the error's id out of `aria-describedby` in the markup and add it
  on error, after the hint, removing it on fix: a referenced description
  is read even while it is hidden, so markup that names it announces the
  error before the user has typed
  ([WAI notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)).
- Style errors with `:user-invalid`, never `:invalid`, which matches empty
  required fields on load
  ([MDN :user-invalid](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid)).
- Mirror `:user-invalid` into `aria-invalid` from `input`, `change`,
  `blur` and `invalid`, since no event reports the pseudo-class itself.
  Set it to `false` rather than leaving it unset: Firefox and Safari
  expose an empty required field as invalid from load, and Chromium
  exposes it after interaction only when the attribute is `true`
  ([Chrome](https://developer.chrome.com/docs/forms/validate-accessible-forms)).
- Make one visually hidden `role="status"` region per page announce the
  message that appears when a field loses focus; a live region that is
  shown rather than changed is announced unreliably, so never mark each
  error message as a live region (same source).
- After a failed submit without reload, fill a summary that exists empty
  as `role="alert"`: a heading with the count, one link per error naming
  label, problem and fix; then focus the first invalid field
  ([WAI notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)).

```html
<div role="alert" id="form-errors">
  <h2>2 errors in Billing address</h2>
  <ul>
    <li><a href="#email">Email: enter an address with an @</a></li>
    <li><a href="#postcode">Postcode: enter 5 digits</a></li>
  </ul>
</div>
```

- Declare constraints in markup so they work before script; `minlength`
  and `maxlength` are checked on user edits only
  ([MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)).
- Use `setCustomValidity()` only for cross-field rules, on a control: on
  `<fieldset>` it does not block submission. Clear it with `""`
  ([MDN constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)).
- Let native bubbles report errors by default. An island that renders its
  own messages adds `novalidate` on upgrade and calls `checkValidity()`.
- Submit from script with `requestSubmit(submitter)`, never `submit()`,
  which skips validation and the `submit` event; the server revalidates
  ([MDN requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit)).
- Order `autocomplete` tokens as the spec does: `section-*`, then
  `shipping`/`billing`, then a field name or `home`/`work`/`mobile` plus a
  contact field, then `webauthn`, as in `"shipping postal-code"`
  ([HTML autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)).
- Choose `type` first and add `inputmode` only where no type fits; it
  picks a keyboard and enforces nothing
  ([MDN inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode)).
- Keep `action` and `method` working; on `submit`, not `click`, call
  `preventDefault()` and `fetch` a `new FormData(form, event.submitter)`,
  reporting failure in a pre-existing `role="alert"`
  ([pqina](https://pqina.nl/blog/async-form-posts-with-a-couple-lines-of-vanilla-javascript/)).
- A `FormData` body is always `multipart/form-data`; URL-encoded endpoints
  get `new URLSearchParams(formData)`, and `GET` gets it as the query
  ([stitcher.io](https://aggregate.stitcher.io/post/1ff66e85-db2e-4bcf-88bb-6828f52ede22)).

## WCAG 2.2 deltas

| SC | Level | Authoring change |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | AA | A focused control may not be fully covered by sticky headers, footers or banners; set `scroll-padding` on `html` to their height ([WAI what's new](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)) |
| 2.5.7 Dragging Movements | AA | Every drag has a single-pointer alternative, such as move buttons |
| 2.5.8 Target Size (Minimum) | AA | Targets are at least 24×24 CSS px, or spaced so a 24 px circle on each overlaps no other; links inside a sentence are exempt ([Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). Aim for 44×44 on buttons ([MDN button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)) |
| 3.2.6 Consistent Help | A | Help links keep the same relative order in every document; keep them in the verbatim block |
| 3.3.7 Redundant Entry | A | Data entered earlier in a process is prefilled or selectable; carry it in the store and use `autocomplete` |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive test without an alternative; mark fields `current-password`, `new-password` or `one-time-code` and never block paste |
| 4.1.1 Parsing | removed | Validity is no longer a WCAG pass/fail; keep the validators as a gate because broken markup still corrupts the accessibility tree ([WAI what's new](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)) |

## Security floor

- Write untrusted strings only through `textContent`, `append` or
  `setAttribute` on non-executable attributes, never `innerHTML`, `outerHTML`,
  `document.write`, `eval`, string timers, `on*` or `javascript:` URLs
  ([OWASP DOM XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)).
- Validate a URL's scheme before it reaches `href` or `src`; encoding
  cannot neutralise `javascript:`
  ([OWASP DOM XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)).
- Render untrusted HTML with `setHTML()`, which always strips script, not
  `setHTMLUnsafe()`; feature-test it and fall back to `textContent`
  ([alfy.blog](https://alfy.blog/2026/05/07/html-sanitizer-api.html)).
- Add `require-trusted-types-for 'script'` to the CSP so a string sent to
  `innerHTML` throws in tests, with one named policy as the only door;
  feature-test this. CSP delivery is in [document head](document-head.md)
  ([MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)).
- Load no third-party script by default; one that is unavoidable gets
  `integrity` plus `crossorigin="anonymous"`, since browsers block
  `no-cors` requests that carry `integrity`
  ([MDN SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)).
- `integrity` does not cover `import`; guard a cross-origin module graph
  with the import map's `integrity` block, and feature-test this
  ([Shopify](https://shopify.engineering/shipping-support-for-module-script-integrity-in-chrome-safari)).

## Validation tooling

| Tool | Run | Catches | Limit |
| --- | --- | --- | --- |
| html-validate | `extends` `html-validate:standard`, `html-validate:a11y`, `html-validate:document` on every document | `prefer-native-element` (any `role` with a native equivalent), `no-redundant-role`, `heading-level`, `input-missing-label`, `hidden-focusable`, `prefer-button`, `wcag/h*` ([presets](https://html-validate.org/rules/presets.html); [prefer-native-element](https://html-validate.org/rules/prefer-native-element.html)) | `a11y` alone skips document structure; extend all three |
| Nu Html Checker | `java -jar vnu.jar`, `npm install vnu-jar`, or the `ghcr.io/validator/validator` image ([validator](https://github.com/validator/validator)) | HTML, CSS and SVG conformance | "An ongoing experiment", not a certification ([Nu about](https://validator.w3.org/nu/about.html)) |
| axe-core | Through Playwright on every document after islands upgrade | 105 rules, including `button-name`, `landmark-one-main`, `heading-order`, `target-size` ([axe rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)) | Automation finds about 57% of issues by volume, a vendor figure ([Deque](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues)); keyboard and screen-reader passes stay manual |
| Lighthouse | Accessibility category | The same axe rules as a weighted pass/fail score ([Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)) | Manual audits are excluded; 100 is not conformance |
| Playwright `getByRole` | In every element test | Controls by role and name, "the closest way to how users and assistive technology perceive the page" ([Playwright locators](https://playwright.dev/docs/locators)) | Pierces open shadow roots only; a failed lookup usually means a missing name |
