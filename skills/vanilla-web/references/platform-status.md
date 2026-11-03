# Platform status

Snapshot taken 2026-11-03. Re-verify against the [web-features explorer](https://web-platform-dx.github.io/web-features-explorer/) before relying on anything below the widely-available tier.

## Contents

- How to read this
- Widely available
- Newly available
- Limited
- Proposals and removed
- Engine blockers
- Conflicts found

## How to read this

Widely available: depend on it. Newly available: every engine ships it, but
for less than 30 months; use it as an enhancement behind a feature check.
Limited: missing from at least one engine, often Chromium-only; enhancement
only, never a dependency. Proposal or removed: do not use. In the widely table
a month is MDN's first cross-browser date and a full date is the explorer's widely date.

## Widely available

| Feature | Since | Note | Source |
| --- | --- | --- | --- |
| `AbortSignal.any()` | March 2024 | joins a component signal with a timeout | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static) |
| `AbortSignal.timeout()` | undated; notes say "Baseline" | aborts with `TimeoutError`, paused in bfcache | [MDN](https://developer.mozilla.org/docs/Web/API/AbortSignal/timeout_static) |
| `adoptedStyleSheets` | March 2023 | one constructed sheet shared by every root | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets) |
| `BroadcastChannel` | March 2022 | same-origin fan-out across tabs | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) |
| Cache API | April 2018 | works without a service worker; ignores HTTP cache headers | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Cache) |
| `color-scheme` | January 2022 | UA controls and scrollbars follow the user's scheme | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) |
| `contain-intrinsic-size` | Baseline 2023 (September 2023) | keeps skipped sections at their last size | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-size) |
| Container size queries | 2025-08-14 | old Safari misses `:host` as container; use an inner wrapper | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/container-queries/) |
| Custom elements, shadow DOM, slots | undated in notes | the component model itself | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) |
| Declarative shadow DOM | 2026-08-20 | parser-attached roots that stream without script | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/declarative-shadow-dom/) |
| `:defined` | January 2020 | `:not(:defined)` reserves space before upgrade | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:defined) |
| `<dialog>` | March 2022 | `showModal()` sets `aria-modal` and inerts the page | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |
| Dynamic `import()` | January 2020 | loads island code on demand | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) |
| `ElementInternals`, form-associated elements | March 2023 | form value, validity and default ARIA | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) |
| `EventTarget` subclass | undated; notes say widely | the store primitive | [dev.to](https://dev.to/pfrueh/the-dom-eventtarget-interface-6ak) |
| `:focus-visible` | March 2022 | custom focus ring at 3:1 contrast | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) |
| `:has()` | 2026-06-19 | parent- and sibling-aware selectors | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/has/) |
| Import maps | March 2023 | bare-specifier prefixes; one inline map | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) |
| `inert` | April 2023 | removes a subtree from focus and the accessibility tree | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) |
| `IntersectionObserver` | March 2019 | visibility trigger for islands | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) |
| `@layer` | March 2022 | layer order decides the cascade; unlayered wins | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) |
| `loading="lazy"` | img: Chrome 77, Firefox 75, Safari 15.4; iframe: Firefox 121, Safari 16.4 | never on the LCP image | [web.dev](https://web.dev/articles/browser-level-image-lazy-loading) |
| `modulepreload` | September 2023 | compiles into the module map; list every dependency | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload) |
| `MutationObserver` | July 2015 | detects children added after parse | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) |
| Navigation preload (service worker) | April 2022 | removes the worker boot delay on navigations | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager) |
| Nesting | 2026-06-11 | native nesting without a preprocessor | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/nesting/) |
| `::part`, `exportparts` | July 2020 | outside-in styling of shadow parts | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) |
| `prefers-reduced-motion` | January 2020 | gates every animation | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |
| `preload` | January 2021 | early fetch for the LCP image and fonts | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload) |
| Private `#fields` | July 2021 | class privacy without transpiling | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) |
| `replaceChildren()` | October 2020 | atomic list swap | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren) |
| `requestSubmit()` | September 2022 | programmatic submit that keeps validation | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit) |
| `ResizeObserver` | July 2020 | size-driven layout; disconnect on removal | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) |
| `<search>` | October 2023 | search landmark without `role` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search) |
| `structuredClone()` | 2024-09-14 | deep copy of store state | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/structured-clone) |
| `<template>` | November 2015 | inert markup stamped with `importNode` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template) |
| `:user-invalid` | November 2023 | error styles only after interaction | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) |
| Web Locks | March 2022 | cross-tab leader election | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) |

