# Interaction

## Contents

- The ladder
- Dialogs
- Popovers and invokers
- Disclosure and hidden content
- Forms without script
- Top-layer animation
- Page transitions
- Keys and focus
- Testing

## The ladder

Climb one rung at a time and stop at the first that works. Each rung
above adds a failure mode that survives a late or missing module.

1. An HTML element that already does it: `<button>`, `<details>`,
   `<dialog>`, `<select>`, `<input type>`.
2. An HTML attribute that wires it: `popover`, `commandfor` with
   `command`, `name` on `<details>`, `closedby`.
3. A CSS state instead of a class: `:popover-open`, `:modal`,
   `:user-invalid`, `:has()`, `:checked`, `:placeholder-shown`.
4. One delegated listener in `main.js` for the whole document.
5. An island, when state, lifecycle or a scriptable API is needed.

Rung 2 is the one agents skip. A confirm dialog, a menu, an accordion, a
tooltip and an auto-growing textarea all ship with no module at all.

## Dialogs

- Open a modal with `command="show-modal"` and `commandfor`, never with
  the `open` attribute or `show()`, which skip inertness, focus return
  and Esc ([MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)).
- Add no `role="dialog"`, `aria-modal`, focus trap or Esc handler; the
  native modal supplies each, and a second copy breaks it.
- Close it from a button with `command="close"`, or from
  `<form method="dialog">` whose submitter value becomes
  `dialog.returnValue`.
- Put the dialog after its invoker in the DOM, and `autofocus` the
  likeliest control, not the `<dialog>` itself.
- Stop the page scrolling under it in CSS, never by mutating `<html>` or
  `<body>` from script. `overscroll-behavior` on the backdrop traps the
  wheel in Chromium alone, so pair it with a hidden overflow on the root,
  which `scrollbar-gutter` keeps shift-free.

```css
html { scrollbar-gutter: stable; }
html:has(dialog:modal) { overflow: hidden; }
dialog::backdrop { overscroll-behavior: contain; }
```

- Treat `closedby="any"` as light dismiss on top of Esc and the back
  gesture; feature-test `"closedBy" in HTMLDialogElement.prototype` and
  keep a visible close button either way
  ([platform status](platform-status.md)).
- Use `<dialog popover="manual">` for a panel that leaves the page
  usable, such as a find bar; `showModal()` would block it.

Invoker commands are newly available, so keep one shim in `main.js`
rather than an island per dialog:

```js
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  /** @type {Record<string, (el: HTMLElement) => void>} */
  const commands = {
    'show-modal': (el) => /** @type {HTMLDialogElement} */ (el).showModal(),
    close: (el) => /** @type {HTMLDialogElement} */ (el).close(),
    'toggle-popover': (el) => el.togglePopover(),
    'show-popover': (el) => el.showPopover(),
    'hide-popover': (el) => el.hidePopover(),
  };
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[commandfor]');
    const command = button?.getAttribute('command') ?? '';
    const element = document.getElementById(button?.getAttribute('commandfor') ?? '');
    if (element) commands[command]?.(element);
  });
}
```

## Popovers and invokers

- Toggle a panel with `command="toggle-popover"`, or open and close it
  with `show-popover` and `hide-popover`; never put `popovertarget` and
  `commandfor` on one button, which toggles twice.
