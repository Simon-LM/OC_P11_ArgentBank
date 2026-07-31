# Email to the darkmode-plus-a11y maintainer

> Ready to send. Written by the ArgentBank integration agent, forwarded by
> Simon-LM. Logged in `DARKMODE_PLUS_A11Y_FEEDBACK.md` as items 14-16.

---

**Subject:** darkmode-plus-a11y 0.6.1 — one accessibility bug, one performance
bug, one documentation gap

Dear maintainer,

Three findings from integrating version 0.6.1 into ArgentBank (React 19 + Vite
SPA, Path A scaffold, SCSS/BEM host, no Tailwind).

All three are in the package's own `templates/`. I diffed our scaffolded copy
against a clean `node_modules/darkmode-plus-a11y/` to be sure none of them came
from our side. Nothing here needs a decision from us — they are yours to fix or
to decline.

The first one is an accessibility bug, so it comes first even though it is the
smallest change.

---

## 1. Dyslexia mode is lost when the page reloads

**What happens.** A user turns on dyslexia mode. It works. They reload the page,
or open the site in a new tab, and it is off again. They have to turn it back on
every time.

**Why.** The setting is never saved.

- `templates/react/AccessibilityMenu.tsx:76` starts `isDyslexicMode` at `false`
  and never reads any stored value.
- `toggleDyslexicMode()` at `:101-111` adds the `dyslexia-optimized` class to
  `<html>`, but writes nothing to `localStorage`.
- `react/themeInitScript.ts` restores `theme` and nothing else.

Inside a single-page app, client-side navigation keeps the class alive. Only a
real reload loses it. That is very likely why this has gone unnoticed.

**Suggested fix.** The same pattern already exists twice in that file:
`reduceMotion` at `:79` and `hcVariant` at `:93` both read from `localStorage`
on init and write back on change. Applying it here means:

1. Save the value in `toggleDyslexicMode()`.
2. Lazy-initialise `isDyslexicMode` from the saved value.
3. Restore the class in `themeInitScript` next to `theme`, so it applies before
   the first paint. Restoring it after hydration would flash the unstyled page
   at exactly the person who enabled the mode to avoid reading difficulty.
4. Clear the key in `resetAllAccessibilitySettings()` at `:293-296`, as it
   already does for `hc-variant`.

---

## 2. The menu downloads its fonts on every page, even when closed

**What happens.** Every visitor pays to download the accessibility menu's fonts
on every page, including visitors who never open it.

**Why.** The menu is always in the page, only made invisible.

- `templates/react/AccessibilityControl.tsx:130-136` renders
  `<AccessibilityMenu>` unconditionally. Only the wrapper receives the `open`
  class.
- `templates/scss/accessibility-trigger.scss:89-91` hides the closed panel with
  `opacity: 0; visibility: hidden`.

`visibility: hidden` still lays the subtree out, unlike `display: none`. So the
browser still resolves which fonts that text needs, and downloads them.

**Measured** on ArgentBank production, Chromium Lighthouse, default mobile
profile, menu never opened. Both faces sit in the critical request chain:

| Font | Size | Time |
| --- | --- | --- |
| `AtkinsonHyperlegibleNextVF-Variable.woff2` | 77.14 KiB | 1321 ms |
| our italic body face (`Nunito-Italic-VariableFont_wght.woff2`) | 276.38 KiB | 1314 ms |

Those are the two longest legs of a 1321 ms critical path, on a page whose LCP
is 3.2 s.

**What it costs any consumer, not just us:**

- Atkinson Hyperlegible, 78 444 bytes, unconditionally — because
  `templates/scss/accessibility-menu.scss:455` and `:480` style the
  high-contrast buttons with it.
- One italic face of whatever the host uses for body text — because `:179` sets
  `font-style: italic` on `__help-description`. The weight varies by host. Ours
  is 276 KiB.

**Suggested fix.**

```tsx
<div className={`accessibility-panel ${menuOpen ? "open" : ""}`}>
  {menuOpen && <AccessibilityMenu … />}
</div>
```

The wrapper keeps its opacity and visibility transition. Only the contents
become conditional. The fonts then load when the panel is actually shown.

Optionally, preloading both faces on `mouseenter` or `focus` of the trigger
button would remove the one-time font swap on first open, while still costing
nothing to visitors who never open the menu.

**Two things to watch.**

This fix needs finding 1 applied first. While `isDyslexicMode` is unpersisted,
unmounting the menu makes the effect at `:115-121` re-run with `false` the next
time it opens, which strips the `dyslexia-optimized` class and silently turns
the setting off. Fixed together, the two are safe.

And please do not fix this by changing the typography. The italic carries real
visual hierarchy inside the panel, and Atkinson Hyperlegible puts the most
legible available face exactly where low-vision users need it. Both are correct
design decisions. They cost bandwidth only because of the mounting behaviour
above. Once the subtree is conditional, they are free. Removing them would give
up an accessibility feature to buy something the structural fix already
provides.

---

## 3. The font cost is not documented

**What happens.** An integrator cannot know that installing the control adds
font downloads to their critical path. We only found out by measuring.

**Why.** Neither `README.md` nor `AGENTS.md` mentions it, or says which bundled
faces load eagerly and which load on demand.

**Suggested fix.** A short "Performance" section covering:

- which faces load eagerly today, and their byte cost;
- that the control also pulls an italic face of the host's own body font;
- the recommended integration for a host on a performance budget.

Worth saying clearly in that section that the on-demand mechanism already works
for the fonts that are the actual feature. OpenDyslexic, Andika and Lexend stay
out of the network trace until a user selects them. The eager cost is confined
to Atkinson, and only because the menu's own chrome uses it. The package is not
missing a lazy-loading system; there is one narrow exception to it.

---

## Environment

- `darkmode-plus-a11y@0.6.1`, Path A scaffold into `src/a11y/`
- React 19.2.7, Vite 8, SCSS/BEM host, no Tailwind
- Measurements: Chromium Lighthouse, default mobile profile, against a
  production Vercel deployment

We are happy to test a patched version against our Lighthouse CI, which runs
five routes on both form factors and gates at 95% mobile and 97% desktop
performance, with 100% accessibility.

Kind regards,

The ArgentBank integration agent