## Newly available

| Feature | Since | Note | Source |
| --- | --- | --- | --- |
| Anchor positioning, core (`anchor-name`, `position-area`) | January 2026 (MDN) | pins popovers to their invoker; explorer disagrees | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name), [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) |
| Container style queries | Baseline 2026 (undated list) | replaces `:host-context()` | [web.dev](https://web.dev/baseline/2026) |
| `content-visibility` | Baseline 2024 (September 2024) | skips off-screen rendering, keeps the accessibility tree | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) |
| `<details name>` | 2024-09-03; widely expected 2027-03-03 | exclusive accordions | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/details-name/) |
| `::details-content` | 2025-09-16 | animates disclosure content | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/details-content/) |
| `fetchpriority` | Chrome 102, Firefox 132, Safari 17.2 | a hint; `high` on the LCP image | [web.dev](https://web.dev/articles/fetch-priority) |
| `getHTML()` | September 2024 | serializes shadow roots for tests | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getHTML) |
| Import attributes (`with { type }`) | April 2025 | `json` type; the `css` type is limited | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) |
| Import map `integrity` | Chrome 127, Firefox 138, Safari 18 | SRI over the whole module graph | [es-module-shims](https://github.com/guybedford/es-module-shims), [Shopify](https://shopify.engineering/shipping-support-for-module-script-integrity-in-chrome-safari) |
| Invoker commands (`command`, `commandfor`) | 2025-12-12; widely expected 2028-06-12 | zero-JS dialog and popover wiring | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/) |
| `light-dark()` | 2024-05-13; widely expected 2026-11-13 | per-scheme colour in one declaration | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/) |
| Navigation API | 2026-01-13; widely expected 2028 | one `navigate` router; Safari lacks `precommitHandler` | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/navigation) |
| `popover` (`auto`, `manual`) | 2025-01-27; widely expected 2027-07-27 | non-modal top layer; add an explicit role | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/popover/) |
| `@scope` | March 2026 | donut scoping with zero added specificity | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope) |
| Scoped custom element registries | 2026-10-27; widely expected 2029-04-27 | per-root registries; Firefox 159 shipped last | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/scoped-custom-element-registries/) |
| Scroll-driven animations | 2026-10-27; widely expected 2029-04-27 | keep the `@supports` fallback | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/) |
| `setHTMLUnsafe()` | Chrome 124, Safari 17.4, Firefox 148 (secondary) | parses declarative shadow roots from strings | [rezhajul.io](https://rezhajul.io/posts/stop-using-innerhtml-firefox-sethtml/) |
| `:state()`, `CustomStateSet` | May 2024 | styles internal state without classes | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:state) |
| Trusted Types | 2026-02-24; widely expected ~August 2028 | string sinks throw under the CSP directive | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/trusted-types) |
| View transitions, same-document | 2025-10-14; widely expected 2028-04-14 | `document.startViewTransition()` | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/view-transitions/) |

## Limited

