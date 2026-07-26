# darkmode-plus-a11y integration plan

Status: **Phase 1 mechanical wiring done and verified (build/typecheck/
lint/existing 282 tests all green).** Gray family visually tested and
settled on **Taupe** (+1 dark-mode adjustment on `gray-50`) after Slate
turned out to read as distractingly blue in dark mode — see "Gray family:
Slate → Taupe" below. A real hero-card mapping mistake (`bg-container`
instead of `bg-base`) was found and fixed during visual QA. Still paused
on the WCAG contrast / CVD distinguishability findings from the
verification suite (see "Verification results" below) — not yet resolved.
Branch: `feat/darkmode-plus-a11y`, nothing committed yet.

Two other docs this plan leans on, kept separate on purpose:

- `QUESTIONS_FOR_SIMON.md` — ArgentBank-side decisions only Simon can make.
- `DARKMODE_PLUS_A11Y_FEEDBACK.md` — notes for whoever works on the
  `darkmode-plus-a11y` package itself, not ArgentBank decisions.

## Context

`darkmode-plus-a11y@0.3.0` (own package: dark mode via color shift, not
inversion, + high-contrast / color-vision-deficiency / anti-glare variants,
mechanically WCAG-enforced). The project had **no existing theming
infrastructure**: 216 references to `$light_*` variables in raw hex,
across 9 SCSS/`.module.scss` files. A full-site retrofit in one PR would be
large and risky, unlike the rest of this session's one-thing-at-a-time PRs
(#15–#33). So: **Phase 0** got the codebase ready (merged in via
`chore/scss-use-migration`, PR #33 not yet merged to `main`), then
**Phase 1** wires the engine + UI and migrates only the global chrome
(body/Header/Footer), with the remaining 7 pages migrated later, one at a
time in separate PRs.

## What's done (Phase 1)

1. `npx darkmode-plus-a11y init --dir src/a11y` — scaffolded
   `react/AccessibilityControl.tsx`, `react/AccessibilityMenu.tsx`,
   `react/accessibilityPreferences.ts`, `scss/theme.config.scss`,
   `scss/theme-example.scss`, `scss/accessibility-{menu,trigger,features}.scss`.
   Fonts copied into `public/fonts/` — no collision with the existing
   `Nunito-*.woff2` files. Removed the leftover Next.js `"use client"`
   directives (harmless but meaningless in Vite). Added `react-select`
   dependency (`react-icons` was already present).
2. Brand primitives configured in `theme-example.scss`: `accent` →
   `("emerald", 600)`, `link`/`link-hover` → `("indigo", 500)`/`("indigo",
   600)`, `success`/`danger` left at package defaults (`("emerald", 700)`/
   `("red", 600)`). `$gray-family` started at `"slate"`, revised to
   `"taupe"` — see "Gray family: Slate → Taupe" below.
3. The 4 scaffolded partials wired into `main.scss` (trivial now that
   Phase 0 made the whole file `@use`-based), plus `@include
   emit-role-vars();` added in `theme-example.scss`'s `generate-all-themes`
   block — this emits `--bg-base`, `--fg-base`, `--link`, `--accent`, etc.
   as real CSS custom properties per `[data-theme]` block, so ArgentBank's
   own chrome CSS can consume the roles **directly** (`var(--bg-base)`)
   without needing a redundant intermediate token layer — the widget's own
   `theme.config.scss` only emits its own `--color-*` tokens, not the raw
   roles, so this call was necessary.
4. Anti-FOUC: a small Vite plugin (`darkmodeAntiFouc` in `vite.config.ts`)
   using `transformIndexHtml` to inject `themeInitScript(THEMES)` into
   `index.html`'s `<head>`, imported directly from the installed package —
   stays in sync with whatever `THEMES` the version defines, never goes
   stale. Verified: script appears first in `<head>`, runs synchronously
   before any deferred module script.
5. `<AccessibilityControl language={SITE_LANGUAGE} />` rendered in
   `Header.tsx`, between the logo and the nav, in the document flow (the
   button itself is `position: relative`; only its popup panel uses
   `position: fixed`, which is the expected/correct pattern, not the
   "floating trigger" anti-pattern the package warns against).
   `SITE_LANGUAGE` is a single module-level constant (`"en"`) — the i18n
   resilience seam from `QUESTIONS_FOR_SIMON.md` #2.
6. Global chrome migrated onto the token system — `base/_globale.scss`
   (`body` background/text), `layouts/_Header.scss`, `layouts/_Footer.scss`
   now consume `var(--bg-base)`, `var(--fg-base)`, `var(--link)`,
   `var(--link-hover)`, `var(--border-subtle)`, `var(--accent)`,
   `var(--fg-on-accent)`, `var(--focus-ring)` instead of the old
   `$light_*` hex — including the skip-link's box-shadow, rewritten with
   `color-mix(in srgb, var(--accent) 60%, transparent)` instead of a
   hardcoded rgba. The remaining 7 pages are untouched, still on
   `$light_*` hex, as scoped.
7. Verification suite set up at `src/a11y/contrast/` (`setup.ts`,
   `pairs.ts`, `contrast.test.ts`, `cvd-distinguishability.test.ts`),
   using the package's real `testing/*` primitives. Two real snags fixed
   to get it running at all (see `DARKMODE_PLUS_A11Y_FEEDBACK.md` for the
   package-side one):
   - `setupTests.ts`'s global `window.matchMedia` mock crashed under the
     `node` environment this suite needs (Sass compiles at test time,
     jsdom isn't relevant here) — guarded with `typeof window !==
     "undefined"`, doesn't affect any existing jsdom-environment test.
   - `configureThemeExtraction`'s `entry` can't be the app's full
     `main.scss`: that file also pulls in `normalize.css` (a bare
     npm-package import Vite resolves specially) and the `@styles/*`
     alias (Vite-config only) — plain Sass, run standalone by the test,
     understands neither. Pointed `entry` directly at
     `src/a11y/scss/theme-example.scss` instead, which only needs the
     package's own imports — this answers feedback #5 empirically: a
     minimal theme-only entry is the right (and really the only clean)
     choice, not the full app stylesheet.
   - Both `setup.ts`/`pairs.ts` added to `vitest.config.ts` coverage
     `exclude` (test infrastructure, same treatment as `setupTests.ts`).

Existing test suite (282 tests) still green with the new `<AccessibilityControl>`
child in `Header.tsx` — no snapshot/structure regressions.

## Gray family: Slate → Taupe

Slate was the original pick (exact hex match to `$color-gray-200` in
light mode). Once dark mode was actually visible (dev server + real
screenshots, not just compiled CSS numbers), it read as distractingly
blue: the package's dark-mode transform is a **7-step shift within the
same family** (documented as "shift, not invert" — it's the package's
whole premise), not a full swap to the opposite end of the rail. Slate's
chroma stays non-trivial at the mid-lightness weight that shift lands on
(`slate-700`, chroma ~0.044), and chroma is most visible to the eye at mid
lightness — invisible at the extremes (which is exactly why it was a good
*light-mode* match and a bad *dark-mode* one). Neutral, Stone, and Taupe
were tested the same way (dev server, forced `data-theme`, real
screenshots): all three read as properly neutral-to-warm dark surfaces,
no blue. Settled on **Taupe**, further darkened with a per-theme
`$configs` override (`"dark": ("adjustments": ("gray-50": 1))`) — the
same `$configs`/deep-merge mechanism from the 0.3.0 `family-remap` fix,
just applied to the dark-shift step count instead. Considered Mist/Olive
(green-tinted) and Fuchsia/Mauve (red-family, complementary to the green
accent) as further options — recommended against both: the gray role's
job is to recede so the accent is the only real color, and both those
directions risk either muddying against the accent (Mist/Olive) or
producing an uncomfortable complementary "vibration" across a large
surface (Fuchsia/Mauve) — not tested, since the direction itself seemed
like the wrong one to pursue rather than a specific shade being wrong.

Separately, found and fixed a real mapping mistake this way too: the
Home page's hero card background had been migrated to `bg-container`
(a role that's deliberately a different shade from `bg-base`) instead of
`bg-base`, because it structurally looked like a card. Its original hex
was identical to the general page background's — should have been mapped
by comparing hex values, not by what the element visually represents.
Fixed; logged as package feedback (`DARKMODE_PLUS_A11Y_FEEDBACK.md` #12)
since nothing in `AGENTS.md` warns about this migration pitfall.

## Verification results — real findings, need your call

Running the suite for real (not just setting it up) surfaced two categories
of genuine, measured findings — not wiring bugs, design tensions:

**1. CVD distinguishability failures** (`cvd-distinguishability.test.ts`,
8/35 failing):

- `accent` (emerald-600) vs `success` (emerald-700) — same hue family,
  different weight only. Fails in deuteranomaly, protanomaly, tritanomaly,
  tritanopia (ΔE as low as ~10.8, need ≥20). This is a direct consequence
  of accent and success both landing in Emerald — arguably a design
  question (should a brand's accent and its "success" status color ever
  share a hue family?), not something a `family-remap` entry alone fixes
  cleanly, since remapping "emerald" would also remap the accent itself.
- `link` (indigo-500) vs `success` (emerald-700) — fails in deuteranopia,
  protanopia specifically (ΔE ~5.5–8.7, need ≥12).

**2. WCAG contrast failures** (`contrast.test.ts`, 54/345 failing):
Mostly `link` (indigo-500) against several backgrounds/themes — as low as
2.84:1 where 4.5:1 is required (`link-on-bg-container` in `anti-glare-light`)
— plus isolated near-misses on `danger` (3.99:1 in `anti-glare-light`),
`success` (2.48:1 in `achromatopsia`), and `focus-ring` (non-text, 3:1
required, 2.27–2.29:1 in `dark`/`anti-glare-dark`). The `link` failures
dominate: indigo-500 (chosen to match the brand hex `#6866e9` closely)
doesn't appear to be dark/saturated enough to reliably clear 4.5:1 as a
**role** used across arbitrary backgrounds and all 15 themes — unlike
`success`/`danger`, which the engine explicitly WCAG-resolves the weight
for automatically, `link`'s weight is fully on the consumer to pick right.

Neither category is a bug in the wiring — both are genuine tradeoffs
between "match the literal brand hex" and "guarantee accessibility
mechanically across every theme," which is exactly what this whole
integration is supposed to buy us. Worth noting: today's actual site
(`_variables.scss`) uses the same raw secondary-color hex directly in
several spots without this kind of systematic check — this verification
suite is the first thing to actually surface it, which is the point of
doing this integration at all.

**Options, need your input rather than me picking one:**

- Accept a WCAG-safe **derived** weight for the `link` role (e.g. a
  darker indigo) distinct from the literal brand hex — common practice
  (marketing/logo brand color vs. accessible UI link color legitimately
  differ), but a real visual change from indigo-500.
- Document specific waivers (`withWaivers`) for the near-misses if you
  consider them acceptable/pre-existing, and fix only the clear failures.
- Reconsider whether `success` should share Emerald with `accent` at all
  (separate hue instead) to resolve the CVD collision at the source.

## `language` prop — future-i18n resilience

`AccessibilityControl`'s `language` prop only controls the **UI copy of
the accessibility widget itself** (button label, menu option text) — it's
unrelated to the `<html lang="en">` SEO/a11y attribute already set in
`index.html` (separate, unaffected) and unrelated to the site's actual
content language. Site-wide i18n is confirmed as a later, separate
initiative (`QUESTIONS_FOR_SIMON.md` #2) — `SITE_LANGUAGE` in `Header.tsx`
is the one-line seam to update once it exists.

## Verification checklist

- [x] `pnpm build`, `pnpm typecheck`, `pnpm lint:check` green.
- [x] Existing test suite (282 tests) green, no regressions.
- [x] All 15 `[data-theme]` blocks compile with our real brand colors
      (confirmed via built CSS: `--accent:oklch(59.6%...)`,
      `--link:oklch(58.5%...)` match emerald-600/indigo-500).
- [ ] `pnpm dev`: manual visual toggle check — not yet done.
- [ ] Contrast + CVD distinguishability suite green — **blocked on the
      findings above**.
- [ ] Existing Pa11y/Lighthouse CI gates (a11y 100% since PR #29) don't
      regress — not yet checked against a real deployment.
- [ ] Isolated PR, reviewed and merged the same way as the rest of this
      session — not yet opened, pending the above.