- Add the role the markup lacks: `popover` gives behaviour and no
  semantics, so a menu gets `role="menu"`, a listbox `role="listbox"`,
  and plain text a `role="tooltip"`
  ([Hidde de Vries](https://hidde.blog/popover-semantics/)).
- Return focus to the invoker when a control inside the panel hides it;
  the button disappears with the panel and focus falls to `<body>`.
- Leave `popover="hint"` and `interestfor` out; both are Chromium-only
  ([platform status](platform-status.md)).

## Disclosure and hidden content

- Reach for `<details>` with `<summary>` for anything that shows and
  hides; the content stays in the accessibility tree and in find-in-page.
- Give sibling `<details>` one shared `name` for an exclusive accordion,
  and feature-test it; without support they simply open independently.
- Style the body as `details::details-content`. Closed content keeps
  `content-visibility: hidden`, not `display: none`, which is what keeps
  it findable; to animate it, add `interpolate-size: allow-keywords`,
  `contain: layout` and a discrete `content-visibility` transition
  behind `prefers-reduced-motion`
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content)).
- Use `hidden="until-found"` only where `<details>` cannot express the
  control, and listen for `beforematch` on the element to sync any
  toggle state before the browser reveals it
  ([Chrome](https://developer.chrome.com/blog/hidden-until-found)).

## Forms without script

- Let controls size themselves with `field-sizing: content`, bounded by
  `min-inline-size` and `max-inline-size`; an unbounded input collapses
  when empty and overflows when full. A textarea takes `width: 100%`
  plus `min-block-size` and `max-block-size` in `lh` so only its height
  grows ([MDN field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing)).
- Style with `:user-invalid` and `:user-valid`, never `:invalid`, which
  matches an empty required field at load
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid)).
- Tint native controls with `accent-color`, and reach their parts with
  `::file-selector-button` and `::placeholder`; a replacement component
  loses autofill, validation and the platform picker
  ([platform status](platform-status.md)).
- Keep `<input type="checkbox" role="switch">`; the `switch` attribute
  itself is Safari-only, and `role="switch"` is permitted on a checkbox.
- Leave the customizable `<select>` and `::picker()` styling out until
  Firefox ships them; a native `<select>` already has an accessible
  picker on every platform.
## Top-layer animation

- Animate entry with `@starting-style` on the open state and keep it
  inside `@media (prefers-reduced-motion: no-preference)`; entry needs
  no JavaScript and no flags
  ([MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)).
- Ship no exit animation. It needs the `overlay` property, which only
  Chromium has, and a discrete `display` transition that Firefox parses
  but does not apply, so the panel would vanish in two engines and fade
  in one ([platform status](platform-status.md)).
- Declare `transition-behavior: allow-discrete` after the `transition`
  shorthand; inside it, an engine that cannot parse the value drops the
  whole declaration.

```css
@media (prefers-reduced-motion: no-preference) {
  /* the closed state carries the transition; the exit is instant, so only
     the entry is ever seen */
  dialog,
  [popover] {
    transition: opacity 0.15s ease-out;
  }

  dialog[open],
  [popover]:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}
```

## Page transitions

- Opt in once in `main.css`, inside `prefers-reduced-motion:
  no-preference`; both documents must carry the rule, and engines
  without it navigate normally, so nothing needs a fallback
  ([Chrome](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)).
- Add `<link rel="expect" href="#main" blocking="render">` to the head,
  so the new document is painted before the cross-fade starts; without
  it the transition can animate to a blank page, and the validator cost
  of that link is in [document head](document-head.md#purpose-block).
- Block render on nothing else. All blocking work counts against a
  timeout near four seconds, after which the browser skips the
  transition entirely.
- Give each named element a unique `view-transition-name`, and reuse that
  name on its counterpart in the other document; two elements sharing a
  name in one document cancel the whole transition.

## Keys and focus

- Let `showModal()` own focus. `delegatesFocus` on a shadow root
  forwards host focus to the first focusable node, so use it on an
  element that wraps a native control and not on one that carries its
  own role
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow)).
- Give a revealed region `tabindex="-1"` and focus it, rather than
  relying on tab order to reach it.
- Use `inert` on the rest of a panel you show without `showModal()`;
  never build a focus trap from `keydown`.
- Submit on Enter in a textarea only when `event.isComposing` is false,
  or an IME user's uncommitted text submits first
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing)).

## Testing

- Open every dialog and popover during the test and assert by role:
  `getByRole('dialog')` and `getByRole('menu')` fail when the panel has
  no accessible name ([Playwright](https://playwright.dev/docs/locators)).
- Assert Esc closes a modal and focus returns to the invoker; both are
  engine behaviour that a stray handler silently breaks.
- Run the suite once with every module blocked; an interactive control
  built on rung 1 or 2 still works, an island does not.