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
      it(`${pair.id} meets its ${pair.level} threshold in "${theme}"`, () => {
        if (pair.waiver?.measured?.[theme] !== undefined) return;
        expect(measureRatio(pair, theme)).toBeGreaterThanOrEqual(
          thresholdFor(pair.level),
        );
      });
    }
  }
});
