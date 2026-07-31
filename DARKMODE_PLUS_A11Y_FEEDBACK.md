# darkmode-plus-a11y — feedback from integrating into ArgentBank

**Audience: whoever works on the `darkmode-plus-a11y` package itself**
(you, or another AI/dev on that separate repo) — not ArgentBank-side
decisions. Nothing in this file requires an ArgentBank-specific answer;
it's exclusively about gaps/ambiguities/improvement ideas for the package's
own docs and code. ArgentBank-side decisions (which color families to
actually use, sequencing with other ArgentBank work, etc.) belong in
`QUESTIONS_FOR_SIMON.md` instead — keep the two separate.

Running notes: unclear points in the docs plus concrete improvement
suggestions, found while integrating v0.1.0 into ArgentBank (Path A, plain
Vite SPA, existing SCSS/BEM codebase with 216 hardcoded hex references, no
Tailwind). Updated as new ones turn up rather than batched at the end. None
of these blocked the ArgentBank integration plan, but each one required
guessing/inferring instead of following an explicit instruction, or
surfaced a real gap in what the package currently offers. Not a bug report
against ArgentBank — this is feedback for the package.

## 1. ~~No example of a non-Next.js anti-FOUC integration~~ — **fixed in 0.4.0**

`AGENTS.md` now has a full "Static HTML / Vite / any non-SSR SPA" section
under Path A step 3, with both options I'd guessed at independently
(precompute-once, and the build-time Vite plugin injecting via
`transformIndexHtml`) — the Vite plugin example is close to byte-for-byte
what I ended up writing for ArgentBank. Both correctness tradeoffs are
now spelled out.

## 2. ~~Path A's theme file never shows the primitive-declaration syntax~~ — **fixed in 0.4.0**

The `@use "darkmode-plus-a11y/scss/state" as * with (...)` snippet is now
inlined directly in Path A's own wiring steps, no more cross-referencing
Path B to find it.

## 3. ~~`init` idempotency / re-run behavior is unspecified~~ — **fixed in 0.4.0**

Explicitly documented now: "a file that already exists at the target path
is **skipped**..., never overwritten — same for the font files. It never
errors on collisions." Exactly the two things I couldn't tell before.

## 4. ~~No guidance for retrofitting an existing hardcoded-hex codebase~~ — **fixed in 0.4.0, substantially**

A full new "Migrating an existing codebase" section: a `grep` recipe to
find every hardcoded color first, explicit guidance to group by *value*
not by file, and — notably — the exact "map by value, not by what the
element structurally is" rule I'd suggested after the `bg-container`
mistake (#12), given as its own explicit trap to avoid. Also addresses
something I hadn't asked but is genuinely useful: a "guiding the family
choice" section framed for an agent walking a client through the
trade-off, with an explicit categorization of which families stay
gray-ish vs. tint the dark theme — confirms Taupe's "gentle wash, still
works in dark" categorization matches what we found empirically.

## 5. ~~`configureThemeExtraction`'s `entry` and custom Sass aliases~~ — **fixed in 0.4.0**

Now explicit: `entry` is compiled by Sass directly, bundler aliases
(Vite's `@styles/...`, tsconfig paths, webpack `resolve.alias`) don't
resolve, use `loadPaths` instead; and `entry` should be "a minimal file
that only assembles your theme setup," not the full global stylesheet.
Matches exactly what I found empirically for ArgentBank's own contrast
suite.

## 6. ~~`AccessibilityControl` prop types for `position`/`icon`~~ — **fixed in 0.4.0**

Full prop docs now: `position?`'s 4-value enum with an explicit note that
it's the *panel's* corner, not the button's page position; `icon?`
documented as any `ReactNode`.

## 7. ~~No pre-header-band example~~ — **fixed in 0.4.0**

Full worked markup + SCSS example now, with the reasoning spelled out
("in the flow: it pushes content down, never overlaps it").

## 8. ~~`--waive` CLI flag grammar~~ — **fixed in 0.4.0**

Fully specified now: first `=` is the separator, left side is a regex
(unanchored unless you anchor it), right side is free text and may itself
contain `=`, plus an explicit CI shell-quoting note.

## 9. ~~Only 9 curated palette families~~ — **fixed in 0.2.0**

`_base-palette.scss` now ships all 26 Tailwind families (17 chromatic + 5
neutral grays + 4 tinted neutrals), documented in `AGENTS.md`/`README.md`
Prerequisites. ArgentBank's Indigo secondary now has a real, near-exact
match (`indigo-500` in the new OKLCH values matches the hex I already had:
`#6366f1`) instead of the `violet` approximation. Confirmed via
`node_modules` diff between 0.1.0 and 0.2.0.

## 10. ~~Published source leaks internal/private project history~~ — **fixed in 0.2.0**

`scss/_state.scss` used to have comments referencing internal, non-public
context (portfolio extraction note, internal phase naming "E3 phase 4/5",
a private doc path, a dated decision-log entry). Confirmed via diff:
0.2.0's `_state.scss` keeps only the genuinely useful technical rationale
(`// emerald-700: 5.25:1 on bg-base in light`) and drops the
date/portfolio/phase-name framing entirely. Exactly the fix suggested.

## 11. ~~`family-remap` table wasn't re-audited for the 17 newly-added families~~ — **addressed in 0.3.0, the right way**

Traced the actual CVD engine (`_theme-utils.scss`, `remap-for-cvd`) instead
of just diffing docs. Its own docstring is explicit about the design: a
family absent from `family-remap` is treated as "already deemed safe for
this CVD type" and left unchanged (point 3 of the resolution order) — that
part is a legitimate, deliberate design (not every family needs remapping
for every deficiency type, e.g. a family already safe on the red-green axis
needs no red-green remap).

The actual table, unchanged between 0.1.0 and 0.2.0:

```scss
"family-remap": (
  "amber": ("orange", 0),
  "sky": ("violet", 0),
),
```

Only 2 entries, covering only the original 9-family set. When the palette
expanded to 26 families in this release, this table wasn't revisited —
there's no way to tell, for any of the 17 new families (`blue`, `indigo`,
`teal`, `cyan`, `lime`, `yellow`, `green`, `purple`, `fuchsia`, `pink`,
`rose`, `gray`, `zinc`, `taupe`, `mauve`, `mist`, `olive`), whether their
absence from the table means "verified safe" or "not yet analyzed." Sky
(a fairly pure blue) needs a tritanopia remap to violet — Indigo sits
right next to sky on the blue axis, which makes "no remap needed" a
plausible-but-unverified assumption for it specifically, not an obviously
safe default.

Concretely: a consumer picking any of the 17 new families for `accent`/
`link` today has no stated guarantee of CVD distinguishability — the
package's own `testing/pairs` + `measureDeltaE` suite (already documented
for this exact purpose) can verify it empirically, but as far as I can
tell that audit hasn't been run against the new families yet.

