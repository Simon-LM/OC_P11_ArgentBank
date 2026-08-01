# Email to the darkmode-plus-a11y maintainer — 2

> Ready to send. Written by the ArgentBank integration agent, forwarded by
> Simon-LM. Follows the first message, which led to 0.7.0.

---

**Subject:** darkmode-plus-a11y 0.7.0 — react-select ships to every visitor, and dropping it may be the better fix

Dear maintainer,

Thank you for 0.7.0. All three findings from the previous message are
fixed, and the `display: none` solution is better than the unmounting we
had suggested — it keeps the menu's state untouched, which removes a
whole class of risk we had flagged as a prerequisite.

While measuring the result, we found the same problem one layer down.
It is a single finding this time, but it comes with two possible fixes,
and we think the second is worth more than the bytes it saves.

---

## The problem

**What happens.** Every visitor downloads react-select and Emotion on
every page, including visitors who never open the accessibility menu.

**Why.** `templates/react/AccessibilityMenu.tsx:21` imports react-select
statically. A static import is resolved at build time, so the library is
placed in the host's entry bundle regardless of whether the menu is ever
shown.

This is the same shape as the font problem 0.7.0 fixed. `display: none`
stops the browser resolving *fonts* for a hidden subtree, because font
matching happens at layout. It cannot do anything about JavaScript that
was already bundled at build time.

**Measured** on ArgentBank, by isolating react-select and its Emotion
dependencies into their own chunk:

| | Size |
| --- | --- |
| react-select + Emotion | **31 KB gzipped** |
| host's whole entry bundle | 87 KB gzipped |

Over a third of the entry bundle, for a panel most visitors never open.

---

## Fix A — import the menu lazily

`AccessibilityControl` imports `AccessibilityMenu` through `lazy()`,
mounted from the first open onward via a latching flag rather than
tracking the open state, so the menu still never unmounts and preferences
keep their state exactly as they do today.

We implemented this on our side to measure it. Lighthouse default mobile
profile (150 ms RTT / 1638 kbps / CPU ×4), same build, three runs each:

| | Score | LCP | FCP |
| --- | --- | --- | --- |
| before | 87 / 87 / 87 | 3902 ms | 1952 ms |
| after | 89 / 89 / 89 | 3678 ms | 1653 ms |

JavaScript downloaded on page load: **146 KB → 114 KB**.

**One trap, in case you take this route.** Naming react-select and
Emotion in Vite's `manualChunks` looks like the obvious first step and
silently defeats the whole thing: a named chunk is promoted into the
entry's modulepreload graph, so `index.html` gains a
`<link rel="modulepreload">` for it and the browser fetches it eagerly
anyway. Left unnamed, Rollup emits a true dynamic chunk. Worth a line in
the docs if Fix A ships, because the failure is invisible — the build
looks correctly split, and the bytes still arrive.

**What it costs the package**: a Suspense boundary, a loading state, and
one more string to translate.

---

## Fix B — drop react-select

We think this is the better answer, and the strongest argument is not
about bytes.

**The menu has two selects.** One for colour vision mode
(`AccessibilityMenu.tsx:546`), one for the accessibility font
(`:669`). Their options are plain text, and the second one's three
groups map exactly onto `<optgroup>`. There is nothing here a native
`<select>` cannot express.

**The package already had to repair react-select's keyboard handling.**
`handleSelectKeyDown` at `:368-384` reopens the listbox on Enter and
Space, and converts Tab into arrow keys inside the open menu. Directly
above it sits this comment:

> `/* v8 ignore start -- react-select's internal keyboard handling isn't`
> `   reliably triggerable through jsdom + user-event; covered by`
> `   manual/E2E testing instead */`

So an accessibility component depends on a library whose keyboard
behaviour needed patching, and whose behaviour cannot be covered by the
package's own automated tests.

A native `<select>` is driven by the platform. It works with the
keyboard without help, is announced correctly by screen readers without
help, and on mobile opens the operating system's own picker — which for
many users is markedly easier than a custom listbox.

Fix B would remove, in one change:

- 31 KB from every consumer's entry bundle, with no lazy-loading
  machinery, no Suspense boundary and no loading string;
- a keyboard workaround;
- a testing blind spot in a component whose entire purpose is
  accessibility.

The cost is visual: a native select cannot be styled as freely as
react-select, so the menu's two dropdowns would look closer to the
platform than to the rest of the panel. That is a real trade-off and
your call, not ours — but for this particular component, platform
behaviour seems worth more than visual uniformity.

---

## What we are doing meanwhile

We have Fix A working locally but are **holding it unmerged**. Patching
a scaffolded template only helps us, and leaves us re-merging our own
divergence at every upgrade — the same reasoning that made us send the
first message instead of fixing the fonts locally. We would rather take
whichever fix you choose and drop our version.

If you would like a second opinion on Fix B before committing to it, we
are happy to prototype the two selects natively against our own test
suite and report what it costs visually.

---

## Environment

- `darkmode-plus-a11y@0.7.0`, Path A scaffold into `src/a11y/`
- React 19.2.7, Vite 8, SCSS/BEM host, no Tailwind
- Measurements: Lighthouse default mobile profile, local production build
  over loopback, three runs, median reported

As before, we can test a patched version against our Lighthouse CI, which
runs five routes on both form factors and gates at 100% accessibility.

Kind regards,

The ArgentBank integration agent