| Feature | Since | Note | Source |
| --- | --- | --- | --- |
| Anchor positioning, explorer umbrella | Safari 27 only listed | contradicts the MDN core badges | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/anchor-positioning/) |
| CSS module scripts (`with { type: "css" }`) | Chrome 123, Firefox 147 | Safari blocks; export sheets from `.css.js` | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/css-modules) |
| Customizable `<select>` (`appearance: base-select`) | Chrome 135, Safari 27 | Firefox blocks since September 2026 | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/customizable-select/) |
| Customized built-ins (`is=""`) | blocked since January 2020 | WebKit WONTFIX; use a light-DOM wrapper | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/customized-built-in-elements.json), [WebKit](https://bugs.webkit.org/show_bug.cgi?id=182671) |
| `<datalist>` | Limited (MDN) | assistive-technology gaps; enhance a text input only | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist) |
| `dialog closedby` | Chrome 134, Firefox 141 | Safari blocks since July 2025 | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/dialog-closedby/) |
| JSON module scripts | Chrome 123, Safari 17.2 | Firefox missing; `fetch` the JSON instead | [es-module-shims](https://github.com/guybedford/es-module-shims) |
| `moveBefore()`, `connectedMoveCallback` | Chrome 133, Firefox 144 | Safari missing; fall back to `insertBefore()` | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/move-before.json) |
| Multiple import maps | Chrome 135, Safari 18.4 | Firefox missing; keep one inline map | [es-module-shims](https://github.com/guybedford/es-module-shims) |
| Observable, `EventTarget.when()` (WICG) | Chrome 135 (April 2025) | Mozilla negative; "very unlikely to become Baseline" | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/observable/) |
| `popover="hint"` | Chrome 151, Firefox 153 | Safari blocks since July 2026 | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/popover-hint/) |
| `prefetch` | not Baseline (MDN) | blocking engine not recorded | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch) |
| Reference Target, phase 1 | Chrome 152 (2026-08-25) | Safari and Firefox prototypes only | [Chrome 152](https://developer.chrome.com/release-notes/152) |
| `requestIdleCallback` | not Baseline (MDN) | off by default in every stable Safari through 27.2 | [caniuse](https://caniuse.com/requestidlecallback) |
| Sanitizer `setHTML()` | Firefox 148 (2026-02-24), Chrome 146 (disputed) | Safari blocks since March 2026; render text as fallback | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/sanitizer.json), [MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/148) |
| `scheduler.yield()`, `scheduler.postTask()` | yield Chrome 129, postTask Chrome 94, both Firefox 142 | Safari blocks; `setTimeout` fallback | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/scheduler.json) |
| Speculation rules | Chromium; `prerender_until_script` trial Chrome 144 | no-op in Firefox; WebKit 27.2 parses prefetch rules (see Conflicts) | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API), [Chrome](https://developer.chrome.com/blog/prerender-until-script-origin-trial) |
| Temporal | Firefox 139, Chrome 144 | Safari blocks since January 2026; Stage 4 for ES2027 | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/temporal) |
| View transitions, cross-document | Chrome 126, Safari 18.2 | Firefox blocks since December 2024 | [explorer](https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions/) |

## Proposals and removed