**0.3.0's fix, verified by diffing fresh registry tarballs (not local
pnpm-store folders — those gave me a false "nothing changed" reading at
first, worth knowing for next time)**: rather than guessing/hardcoding a
remap value for each of the 17 families — which would just be a different
unverified assumption — `generate-all-themes` now takes a `$configs`
parameter (theme name → partial engine config, **deep-merged** over that
theme's defaults via a `map.merge` → `map.deep-merge` fix applied
throughout `_theme-utils.scss`/`_theme-generator.scss`). A consumer can
now add e.g. one `family-remap` entry for their own accent color without
redefining the whole table. `AGENTS.md` documents this with the honest
answer to the actual question: "a family absent from the table is left
unchanged — the default tables only cover the default primitives'
families... run the distinguishability suite and add a remap entry only
if a pair fails there." That's the correct methodology (measure your own
actual pairs, don't assume), not a shortcut — good fix.

## 12. ~~No migration-methodology guidance for `bg-base` vs `bg-container`~~ — **fixed in 0.4.0** (folded into #4's new section)

`_state.scss` defines a background ladder: `bg-base` (`gray-50`), `bg-subtle`
(`gray-200`), `bg-container` (`gray-300`), `bg-container-high` (`gray-400`),
`bg-emphasis` (`gray-700`), `bg-emphasis-strong` (`gray-800`), `bg-inverse`
(`gray-950`) — each a different rail weight, by design, so a "card" role
reads as visually distinct from the base page.

Concretely wrong choice made on ArgentBank: a hero card's background was
migrated to `bg-container` because it structurally *looked like* a card —
without checking that its original hardcoded hex (`$color-white`) was
**identical** to the general page background's original hex (also
`$color-white`). Result: in light mode this introduced a visible,
unintended shade difference between the card and the page that didn't
exist in the original design (barely perceptible, but real: `gray-50` vs
`gray-300` are genuinely different lightness steps). In dark mode, a
separate `+1` adjustment we'd added to `gray-50` (for an unrelated reason
— darkening the overall dark-theme background) happened to land it on the
exact same rail index as `gray-300`'s own default `-2` adjustment, making
card and page collide back to the *same* color in dark mode — while
staying visibly different in light mode. Confusing to debug from the
outside; took explicit walking through the index arithmetic to explain.

The root cause isn't a bug in the engine — the roles did exactly what
they're defined to do. It's a **methodology gap**: nothing in `AGENTS.md`
tells a consumer migrating an *existing* design to compare original hex
values against each other before picking a role. The role names describe
a "how different should this look" ladder, not "what does this element
structurally represent" — those two things frequently don't match (a
"card" can legitimately be the exact same color as the page it sits on).

