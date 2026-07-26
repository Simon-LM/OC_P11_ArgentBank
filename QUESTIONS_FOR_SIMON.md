# Open decisions for Simon — ArgentBank / darkmode-plus-a11y integration

Project-side decisions only you can make. Different from
`DARKMODE_PLUS_A11Y_FEEDBACK.md`, which is notes for whoever works on the
`darkmode-plus-a11y` package itself — that file has nothing to do with
ArgentBank's own choices, this one is only about ArgentBank's own choices.

## 1. Palette family for each brand color — **resolved**

Confirmed by you: **Emerald** (accent), **Indigo** (secondary), **Slate**
(gray/primary). No need for `Taupe`/`Mauve`/`Mist`/`Olive` on ArgentBank —
good, since I can't currently pull reliable exact values for those 4
(WebFetch gave inconsistent results across 3 attempts on that specific
question, including one fabricated-looking duplicate — see git history of
this file if you want the detail, trimmed here now that it's moot).

**Bonus, answers your Red/error question**: checked `scss/_state.scss`
directly. The package already ships default `status` primitives —
`"success": ("emerald", 700)` and `"danger": ("red", 600)` — no palette
work needed, both weights deliberate (contrast-tuned, see
`DARKMODE_PLUS_A11Y_FEEDBACK.md` #10). ArgentBank already has its own error
color, `$color-error: #dc3545` (`_variables.scss:31`) — extremely close to
`red-600 #dc2626`. **Recommendation: leave `success`/`danger` at the
package defaults**, don't override them.

## 2. Multilingual site — before or after the a11y/dark-mode package? **Resolved: after**

Confirmed: darkmode-plus-a11y integration first, site-wide i18n as its own
initiative afterward. **Constraint for Phase 1 implementation**: design for
future multilingual resilience even though we're not building i18n now —
concretely means, when Phase 1 actually starts:

- `language="en"` isolated behind one named constant (not repeated inline),
  one-line swap once real i18n exists.
- Any new user-facing text this integration adds (aria-labels, the
  accessibility widget's own copy, etc.) kept in as few, easy-to-find
  places as possible — not scattered — so a future i18n pass can find and
  extract it without re-auditing the whole component.
- The theming engine itself has zero i18n surface (colors aren't
  translated), so this only matters for the UI widget's copy, not the
  darkmode logic.

## 3. ~~Wait for the palette update, or start now?~~ — **moot: 0.2.0 shipped**

`darkmode-plus-a11y@0.2.0` published 2026-07-18, bumped on
`feat/darkmode-plus-a11y` already. All 26 Tailwind families present,
including Indigo — no more need for the `violet` placeholder discussion.
**Nothing left blocking Phase 1.**