| Feature | Since | Note | Source |
| --- | --- | --- | --- |
| Declarative partial updates (`<template patchfor>`, `patchsrc`) | TAG review filed 2025-08-12 | WICG; Chrome 148 flag claimed, unverified | [WICG](https://github.com/WICG/declarative-partial-updates), [TAG](https://tag-github-bot.w3.org/gh/w3ctag/design-reviews/1134) |
| DOM Parts, declarative custom elements, open-stylable roots, `ElementInternals.type` | listed 2024 | no 2025-2026 status found | [lea.verou.me](https://lea.verou.me/blog/2024/wcs-vs-frameworks/) |
| `:host-context()` | dropped from spec March 2025 | Chrome still ships it; Firefox and WebKit never did | [CSSWG](https://lists.w3.org/Archives/Public/public-css-archive/2025Mar/0859.html), [explorer](https://web-platform-dx.github.io/web-features-explorer/features/host-context) |
| HTML Imports | deprecated Chrome 70; removed ~Chrome 80 (February 2020) | Chromium-only and gone | [Chrome](https://developer.chrome.com/blog/chrome-70-deps-rems) |
| HTML includes | whatwg/html#2791 opened 2017-06-27, still open | labelled "needs implementer interest" | [whatwg/html#2791](https://github.com/whatwg/html/issues/2791) |
| `Node.disconnectedSignal()` | open WHATWG issue | would abort on disconnect | [whatwg/dom#1296](https://github.com/whatwg/dom/issues/1296) |
| Reference Target, phase 2 | being designed | multi-target relationships | [HTMHell](https://htmhell.dev/adventcalendar/2025/4/) |
| TC39 Observable | Stage 1, last presented 2025-04 | distinct from WICG Observable | [TC39](https://github.com/tc39/proposals/blob/main/stage-1-proposals.md) |
| TC39 Signals | Stage 1, last presented 2024-06 | native "2-3 years" away; polyfill not for production | [proposal](https://github.com/tc39/proposal-signals) |
| Web Components Community Group | flagged for closure April 2026 | closure unconfirmed; use WHATWG, web-features, Interop | [W3C list](https://lists.w3.org/Archives/Public/public-webcomponents/2026Apr/0000.html) |

## Engine blockers

### Safari blocks

- CSS module scripts, `moveBefore()` and `connectedMoveCallback`
- `dialog closedby` (since July 2025), `popover="hint"` (since July 2026)
- Sanitizer `setHTML()` (since March 2026), Temporal (since January 2026)
- `scheduler.yield()` and `postTask()`; `requestIdleCallback` off by default
- Customized built-ins (WONTFIX); Navigation API `precommitHandler`
- Chromium-only: speculation rules prerender (prefetch: see Conflicts), Observable, Reference Target, `:host-context()`

### Firefox blocks

- Cross-document view transitions (since December 2024)
- Customizable `<select>` (since September 2026)
- Multiple import maps and JSON module scripts
- Chromium-only: speculation rules, Observable, Reference Target, `:host-context()`

## Conflicts found

- Anchor positioning: explorer umbrella says Limited with only Safari 27; MDN marks `anchor-name` and `position-area` newly available since January 2026.
- `setHTML()` in Chrome: web-features and Japanese press say Chrome 146 stable; alfy.blog (May 2026) says Canary behind a flag.
- `light-dark()`: the widely date 2026-11-13 is "expected", ten days after this snapshot.
- Speculation rules: the research says Chromium-only, but Playwright's WebKit 27.2 build logged "Prefetch request denied: URL must be secure (HTTPS)" for the example app's prefetch rule on 2026-11-03. WebKit appears to parse prefetch rules over HTTPS; verify before relying on it.
- `<template patchfor>` behind a Chrome 148 flag: one secondary source, unverified.
- Declarative partial updates: MDN's template page names an experimental `<template for>`; the WICG repository uses `patchfor`; likely one proposal renamed.
- Declarative shadow DOM: web.dev gives newly 2024-08-05; the explorer's widely date 2026-08-20 implies newly 2024-02-20.
- CSS module scripts: es-module-shims says Chrome-only; web-features adds Firefox 147. Both agree Safari blocks.
- Import map `integrity`: es-module-shims lists Firefox 138; the security research found no Firefox source.
- `fetchpriority`: the report tiers it widely; the notes give only versions, and Firefox 132 is a late-2024 release, so it stays newly here.
- `contain-intrinsic-size`: notes give only "Baseline 2023"; widely by the 30-month rule.
- `AbortSignal.timeout()`: notes say Baseline without tier or date; listed widely beside `AbortSignal.any()`.
- `setHTMLUnsafe()`: versions come from one secondary blog, not checked against MDN.
- Form-associated elements: a secondary blog dates them widely 2025-09-27; MDN dates `ElementInternals` March 2023.
- `@scope`: MDN says newly March 2026; a 2025 overview claims Firefox shipped in 2025.
- Observable: the report files it under proposals; web-features shows it shipped in Chrome 135.
- Report Conclusion counts sanitised HTML insertion as Baseline; every note and the report's table say Safari blocks `setHTML()`.
- Not sourced (no status in any note, so not tabled): ES module scripts, top-level await, custom properties, `CustomEvent`, static initialization blocks.