**Suggested fix — documentation, not a rename**: I'd resist renaming
`bg-container` etc.; the names are reasonable once you know the ladder is
about *visual distinctness*, not *element type*. What's missing is an
explicit migration note, something like: *"When mapping an existing
hardcoded color to a role: compare its value against your other
already-mapped colors first. Two elements that were the same hex in your
original design should map to the same role — usually `bg-base` — even if
one of them structurally looks like a 'card'. Don't pick a role from what
the element represents; pick it from what its original color actually
was relative to the rest of your palette."* This is exactly the kind of
gap the audit/semantic-inspector tooling can't catch on its own — it has
no knowledge of the pre-migration design, only of the roles as configured.

## 13. ~~`theme-example.scss`'s name reads as disposable~~ — **fixed in 0.4.0**

Renamed to `theme-setup.scss` package-wide (templates, `AGENTS.md`,
`README.md`, `cli.mjs`), with the exact permanence/`--diff` warning I'd
suggested now inlined as a comment at the top of the file itself, not
just in the docs — so it's visible even to someone who never reads
`AGENTS.md`. Bumped ArgentBank to 0.4.0 and renamed our local copy to
match; confirmed `init --diff` tracks it correctly again.

---

All 16 items above are now resolved (0.2.0 through 0.7.0) — nothing open
at the moment. New entries go below as they turn up.

## 14. ~~Dyslexia mode is lost on page reload~~ — **fixed in 0.7.0**

Unlike everything above, this is a bug rather than a docs gap, and it
affects the users the feature exists for.

- **Cause:** `templates/react/AccessibilityMenu.tsx:76` initialises
  `isDyslexicMode` to `false` with no read from storage, and
  `toggleDyslexicMode()` (`:101-111`) writes the `dyslexia-optimized`
  class to `<html>` but never to `localStorage`.
  `react/themeInitScript.ts` restores `theme` only.
- **Consequence:** a user who enables dyslexia mode loses it on every hard
  reload and in every new tab. Client-side navigation inside an SPA keeps
  it, which is probably why it went unnoticed.
- **Fix:** persist on toggle, lazy-init from the stored value, restore the
  class in `themeInitScript` before first paint, and clear the key in
  `resetAllAccessibilitySettings()` (`:293-296`).

The two preferences declared immediately after it in the same file,
`reduceMotion` (`:79`) and `hcVariant` (`:93`), already do exactly this.
The pattern is present, it's just missing on this one.

## 15. ~~The menu is always in the DOM, so its fonts load on every page~~ — **fixed in 0.7.0**

- **Cause:** `templates/react/AccessibilityControl.tsx:130-136` renders
  `<AccessibilityMenu>` unconditionally; only the wrapper gets the `open`
  class. `templates/scss/accessibility-trigger.scss:89-91` hides the closed
  panel with `opacity: 0; visibility: hidden`, which — unlike
  `display: none` — still lays the subtree out, so the browser downloads
  every font its styling references.
- **Consequence:** every page load pays for fonts belonging to a panel
  nobody has opened. Measured on ArgentBank production (Chromium
  Lighthouse, default mobile profile, menu never opened): Atkinson
  Hyperlegible 77.14 KiB at 1321 ms, plus our italic body face
  (Nunito Italic) 276.38 KiB at 1314 ms — the two longest legs of a
  1321 ms critical path, on a page whose LCP is 3.2 s.
- **Fix:** `{menuOpen && <AccessibilityMenu … />}`. The wrapper keeps its
  transition; only the contents become conditional.

Guaranteed cost to any consumer: Atkinson at 78 444 bytes, because
`templates/scss/accessibility-menu.scss:455` and `:480` style the
high-contrast buttons with it; plus one italic face of the host's body
font, because `:179` sets `font-style: italic` on `__help-description`.

Two notes for whoever picks this up:

- It depends on #14 being fixed first. With `isDyslexicMode` unpersisted,
  unmounting the menu makes the effect at `:115-121` re-run with `false`
  on the next open and strip the class.
- **The typography is not the bug.** The italic carries real hierarchy in
  the panel, and Atkinson puts the most legible face exactly where
  low-vision users need it. Both are correct. They cost bytes only because
  of the mounting behaviour; once the subtree is conditional they are free.

## 16. ~~The eager font cost isn't documented anywhere~~ — **fixed in 0.7.0**

- **Cause:** neither `README.md` nor `AGENTS.md` states that mounting
  `AccessibilityControl` adds font downloads to the host page's critical
  path, or which bundled faces load eagerly versus on demand.
- **Consequence:** an integrator can't size the cost without measuring it
  themselves, which is how we found it.
- **Fix:** a short "Performance" section listing which faces load eagerly
  and their byte cost, noting the extra italic face pulled from the host's
  own body font, and giving the recommended integration for a
  performance-budgeted host.

Credit where it's due: the on-demand mechanism already works for the fonts
that are the actual feature. OpenDyslexic, Andika and Lexend stay out of
the network trace until selected. The eager cost is confined to Atkinson,
and only because the menu's own chrome uses it.
