/** @format */

import {
  defaultRolePairs,
  withWaivers,
  type ContrastPair,
} from "darkmode-plus-a11y/testing/pairs";

// Pairs specific to how Phase 1 actually wires the roles in Header/Footer.
const sitePairs: ContrastPair[] = [
  {
    id: "site/nav-text-on-header-bg",
    fg: "--fg-base",
    bg: "--bg-base",
    level: "text",
  },
  {
    id: "site/nav-hover-on-header-bg",
    fg: "--link-hover",
    bg: "--bg-base",
    level: "text",
  },
  {
    id: "site/footer-link-on-footer-bg",
    fg: "--link",
    bg: "--bg-base",
    level: "text",
  },
  {
    id: "site/skip-link-text-on-link",
    fg: "--fg-on-emphasis",
    bg: "--link",
    level: "text",
  },
];

export const contrastPairs = [
  ...withWaivers(defaultRolePairs, {
    // --fg-on-accent is unused anywhere in the codebase (the one real
    // consumer, the header skip-link, was fixed to use --link/
    // --fg-on-emphasis instead — see site/skip-link-text-on-link below).
    // Purely theoretical: no live pairing on the site.
    "role/fg-on-accent-on-accent": {
      reason:
        "--fg-on-accent is not used anywhere on the site (verified by grep) — dormant, not a live bug. See DARKMODE_PLUS_A11Y_INTEGRATION_PLAN.md.",
      preexisting: false,
      measured: {
        dark: 2.9626,
        "anti-glare-dark": 2.9359,
        "high-contrast-paper": 1.0,
        achromatopsia: 2.5322,
      },
    },
    // --link is never used as TEXT on --bg-subtle or --bg-container on this
    // site (only as a background fill or a border elsewhere) — vigilance
    // comment left on the "link" primitive in theme-setup.scss.
    "role/link-on-bg-subtle": {
      reason:
        '--link is never used as text on --bg-subtle on this site (background-fill/border only). See vigilance comment on the "link" primitive in theme-setup.scss.',
      preexisting: false,
      measured: { "anti-glare-light": 4.2744 },
    },
    "role/link-on-bg-container": {
      reason:
        '--link is never used as text on --bg-container on this site (background-fill/border only). See vigilance comment on the "link" primitive in theme-setup.scss.',
      preexisting: false,
      measured: {
        light: 4.3099,
        "anti-glare-light": 3.9794,
        deuteranomaly: 4.3099,
        deuteranopia: 4.3099,
        protanomaly: 4.3099,
        protanopia: 4.3099,
        tritanomaly: 4.3099,
        tritanopia: 4.3099,
      },
    },
    // Real, live pairing (error text on the page background) — a narrow
    // miss (4.01:1 vs 4.5:1) specific to anti-glare-light. Not fixable via
    // config: "anti-glare-light" accepts no per-theme override at all (the
    // engine warns and ignores any $configs entry for it). Accepted:
    // anti-glare users need less contrast, not more.
    "role/danger-on-bg-base": {
      reason:
        'Real pairing (error text), narrow miss in anti-glare-light only (4.01:1). "anti-glare-light" accepts no per-theme config — can\'t be fixed via special-colors/adjustments. Accepted: anti-glare reduces contrast by design.',
      preexisting: false,
      measured: { "anti-glare-light": 4.0134 },
    },
  }),
  ...sitePairs,
];
