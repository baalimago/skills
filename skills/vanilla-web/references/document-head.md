# Document head

## Contents

- Why the head is per document
- Verbatim blocks
- CSP
- Purpose block
- Equality test
- Escalation

## Why the head is per document

The head is a manifest of the document's purpose: what it is called, how
it previews when shared, what it loads, where the user goes next. It
cannot be shared at runtime. The import map must precede every module
script, the CSP must be parsed before any script runs, and a script that
injected them would block the parser and defeat preloading. HTML has no
include mechanism; [platform status](platform-status.md) tracks the
proposals. Write the head per document and let the equality test guard
the parts that must stay identical.

## Verbatim blocks

Mark each shared block with comments so the equality test can find it:
`<!-- verbatim:head -->` … `<!-- /verbatim:head -->`, and the same for
`header` and `footer` in the body. Keep the head block in this order;
each line depends on the one above:

```html
<!-- verbatim:head -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; …">
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/reset.css">
<!-- … tokens, base, layout, utilities -->
<script type="importmap">{ "imports": { "#lib/": "/js/lib/", … } }</script>
<script type="module" src="/js/main.js"></script>
<link rel="modulepreload" href="/js/lib/lazy-define.js">
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="manifest" href="/manifest.webmanifest">
<!-- /verbatim:head -->
```

- Put `charset` first; it must sit in the first 1024 bytes.
- Put `color-scheme` before the stylesheets so the first paint already
  uses the user's scheme
  ([MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)).
- Never set `user-scalable=no` or a `maximum-scale` below 5; WCAG 1.4.4
  requires zoom to 200%
  ([MDN viewport](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)).
- Link every global sheet here, `main.css` first, and never chain them
  with `@import`; a chain costs a round trip before first paint and
  before any module runs. Rules in [modules](modules.md#styles).
- Put the import map before every module script, or it is ignored
  ([MDN importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)).
- Keep `main.js` and its eager preloads in the block. Module scripts are
  deferred, so their position does not delay parsing.
- Keep the body blocks to the skip link, the header with its `<nav>`, and
  the footer. Only `aria-current="page"` moves between documents. The nav
  is plain HTML; it has no behaviour, so it has no element.

## CSP

- Deliver the CSP in the verbatim block with `<meta http-equiv>`. Move it
  to a header only for `frame-ancestors` or report-only, which `<meta>`
  cannot carry ([MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)).
- Start from `default-src 'self'; style-src 'self'; object-src 'none';
  base-uri 'none'; require-trusted-types-for 'script'; trusted-types
  'none'`. With no HTML sinks in the code, no Trusted Types policy is
  needed; add one named policy only when a sink is unavoidable.
- List in `script-src` a `'sha256-…'` hash for every inline executable
  script in any document: the import map and each speculation rules
  block. JSON-LD is a data block and needs none. Do not use
  `'inline-speculation-rules'`; only Chromium knows it and the Nu
  checker rejects it.
- Accept that editing one document's speculation rules changes the CSP
  in every document. The equality test recomputes every hash and names
  the missing one.
- Exclude documents from formatters. Reformatting the import map changes
  its bytes and therefore its hash.

## Purpose block

Each group is optional except identity. Write only what the page needs.

| Group      | Fields                                                   |
| ---------- | -------------------------------------------------------- |
| Identity   | `<title>`, `description`, `canonical`, `lang` on `<html>` |
| Social     | `og:title` `og:description` `og:url` `og:type` `og:image` with `width`, `height`, `alt`; `twitter:card` |
| Discovery  | `robots`, `rel=alternate` with `hreflang`, feed link     |
| Entity     | JSON-LD `<script type="application/ld+json">`, one `@type` |
| Appearance | `theme-color`                                            |
| Sheets     | `<link rel="stylesheet">` for each light-DOM island in the document; `preload as=style` for each shadow island's sheet |
| Loading    | `modulepreload` for each island's module graph, `preload` for late-discovered resources, `preconnect` |
| Navigation | `<script type="speculationrules">`                       |

- Order the title page first, site last: `Todos · Acme`. Screen readers
  announce it on load and tab switch, so the distinguishing part leads
  ([WCAG 2.4.2](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)).
- Give every `og:image` an absolute URL and an `og:image:alt`; the share
  card has no other alt text.
- Add JSON-LD only when the page is an entity: `WebSite` for the hero,
  `Person` for a profile, nothing for a tool page. Add `robots noindex`
  to tool pages that show user data.
- Link the sheet of every light-DOM island the document contains. The
  markup paints before upgrade, so the styles must arrive with it.
- Preload a shadow island's sheet with `as=style`, so its fetch starts
  with the head instead of when the parser reaches the declared root.
- List a `modulepreload` for every module the document's islands import,
  transitive ones included; browsers follow dependencies only as an
  optimisation
  ([MDN modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload)).
  Write `href` as the resolved URL, not the import map name.
- Mark the LCP image `fetchpriority="high"` on the `<img>` itself. Add a
  `preload` only when the parser cannot see it, such as a CSS background;
  see [loading](loading.md).
- Preload data an island fetches at once, with `as=fetch` and
  `crossorigin` so the request matches `fetch()`'s mode.
- Write speculation rules per document: the hero prefetches the likely
  next document, a tool page prefetches nothing.

Example purpose block for a profile document:

```html
<title>Profile · Acme</title>
<meta name="description" content="Ada Example's profile: name, bio and recent activity.">
<link rel="canonical" href="https://acme.example/profile.html">
<meta property="og:type" content="profile">
<meta property="og:image" content="https://acme.example/assets/og/profile.png">
<meta property="og:image:alt" content="Acme placeholder: a white square on an indigo field">
<link rel="preload" as="style" href="/js/components/user-card/user-card.css">
<link rel="preload" as="fetch" href="/data/profile.json" crossorigin>
<link rel="modulepreload" href="/js/components/user-card/user-card.js">
<link rel="modulepreload" href="/js/components/user-card/UserCard.js">
```

## Equality test

Write `test/shell-equality.test.js` with `node:test` and no dependencies.
It reads every `*.html` at the root and asserts:

- Every verbatim block is byte-identical across documents once
  `aria-current="page"` is removed.
- The CSP holds the hash of every inline executable script.
- `package.json` `imports` mirrors the import map, so tsc and Node
  resolve the same names as the browser.
- Each document has a `<title>`, a `description`, one `<h1>`, one
  `<main>` and one `aria-current="page"`.
- Each document's `modulepreload` list equals the static import graph of
  `main.js` plus the graph of every island the document contains.

Run it with the other gates. It is what makes duplication safe: drift
fails a test instead of shipping. A working version is in
[the example app](../assets/example-app/test/shell-equality.test.js).

Configure html-validate's `require-sri` rule with `"target":
"crossorigin"`. Integrity on same-origin files only adds churn; SRI
guards against a third party changing a file.

## Escalation

Start with duplication and the equality test. When the document count
passes five, or the verbatim blocks change more than once a month, add a
layout file with slots for the purpose block and a script that writes
the documents. The shipped files stay plain HTML; the generator is a
setup step, not a build. Do not move to a single document for this
reason; that is a different architecture, described in
[loading](loading.md).
