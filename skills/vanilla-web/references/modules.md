# Modules

## Contents

- Module scripts
- Import map
- Preloading
- Imports and islands
- File layout
- Styles
- Types and tests
- When to build

## Module scripts

- Reach every module by one URL. Modules run once, deferred and strict
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)),
  but once per URL: `x.js` and `x.js?v=2` both run, so `define` throws.
- Use relative paths in workers. Import maps do not apply there, and
  `import()` throws in a service worker
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)).

## Import map

- Write one inline map in the verbatim block, placed per
  [head order](document-head.md#verbatim-blocks). It cannot take `src`, and a
  second map merges only in some engines and cannot retarget a specifier
  ([MDN importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap));
  see [platform status](platform-status.md).
- Allow the map in the CSP by the hash of its exact text; CSP treats it
  as an inline script
  ([HTML](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element)).
  The map is verbatim, so one hash serves every document; recompute it
  on change; the equality test asserts the hash is present.
- Prefix own code with `#lib/`, `#stores/` and `#components/`. A `#`
  name cannot collide with a package, and Node's `package.json`
  `imports` field accepts only `#` names, so tsc and Node can mirror it.
- End a prefix key and its value with `/`. The longest matching key
  wins whatever the order, so an exact entry overrides a prefix
  ([MDN importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)).
- Use `scopes` only for a vendored file needing another version of a
  name, with root-absolute values; scope values resolve as in `imports`
  ([MDN importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)).
- Add `integrity` for every file you did not write, keyed by resolved
  URL. It covers static imports, `import()` and preloads
  ([MDN importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)).
- Bust caches through the map: point each bare name at a versioned
  file, so an upgrade changes one line and no importer
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)),
  and serve that file `immutable`
  ([web.dev HTTP cache](https://web.dev/articles/http-cache)).
- Serve own files `no-cache` with an `ETag`. A prefix maps a directory,
  so it cannot carry a per-file hash.

```html
<script type="importmap">{
  "imports": { "#lib/": "/js/lib/", "#stores/": "/js/stores/",
    "#components/": "/js/components/",
    "marked": "/js/vendor/marked-12.0.2.js" },
  "scopes": {
    "/js/vendor/editor/": { "marked": "/js/vendor/marked-4.3.0.js" } },
  "integrity": { "/js/vendor/marked-12.0.2.js": "sha384-…" }
}</script>
```

## Preloading

- Preload modules with `modulepreload`, never `preload`. It parses and
  compiles into the module map; `preload` only caches bytes
  ([MDN modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload)).
- List every module, transitive ones included. Browsers follow
  dependencies only as an optimisation
  ([MDN modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload)),
  and each unlisted import waits for its parent: the waterfall avoided
  by listing "all the modules we know we'll need up front"
  ([JS Jabber 441](https://devchat.tv/podcasts/javascript-jabber/episodes/jsj-441-the-present-and-future-of-javascript-bundling-and-delivery-with-yoav-weiss)).
- Preload `main.js`'s eager graph in the verbatim block and each
  island's graph in the purpose block of the documents holding it. Skip
  islands behind rare interactions; over-preloading starves other work
  ([MDN modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload)).
- Write the resolved URL in `href`. A link ignores the map, and a URL
  that differs from the resolved one fetches the module twice.
- Write the lists by hand and let the equality test walk `import`
  statements from `main.js` and each island in the document, failing on
  any difference. A list nobody checks duplicates the graph and drifts.

## Imports and islands

- Import by full path with the `.js` extension. Extensionless paths
  "don't work in the browser because it doesn't have direct access"
  ([modern-web.dev ES modules](https://modern-web.dev/guides/going-buildless/es-modules/)).
- Resolve a sibling asset with `new URL("./x.svg", import.meta.url)`.
  A relative URL otherwise resolves against the document
  ([modern-web.dev ES modules](https://modern-web.dev/guides/going-buildless/es-modules/)).
- Read data with `fetch()`, so a failure stays in one element. Escape
  hatch: import constant JSON `with { type: "json" }`, served as
  `application/json`, never `assert`
  ([MDN import with](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with));
  feature-test this per [platform status](platform-status.md), as an
  unsupported attribute fails the whole graph.
- Never import CSS `with { type: "css" }`. CSS module scripts are not in
  every engine
  ([web-features](https://web-platform-dx.github.io/web-features-explorer/features/css-modules)).
- Load an island's `tag.js` with `import()` and its `#components/`
  specifier. It downloads "only when the function is executed"
  ([modern-web.dev ES modules](https://modern-web.dev/guides/going-buildless/es-modules/)).
- Catch a rejected island import and leave the markup alone; the
  document works without it. Triggers are in [loading](loading.md).

## File layout

- Give each element `js/components/<tag>/` with `Tag.js`, `tag.js`,
  `tag.css` and `tag.test.js`. "The co-location is key to sanity"
  ([blog.master.dev](https://blog.master.dev/architecture-through-component-colocation/)).
- Keep `Tag.js` free of side effects and call `define` in `tag.js`. "JS
  files with side effects should exist separately"
  ([open-wc](https://open-wc.org/guides/developing-components/publishing/)),
  so tests and scoped registries import the class unregistered.
- Import downward only: elements, then stores, then `lib/` as leaves. A
  cycle throws `ReferenceError` once a binding is read in evaluation
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)).
- Keep chains at most three imports deep, as in `tag.js` → `TodoList.js`
  → `#stores/todos.js` → `#lib/store.js`; nesting is a "waterfall"
  ([gomakethings](https://gomakethings.com/web-performance-and-parallel-vs.-waterfall-downloads/)).
- Write no barrel `index.js`. "The entire file you're importing from is
  downloaded" even for one function, and a barrel adds a hop
  ([JS Jabber 441](https://devchat.tv/podcasts/javascript-jabber/episodes/jsj-441-the-present-and-future-of-javascript-bundling-and-delivery-with-yoav-weiss)).

## Styles

- Link every global sheet from the verbatim block, `main.css` first.
  `main.css` only declares the layer order, where "The first declared
  layer gets the lowest priority"
  ([MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer)).
- Never `@import` one sheet from another. The browser finds an imported
  file only after parsing its parent, and module scripts wait for
  pending stylesheets. In the example app at 150 ms latency, a two-level
  chain cost one round trip: first paint 136–175 ms and island upgrade
  90–145 ms later, across 20 interleaved pairs per page.
- Wrap each file's whole content in its own `@layer` block, since a
  `<link>` cannot assign a layer.
- Layer everything, vendor CSS included. Unlayered declarations beat
  every layered one, and `!important` inverts the layer order
  (MDN, above). Wrap a vendored sheet in `@layer vendor` once, when you
  copy it into the project.

```html
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/utilities.css">
```

```css
/* css/main.css: order only. Each other file: @layer base { … } */
@layer reset, vendor, tokens, base, layout, components, utilities;
```

- Nest a light-DOM element's sheet one level under its tag inside
  `@layer components`, and link it from the purpose block of each
  document holding the element. The markup exists before upgrade, so its
  styles must too; a sheet loaded with the island would shift layout.
- Keep nesting to one level and start nested type selectors with `&`;
  nesting is widely available, and deeper chains raise specificity
  ([kiwipedia](https://github.com/alsacreations/kiwipedia/blob/main/guidelines/css.md)).
- Adopt `@scope` for structure once it is widely available. Today a
  browser without it drops the whole block and the element paints
  unstyled; see [platform status](platform-status.md) and
  [MDN @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope).
- Define tokens as custom properties on `:root`. They inherit through
  shadow boundaries, "a common way to apply a theme to a whole page"
  ([modern-web.dev CSS](https://modern-web.dev/guides/going-buildless/css/)).

```css
/* js/components/todo-list/todo-list.css */
@layer components {
  todo-list {
    display: grid;
    gap: var(--space-m);

    & todo-item:has(:checked) label { text-decoration: line-through; }
    & .todo-status:empty { display: none; }
  }
}
```

- Link a shadow element's sheet with `<link rel="stylesheet">` inside
  the declared root and use `:host`. A strict CSP blocks an inline
  `<style>` there, and the document's layers do not reach in.
- Escape hatch: an element with many shadow instances exports a shared
  `CSSStyleSheet` from `tag.css.js`, built with `replaceSync`, which
  ignores `@import` ([web.dev](https://web.dev/articles/css-module-scripts)).

## Types and tests

- Type with JSDoc; run `tsc --noEmit` with `allowJs`, `checkJs`,
  `strict` and `"moduleResolution": "bundler"`
  ([TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)).
  Served files stay the source, so stack traces point at real lines.
- Mirror the map in `package.json` `imports`, as `"#lib/*":
  "./js/lib/*"`. tsc and Node read that field, never the map; let the
  equality test check that the two agree.
- Serve over HTTP with `text/javascript`, `application/json` and
  `text/css`; modules fail from `file://`
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)).
- Test elements in real browsers with Web Test Runner, which "Mocks ES
  modules using Import Maps"
  ([test runner](https://modern-web.dev/docs/test-runner/overview/)).
  Omit `--node-resolve` so tests run the shipped files.
- Give test pages the import map through `testRunnerHtml`. They are not
  documents, so they lack the verbatim block.
- List `*.html` in `.prettierignore`. Reformatting a document changes
  the import map's bytes and therefore its CSP hash.

## When to build

- Stay unbundled. Per-file URLs mean "only the cache for that single
  file is invalidated"
  ([importmap-rails](https://github.com/rails/importmap-rails)),
  and the request-start gaps that slowed Khan Academy's unbundled test
  ([perfplanet](https://calendar.perfplanet.com/?p=1895))
  are the waterfall that preloads and the depth limit remove.
- Add a build step only for CommonJS, minifying a large stable vendor
  set, or a trace dominated by request-start gaps. Native loading does
  no minification or tree-shaking
  ([MDN modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)).
- Convert CommonJS once with esbuild into `js/vendor/`
  ([jvns.ca](https://jvns.ca/blog/2024/11/18/how-to-import-a-javascript-library/)),
  never per request: Rollup's commonjs plugin "locks your project into
  requiring a specific build setup"
  ([modern-web.dev ES modules](https://modern-web.dev/guides/going-buildless/es-modules/)).
