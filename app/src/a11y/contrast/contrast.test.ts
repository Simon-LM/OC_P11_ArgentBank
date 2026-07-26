/** @format */
// @vitest-environment node

import "./setup";
import { THEMES } from "./setup";
import { thresholdFor } from "darkmode-plus-a11y/testing/wcag";
import { measureRatio } from "darkmode-plus-a11y/testing/measure";
import { contrastPairs } from "./pairs";

describe("WCAG contrast — pair x theme matrix", () => {
  for (const pair of contrastPairs) {
    for (const theme of pair.themes ?? THEMES) {
      // 20s timeout: the first assertion to run pays for compiling the
      // theme-setup.scss pipeline for all 15 themes (configureThemeExtraction
      // in ./setup, lazily triggered here) — fast locally, but slow enough on
      // a loaded CI runner to exceed vitest's 5s default on that one test.
      it(`${pair.id} meets its ${pair.level} threshold in "${theme}"`, () => {
        if (pair.waiver?.measured?.[theme] !== undefined) return;
        expect(measureRatio(pair, theme)).toBeGreaterThanOrEqual(
          thresholdFor(pair.level),
        );
      }, 20000);
    }
  }
});
