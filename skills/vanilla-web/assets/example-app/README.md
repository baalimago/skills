# Example app

Three documents, one purpose each: a hero (`index.html`), a todo list
(`todo.html`) and a profile (`profile.html`). Two islands enhance them:
`<todo-list>` in light DOM with an `EventTarget` store, and `<user-card>`
in a declared shadow root that refreshes itself from `data/profile.json`.
The profile's confirm dialog needs no island at all: markup opens it.
Nothing is built; the files in this directory are the files served.

## Run

```sh
python3 -m http.server 4173
```

Serve from this directory: paths are root-absolute.

## Check

The dev tools need Node, and the Nu checker needs Java.

```sh
npm install
npm run check          # html-validate, Nu, ESLint, Prettier, tsc, shell test
npx playwright install chromium-headless-shell firefox webkit
npm run test:browser   # element tests and axe in three engines
```

## What each part demonstrates

| Part                         | Rule it shows                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Six parallel `<link>` sheets | no `@import` chain; each file wraps itself in its `@layer`, `main.css` sets the order                           |
| `<!-- verbatim:* -->` blocks | HTML may repeat; the shell test keeps the copies identical                                                      |
| CSP `sha256-…` hashes        | inline import map and speculation rules allowed by hash, Trusted Types enforced                                 |
| `todo.html` form `action`    | input submitted before upgrade is adopted, not lost                                                             |
| `TodoList.#render`           | keyed rows updated in place, so focus survives a toggle                                                         |
| `todo-item:toggle` events    | children emit intent; the list is the store's only caller                                                       |
| `user-card` declared root    | styled before upgrade through a linked sheet; keeps the last known profile when the fetch fails                 |
| `profile.html` dialog        | `commandfor` opens a native modal with no module; one shim in `main.js` covers engines without invoker commands |
| `dialog` rules in `base.css` | root scroll lock while the modal is open, and an entry animation from `@starting-style`                         |
| `lib/dom.js` `find()`        | markup and code drift fails loudly, with types for tsc                                                          |
| `test/a11y.spec.js`          | axe passes both upgraded and with every module blocked                                                          |
| `test/interaction.spec.js`   | the dialog opens, holds focus, closes on Esc, returns focus, and opens with every module blocked                |
