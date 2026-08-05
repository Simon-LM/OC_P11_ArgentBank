# Email to the darkmode-plus-a11y maintainer — 3

> Ready to send. Written by the ArgentBank integration agent, forwarded by
> Simon-LM. Follows the second message, which led to 0.8.0.

---

**Subject:** 0.8.0 is a real improvement — and one recommendation in the docs still cannot be followed

Dear maintainer,

0.8.0 landed well. We took it the day it shipped, and the numbers hold up:
our entry bundle went from **87.35 KB to 58.19 KB gzipped**, and the
button groups replaced the two dropdowns with no loss we could find. The
`display: none` fix from 0.7.0 and this one together removed 353 KB of
fonts and 29 KB of JavaScript from every page load, for a panel most
visitors never open. The keyboard workaround and the jsdom testing blind
spot went with react-select, exactly as hoped.

Two smaller things worth passing on from the upgrade itself, then the
finding.

**The colour-vision fallback direction is right.** jsdom loads no
stylesheet, so `resolveColorVisionModes("auto")` finds nothing and falls
back to offering every mode. Our test suite therefore sees seven buttons
rather than the site's real list. That is the correct failure direction —
hiding a mode a site does have would remove a feature from the person who
needs it — but it is worth one line in the docs, because a consumer
writing a test that asserts "this site offers three modes" will be
surprised.

**Five of our tests drove the old dropdowns** and were rewritten against
the buttons in about twenty minutes. `aria-pressed` on every option and a
`role="group"` per font purpose made them read better than what they
replaced. No complaint — just a data point on migration cost, in case you
want to put a number in the upgrade notes.

---

## The finding: Sylexiad is recommended, and cannot be adopted

This is the same shape as the last two messages — something the package
does well that its documentation does not let a consumer reach.

Simon asked why we had never once proposed Sylexiad, given the package
recommends it. The answer turned out to be that nothing an integrator
reads ever mentions it.

### 1. The recommendation lives where nobody looks

| File | Mentions of "Sylexiad" |
| --- | --- |
| `README.md` | **0** |
| `AGENTS.md` | **0** |
| `AGENTS.md` scaffolded into the consumer's `src/a11y/` | **0** |
| `fonts/LICENSES/README.md` | 1 |

The only prose describing it sits in a licensing appendix, plus three
source comments in `_a11y-fonts.scss` and `_dyslexia.scss`.

So the font the package calls *"the **recommended** body font for this
package's dyslexia mode"* is invisible to every integrator who reads the
documentation — and to every coding agent that reads `AGENTS.md`, which is
how we work. We integrated this package across a dozen pull requests and
never saw it. Consumers ship the fallback believing it is the intended
choice.

**Suggested fix:** name it in `README.md` and `AGENTS.md`, in the dyslexia
mode section, with the one-line reason it is not bundled and a pointer to
the appendix for the licensing detail.

### 2. The documented extension points do not exist

`fonts/LICENSES/README.md:31-33` tells the consumer to wire Sylexiad
"through the font module's extension point (`$dyslexia-fonts` on the SCSS
side + `extraClasses` on the runtime side)".

Neither identifier exists. `$dyslexia-fonts` appears nowhere in `scss/`.
`extraClasses` appears exactly once in the whole package — in that same
sentence.

The correct instruction already exists two files away, in
`_dyslexia.scss:23`:

```scss
@include dyslexia-typography($body-font: "SylexiadSans");
```

Anyone following the only instructions the package gives will search for
two names that return nothing and conclude the feature is unfinished. That
the right answer is already written elsewhere makes the wrong one purely a
cost.

**Suggested fix:** replace that sentence with the mixin call, and say
plainly that the consumer declares the `@font-face` rules on their own
side.

### 3. A font cannot be added to the menu without forking the template

`templates/react/AccessibilityMenu.tsx:65` still hardcodes:

```ts
type FontType = "none" | "opendyslexic" | "atkinson" | "andika";
```

with the labels hardcoded alongside it in `getFontTypeLabel`.

The two uses of Sylexiad are therefore not equivalent:

- **As dyslexia mode's body font** — works today through the SCSS mixin,
  no template change. This is presumably what the recommendation means.
- **As a fourth entry in the font picker** — requires editing the
  scaffolded file, which means carrying a local divergence and re-merging
  it at every `init --diff`. That is the exact cost that sent items #14-16
  upstream rather than being fixed locally.

0.8.0 moved one piece in the right direction: `ACCESSIBILITY_FONT_GROUPS`
now lives in the consumer's `accessibilityPreferences.ts`, so grouping and
ordering are ours. But it only arranges the three built-ins. Half the
extension point exists; the half that would let Sylexiad in does not.

**Suggested fix:** accept extra entries as data — an optional prop on
`AccessibilityControl`/`AccessibilityMenu` taking
`{ value, label, className, group }`, appended to the built-in list. That
also covers brand fonts and Lexend, which `_a11y-fonts.scss` already
treats as consumer-declared for the same reason.

---

## Two licensing notes worth adding

We read the Sylexiad EULA (February 2022) while working out how to ship
it. Two clauses affect any consumer and are not currently mentioned:

- **"You are not allowed to edit the original typeface files."** So unlike
  every bundled OFL font, Sylexiad **must not be subset**. That is a real
  constraint worth stating next to a recommendation, since subsetting is
  the normal advice for a webfont — we cut Nunito from 271 KB to 57 KB the
  same week.
- **"please credit Robert Hillier as the designer and then acknowledge the
  name of the typefaces in the credit."** A consumer following the
  recommendation incurs an attribution duty they have no way to learn
  about from the docs.

## And the wall we actually hit

We parked Sylexiad for a reason unrelated to the package, but one that
will affect other consumers:

The EULA permits website use while requiring that "the new typeface files
are not publicly downloadable". ArgentBank deploys through **Vercel's
GitHub integration**, so every asset must be committed to a public
repository — which is precisely what that clause forbids. The same is true
of any Netlify or Cloudflare Pages project on git-connected deploys, which
is most of them.

There is no workaround inside the repository. The options are all outside
it: serve the font from a domain you control, fetch it during the build
from a private URL, or ask the author for written permission.

**Suggested fix:** phrase the licensing note as *how to ship it* rather
than *download it and wire it up*. As written, it implies the only
obstacle is the wiring.

---

## Environment

- `darkmode-plus-a11y@0.8.0`, Path A scaffold into `src/a11y/`
- React 19.2.7, Vite 8, SCSS/BEM host, no Tailwind
- 715 tests, Lighthouse CI gating 5 routes on three device profiles at
  100% accessibility

As before, we can test a patched version against our pipeline, which now
also gates a pessimistic mobile profile (Lighthouse's own default
throttling) and a gzipped critical-path budget.

Kind regards,

The ArgentBank integration agent
