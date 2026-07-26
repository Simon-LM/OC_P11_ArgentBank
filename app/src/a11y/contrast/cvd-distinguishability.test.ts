/** @format */
// @vitest-environment node

// Directly answers DARKMODE_PLUS_A11Y_FEEDBACK.md #11: our Emerald accent
// and Indigo link/secondary aren't in the package's `family-remap` table
// (only amber/sky are). Absence from that table is only safe if the pair
// is *actually* distinguishable under CVD simulation — measured here
// instead of assumed. If this fails for a given theme, add one
// `family-remap` entry via `generate-all-themes`'s `$configs` param
// (see AGENTS.md § Per-theme engine overrides) rather than picking a
// different family.

import "./setup";
import { measureDeltaE } from "darkmode-plus-a11y/testing/measure";
import {
  defaultDistinguishabilityPairs,
  withWaivers,
} from "darkmode-plus-a11y/testing/pairs";

// success-vs-danger, achromatopsia: mathematically forced tradeoff. Both
// roles must stay dark enough for 4.5:1 against the near-white
// achromatopsia background, and that dark band can't fit two colors 20 ΔE
// apart (max achievable there ≈4.3, verified directly by sweeping
// lightness) — accepted once --success/--danger were each fixed
// individually against --accent. Still dormant only: --success is unused
// anywhere on the site. See theme-setup.scss's "success" primitive comment.
const distinguishabilityPairs = withWaivers(defaultDistinguishabilityPairs, {
  "distinguish/success-vs-danger": {
    reason:
      "Both --success and --danger must stay dark for 4.5:1 against the near-white achromatopsia background; that dark band can't fit two colors 20 ΔE apart (max ≈4.3, verified). --success is unused on the site — dormant.",
    preexisting: false,
    measured: { achromatopsia: 3.0643 },
  },
});

describe("CVD distinguishability — accent (emerald) / link (indigo) / success / danger", () => {
  for (const pair of distinguishabilityPairs) {
    for (const theme of pair.themes) {
      it(`${pair.id} stays distinguishable in "${theme}"`, () => {
        if (pair.waiver?.measured?.[theme] !== undefined) return;
        expect(measureDeltaE(pair, theme)).toBeGreaterThanOrEqual(
          pair.minDeltaE,
        );
      });
    }
  }
});
