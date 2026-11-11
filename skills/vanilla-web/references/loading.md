# Loading

## Contents

- Native primitives
- Islands
- Fetch
- Stores and DOM updates
- Service worker
- Pagination
- Observers and cross-tab
- Core Web Vitals and scheduling
- Navigation between documents
- Single-document architecture

## Native primitives

- Put `loading="lazy"` on images and iframes below the first viewport.
  Chrome fetches from 1250px away, so it saves little near the fold
  ([web.dev lazy loading](https://web.dev/articles/browser-level-image-lazy-loading)).
- Give lazy images `width` and `height`; at 0 by 0 they "will never be
  loaded". Give scripted images `decoding="async"` so paint skips decode
  ([MDN img](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)).
- Write `sizes="auto, <fallback>"`; `auto` is valid only on lazy images
  with `width` and `height`, and other engines read the fallback
  ([ericportis.com](https://ericportis.com/posts/2023/auto-sizes-pretty-much-requires-width-and-height)).
- Skip `<link rel="prefetch">`: some engines ignore it, `no-store` blocks it
  ([MDN prefetch](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch)).
- Put `content-visibility: auto; contain-intrinsic-size: auto 40rem` on
  long sections; it skips off-screen rendering, not image fetches
  ([MDN content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)).

## Islands

- Write the island's final content in the document; `define()` upgrades
  existing elements whenever it runs, so the module may arrive late
  ([MDN define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)).
- Load on visibility or first interaction, importing the registration
  file `tag.js` through a thunk so tsc checks the path; the module map
  runs it once, so no trigger redefines the tag:

```js
export function lazyDefine(tag, load) {
  const start = () => { io.disconnect(); load().catch(console.error); };
  const io = new IntersectionObserver((entries) =>
    entries.some((e) => e.isIntersecting) && start(), { rootMargin: '200px' });
  for (const el of document.querySelectorAll(`${tag}:not(:defined)`)) {
    io.observe(el);
    for (const type of ['pointerover', 'focusin'])
      el.addEventListener(type, start, { once: true });
  }
}
```

- Never lose input given before upgrade. Give an island's form a real
  `action` and `method`; a submit before upgrade then navigates with the
  data, and the island adopts it on upgrade and cleans the URL with
  `history.replaceState`. Under parallel load the example app's tests
  submitted before upgrade in 4 of 16 runs.

- Link a light-DOM island's `<tag>.css` from the purpose block; its markup
  paints before upgrade, so styles shipped with the module shift layout.
- Use `:not(:defined)` only to reserve space for what upgrade changes,
  such as a control hidden until the element can operate it
  ([MDN :defined](https://developer.mozilla.org/en-US/docs/Web/CSS/:defined)).
- `await customElements.whenDefined(tag)` before calling an island's
  methods; they do not exist until upgrade
  ([MDN whenDefined](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined)).

## Fetch

- Check `res.ok`; a 404 fulfils. Read a body once or `clone()` first,
  since after a read "nothing else can read from the stream"
  ([MDN Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)).
- Abort the previous request before the next, or a stale response wins.
  Join the signal and a timeout with `AbortSignal.any`; drop an
  `AbortError`, offer retry on a `TimeoutError`
  ([MDN AbortSignal.any](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)).

```js
export async function fetchJSON(url, { signal, timeout = 1e4, ...init } = {}) {
  const any = [signal, AbortSignal.timeout(timeout)].filter(Boolean);
  const res = await fetch(url, { ...init, signal: AbortSignal.any(any) });
  if (!res.ok) throw new Error(`${res.status} ${url}`, { cause: res });
  return res.json();
}
```

- Stamp fetched JSON into a `<template>`; no string is parsed as HTML.
- Insert server fragments with `el.setHTML()`, else as `textContent`;
  feature-test this. Scripts are stripped, so islands carry behaviour
  ([MDN setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)).
- Leave `cache` at its default; use `'no-cache'` only where stale is wrong
  ([MDN Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)).

## Stores and DOM updates

- Write each store as an `EventTarget` subclass; one `change` per mutator
  ([dev.to](https://dev.to/pfrueh/the-dom-eventtarget-interface-6ak)):

```js
export class Store extends EventTarget {
  #state;
  constructor(state) { super(); this.#state = Object.freeze(state); }
  get state() { return this.#state; }
  commit(next) {
    this.#state = Object.freeze(next);
    this.dispatchEvent(new CustomEvent('change', { detail: next }));
  }
}
```

- Let elements call named mutators like `todos.add(text)`, never `commit`.
  Replace nested data rather than mutate it; the freeze is shallow.
- Never build a Proxy store: Proxies "don't detect changes to nested
  array and object data", and the workaround froze the UI
  ([gomakethings](https://gomakethings.com/proxies-vs.-setter-functions-in-state-based-ui-libraries/)).
- Render fixed structure once, then set `textContent`, `hidden` and
  attributes on kept nodes; recreating DOM "risks losing state"
  ([Plain Vanilla](https://plainvanillaweb.com/pages/applications.html)).
- Key rows by id: stamp only new rows with
  `document.importNode(tpl.content, true)`, remove rows whose id left the
  state, and update kept rows in place. Removing a focused node drops
  focus, so a full re-stamp breaks keyboard use on every toggle.
- Use one `replaceChildren()` only for lists nothing inside can focus,
  such as read-only activity feeds
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren)).
- Reorder with `moveBefore`, which keeps focus and dialog state, else
  `insertBefore`; test `'moveBefore' in Element.prototype` and fall back
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore)).
- Delegate per element root with `closest()`, so new rows need no wiring
  ([gomakethings](https://gomakethings.com/javascript-event-delegation-across-a-code-base/)).
- Create an `AbortController` per connect, give every listener its
  signal, abort it on disconnect; both callbacks fire on every move
  ([videojs](https://videojs.org/docs/framework/html/concepts/custom-element-lifecycle)).

## Service worker

- Serve static assets cache-first from a versioned cache that install
  fills with `cache.addAll`; non-GET goes straight to the network
  ([web.dev Offline Cookbook](https://web.dev/articles/offline-cookbook)).
- Serve documents network-first with navigation preload and a timeout,
  then cache; without preload the worker's boot delays navigation
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager)).
- Serve data and avatars stale-while-revalidate:

```js
async function staleWhileRevalidate(event) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then((res) => {
    if (res.ok) cache.put(event.request, res.clone());
    return res;
  }).catch(() => cached ?? Response.error());
  event.waitUntil(network);
  return cached ?? network;
}
```

- Version cache names and delete old ones on `activate`; entries "don't
  expire unless deleted" and ignore HTTP headers
  ([MDN Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)).
- Never cache opaque responses; a hidden error status is served forever.

## Pagination

- Default to `<button type="button">Load more</button>`; infinite scroll
  hides the footer and fails keyboard and switch users
  ([Deque](https://www.deque.com/blog/infinite-scrolling-rolefeed-accessibility-issues/)).
- Append below existing items; injection near the top shifts layout
  ([web.dev CLS](https://web.dev/articles/optimize-cls)).
- Focus the first new item (`tabindex="-1"`) so reading resumes there
  ([ezud](https://ezud.com/accessible-infinite-scroll-pagination/)).
- Announce "Showing 40 of 312" in a polite live region; the button alone
  hides what is left ([digitala11y](https://www.digitala11y.com/?p=1371)).
- Offer infinite scroll only as an opt-in toggle, with the button as the
  sentinel and a batch cap so the footer stays reachable.

## Observers and cross-tab

- Disconnect every observer in `disconnectedCallback`; an observed target
  keeps the callback's captures alive
  ([refined-github](https://oss.issuehunt.io/r/sindresorhus/refined-github/issues/4484)).
- Never resize an observed element inside its `ResizeObserver` callback;
  defer with `requestAnimationFrame`. The error stops lockup, not loops
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)).
- Elect one polling tab with a Web Lock held in a never-settling callback;
  share results over `BroadcastChannel`, which skips the sender, so the
  leader updates its own store too
  ([MDN Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API); [MDN BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)).

## Core Web Vitals and scheduling

- Never lazy-load the LCP candidate or gate it on an island: HTTP Archive
  shows 75th-percentile LCP of 3,546 ms with lazy loading, 2,922 without
  ([web.dev](https://web.dev/articles/lcp-lazy-loading)).
- Mark it `fetchpriority="high"`. Add a `preload` only when the parser
  cannot see it, as for a CSS background or a script-inserted image;
  priority alone does not make it discoverable
  ([web.dev](https://web.dev/articles/fetch-priority)).
- Reserve space for late content: media dimensions, island sheets,
  `contain-intrinsic-size`. Keep it on error; CLS target is 0.1
  ([web.dev CLS](https://web.dev/articles/optimize-cls)).
- Keep INP under 200 ms: show feedback before `await import()`, and split
  work over 50 ms into batches with a yield between them
  ([web.dev INP](https://web.dev/articles/inp); [web.dev long tasks](https://web.dev/articles/optimize-long-tasks)).
- Feature-test `scheduler.yield()` and `postTask()`, falling back to
  `setTimeout`; Safari lacks both
  ([web-features](https://web-platform-dx.github.io/web-features-explorer/features/scheduler.json)).
- Feature-test `requestIdleCallback` (off in stable Safari); a `timeout`
  stops it starving ([caniuse](https://caniuse.com/requestidlecallback)).

## Navigation between documents

- Navigate with plain links: "at least nine times out of ten, a
  multi-page approach is leaner, more robust, and simpler"
  ([adactio](https://adactio.com/journal/19573)).
- Put `@view-transition { navigation: auto; }` in `main.css`, inside a
  `prefers-reduced-motion: no-preference` query; engines without it
  navigate normally
  ([Chrome](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)).
- Pair it with a render block on the new document's above-fold content,
  or the cross-fade can start before that content exists; see
  [interaction](interaction.md) and [document head](document-head.md).
- Add speculation rules as an enhancement; engine support is uneven
  ([platform status](platform-status.md)). Prefetch `eager`, prerender
  `moderate` ([HTMHell](https://htmhell.dev/adventcalendar/2025/3/)).
- Inline speculation rules need a hash in `script-src`
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)).
  List one per block in the verbatim CSP beside the import map's; the Nu
  checker rejects `'inline-speculation-rules'`. An edit to one document's
  rules changes every CSP, an accepted cost; the equality test checks it.
- Exclude side-effecting URLs with `where`, and defer analytics while
  `document.prerendering` is true
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)).

## Single-document architecture

Choose it only when state must survive section changes, such as playing
media; shell duplication is not a reason ([document head](document-head.md)).

- Feature-test `'navigation' in window`. One `navigate` listener skips
  `!canIntercept`, `hashChange`, `downloadRequest` and `formData`, passes
  `event.signal` to fetches, and renders a placeholder at once because
  the URL has already changed. Avoid `precommitHandler`; Safari lacks it
  ([Chrome](https://developer.chrome.com/docs/web-platform/navigation-api); [InfoQ](https://infoq.com/news/2026/05/navigation-api-browser)).
- Re-implement `document.title` per view; screen readers announce it
  ([WCAG 2.4.2](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)).
- Re-implement focus: `focusReset: 'manual'`, then focus the view's
  `<h1 tabindex="-1">`; screen reader users prefer it to `<body>`
  ([WICG](https://github.com/WICG/navigation-api)).
- Re-implement scroll: settle the handler after rendering, or call
  `event.scroll()` once content has height
  ([Chrome](https://developer.chrome.com/docs/web-platform/navigation-api)).
- Keep a no-JS fallback: each route is a real document with a purpose
  block; hash routes are "effectively invisible to search engines"
  ([Plain Vanilla](https://plainvanillaweb.com/pages/applications.html)).
