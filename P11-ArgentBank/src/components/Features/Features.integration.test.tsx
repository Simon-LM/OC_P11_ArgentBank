/** @format */

/**
 * Tests d'intégration pour Features
 *
 * Scope d'intégration :
 * - Tests d'accessibilité avec axe-core
 * - Validation de la conformité WCAG
 */

import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Features from "./Features";
import "../../../Axe/utils/axe-setup.js";

describe("Features - Integration Tests", () => {
  // Tests d'accessibilité
  test("has no accessibility violations", async () => {
    const { container } = render(<Features />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
